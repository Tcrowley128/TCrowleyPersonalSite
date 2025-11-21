import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/assessment/[id]/projects - List all projects for an assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = createAdminClient();

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10); // Default limit of 50
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get total count
    const { count } = await supabase
      .from('assessment_projects')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId);

    // Fetch projects with limit - sorted by updated_at so recently modified projects appear first
    const { data: projects, error } = await supabase
      .from('assessment_projects')
      .select(`
        *,
        tasks:project_tasks(count)
      `)
      .eq('assessment_id', assessmentId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: projects || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET /api/assessment/[id]/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assessment/[id]/projects - Create a new project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const projectData = {
      assessment_id: assessmentId,
      title: body.title,
      description: body.description,
      category: body.category,
      operational_area: body.operational_area,
      status: body.status || 'not_started',
      priority: body.priority || 'medium',
      complexity: body.complexity || 'medium',
      project_lead: body.project_lead,
      team_members: body.team_members || [],
      estimated_timeline_days: body.estimated_timeline_days,
      target_completion_date: body.target_completion_date,
      source_recommendation_id: body.source_recommendation_id,
      source_type: body.source_type
    };

    const { data: project, error } = await supabase
      .from('assessment_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error in POST /api/assessment/[id]/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
