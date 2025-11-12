import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { messageId, updates } = await request.json();

    console.log('[Project Apply Update] Received request:', {
      projectId,
      messageId,
      updateCount: updates?.length,
    });

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        const { type, action, entityId, field, newValue } = update;

        console.log('[Project Apply Update] Processing update:', {
          type,
          action,
          entityId,
          field,
        });

        if (action === 'create') {
          // Handle creation of new entities
          if (type === 'new_pbi' || type === 'new_user_story') {
            const { data, error } = await supabase
              .from('product_backlog_items')
              .insert({
                project_id: projectId,
                title: update.entityName,
                description: newValue,
                item_type: 'user_story',
                status: 'todo',
                priority: 50,
                story_points: 0,
                backlog_order: 999,
              })
              .select()
              .single();

            if (error) throw error;
            results.push({ success: true, entity: data, update });
          }
        } else if (action === 'update') {
          // Handle updates to existing entities
          if (type === 'pbi' || type === 'user_story') {
            const { data, error } = await supabase
              .from('product_backlog_items')
              .update({ [field]: newValue })
              .eq('id', entityId)
              .eq('project_id', projectId)
              .select()
              .single();

            if (error) throw error;
            results.push({ success: true, entity: data, update });
          } else if (type === 'sprint') {
            const { data, error } = await supabase
              .from('sprints')
              .update({ [field]: newValue })
              .eq('id', entityId)
              .eq('project_id', projectId)
              .select()
              .single();

            if (error) throw error;
            results.push({ success: true, entity: data, update });
          } else if (type === 'risk') {
            // Find the risk and update it
            const { data, error } = await supabase
              .from('assessment_risks')
              .update({ [field]: newValue })
              .eq('id', entityId)
              .eq('related_project_id', projectId)
              .select()
              .single();

            if (error) throw error;
            results.push({ success: true, entity: data, update });
          }
        }
      } catch (error) {
        console.error('[Project Apply Update] Error processing update:', error);
        errors.push({
          update,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('[Project Apply Update] Results:', {
      successCount: results.length,
      errorCount: errors.length,
    });

    return NextResponse.json({
      success: true,
      results,
      errors,
      appliedCount: results.length,
      totalCount: updates.length,
    });
  } catch (error) {
    console.error('[Project Apply Update] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply updates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
