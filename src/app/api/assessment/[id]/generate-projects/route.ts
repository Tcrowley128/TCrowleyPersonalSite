import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/assessment/[id]/generate-projects - Auto-generate projects from assessment recommendations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = createAdminClient();

    // Fetch assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (resultsError || !results) {
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    const projects = [];

    // Generate projects from quick wins
    if (results.quick_wins && Array.isArray(results.quick_wins)) {
      for (const win of results.quick_wins.slice(0, 10)) { // Limit to top 10
        projects.push({
          assessment_id: assessmentId,
          title: win.title || 'Quick Win',
          description: win.description || win.expected_outcome || '',
          category: win.pillar?.toLowerCase() || 'general',
          status: 'not_started',
          priority: win.impact === 'HIGH' ? 'high' : 'medium',
          complexity: win.effort === 'LOW' ? 'low' : 'medium',
          estimated_timeline_days: win.timeframe === '30_days' ? 30 : win.timeframe === '60_days' ? 60 : 90,
          source_recommendation_id: win.title,
          source_type: 'quick_win'
        });
      }
    }

    // Generate projects from tier recommendations
    const tiers = [
      { data: results.tier1_citizen_led, type: 'tier1', complexity: 'low' },
      { data: results.tier2_hybrid, type: 'tier2', complexity: 'medium' },
      { data: results.tier3_technical, type: 'tier3', complexity: 'high' }
    ];

    for (const tier of tiers) {
      if (tier.data && Array.isArray(tier.data)) {
        for (const rec of tier.data.slice(0, 5)) { // Limit to top 5 per tier
          projects.push({
            assessment_id: assessmentId,
            title: `Implement ${rec.name || 'Tool'}`,
            description: rec.description || rec.why_recommended || '',
            category: rec.pillar?.toLowerCase() || 'general',
            status: 'not_started',
            priority: 'medium',
            complexity: tier.complexity,
            estimated_timeline_days: tier.complexity === 'low' ? 30 : tier.complexity === 'medium' ? 60 : 90,
            source_recommendation_id: rec.name,
            source_type: tier.type
          });
        }
      }
    }

    // Insert projects into database
    const { data: createdProjects, error: insertError } = await supabase
      .from('assessment_projects')
      .insert(projects)
      .select();

    if (insertError) {
      console.error('Error creating projects:', insertError);
      return NextResponse.json(
        { error: 'Failed to create projects', details: insertError.message },
        { status: 500 }
      );
    }

    // Auto-generate basic tasks for each project
    const tasks = [];
    for (const project of createdProjects || []) {
      tasks.push(
        {
          project_id: project.id,
          title: 'Research and evaluate solution',
          status: 'todo',
          priority: 'high',
          order_index: 0
        },
        {
          project_id: project.id,
          title: 'Create implementation plan',
          status: 'todo',
          priority: 'high',
          order_index: 1
        },
        {
          project_id: project.id,
          title: 'Get stakeholder approval',
          status: 'todo',
          priority: 'medium',
          order_index: 2
        },
        {
          project_id: project.id,
          title: 'Execute implementation',
          status: 'todo',
          priority: 'high',
          order_index: 3
        },
        {
          project_id: project.id,
          title: 'Test and validate',
          status: 'todo',
          priority: 'high',
          order_index: 4
        }
      );
    }

    if (tasks.length > 0) {
      await supabase.from('project_tasks').insert(tasks);
    }

    return NextResponse.json({
      success: true,
      projects_created: createdProjects?.length || 0,
      message: `Successfully created ${createdProjects?.length || 0} projects from recommendations`
    });
  } catch (error) {
    console.error('Error in POST /api/assessment/[id]/generate-projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
