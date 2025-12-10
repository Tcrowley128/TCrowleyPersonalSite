import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// GET /api/assessment/[id]/results - Fetch assessment results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    // Verify authentication and ownership
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user owns this assessment
    const { data: assessment, error: assessmentError } = await authSupabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this assessment' },
        { status: 403 }
      );
    }

    // User owns the assessment, fetch results using admin client
    const supabase = createAdminClient();
    const { data: results, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error) {
      console.error('Error fetching assessment results:', error);
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assessment results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
