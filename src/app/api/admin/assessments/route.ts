import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Fetch all assessments with results count
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        id,
        company_name,
        company_size,
        industry,
        user_role,
        technical_capability,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Check which assessments have results
    const assessmentsWithResults = await Promise.all(
      (assessments || []).map(async (assessment) => {
        const { data: result } = await supabase
          .from('assessment_results')
          .select('id')
          .eq('assessment_id', assessment.id)
          .single();

        return {
          ...assessment,
          has_results: !!result
        };
      })
    );

    return NextResponse.json({
      success: true,
      assessments: assessmentsWithResults,
      total: assessmentsWithResults.length
    });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
