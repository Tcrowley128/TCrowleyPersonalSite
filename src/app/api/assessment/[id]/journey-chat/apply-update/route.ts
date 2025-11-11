import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface UpdateRequest {
  messageId: string;
  conversationId: string;
  updates: Array<{
    type: 'project' | 'pbi' | 'risk' | 'sprint' | 'new_pbi';
    action: 'update' | 'create';
    entityId?: string;
    entityName: string;
    field?: string;
    oldValue?: any;
    newValue: any;
    reason: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body: UpdateRequest = await request.json();
    const { messageId, conversationId, updates } = body;

    console.log('[Journey Apply Update] Starting update for assessment:', assessmentId);

    const supabase = createAdminClient();

    // Get assessment for user_id
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('[Journey Apply Update] Assessment not found:', assessmentError);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const appliedUpdates: string[] = [];

    // Apply each update
    for (const update of updates) {
      const { type, action, entityId, entityName, field, oldValue, newValue, reason } = update;

      try {
        if (action === 'create') {
          // Handle creation of new items
          if (type === 'new_pbi') {
            const { error: createError } = await supabase
              .from('project_pbis')
              .insert({
                ...newValue,
                created_at: new Date().toISOString(),
              });

            if (createError) {
              console.error('[Journey Apply Update] Failed to create PBI:', createError);
              continue;
            }

            // Record the creation in chat updates
            await supabase.from('assessment_chat_updates').insert({
              assessment_id: assessmentId,
              conversation_id: conversationId,
              message_id: messageId,
              update_type: 'new_pbi',
              section_path: `new_pbi.${entityName}`,
              old_value: null,
              new_value: newValue,
              reason: reason,
              applied_by: assessment.user_id,
            });

            appliedUpdates.push(`Created new PBI: ${entityName}`);
          }
        } else if (action === 'update' && entityId && field) {
          // Handle updates to existing items
          let tableName: string;
          let updateResult;

          switch (type) {
            case 'project':
              tableName = 'assessment_projects';
              updateResult = await supabase
                .from(tableName)
                .update({ [field]: newValue })
                .eq('id', entityId);
              break;

            case 'pbi':
              tableName = 'project_pbis';
              updateResult = await supabase
                .from(tableName)
                .update({ [field]: newValue })
                .eq('id', entityId);
              break;

            case 'risk':
              tableName = 'assessment_risks';
              updateResult = await supabase
                .from(tableName)
                .update({ [field]: newValue })
                .eq('id', entityId);
              break;

            case 'sprint':
              tableName = 'project_sprints';
              updateResult = await supabase
                .from(tableName)
                .update({ [field]: newValue })
                .eq('id', entityId);
              break;

            default:
              console.warn('[Journey Apply Update] Unknown type:', type);
              continue;
          }

          if (updateResult?.error) {
            console.error(`[Journey Apply Update] Failed to update ${type}:`, updateResult.error);
            continue;
          }

          // Record the update in chat updates
          await supabase.from('assessment_chat_updates').insert({
            assessment_id: assessmentId,
            conversation_id: conversationId,
            message_id: messageId,
            update_type: type,
            section_path: `${type}.${entityId}.${field}`,
            old_value: oldValue,
            new_value: newValue,
            reason: reason,
            applied_by: assessment.user_id,
          });

          appliedUpdates.push(`Updated ${entityName}: ${field} = ${newValue}`);
        }
      } catch (error) {
        console.error(`[Journey Apply Update] Error applying update for ${entityName}:`, error);
        // Continue with other updates even if one fails
      }
    }

    console.log('[Journey Apply Update] Applied updates:', appliedUpdates);

    return NextResponse.json({
      success: true,
      appliedUpdates,
      message: `Successfully applied ${appliedUpdates.length} update(s)`,
    });
  } catch (error) {
    console.error('[Journey Apply Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to apply updates' },
      { status: 500 }
    );
  }
}
