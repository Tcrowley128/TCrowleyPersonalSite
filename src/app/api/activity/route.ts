import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/activity - Get activity feed
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const assessmentId = searchParams.get('assessment_id');
    const projectId = searchParams.get('project_id');
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activity feed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity feed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error) {
    console.error('Error in GET /api/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activity - Create activity log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const {
      entity_type,
      entity_id,
      activity_type,
      user_id,
      user_name,
      description,
      project_id,
      assessment_id,
      field_name,
      old_value,
      new_value,
      metadata
    } = body;

    // Use the log_activity function
    const { data, error } = await supabase.rpc('log_activity', {
      p_entity_type: entity_type,
      p_entity_id: entity_id,
      p_activity_type: activity_type,
      p_user_id: user_id,
      p_user_name: user_name,
      p_description: description,
      p_project_id: project_id || null,
      p_assessment_id: assessment_id || null,
      p_field_name: field_name || null,
      p_old_value: old_value || null,
      p_new_value: new_value || null,
      p_metadata: metadata || {}
    });

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity_id: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
