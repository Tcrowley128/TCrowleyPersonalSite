import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Fetch all chat conversations with analytics
    const { data: conversations, error: convError } = await supabase
      .from('assessment_conversations')
      .select(`
        id,
        assessment_id,
        user_id,
        title,
        total_messages,
        total_tokens,
        total_cost,
        created_at,
        updated_at,
        assessments (
          company_name,
          industry
        )
      `)
      .order('created_at', { ascending: false });

    if (convError) {
      throw convError;
    }

    // Fetch detailed message stats
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select('conversation_id, input_tokens, output_tokens, total_tokens, created_at, role');

    if (msgError) {
      throw msgError;
    }

    // Calculate costs
    const inputCostPer1M = 3.00; // $3 per 1M input tokens
    const outputCostPer1M = 15.00; // $15 per 1M output tokens

    // Process conversation data
    const conversationData = (conversations || []).map(conv => {
      const convMessages = (messages || []).filter(m => m.conversation_id === conv.id);
      const totalInputTokens = convMessages.reduce((sum, m) => sum + (m.input_tokens || 0), 0);
      const totalOutputTokens = convMessages.reduce((sum, m) => sum + (m.output_tokens || 0), 0);
      const totalTokens = totalInputTokens + totalOutputTokens;
      const cost = (totalInputTokens / 1000000 * inputCostPer1M) +
                   (totalOutputTokens / 1000000 * outputCostPer1M);

      return {
        conversation_id: conv.id,
        assessment_id: conv.assessment_id,
        company_name: (conv.assessments as any)?.company_name || 'Anonymous',
        industry: (conv.assessments as any)?.industry || 'Unknown',
        title: conv.title,
        message_count: convMessages.length,
        user_messages: convMessages.filter(m => m.role === 'user').length,
        assistant_messages: convMessages.filter(m => m.role === 'assistant').length,
        input_tokens: totalInputTokens,
        output_tokens: totalOutputTokens,
        total_tokens: totalTokens,
        cost,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      };
    });

    // Calculate summary stats
    const totalConversations = conversationData.length;
    const totalMessages = conversationData.reduce((sum, c) => sum + c.message_count, 0);
    const totalTokens = conversationData.reduce((sum, c) => sum + c.total_tokens, 0);
    const totalCost = conversationData.reduce((sum, c) => sum + c.cost, 0);
    const avgMessagesPerConversation = totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;
    const avgTokensPerConversation = totalConversations > 0
      ? Math.round(totalTokens / totalConversations)
      : 0;

    // Calculate period breakdowns
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const calculatePeriod = (startDate: Date) => {
      const periodConvs = conversationData.filter(c => new Date(c.created_at) >= startDate);
      return {
        conversations: periodConvs.length,
        messages: periodConvs.reduce((sum, c) => sum + c.message_count, 0),
        tokens: periodConvs.reduce((sum, c) => sum + c.total_tokens, 0),
        cost: periodConvs.reduce((sum, c) => sum + c.cost, 0),
      };
    };

    const byPeriod = {
      today: calculatePeriod(startOfToday),
      thisWeek: calculatePeriod(startOfWeek),
      thisMonth: calculatePeriod(startOfMonth),
    };

    // Get top questions (conversation titles)
    const topQuestions = conversationData
      .filter(c => c.title)
      .slice(0, 20)
      .map(c => ({
        title: c.title,
        company_name: c.company_name,
        message_count: c.message_count,
        created_at: c.created_at,
      }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalConversations,
          totalMessages,
          totalTokens,
          totalCost: parseFloat(totalCost.toFixed(2)),
          avgMessagesPerConversation,
          avgTokensPerConversation,
        },
        byPeriod,
        conversations: conversationData,
        topQuestions,
      },
    });

  } catch (error) {
    console.error('Error fetching chat analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
