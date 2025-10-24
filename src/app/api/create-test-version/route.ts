import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Temporary endpoint to create test versions for existing assessments
// DELETE THIS FILE after testing the restore feature
export async function POST(request: Request) {
  try {
    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if assessment exists
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessment_results')
      .select('assessment_id')
      .eq('assessment_id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Create a version snapshot
    const { data: versionId, error: versionError } = await supabase.rpc(
      'create_assessment_version',
      {
        p_assessment_id: assessmentId,
        p_created_by: 'manual_snapshot',
        p_change_summary: 'Test version created for restore feature testing',
        p_changed_responses: null,
      }
    );

    if (versionError) {
      console.error('Error creating version:', versionError);
      return NextResponse.json(
        { error: 'Failed to create version', details: versionError.message },
        { status: 500 }
      );
    }

    // Fetch all versions to show
    const { data: versions, error: versionsError } = await supabase
      .from('assessment_versions')
      .select('id, version_number, is_current, created_by, change_summary, created_at')
      .eq('assessment_id', assessmentId)
      .order('version_number', { ascending: false });

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
    }

    return NextResponse.json({
      success: true,
      versionId,
      message: 'Version created successfully!',
      versions: versions || [],
      testUrl: `http://localhost:3002/assessment/results/${assessmentId}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
