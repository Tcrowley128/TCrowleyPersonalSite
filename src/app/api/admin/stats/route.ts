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

    // Get time period from query params (default to 7 days)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';

    // Fetch assessment stats
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, status, created_at');

    if (assessmentError) throw assessmentError;

    // Fetch assessment results with token counts
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('assessment_id, prompt_tokens, completion_tokens, regeneration_count, generated_at');

    if (resultsError) throw resultsError;

    // Fetch contact submissions
    const { data: contacts, error: contactsError } = await supabase
      .from('contact_submissions')
      .select('id, status, created_at');

    if (contactsError) throw contactsError;

    // Fetch blog posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, published, created_at');

    if (postsError) throw postsError;

    // Calculate assessment stats
    const totalAssessments = assessments?.length || 0;
    const completedAssessments = assessments?.filter(a => a.status === 'COMPLETED').length || 0;
    const inProgressAssessments = assessments?.filter(a => a.status === 'IN_PROGRESS').length || 0;
    const withResults = results?.length || 0;

    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Determine the date cutoff based on period
    let periodStart: Date;
    switch (period) {
      case '30days':
        periodStart = last30Days;
        break;
      case '90days':
        periodStart = last90Days;
        break;
      case '7days':
      default:
        periodStart = last7Days;
        break;
    }

    const assessmentsLast7Days = assessments?.filter(
      a => new Date(a.created_at) >= last7Days
    ).length || 0;

    const assessmentsLast30Days = assessments?.filter(
      a => new Date(a.created_at) >= last30Days
    ).length || 0;

    const assessmentsLast90Days = assessments?.filter(
      a => new Date(a.created_at) >= last90Days
    ).length || 0;

    // Filter data for the selected period
    const assessmentsInPeriod = assessments?.filter(
      a => new Date(a.created_at) >= periodStart
    ) || [];

    const resultsInPeriod = results?.filter(r => {
      const resultDate = new Date(r.generated_at);
      return resultDate >= periodStart;
    }) || [];

    const contactsInPeriod = contacts?.filter(
      c => new Date(c.created_at) >= periodStart
    ) || [];

    // Calculate AI usage stats (all-time)
    const totalPromptTokens = results?.reduce((sum, r) => sum + (r.prompt_tokens || 0), 0) || 0;
    const totalCompletionTokens = results?.reduce((sum, r) => sum + (r.completion_tokens || 0), 0) || 0;
    const totalTokens = totalPromptTokens + totalCompletionTokens;
    const totalRegenerations = results?.reduce((sum, r) => sum + (r.regeneration_count || 0), 0) || 0;

    // Calculate AI usage stats for selected period
    const periodPromptTokens = resultsInPeriod?.reduce((sum, r) => sum + (r.prompt_tokens || 0), 0) || 0;
    const periodCompletionTokens = resultsInPeriod?.reduce((sum, r) => sum + (r.completion_tokens || 0), 0) || 0;
    const periodTotalTokens = periodPromptTokens + periodCompletionTokens;

    // Claude pricing (approximate - adjust based on actual pricing)
    const inputCostPer1M = 3.00; // $3 per 1M input tokens
    const outputCostPer1M = 15.00; // $15 per 1M output tokens
    const estimatedCost = (totalPromptTokens / 1000000 * inputCostPer1M) +
                          (totalCompletionTokens / 1000000 * outputCostPer1M);
    const periodEstimatedCost = (periodPromptTokens / 1000000 * inputCostPer1M) +
                                (periodCompletionTokens / 1000000 * outputCostPer1M);

    // Contact submission stats
    const totalContacts = contacts?.length || 0;
    const newContacts = contacts?.filter(c => c.status === 'NEW').length || 0;
    const periodNewContacts = contactsInPeriod?.filter(c => c.status === 'NEW').length || 0;
    const contactsLast7Days = contacts?.filter(
      c => new Date(c.created_at) >= last7Days
    ).length || 0;

    // Blog post stats
    const totalPosts = posts?.length || 0;
    const publishedPosts = posts?.filter(p => p.published).length || 0;
    const totalViews = 0; // view_count column doesn't exist yet

    return NextResponse.json({
      success: true,
      stats: {
        assessments: {
          total: totalAssessments,
          completed: completedAssessments,
          inProgress: inProgressAssessments,
          withResults,
          last7Days: assessmentsLast7Days,
          last30Days: assessmentsLast30Days,
          last90Days: assessmentsLast90Days,
          inPeriod: assessmentsInPeriod.length,
        },
        ai: {
          totalTokens,
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalResults: results?.length || 0,
          totalRegenerations,
          estimatedCost: parseFloat(estimatedCost.toFixed(2)),
          periodTokens: periodTotalTokens,
          periodCost: parseFloat(periodEstimatedCost.toFixed(2)),
        },
        contacts: {
          total: totalContacts,
          new: newContacts,
          last7Days: contactsLast7Days,
          inPeriod: contactsInPeriod.length,
          newInPeriod: periodNewContacts,
        },
        blog: {
          total: totalPosts,
          published: publishedPosts,
          totalViews,
        },
        period,
      },
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch admin stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
