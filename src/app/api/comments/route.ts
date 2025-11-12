import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/comments - Get comments for an entity
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const {
      entity_type,
      entity_id,
      content,
      parent_comment_id,
      thread_level = 0,
      user_id,
      user_name
    } = body;

    if (!entity_type || !entity_id || !content || !user_id) {
      return NextResponse.json(
        { error: 'entity_type, entity_id, content, and user_id are required' },
        { status: 400 }
      );
    }

    // Extract mentions from content
    const { data: mentions } = await supabase.rpc('extract_mentions', {
      p_text: content
    });

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        entity_type,
        entity_id,
        content,
        parent_comment_id: parent_comment_id || null,
        thread_level,
        user_id,
        user_name,
        mentioned_users: mentions || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Get project_id, assessment_id, and titles based on entity type
    let project_id = null;
    let assessment_id = null;
    let entity_title = null;
    let project_title = null;

    if (entity_type === 'pbi') {
      const { data: pbi } = await supabase
        .from('product_backlog_items')
        .select('project_id, title')
        .eq('id', entity_id)
        .single();
      project_id = pbi?.project_id || null;
      entity_title = pbi?.title || null;

      // Get assessment_id and project_title from the project
      if (project_id) {
        const { data: project } = await supabase
          .from('assessment_projects')
          .select('assessment_id, title')
          .eq('id', project_id)
          .single();
        assessment_id = project?.assessment_id || null;
        project_title = project?.title || null;
      }
    } else if (entity_type === 'project') {
      // For project comments, get info from assessment_projects
      const { data: project } = await supabase
        .from('assessment_projects')
        .select('assessment_id, title')
        .eq('id', entity_id)
        .single();
      project_id = entity_id;
      assessment_id = project?.assessment_id || null;
      entity_title = project?.title || null;
      project_title = project?.title || null;
    } else if (entity_type === 'risk') {
      // For risk comments, get info from project_risks
      const { data: risk } = await supabase
        .from('project_risks')
        .select('project_id, title')
        .eq('id', entity_id)
        .single();
      project_id = risk?.project_id || null;
      entity_title = risk?.title || null;

      // Get assessment_id and project_title from the project
      if (project_id) {
        const { data: project } = await supabase
          .from('assessment_projects')
          .select('assessment_id, title')
          .eq('id', project_id)
          .single();
        assessment_id = project?.assessment_id || null;
        project_title = project?.title || null;
      }
    }

    // Create activity log entry
    console.log('Logging activity with:', {
      entity_type,
      entity_id,
      project_id,
      assessment_id,
      entity_title,
      project_title,
      user_name
    });

    const { data: activityResult, error: logError } = await supabase.rpc('log_activity', {
      p_entity_type: entity_type,
      p_entity_id: entity_id,
      p_activity_type: 'commented',
      p_user_id: user_id,
      p_user_name: user_name,
      p_description: `${user_name} commented: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      p_metadata: { comment_id: comment.id },
      p_project_id: project_id,
      p_assessment_id: assessment_id,
      p_entity_title: entity_title,
      p_project_title: project_title
    });

    if (logError) {
      console.error('Error logging activity:', logError);
    } else {
      console.log('Activity logged successfully, ID:', activityResult);
    }

    // Build link URL for notifications
    const linkUrl = entity_type === 'pbi'
      ? `/assessment/journey/${assessment_id}?section=sprints&pbi=${entity_id}`
      : entity_type === 'risk'
        ? `/assessment/journey/${assessment_id}?section=risks&risk=${entity_id}`
        : null;

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUser of mentions) {
        await supabase.rpc('create_notification', {
          p_user_id: mentionedUser,
          p_type: 'mention',
          p_title: 'You were mentioned',
          p_message: `${user_name} mentioned you in a comment`,
          p_entity_type: entity_type,
          p_entity_id: entity_id,
          p_link_url: linkUrl,
          p_from_user_id: user_id,
          p_from_user_name: user_name
        });
      }
    }

    // Get users who should be notified about this comment
    try {
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('user_id, notify_all_comments, notify_comment_replies')
        .or('notify_all_comments.eq.true,notify_comment_replies.eq.true');

      if (preferences && preferences.length > 0) {
        // linkUrl is already defined above, just use it for all notifications

        // If this is a reply to another comment, notify the parent comment author
        if (parent_comment_id) {
          const { data: parentComment } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', parent_comment_id)
            .single();

          if (parentComment) {
            // Check if parent comment author wants reply notifications
            const parentUserPref = preferences.find(p => p.user_id === parentComment.user_id);
            if (parentUserPref?.notify_comment_replies && parentComment.user_id !== user_id) {
              await supabase.rpc('create_notification', {
                p_user_id: parentComment.user_id,
                p_type: 'comment',
                p_title: `${user_name} replied to your comment`,
                p_message: `on ${entity_type}: "${entity_title || 'Item'}"`,
                p_entity_type: entity_type,
                p_entity_id: entity_id,
                p_link_url: linkUrl,
                p_from_user_id: user_id,
                p_from_user_name: user_name
              });
            }
          }
        }

        // Notify users who want all comment notifications (except the commenter and those already mentioned)
        const notifiedUsers = new Set([user_id, ...(mentions || [])]);
        if (parent_comment_id) {
          const { data: parentComment } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', parent_comment_id)
            .single();
          if (parentComment) notifiedUsers.add(parentComment.user_id);
        }

        for (const pref of preferences) {
          if (pref.notify_all_comments && !notifiedUsers.has(pref.user_id)) {
            await supabase.rpc('create_notification', {
              p_user_id: pref.user_id,
              p_type: 'comment',
              p_title: `${user_name} commented`,
              p_message: `on ${entity_type}: "${entity_title || 'Item'}"`,
              p_entity_type: entity_type,
              p_entity_id: entity_id,
              p_link_url: linkUrl,
              p_from_user_id: user_id,
              p_from_user_name: user_name
            });
          }
        }
      }
    } catch (notifError) {
      console.error('Error sending comment notifications:', notifError);
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
