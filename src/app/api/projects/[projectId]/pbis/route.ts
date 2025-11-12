import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/projects/[projectId]/pbis - List all PBIs for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Extract filters from query params
    const sprintId = searchParams.get('sprint_id');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const itemType = searchParams.get('item_type');
    const parentId = searchParams.get('parent_id');
    const limit = parseInt(searchParams.get('limit') || '200', 10); // Default limit of 200
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('product_backlog_items')
      .select('*')
      .eq('project_id', projectId)
      .order('backlog_order', { ascending: true });

    // Apply filters if provided
    if (sprintId) {
      query = query.eq('sprint_id', sprintId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    if (itemType) {
      query = query.eq('item_type', itemType);
    }
    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    // Apply limit and offset
    query = query.range(offset, offset + limit - 1);

    const { data: pbis, error } = await query;

    if (error) {
      console.error('Error fetching PBIs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product backlog items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pbis: pbis || [] });
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/pbis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/pbis - Create new PBI
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Auto-calculate backlog_order (add to end)
    const { data: existingPbis } = await supabase
      .from('product_backlog_items')
      .select('backlog_order')
      .eq('project_id', projectId)
      .order('backlog_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingPbis?.[0]?.backlog_order || 0) + 1;

    const pbiData = {
      project_id: projectId,
      backlog_order: nextOrder,
      status: 'new',
      created_date: new Date().toISOString(),
      ...body
    };

    const { data: pbi, error } = await supabase
      .from('product_backlog_items')
      .insert(pbiData)
      .select()
      .single();

    if (error) {
      console.error('Error creating PBI:', error);
      return NextResponse.json(
        { error: 'Failed to create product backlog item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pbi }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/pbis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
