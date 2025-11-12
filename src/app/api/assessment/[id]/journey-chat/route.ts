import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessment_id } = await params;
    const { message, conversation_id } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated (but don't require it for shared assessments)
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const supabase = createAdminClient();

    // Fetch assessment and results for context
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessment_id)
      .single();

    const { data: results } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessment_id)
      .single();

    // Fetch journey data - projects, sprints, PBIs, risks
    const { data: projectsData } = await supabase
      .from('assessment_projects')
      .select('*')
      .eq('assessment_id', assessment_id)
      .order('created_at', { ascending: false });
    const projects = projectsData || [];

    const { data: risksData } = await supabase
      .from('assessment_risks')
      .select('*')
      .eq('assessment_id', assessment_id);
    const risks = risksData || [];

    // Get PBIs for all projects
    const projectIds = projects.map(p => p.id);
    let pbis: any[] = [];
    let sprints: any[] = [];

    if (projectIds.length > 0) {
      const { data: pbisData } = await supabase
        .from('product_backlog_items')
        .select('*')
        .in('project_id', projectIds);
      pbis = pbisData || [];

      const { data: sprintsData } = await supabase
        .from('sprints')
        .select('*')
        .in('project_id', projectIds);
      sprints = sprintsData || [];
    }

    if (!assessment || !results) {
      return NextResponse.json(
        { error: 'Assessment or results not found' },
        { status: 404 }
      );
    }

    // Get or create conversation
    let currentConversationId = conversation_id;

    if (!currentConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('assessment_conversations')
        .insert({
          assessment_id,
          user_id: user?.id || null,
          title: message.substring(0, 100),
          context_type: 'journey' // Mark as journey conversation
        })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('Conversation creation error:', convError);
        throw new Error(`Failed to create conversation: ${convError?.message || 'Unknown error'}`);
      }

      currentConversationId = newConversation.id;
    }

    // Get conversation history
    const { data: messageHistory } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    // Save user message
    await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      });

    // Build context-aware prompt with journey data
    const systemPrompt = buildJourneyChatSystemPrompt(assessment, results, projects, pbis, sprints, risks);

    // Build message history for Claude
    const claudeMessages: Anthropic.MessageParam[] = [];

    // Add previous messages
    if (messageHistory && messageHistory.length > 0) {
      messageHistory.forEach((msg) => {
        claudeMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    claudeMessages.push({
      role: 'user',
      content: message
    });

    // Call Claude API with streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: claudeMessages
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullMessage = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send conversation_id first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'conversation_id', conversation_id: currentConversationId })}\n\n`));

          // Stream text deltas
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullMessage += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`));
            } else if (chunk.type === 'message_start') {
              inputTokens = chunk.message.usage.input_tokens;
            } else if (chunk.type === 'message_delta') {
              outputTokens = chunk.usage.output_tokens;
            }
          }

          // Notify that we're analyzing for suggestions
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'analyzing' })}\n\n`));

          // Analyze the response for actionable insights
          try {
            const insights = await analyzeForInsights(fullMessage, projects, pbis, sprints, risks, anthropic);

            if (insights && insights.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'metadata',
                metadata: {
                  hasActionableInsights: true,
                  insights
                }
              })}\n\n`));
            }
          } catch (analysisError) {
            console.error('Error analyzing for insights:', analysisError);
            // Continue without insights if analysis fails
          }

          // Save the complete message to database
          const { data: savedMessage, error: saveError } = await supabase
            .from('conversation_messages')
            .insert({
              conversation_id: currentConversationId,
              role: 'assistant',
              content: fullMessage,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              model_version: 'claude-sonnet-4-20250514'
            })
            .select()
            .single();

          if (saveError || !savedMessage) {
            console.error('Error saving assistant message:', saveError);
          }

          // Send final message with message_id
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            message_id: savedMessage?.id,
            usage: { input_tokens: inputTokens, output_tokens: outputTokens }
          })}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Streaming failed' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in journey chat endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessment_id } = await params;

    // Get user if authenticated
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    const supabase = createAdminClient();

    // Get journey conversations for this assessment
    let query = supabase
      .from('assessment_conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        context_type
      `)
      .eq('assessment_id', assessment_id)
      .eq('context_type', 'journey'); // Only get journey conversations

    // Only filter by user if authenticated
    if (user) {
      query = query.or(`user_id.eq.${user.id},user_id.is.null`);
    } else {
      query = query.is('user_id', null);
    }

    const { data: conversations, error: convError } = await query.order('updated_at', { ascending: false });

    if (convError) {
      throw convError;
    }

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: messages } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        return {
          ...conv,
          messages: messages || []
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithMessages
    });

  } catch (error) {
    console.error('Error fetching journey chat history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildJourneyChatSystemPrompt(
  assessment: any,
  results: any,
  projects: any[],
  pbis: any[],
  sprints: any[],
  risks: any[]
): string {
  // Calculate journey statistics
  const totalProjects = projects?.length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
  const totalPBIs = pbis?.length || 0;
  const completedPBIs = pbis?.filter(p => p.status === 'done').length || 0;
  const totalRisks = risks?.length || 0;
  const highRisks = risks?.filter(r => r.severity === 'high' || r.severity === 'critical').length || 0;

  // Calculate savings from completed projects
  let realizedSavings = 0;
  projects?.filter(p => p.status === 'completed').forEach(p => {
    const match = p.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
    if (match) {
      const value = parseFloat(match[1]);
      const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
      realizedSavings += value * multiplier;
    }
  });

  return `You are Tyler's AI Assistant, now operating in the **Transformation Journey** workspace. You have complete context of both the original assessment results AND all current implementation progress.

COMPANY CONTEXT:
- Company: ${results.company_name || assessment.company_name || 'the organization'}
- Industry: ${assessment.industry}
- Company Size: ${assessment.company_size}
- Technical Capability: ${assessment.technical_capability}

ORIGINAL ASSESSMENT RESULTS:
- Data Strategy Score: ${results.maturity_assessment?.data_strategy?.score || 'N/A'}/5
- Automation Strategy Score: ${results.maturity_assessment?.automation_strategy?.score || 'N/A'}/5
- AI Strategy Score: ${results.maturity_assessment?.ai_strategy?.score || 'N/A'}/5
- People Strategy Score: ${results.maturity_assessment?.people_strategy?.score || 'N/A'}/5

TRANSFORMATION JOURNEY PROGRESS:
- Total Projects: ${totalProjects}
- Completed: ${completedProjects}
- In Progress: ${inProgressProjects}
- Not Started: ${totalProjects - completedProjects - inProgressProjects}
- Overall Progress: ${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%

PBI (PRODUCT BACKLOG ITEMS) STATUS:
- Total PBIs: ${totalPBIs}
- Completed: ${completedPBIs}
- Completion Rate: ${totalPBIs > 0 ? Math.round((completedPBIs / totalPBIs) * 100) : 0}%

RISK OVERVIEW:
- Total Risks: ${totalRisks}
- High/Critical Risks: ${highRisks}

FINANCIAL IMPACT:
- Realized Savings: $${(realizedSavings / 1000000).toFixed(2)}M from completed projects

DETAILED PROJECT DATA:
${projects?.map((p, i) => `
Project ${i + 1}: ${p.title}
- Status: ${p.status}
- Progress: ${p.progress_percentage}%
- Priority: ${p.priority}
- Complexity: ${p.complexity}
- Operational Area: ${p.operational_area || 'N/A'}
- Description: ${p.description?.substring(0, 200) || 'N/A'}
`).join('\n')}

DETAILED PBI DATA:
${pbis?.slice(0, 20).map((pbi, i) => `
PBI ${i + 1}: ${pbi.title}
- Project: ${projects?.find(p => p.id === pbi.project_id)?.title || 'Unknown'}
- Status: ${pbi.status}
- Priority: ${pbi.priority}
- Story Points: ${pbi.story_points || 'N/A'}
- Sprint: ${pbi.sprint_id ? 'Assigned' : 'Backlog'}
`).join('\n')}

SPRINT DATA:
${sprints?.map((s, i) => `
Sprint ${i + 1}: ${s.name}
- Status: ${s.status}
- Start: ${s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A'}
- End: ${s.end_date ? new Date(s.end_date).toLocaleDateString() : 'N/A'}
- Velocity: ${s.velocity || 'N/A'} points
`).join('\n')}

RISK DATA:
${risks?.slice(0, 10).map((r, i) => `
Risk ${i + 1}: ${r.title}
- Severity: ${r.severity}
- Status: ${r.status}
- Mitigation: ${r.mitigation_plan?.substring(0, 100) || 'N/A'}
`).join('\n')}

YOUR ROLE IN THE JOURNEY WORKSPACE:
1. **Track Progress**: Answer questions about current implementation status, project completion, sprint velocity, etc.
2. **Provide Guidance**: Help with project execution, PBI prioritization, sprint planning, risk mitigation
3. **Analyze Metrics**: Explain savings achieved, completion rates, velocity trends, risk exposure
4. **Offer Recommendations**: Suggest which projects to prioritize, how to address blockers, optimization opportunities
5. **Connect to Assessment**: Relate current progress back to original assessment goals and recommendations
6. **Sprint Planning Support**: Help estimate story points, prioritize PBIs, plan sprint capacity
7. **Risk Management**: Identify risk patterns, suggest mitigation strategies, highlight critical issues
8. **Resource Planning**: Advise on team allocation, skill requirements, timeline adjustments
9. **Suggest Updates**: When appropriate, suggest specific updates to projects, PBIs, risks, or sprints that the user can apply

ACTIONABLE INSIGHTS:
When you identify opportunities for updates, be specific:
- **Project Updates**: Suggest status changes (e.g., "Project X should be marked as 'in_progress'"), progress updates, or priority adjustments
- **PBI Updates**: Suggest status changes, reprioritization, story point estimates, or sprint assignments
- **Risk Updates**: Suggest status changes, severity adjustments, or mitigation improvements
- **New Items**: Suggest creating new PBIs or tasks when gaps are identified
- Always explain WHY the update is recommended
- Reference the specific item by name/title
- Be confident and clear about your recommendations

GUIDELINES:
- Be conversational and friendly, but professional
- Use relevant emojis throughout your responses for better readability (🎯 goals, ✅ benefits, 💡 tips, ⚠️ warnings, 📊 metrics, 🚀 implementation, 💰 costs, ⏱️ timelines, 🏆 achievements, 📈 progress)
- Format responses using markdown: **bold** for emphasis, bullet points for lists, numbered lists for steps
- Reference SPECIFIC projects, PBIs, or risks by name when relevant
- Provide data-driven insights using the metrics available
- Celebrate progress and completed milestones
- Be honest about challenges and blockers
- Suggest actionable next steps
- Connect journey progress back to original assessment goals
- If asked about implementation details, reference actual project/PBI data
- Help users understand the "why" behind metrics and status

CONTEXT-AWARE RESPONSES:
- When discussing projects, reference their actual status, progress %, and operational area
- When discussing savings, use actual realized savings from completed projects
- When discussing risks, reference specific high-priority risks that need attention
- When discussing sprints, reference actual sprint data (velocity, dates, PBI allocation)
- Compare current state to assessment recommendations to show transformation impact

You have complete visibility into their transformation journey. Use this context to provide specific, actionable, and data-driven advice.`;
}

async function analyzeForInsights(
  assistantMessage: string,
  projects: any[],
  pbis: any[],
  sprints: any[],
  risks: any[],
  anthropic: any
): Promise<any[]> {
  try {
    const analysisPrompt = `You are an expert at analyzing AI assistant responses and extracting actionable insights for transformation journey management.

Given the following AI assistant response, identify any SPECIFIC, ACTIONABLE recommendations that could be directly applied to the transformation journey data.

JOURNEY CONTEXT:
- Projects: ${projects.length} total
- PBIs: ${pbis.length} total
- Sprints: ${sprints.length} total
- Risks: ${risks.length} total

AI ASSISTANT'S RESPONSE:
${assistantMessage}

TASK: Extract ONLY concrete, actionable suggestions from the response that can be automatically applied. For each suggestion, provide:

1. **type**: The entity type (project, pbi, user_story, sprint, risk, new_pbi, new_user_story, new_project)
2. **action**: Either "update" (modify existing) or "create" (create new)
3. **suggestedUpdate**:
   - entityId: The ID of the entity to update (null if creating new)
   - entityName: A clear name/title for the entity
   - field: The field to update (e.g., "status", "priority", "progress_percentage", "story_points", "goal")
   - currentValue: The current value (or null if creating new)
   - suggestedValue: The new recommended value
   - reason: A brief explanation of why this change is recommended

IMPORTANT:
- ONLY extract suggestions that are EXPLICIT in the assistant's response
- Do NOT infer or make up suggestions that weren't clearly stated
- If the assistant was just answering a question or providing information without recommendations, return an empty array
- Focus on suggestions that modify projects, PBIs, sprints, or risks
- For status changes, only extract if the assistant gave SPECIFIC new status for SPECIFIC items
- Return a JSON array of insights

Return ONLY valid JSON in this exact format:
[
  {
    "type": "project",
    "action": "update",
    "suggestedUpdate": {
      "entityId": "actual-project-id",
      "entityName": "Project Title",
      "field": "status",
      "currentValue": "not_started",
      "suggestedValue": "in_progress",
      "reason": "Team has resources available and dependencies are resolved"
    }
  }
]

If there are no actionable suggestions, return: []`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const content = response.content[0].text;

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('[analyzeForInsights] No JSON array found in response');
      return [];
    }

    const insights = JSON.parse(jsonMatch[0]);
    console.log('[analyzeForInsights] Extracted insights:', insights.length);

    return Array.isArray(insights) ? insights : [];
  } catch (error) {
    console.error('[analyzeForInsights] Error:', error);
    return [];
  }
}
