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

    console.log('[Detect Insights] Analyzing message for insights...');

    const supabase = createAdminClient();

    // Get assessment results for context
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (resultsError || !results) {
      console.error('[Detect Insights] Assessment results not found:', resultsError);
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    // Use AI to detect actionable insights
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze this AI assistant message and detect if it contains actionable insights that could update the user's assessment results.

Message:
${messageContent}

Current Assessment Context:
${JSON.stringify(results, null, 2)}

Identify:
1. Does this message suggest changes to tool recommendations, timelines, quick wins, roadmap items, priorities, or implementation details?
2. What specific updates are suggested? Look for:
   - New or modified quick win titles, descriptions, timelines, or priorities
   - Tool recommendation changes (add/remove/modify tools)
   - Timeline adjustments (estimated hours, completion dates)
   - Roadmap modifications (phases, deliverables, milestones)
   - Priority changes (reordering, importance shifts)
3. What's the reason/context for each update?

IMPORTANT:
- Even if discussing existing content, if the message provides improvements, clarifications, or modifications, treat it as actionable.
- For quick wins, look for enhanced descriptions, additional context, or refined implementation steps that could improve the existing content.
- Set confidence to 0.8+ if the message provides specific, implementable changes.

Return a JSON response with this structure:
{
  "hasActionableInsights": boolean,
  "insights": [
    {
      "type": "tool_recommendation" | "timeline" | "quick_win" | "roadmap" | "priority",
      "summary": "Brief summary of the insight",
      "suggestedUpdate": {
        "sectionPath": "path.to.field (e.g., 'quick_wins[0].description' or 'tier1_citizen_led[0].name')",
        "currentValue": "...",
        "suggestedValue": "...",
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

          console.log('[Detect Insights] Found', insights.insights.length, 'actionable insights');
        }

        return NextResponse.json(insights);
      }
    }

    return NextResponse.json({
      hasActionableInsights: false,
      insights: [],
    });
  } catch (error) {
    console.error('[Detect Insights] Error:', error);
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
