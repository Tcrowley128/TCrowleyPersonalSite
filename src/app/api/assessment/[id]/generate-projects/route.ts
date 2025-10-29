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

    // Check if projects already exist for this assessment
    const { data: existingProjects } = await supabase
      .from('transformation_projects')
      .select('id')
      .eq('assessment_id', assessmentId)
      .limit(1);

    if (existingProjects && existingProjects.length > 0) {
      return NextResponse.json(
        { error: 'Projects already generated for this assessment' },
        { status: 400 }
      );
    }

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

    const createdProjects = [];

    // Generate projects from quick wins (30-day)
    if (results.quick_wins && Array.isArray(results.quick_wins)) {
      for (const [index, win] of results.quick_wins.entries()) {
        const project = {
          assessment_id: assessmentId,
          title: win.title || `Quick Win ${index + 1}`,
          description: win.description || win.solution || '',
          category: win.category || determineCategory(win.title),
          priority: 'high',
          complexity: 'simple',
          source_recommendation_id: `quick_win_${index}`,
          recommendation_type: '30_day',
          estimated_effort: 'low',
          estimated_impact: win.impact || 'medium',
          estimated_timeline_days: 30,
          status: 'not_started',
          progress_percentage: 0
        };

        const { data, error } = await supabase
          .from('transformation_projects')
          .insert(project)
          .select()
          .single();

        if (!error && data) {
          createdProjects.push(data);
        }
      }
    }

    // Generate projects from tier 1 (Citizen-Led)
    if (results.tier1_citizen_led && Array.isArray(results.tier1_citizen_led)) {
      for (const [index, solution] of results.tier1_citizen_led.entries()) {
        const project = {
          assessment_id: assessmentId,
          title: solution.title || solution.solution || `Citizen-Led Solution ${index + 1}`,
          description: solution.description || solution.why_recommended || '',
          category: solution.category || determineCategory(solution.title),
          priority: solution.priority || 'high',
          complexity: 'simple',
          source_recommendation_id: `tier1_${index}`,
          recommendation_type: solution.timeline || '30_day',
          recommended_tools: solution.tools || null,
          estimated_effort: 'low',
          estimated_impact: solution.impact || 'medium',
          estimated_timeline_days: parseTimelineDays(solution.timeline),
          status: 'not_started',
          progress_percentage: 0
        };

        const { data, error } = await supabase
          .from('transformation_projects')
          .insert(project)
          .select()
          .single();

        if (!error && data) {
          createdProjects.push(data);
        }
      }
    }

    // Generate projects from tier 2 (Hybrid)
    if (results.tier2_hybrid && Array.isArray(results.tier2_hybrid)) {
      for (const [index, solution] of results.tier2_hybrid.slice(0, 5).entries()) {  // Limit to 5
        const project = {
          assessment_id: assessmentId,
          title: solution.title || solution.solution || `Hybrid Solution ${index + 1}`,
          description: solution.description || solution.why_recommended || '',
          category: solution.category || determineCategory(solution.title),
          priority: solution.priority || 'medium',
          complexity: 'moderate',
          source_recommendation_id: `tier2_${index}`,
          recommendation_type: solution.timeline || '60_day',
          recommended_tools: solution.tools || null,
          estimated_effort: 'medium',
          estimated_impact: solution.impact || 'high',
          estimated_timeline_days: parseTimelineDays(solution.timeline),
          status: 'not_started',
          progress_percentage: 0
        };

        const { data, error } = await supabase
          .from('transformation_projects')
          .insert(project)
          .select()
          .single();

        if (!error && data) {
          createdProjects.push(data);
        }
      }
    }

    // Generate projects from tier 3 (Technical) - limit to top 3
    if (results.tier3_technical && Array.isArray(results.tier3_technical)) {
      for (const [index, solution] of results.tier3_technical.slice(0, 3).entries()) {
        const project = {
          assessment_id: assessmentId,
          title: solution.title || solution.solution || `Technical Solution ${index + 1}`,
          description: solution.description || solution.why_recommended || '',
          category: solution.category || determineCategory(solution.title),
          priority: solution.priority || 'medium',
          complexity: 'complex',
          source_recommendation_id: `tier3_${index}`,
          recommendation_type: solution.timeline || '90_day',
          recommended_tools: solution.tools || null,
          estimated_effort: 'high',
          estimated_impact: solution.impact || 'high',
          estimated_timeline_days: parseTimelineDays(solution.timeline),
          status: 'not_started',
          progress_percentage: 0
        };

        const { data, error } = await supabase
          .from('transformation_projects')
          .insert(project)
          .select()
          .single();

        if (!error && data) {
          createdProjects.push(data);
        }
      }
    }

    // Create initial maturity snapshot
    if (results.maturity_assessment) {
      const maturityData = results.maturity_assessment;
      await supabase.from('maturity_score_history').insert({
        assessment_id: assessmentId,
        data_maturity_score: maturityData.data_strategy?.score || 0,
        automation_maturity_score: maturityData.automation_strategy?.score || 0,
        ai_maturity_score: maturityData.ai_strategy?.score || 0,
        ux_maturity_score: maturityData.ux_strategy?.score || 0,
        people_maturity_score: maturityData.people_strategy?.score || 0,
        overall_maturity_score: calculateOverallScore(maturityData),
        trigger_type: 'initial_assessment',
        trigger_details: { message: 'Initial assessment completed' },
        projects_completed_count: 0,
        projects_completed_ids: []
      });
    }

    return NextResponse.json({
      success: true,
      projects_created: createdProjects.length,
      projects: createdProjects
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating projects:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to determine category from title
function determineCategory(title: string): string {
  const titleLower = title?.toLowerCase() || '';

  if (titleLower.includes('data') || titleLower.includes('analytics') || titleLower.includes('dashboard') || titleLower.includes('power bi') || titleLower.includes('reporting')) {
    return 'data';
  } else if (titleLower.includes('automat') || titleLower.includes('workflow') || titleLower.includes('process')) {
    return 'automation';
  } else if (titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('claude') || titleLower.includes('machine learning')) {
    return 'ai';
  } else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('user') || titleLower.includes('interface')) {
    return 'ux';
  } else if (titleLower.includes('training') || titleLower.includes('team') || titleLower.includes('people') || titleLower.includes('culture')) {
    return 'people';
  }

  return 'other';
}

// Helper function to parse timeline string into days
function parseTimelineDays(timeline?: string): number {
  if (!timeline) return 30;

  const timelineLower = timeline.toLowerCase();

  if (timelineLower.includes('30') || timelineLower.includes('month')) {
    return 30;
  } else if (timelineLower.includes('60') || timelineLower.includes('2 month')) {
    return 60;
  } else if (timelineLower.includes('90') || timelineLower.includes('3 month') || timelineLower.includes('quarter')) {
    return 90;
  } else if (timelineLower.includes('180') || timelineLower.includes('6 month')) {
    return 180;
  }

  return 30; // Default
}

// Helper function to calculate overall maturity score
function calculateOverallScore(maturityAssessment: any): number {
  const scores = [
    maturityAssessment.data_strategy?.score || 0,
    maturityAssessment.automation_strategy?.score || 0,
    maturityAssessment.ai_strategy?.score || 0,
    maturityAssessment.ux_strategy?.score || 0,
    maturityAssessment.people_strategy?.score || 0
  ];

  const sum = scores.reduce((a, b) => a + b, 0);
  return sum / scores.length;
}
