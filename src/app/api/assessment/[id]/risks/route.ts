import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = createAdminClient();

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10); // Default limit of 100
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // First, get all project IDs for this assessment
    const { data: projects, error: projectsError } = await supabase
      .from('assessment_projects')
      .select('id, title')
      .eq('assessment_id', assessmentId);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ risks: [], total: 0 });
    }

    const projectIds = projects.map(p => p.id);

    // Get total count
    const { count, error: countError } = await supabase
      .from('project_risks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds);

    // Fetch risks with limit and offset
    const { data: risks, error: risksError } = await supabase
      .from('project_risks')
      .select('*')
      .in('project_id', projectIds)
      .order('identified_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (risksError) {
      console.error('Error fetching risks:', risksError);
      return NextResponse.json({ error: 'Failed to fetch risks' }, { status: 500 });
    }

    // Map project titles to risks
    const risksWithProjectTitles = (risks || []).map(risk => {
      const project = projects.find(p => p.id === risk.project_id);
      return {
        ...risk,
        project_title: project?.title || 'Unknown Project'
      };
    });

    return NextResponse.json({
      risks: risksWithProjectTitles,
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in risks API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
