import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/pbis/[pbiId]/activity - Get activity log for a PBI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const supabase = createAdminClient();

    const { data: activities, error } = await supabase
      .from('pbi_activity_log')
      .select('*')
      .eq('pbi_id', pbiId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error fetching activity log:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error) {
    console.error('Error in GET /api/pbis/[pbiId]/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pbis/[pbiId]/activity - Create an activity log entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Get the PBI to get project_id
    const { data: pbi, error: pbiError } = await supabase
      .from('product_backlog_items')
      .select('project_id')
      .eq('id', pbiId)
      .single();

    if (pbiError || !pbi) {
      return NextResponse.json(
        { error: 'PBI not found' },
        { status: 404 }
      );
    }

    const activityData = {
      pbi_id: pbiId,
      project_id: pbi.project_id,
      activity_type: body.activity_type,
      field_name: body.field_name || null,
      old_value: body.old_value || null,
      new_value: body.new_value || null,
      changed_by: body.changed_by || 'system',
      description: body.description || null,
      metadata: body.metadata || null
    };

    const { data: activity, error } = await supabase
      .from('pbi_activity_log')
      .insert(activityData)
      .select()
      .single();

    if (error) {
      console.error('Error creating activity log:', error);
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pbis/[pbiId]/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
