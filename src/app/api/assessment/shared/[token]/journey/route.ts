import { NextRequest, NextResponse } from 'next/server';
import { validateShareToken, incrementShareTokenViewCount } from '@/lib/supabase/share-token';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/assessment/shared/[token]/journey - Access shared journey data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate share token
    const validation = await validateShareToken(token);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid share link' },
        { status: validation.error?.includes('expired') ? 410 : 404 }
      );
    }

    const { assessmentId, shareToken } = validation;

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Fetch assessment metadata
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('company_name, company_size, industry')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment not found:', assessmentId);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('assessment_projects')
      .select(`
        *,
        tasks:project_tasks(count)
      `)
      .eq('assessment_id', assessmentId)
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Increment view count asynchronously (non-blocking)
    if (shareToken?.id) {
      incrementShareTokenViewCount(shareToken.id);
    }

    console.log('Shared journey accessed:', {
      token,
      assessment_id: assessmentId,
      projects_count: projects?.length || 0
    });

    // Return journey data with metadata and share info
    return NextResponse.json({
      success: true,
      assessment,
      projects: projects || [],
      share_info: {
        permission_level: shareToken?.permission_level || 'view',
        expires_at: shareToken?.expires_at,
        created_at: shareToken?.created_at
      },
      is_shared_view: true
    });

  } catch (error) {
    console.error('Error accessing shared journey:', error);
    return NextResponse.json(
      {
        error: 'Failed to access shared journey',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
