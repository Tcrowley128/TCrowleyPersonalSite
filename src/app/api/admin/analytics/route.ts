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

    // Fetch all assessment results with token usage
    const { data: results, error } = await supabase
      .from('assessment_results')
      .select(`
        assessment_id,
        prompt_tokens,
        completion_tokens,
        regeneration_count,
        model_version,
        generated_at
      `)
      .order('generated_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch assessment details separately to get company names
    const assessmentIds = (results || []).map(r => r.assessment_id);
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, company_name')
      .in('id', assessmentIds);

    // Create a map for quick lookup
    const assessmentMap = new Map(
      (assessments || []).map(a => [a.id, a.company_name])
    );

    // Calculate costs
    const inputCostPer1M = 3.00; // $3 per 1M input tokens
    const outputCostPer1M = 15.00; // $15 per 1M output tokens

    const usage = (results || []).map(record => {
      const promptTokens = record.prompt_tokens || 0;
      const completionTokens = record.completion_tokens || 0;
      const totalTokens = promptTokens + completionTokens;
      const cost = (promptTokens / 1000000 * inputCostPer1M) +
                   (completionTokens / 1000000 * outputCostPer1M);

      return {
        assessment_id: record.assessment_id,
        company_name: assessmentMap.get(record.assessment_id) || 'Anonymous',
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        regeneration_count: record.regeneration_count || 0,
        model_version: record.model_version || 'claude-sonnet-4',
        created_at: record.generated_at,
        cost,
      };
    });

    // Calculate summary stats
    const totalGenerations = usage.length;
    const totalTokens = usage.reduce((sum, r) => sum + r.total_tokens, 0);
    const totalCost = usage.reduce((sum, r) => sum + r.cost, 0);
    const avgTokensPerGeneration = totalGenerations > 0 ? Math.round(totalTokens / totalGenerations) : 0;
    const totalRegenerations = usage.reduce((sum, r) => sum + r.regeneration_count, 0);

    // Calculate period breakdowns
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const calculatePeriod = (startDate: Date) => {
      const periodRecords = usage.filter(r => new Date(r.created_at) >= startDate);
      return {
        generations: periodRecords.length,
        tokens: periodRecords.reduce((sum, r) => sum + r.total_tokens, 0),
        cost: periodRecords.reduce((sum, r) => sum + r.cost, 0),
      };
    };

    const byPeriod = {
      today: calculatePeriod(startOfToday),
      thisWeek: calculatePeriod(startOfWeek),
      thisMonth: calculatePeriod(startOfMonth),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalGenerations,
          totalTokens,
          totalCost: parseFloat(totalCost.toFixed(2)),
          avgTokensPerGeneration,
          totalRegenerations,
        },
        byPeriod,
        usage,
      },
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
