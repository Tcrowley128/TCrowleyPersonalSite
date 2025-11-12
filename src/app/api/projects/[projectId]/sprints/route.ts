import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/projects/[projectId]/sprints - List all sprints for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sprints, error } = await query;

    if (error) {
      console.error('Error fetching sprints:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sprints' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sprints: sprints || [] });
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/sprints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/sprints - Create new sprint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Auto-calculate sprint number
    const { data: existingSprints } = await supabase
      .from('sprints')
      .select('sprint_number')
      .eq('project_id', projectId)
      .order('sprint_number', { ascending: false })
      .limit(1);

    const nextSprintNumber = (existingSprints?.[0]?.sprint_number || 0) + 1;

    const sprintData = {
      project_id: projectId,
      sprint_number: nextSprintNumber,
      ...body
    };

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert(sprintData)
      .select()
      .single();

    if (error) {
      console.error('Error creating sprint:', error);
      return NextResponse.json(
        { error: 'Failed to create sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/sprints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
