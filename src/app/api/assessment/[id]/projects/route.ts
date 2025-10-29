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

    // Fetch all projects for this assessment
    const { data: projects, error } = await supabase
      .from('transformation_projects')
      .select(`
        *,
        tasks:project_tasks(count)
      `)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
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

    const {
      title,
      description,
      category,
      priority = 'medium',
      complexity = 'moderate',
      source_recommendation_id,
      recommendation_type,
      recommended_tools,
      estimated_effort,
      estimated_impact,
      estimated_timeline_days,
      target_completion_date,
      assigned_owner,
      team_members
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create the project
    const { data: project, error } = await supabase
      .from('transformation_projects')
      .insert({
        assessment_id: assessmentId,
        title,
        description,
        category,
        priority,
        complexity,
        source_recommendation_id,
        recommendation_type,
        recommended_tools,
        estimated_effort,
        estimated_impact,
        estimated_timeline_days,
        target_completion_date,
        assigned_owner,
        team_members,
        status: 'not_started',
        progress_percentage: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assessment/[id]/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
