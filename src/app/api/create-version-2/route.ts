import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Temporary endpoint to create version 2 by making a small change
// DELETE THIS FILE after testing
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

    // Get current results
    const { data: currentResults, error: fetchError } = await supabase
      .from('assessment_results')
      .select('executive_summary')
      .eq('assessment_id', assessmentId)
      .single();

    if (fetchError || !currentResults) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Make a small change to the executive summary
    const modifiedSummary = {
      ...currentResults.executive_summary,
      current_state: (currentResults.executive_summary?.current_state || '') + ' [MODIFIED FOR VERSION 2 TESTING]'
    };

    // Update the results with the modified summary
    const { error: updateError } = await supabase
      .from('assessment_results')
      .update({ executive_summary: modifiedSummary })
      .eq('assessment_id', assessmentId);

    if (updateError) {
      console.error('Error updating results:', updateError);
      return NextResponse.json(
        { error: 'Failed to update results', details: updateError.message },
        { status: 500 }
      );
    }

    // Create version 2 snapshot
    const { data: versionId, error: versionError } = await supabase.rpc(
      'create_assessment_version',
      {
        p_assessment_id: assessmentId,
        p_created_by: 'manual_edit',
        p_change_summary: 'Version 2 - Modified executive summary for testing',
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

    // Fetch all versions
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
      message: 'Version 2 created successfully!',
      change: 'Modified executive summary',
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
