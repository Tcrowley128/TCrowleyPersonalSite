import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/projects/[projectId]/sprints/[sprintId] - Get a specific sprint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const supabase = createAdminClient();

    const { data: sprint, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error fetching sprint:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/sprints/[sprintId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/sprints/[sprintId] - Update sprint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updates: any = {
      ...body,
      updated_at: new Date().toISOString()
    };

    const { data: sprint, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', sprintId)
      .eq('project_id', projectId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating sprint:', error);
      return NextResponse.json(
        { error: 'Failed to update sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error('Error in PATCH /api/projects/[projectId]/sprints/[sprintId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/sprints/[sprintId] - Delete sprint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  try {
    const { projectId, sprintId } = await params;
    const supabase = createAdminClient();

    // Move all PBIs in this sprint back to backlog
    await supabase
      .from('product_backlog_items')
      .update({ sprint_id: null, status: 'approved' })
      .eq('sprint_id', sprintId);

    // Delete the sprint
    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error deleting sprint:', error);
      return NextResponse.json(
        { error: 'Failed to delete sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[projectId]/sprints/[sprintId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
