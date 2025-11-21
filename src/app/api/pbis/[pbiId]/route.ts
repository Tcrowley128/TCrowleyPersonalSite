import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/pbis/[pbiId] - Get single PBI with tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const supabase = createAdminClient();

    const { data: pbi, error } = await supabase
      .from('product_backlog_items')
      .select('*')
      .eq('id', pbiId)
      .single();

    if (error) {
      console.error('Error fetching PBI:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product backlog item' },
        { status: 500 }
      );
    }

    if (!pbi) {
      return NextResponse.json(
        { error: 'Product backlog item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pbi });
  } catch (error) {
    console.error('Error in GET /api/pbis/[pbiId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/pbis/[pbiId] - Update PBI
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Get current PBI state for comparison
    const { data: currentPbi, error: fetchError } = await supabase
      .from('product_backlog_items')
      .select('*')
      .eq('id', pbiId)
      .single();

    if (fetchError || !currentPbi) {
      return NextResponse.json(
        { error: 'Product backlog item not found' },
        { status: 404 }
      );
    }

    // Update timestamps based on status changes
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString()
    };

    // Set activated_date when status changes to in_progress
    if (body.status === 'in_progress' && !body.activated_date) {
      updates.activated_date = new Date().toISOString();
    }

    // Set resolved_date when status changes to done
    if (body.status === 'done' && !body.resolved_date) {
      updates.resolved_date = new Date().toISOString();
    }

    const { data: pbi, error } = await supabase
      .from('product_backlog_items')
      .update(updates)
      .eq('id', pbiId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating PBI:', error);
      return NextResponse.json(
        { error: 'Failed to update product backlog item' },
        { status: 500 }
      );
    }

    // Log changes in activity log
    const changedBy = body.changed_by || 'system';
    const activities = [];

    // Check each field for changes and log them
    const fieldsToTrack = {
      status: 'Status',
      assigned_to: 'Assigned To',
      priority: 'Priority',
      story_points: 'Story Points',
      title: 'Title',
      description: 'Description',
      acceptance_criteria: 'Acceptance Criteria',
      sprint_id: 'Sprint'
    };

    for (const [field, label] of Object.entries(fieldsToTrack)) {
      if (body[field] !== undefined && currentPbi[field] !== body[field]) {
        const oldValue = currentPbi[field] || 'None';
        const newValue = body[field] || 'None';

        activities.push({
          pbi_id: pbiId,
          project_id: currentPbi.project_id,
          activity_type: 'updated',
          field_name: field,
          old_value: String(oldValue),
          new_value: String(newValue),
          changed_by: changedBy,
          description: `${label} changed from "${oldValue}" to "${newValue}"`
        });
      }
    }

    // Insert all activity logs
    if (activities.length > 0) {
      await supabase
        .from('pbi_activity_log')
        .insert(activities);
    }

    // Trigger notifications for status changes (only if user wants them)
    if (body.status !== undefined && currentPbi.status !== body.status && currentPbi.assigned_to) {
      try {
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('notify_assigned_status_change')
          .eq('user_id', currentPbi.assigned_to)
          .single();

        if (prefs?.notify_assigned_status_change) {
          const linkUrl = `/assessment/journey/${currentPbi.assessment_id}?section=sprints&pbi=${pbiId}`;

          await supabase.rpc('create_notification', {
            p_user_id: currentPbi.assigned_to,
            p_type: 'status_change',
            p_title: `${currentPbi.item_type === 'task' ? 'Task' : 'Story'} status changed`,
            p_message: `"${currentPbi.title}" moved from ${currentPbi.status} to ${body.status}`,
            p_entity_type: currentPbi.item_type,
            p_entity_id: pbiId,
            p_link_url: linkUrl,
            p_from_user_id: changedBy,
            p_from_user_name: changedBy
          });
        }
      } catch (notifError) {
        console.error('Error sending status change notification:', notifError);
      }
    }

    // Trigger notifications for new assignments (only if user wants them)
    if (body.assigned_to !== undefined && currentPbi.assigned_to !== body.assigned_to && body.assigned_to) {
      try {
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('notify_assigned_to_me')
          .eq('user_id', body.assigned_to)
          .single();

        if (prefs?.notify_assigned_to_me) {
          const linkUrl = `/assessment/journey/${currentPbi.assessment_id}?section=sprints&pbi=${pbiId}`;

          await supabase.rpc('create_notification', {
            p_user_id: body.assigned_to,
            p_type: 'assignment',
            p_title: `Assigned to ${currentPbi.item_type === 'task' ? 'task' : 'story'}`,
            p_message: `"${currentPbi.title}"`,
            p_entity_type: currentPbi.item_type,
            p_entity_id: pbiId,
            p_link_url: linkUrl,
            p_from_user_id: changedBy,
            p_from_user_name: changedBy
          });
        }
      } catch (notifError) {
        console.error('Error sending assignment notification:', notifError);
      }
    }

    // Update sprint completed_story_points when PBI status changes
    if (body.status !== undefined && pbi.sprint_id) {
      try {
        // Get all PBIs in this sprint with status 'done'
        const { data: completedPbis, error: completedError } = await supabase
          .from('product_backlog_items')
          .select('story_points')
          .eq('sprint_id', pbi.sprint_id)
          .eq('status', 'done');

        if (!completedError && completedPbis) {
          // Calculate total completed story points
          const totalCompleted = completedPbis.reduce(
            (sum, item) => sum + (Number(item.story_points) || 0),
            0
          );

          // Update the sprint
          await supabase
            .from('sprints')
            .update({ completed_story_points: totalCompleted })
            .eq('id', pbi.sprint_id);
        }
      } catch (sprintUpdateError) {
        console.error('Error updating sprint completed_story_points:', sprintUpdateError);
      }
    }

    return NextResponse.json({ pbi });
  } catch (error) {
    console.error('Error in PATCH /api/pbis/[pbiId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/pbis/[pbiId] - Delete PBI
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pbiId: string }> }
) {
  try {
    const { pbiId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('product_backlog_items')
      .delete()
      .eq('id', pbiId);

    if (error) {
      console.error('Error deleting PBI:', error);
      return NextResponse.json(
        { error: 'Failed to delete product backlog item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/pbis/[pbiId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
