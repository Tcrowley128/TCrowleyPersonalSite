import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/pbis/[pbiId]/tasks - List all tasks for a PBI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const supabase = createAdminClient();

    const { data: tasks, error } = await supabase
      .from('sprint_tasks')
      .select('*')
      .eq('pbi_id', pbiId)
      .order('task_order', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error in GET /api/pbis/[pbiId]/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pbis/[pbiId]/tasks - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Auto-calculate task_order (add to end)
    const { data: existingTasks } = await supabase
      .from('sprint_tasks')
      .select('task_order')
      .eq('pbi_id', pbiId)
      .order('task_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingTasks?.[0]?.task_order || 0) + 1;

    const taskData = {
      pbi_id: pbiId,
      task_order: nextOrder,
      status: 'to_do',
      ...body
    };

    const { data: task, error } = await supabase
      .from('sprint_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pbis/[pbiId]/tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
