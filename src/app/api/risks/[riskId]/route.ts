import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/risks/[riskId] - Get a single risk by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riskId: string }> }
) {
  try {
    const { riskId } = await params;
    const supabase = createAdminClient();

    const { data: risk, error } = await supabase
      .from('project_risks')
      .select('*')
      .eq('id', riskId)
      .single();

    if (error) {
      console.error('Error fetching risk:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risk' },
        { status: 500 }
      );
    }

    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ risk });
  } catch (error) {
    console.error('Error in GET /api/risks/[riskId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/risks/[riskId] - Update a risk
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ riskId: string }> }
) {
  try {
    const { riskId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Get current risk state to detect escalation
    const { data: currentRisk, error: fetchError } = await supabase
      .from('project_risks')
      .select('*')
      .eq('id', riskId)
      .single();

    if (fetchError || !currentRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are provided in the request body
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.likelihood !== undefined) updateData.likelihood = body.likelihood;
    if (body.probability !== undefined) updateData.probability = body.probability;
    if (body.impact !== undefined) updateData.impact = body.impact;
    if (body.response_strategy !== undefined) updateData.response_strategy = body.response_strategy;
    if (body.response_plan !== undefined) updateData.response_plan = body.response_plan;
    if (body.mitigation_plan !== undefined) updateData.mitigation_plan = body.mitigation_plan;
    if (body.owner !== undefined) updateData.owner = body.owner;

    const { data: risk, error } = await supabase
      .from('project_risks')
      .update(updateData)
      .eq('id', riskId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      console.error('Update data attempted:', updateData);
      return NextResponse.json(
        { error: error.message || 'Failed to update risk', details: error },
        { status: 500 }
      );
    }

    // Check for risk escalation (impact increased)
    if (body.impact !== undefined && currentRisk.impact !== body.impact) {
      const impactLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
      const oldLevel = impactLevels.indexOf(currentRisk.impact);
      const newLevel = impactLevels.indexOf(body.impact);

      // If impact increased, notify users who want escalation notifications
      if (newLevel > oldLevel) {
        try {
          const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('user_id')
            .eq('notify_risk_escalated', true);

          if (preferences && preferences.length > 0) {
            const impactToSeverity: Record<string, string> = {
              very_high: 'critical',
              high: 'high',
              medium: 'medium',
              low: 'low',
              very_low: 'low'
            };
            const severity = impactToSeverity[body.impact] || 'medium';

            console.log(`Notifying ${preferences.length} users about risk escalation`);

            const notificationPromises = preferences.map(pref =>
              supabase.rpc('create_notification', {
                p_user_id: pref.user_id,
                p_type: 'risk',
                p_title: `Risk escalated to ${severity}`,
                p_message: `"${risk.title}"`,
                p_entity_type: 'risk',
                p_entity_id: riskId,
                p_link_url: `/projects/${currentRisk.project_id}/risks`,
                p_from_user_id: null,
                p_from_user_name: 'System'
              })
            );

            await Promise.all(notificationPromises);
          }
        } catch (notifError) {
          console.error('Error sending risk escalation notifications:', notifError);
        }
      }
    }

    return NextResponse.json({ risk });
  } catch (error) {
    console.error('Error in PATCH /api/risks/[riskId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/risks/[riskId] - Delete a risk
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ riskId: string }> }
) {
  try {
    const { riskId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('project_risks')
      .delete()
      .eq('id', riskId);

    if (error) {
      console.error('Error deleting risk:', error);
      return NextResponse.json(
        { error: 'Failed to delete risk' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/risks/[riskId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
