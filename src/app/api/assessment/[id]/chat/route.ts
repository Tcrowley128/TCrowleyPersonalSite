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
          user_id: user?.id || null, // Allow anonymous conversations
          title: message.substring(0, 100) // Use first 100 chars of message as title
        })
        .select()
        .single();

      if (convError || !newConversation) {
        throw new Error('Failed to create conversation');
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

    // Build context-aware prompt
    const systemPrompt = buildChatSystemPrompt(assessment, results);

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

          // Detect insights in the background (don't wait for it)
          if (savedMessage?.id) {
            detectInsights(assessment_id, savedMessage.id, fullMessage, currentConversationId).catch(err => {
              console.error('[Chat] Error detecting insights:', err);
            });
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
    console.error('Error in chat endpoint:', error);
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

    // Get user if authenticated (optional for shared assessments)
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    const supabase = createAdminClient();

    // Get conversations for this assessment
    // If user is authenticated, get all conversations; if not, get only anonymous conversations
    let query = supabase
      .from('assessment_conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at
      `)
      .eq('assessment_id', assessment_id);

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
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildChatSystemPrompt(assessment: any, results: any): string {
  return `You are Tyler's AI Assistant, helping users understand and implement their digital transformation roadmap.

You have access to the complete assessment results for this user. Use this context to provide specific, personalized answers.

COMPANY CONTEXT:
- Company: ${results.company_name || assessment.company_name || 'the organization'}
- Industry: ${assessment.industry}
- Company Size: ${assessment.company_size}
- Technical Capability: ${assessment.technical_capability}

ASSESSMENT RESULTS SUMMARY:
- Data Strategy Score: ${results.maturity_assessment?.data_strategy?.score || 'N/A'}/5
- Automation Strategy Score: ${results.maturity_assessment?.automation_strategy?.score || 'N/A'}/5
- AI Strategy Score: ${results.maturity_assessment?.ai_strategy?.score || 'N/A'}/5
- People Strategy Score: ${results.maturity_assessment?.people_strategy?.score || 'N/A'}/5

RECOMMENDED TOOLS:
- Citizen-Led Solutions: ${results.tier1_citizen_led?.length || 0} recommendations
- Hybrid Solutions: ${results.tier2_hybrid?.length || 0} recommendations
- Technical Solutions: ${results.tier3_technical?.length || 0} recommendations

QUICK WINS: ${results.quick_wins?.length || 0} identified

YOUR ROLE:
1. Answer questions about the assessment results and recommendations
2. Explain WHY specific tools or approaches were recommended
3. Provide implementation guidance and step-by-step help
4. Compare different tool options when asked
5. Offer realistic timelines and resource estimates
6. Help prioritize initiatives based on their context
7. Address concerns and objections to recommendations

GUIDELINES:
- Be conversational and friendly, but professional
- Use relevant emojis throughout your responses for better readability (e.g., 🎯 for goals, ✅ for benefits, 💡 for tips, ⚠️ for warnings, 📊 for metrics, 🚀 for implementation, 💰 for costs, ⏱️ for timelines)
- Format responses using markdown: **bold** for emphasis, bullet points for lists, numbered lists for steps
- Reference their specific data when relevant (company size, industry, scores)
- If asked about a specific recommendation, look for it in their results
- Provide actionable, practical advice
- Be honest about complexity and effort required
- Encourage starting with quick wins before larger initiatives
- Remind them that these are estimates - validate with their specific business context
- If you don't have information about something, acknowledge it rather than making it up

AVAILABLE DATA STRUCTURE:
You have access to: maturity_assessment (with sub_categories for each pillar), quick_wins, tier1_citizen_led, tier2_hybrid, tier3_technical, existing_tool_opportunities, roadmap (30/60/90 days), change_management_plan, success_metrics, long_term_vision.

Reference specific recommendations by name when answering questions. Be specific and cite details from their actual assessment.`;
}

async function detectInsights(assessmentId: string, messageId: string, messageContent: string, conversationId: string) {
  console.log('[Chat - Detect Insights] Analyzing message for insights...');

  const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Chat - Detect Insights] No API key found');
    return;
  }

  const anthropic = new Anthropic({ apiKey });
  const supabase = createAdminClient();

  try {
    // Get assessment results for context
    const { data: results } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (!results) {
      console.error('[Chat - Detect Insights] Assessment results not found');
      return;
    }

    // Use AI to detect actionable insights
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
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
      }],
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

          console.log('[Chat - Detect Insights] Found', insights.insights.length, 'actionable insights');
        } else {
          console.log('[Chat - Detect Insights] No actionable insights found');
        }
      }
    }
  } catch (error) {
    console.error('[Chat - Detect Insights] Error:', error);
  }
}
