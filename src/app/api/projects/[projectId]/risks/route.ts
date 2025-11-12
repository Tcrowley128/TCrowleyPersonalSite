import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/projects/[projectId]/risks - Get all risks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();

    const { data: risks, error } = await supabase
      .from('project_risks')
      .select('*')
      .eq('project_id', projectId)
      .order('identified_date', { ascending: false });

    if (error) {
      console.error('Error fetching risks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ risks });
  } catch (error) {
    console.error('Error in GET /api/projects/[projectId]/risks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/risks - Create a new risk
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Map severity to category (matching database schema)
    // Convert likelihood to probability percentage (low=25, medium=50, high=75)
    const probabilityMap: Record<string, number> = { low: 25, medium: 50, high: 75 };
    const probability = probabilityMap[body.likelihood] || 50;

    // Map impact to database values (low/medium/high -> low/medium/high, critical -> very_high)
    const impactMap: Record<string, string> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'very_high'
    };
    const dbImpact = impactMap[body.impact] || 'medium';

    // Map status to database values
    const statusMap: Record<string, string> = {
      identified: 'identified',
      assessing: 'analyzed',
      mitigating: 'planned',
      resolved: 'closed'
    };
    const dbStatus = statusMap[body.status] || 'identified';

    const riskData = {
      project_id: projectId,
      title: body.title,
      description: body.description,
      category: 'technical', // Default category (technical, schedule, cost, resource, external, organizational)
      status: dbStatus,
      likelihood: body.likelihood,
      probability: probability, // Integer 0-100 percentage
      impact: dbImpact, // very_low, low, medium, high, very_high
      response_strategy: body.mitigation_plan ? 'mitigate' : 'accept', // avoid, mitigate, transfer, accept
      response_plan: body.mitigation_plan, // Map mitigation_plan to response_plan
      mitigation_plan: body.mitigation_plan,
      owner: body.owner,
      identified_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: risk, error } = await supabase
      .from('project_risks')
      .insert([riskData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      console.error('Risk data attempted:', riskData);
      return NextResponse.json(
        { error: error.message || 'Failed to create risk', details: error },
        { status: 500 }
      );
    }

    // Send notifications to users who want to be notified about new risks
    try {
      // Get all team members who should be notified
      const { data: preferences, error: prefError } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('notify_risk_created', true);

      console.log('Risk notification check:', {
        preferences,
        prefError,
        count: preferences?.length || 0
      });

      if (preferences && preferences.length > 0) {
        // Get the creator's information from the request or use a default
        // In a real implementation, you'd get this from the authenticated user
        const fromUserName = 'System';

        console.log(`Creating risk notifications for ${preferences.length} users`);

        // Create notifications for each user
        const notificationPromises = preferences.map(async (pref) => {
          const { data, error } = await supabase.rpc('create_notification', {
            p_user_id: pref.user_id,
            p_type: 'risk',
            p_title: `New ${body.severity} risk identified`,
            p_message: `"${body.title}"`,
            p_entity_type: 'risk',
            p_entity_id: risk.id,
            p_link_url: `/projects/${projectId}/risks`,
            p_from_user_id: null,
            p_from_user_name: fromUserName
          });

          if (error) {
            console.error(`Failed to create notification for ${pref.user_id}:`, error);
          } else {
            console.log(`✓ Notification created for ${pref.user_id}:`, data);
          }

          return { user_id: pref.user_id, success: !error, error, data };
        });

        const results = await Promise.all(notificationPromises);
        console.log('Risk notifications results:', results);
      } else {
        console.log('No users have notify_risk_created enabled');
      }
    } catch (notifError) {
      // Log error but don't fail the risk creation
      console.error('Error sending risk notifications:', notifError);
    }

    return NextResponse.json({ risk }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[projectId]/risks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
