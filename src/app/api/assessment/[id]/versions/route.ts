import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/assessment/[id]/versions
// List all versions of an assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id: assessmentId } = await params;

    console.log('[versions API] Fetching versions for assessment:', assessmentId);

    // Fetch all versions
    const { data: versions, error } = await supabase
      .from('assessment_versions')
      .select('id, version_number, is_current, created_by, change_summary, created_at')
      .eq('assessment_id', assessmentId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('[versions API] Error fetching versions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch versions', details: error.message },
        { status: 500 }
      );
    }

    console.log('[versions API] Found versions:', versions?.length || 0);

    return NextResponse.json({
      versions: versions || [],
    });
  } catch (error) {
    console.error('[versions API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assessment/[id]/versions
// Restore a specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = await params;
    const body = await request.json();

    const { version_number } = body;

    if (!version_number) {
      return NextResponse.json(
        { error: 'version_number is required' },
        { status: 400 }
      );
    }

    // Call database function to restore version
    const { error } = await supabase.rpc('restore_assessment_version', {
      p_assessment_id: assessmentId,
      p_version_number: version_number,
    });

    if (error) {
      console.error('Error restoring version:', error);
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Restored to version ${version_number}`,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/assessment/[id]/versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
