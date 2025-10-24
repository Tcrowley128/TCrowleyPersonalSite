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

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Delete the assessment (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
