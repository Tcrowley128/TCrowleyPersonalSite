import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY,
});

interface DetectInsightsRequest {
  messageId: string;
  messageContent: string;
  conversationId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body: DetectInsightsRequest = await request.json();
    const { messageId, messageContent, conversationId } = body;

    console.log('[Journey Detect Insights] Analyzing message for insights...');

    const supabase = createAdminClient();

    // Get current journey data for context
    const { data: projects } = await supabase
      .from('assessment_projects')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });

    const { data: risks } = await supabase
      .from('assessment_risks')
      .select('*')
      .eq('assessment_id', assessmentId);

    // Get PBIs for all projects
    const projectIds = (projects || []).map(p => p.id);
    let pbis: any[] = [];
    let sprints: any[] = [];

    if (projectIds.length > 0) {
      const { data: pbisData } = await supabase
        .from('project_pbis')
        .select('*')
        .in('project_id', projectIds);
      pbis = pbisData || [];

      const { data: sprintsData } = await supabase
        .from('project_sprints')
        .select('*')
        .in('project_id', projectIds);
      sprints = sprintsData || [];
    }

    // Use AI to detect actionable insights
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze this AI assistant message from a Transformation Journey conversation and detect if it contains actionable insights that could update projects, PBIs, sprints, or risks.

Message:
${messageContent}

Current Journey Context:
Projects: ${JSON.stringify(projects?.slice(0, 5), null, 2)}
PBIs: ${JSON.stringify(pbis?.slice(0, 10), null, 2)}
Sprints: ${JSON.stringify(sprints?.slice(0, 5), null, 2)}
Risks: ${JSON.stringify(risks?.slice(0, 10), null, 2)}

Identify:
1. Does this message suggest changes to:
   - Project status, progress, priority, or timeline?
   - PBI status, priority, story points, or sprint assignment?
   - Risk status, severity, or mitigation plans?
   - Sprint planning or velocity?
   - New PBIs or tasks that should be created?

2. What specific updates are suggested? Look for:
   - Project updates: status changes, progress updates, priority adjustments
   - PBI updates: status changes, reprioritization, story point estimates, sprint assignments
   - Risk updates: status changes, severity adjustments, mitigation improvements
   - New items: suggestions to create new PBIs, tasks, or epics

3. What's the reason/context for each update?

IMPORTANT:
- Only suggest updates that are explicitly mentioned or strongly implied in the message
- For updates, provide the specific ID or enough detail to identify the item
- Set confidence to 0.8+ only if the suggestion is specific and implementable
- Include both the field to update and the new value

Return a JSON response with this structure:
{
  "hasActionableInsights": boolean,
  "insights": [
    {
      "type": "project" | "pbi" | "risk" | "sprint" | "new_pbi",
      "action": "update" | "create",
      "summary": "Brief summary of the insight",
      "suggestedUpdate": {
        "entityId": "UUID of the entity (or null for create)",
        "entityName": "Name/title of the entity for user reference",
        "field": "Field to update (e.g., 'status', 'priority', 'story_points')",
        "currentValue": "Current value (if update)",
        "suggestedValue": "Suggested new value",
        "reason": "Why this change is suggested"
      },
      "confidence": 0.0-1.0
    }
  ]
}

Only include insights with high confidence (>0.7) that are specific and actionable.`,
        },
      ],
    });

    const aiContent = response.content[0];
    if (aiContent.type === 'text') {
      // Extract JSON from AI response
      const jsonMatch = aiContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);

        // Store insights in message metadata
        if (insights.hasActionableInsights && insights.insights.length > 0) {
          await supabase
            .from('conversation_messages')
            .update({
              metadata: {
                hasActionableInsights: true,
                insights: insights.insights,
                analyzedAt: new Date().toISOString(),
              },
            })
            .eq('id', messageId);

          console.log('[Journey Detect Insights] Found', insights.insights.length, 'actionable insights');
        }

        return NextResponse.json(insights);
      }
    }

    return NextResponse.json({
      hasActionableInsights: false,
      insights: [],
    });
  } catch (error) {
    console.error('[Journey Detect Insights] Error:', error);
    return NextResponse.json(
      {
        hasActionableInsights: false,
        insights: [],
        error: 'Failed to analyze message',
      },
      { status: 500 }
    );
  }
}
