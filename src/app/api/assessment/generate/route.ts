import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { buildAssessmentPrompt } from '@/lib/assessment/ai-prompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { assessment_id, regenerate = false } = await request.json();

    if (!assessment_id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    // Check if results already exist
    const { data: existingResults } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessment_id)
      .single();

    if (!regenerate && existingResults) {
      // Remove project_tracking from cached results to avoid schema cache issues
      const { project_tracking, ...resultsWithoutProjectTracking } = existingResults;

      return NextResponse.json({
        success: true,
        results: resultsWithoutProjectTracking,
        cached: true,
        regeneration_count: existingResults.regeneration_count || 0
      });
    }

    // Check regeneration limit
    if (regenerate && existingResults) {
      const currentCount = existingResults.regeneration_count || 0;
      if (currentCount >= 2) {
        return NextResponse.json(
          {
            error: 'Regeneration limit reached',
            details: 'You have reached the maximum of 2 regenerations for this assessment.',
            regeneration_count: currentCount
          },
          { status: 403 }
        );
      }
    }

    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessment_id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessment_id);

    if (responsesError) {
      throw responsesError;
    }

    // Build prompt
    const prompt = buildAssessmentPrompt(assessment, responses || []);

    // Call Claude API
    console.log('Calling Claude API for assessment:', assessment_id);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the JSON response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response
    let parsedResults;
    try {
      // Try to extract JSON if Claude wrapped it in markdown
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResults = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Calculate new regeneration count
    const newRegenerationCount = regenerate && existingResults
      ? (existingResults.regeneration_count || 0) + 1
      : 0;

    // Save results to database (including assessment metadata for reference)
    const resultsData = {
      assessment_id,

      // Assessment metadata
      company_name: assessment.company_name,
      company_size: assessment.company_size,
      industry: assessment.industry,

      // Strategic recommendations
      data_strategy: parsedResults.maturity_assessment?.data_strategy || null,
      automation_strategy: parsedResults.maturity_assessment?.automation_strategy || null,
      ai_strategy: parsedResults.maturity_assessment?.ai_strategy || null,
      people_strategy: parsedResults.maturity_assessment?.people_strategy || null,
      agile_framework: parsedResults.change_management_plan || null,

      // Tiered recommendations
      tier1_citizen_led: parsedResults.tier1_citizen_led || null,
      tier2_hybrid: parsedResults.tier2_hybrid || null,
      tier3_technical: parsedResults.tier3_technical || null,

      // Actionable plans
      quick_wins: parsedResults.quick_wins || null,
      roadmap: {
        month_1: parsedResults.roadmap_30_days,
        month_2: parsedResults.roadmap_60_days,
        month_3: parsedResults.roadmap_90_days
      },
      pilot_recommendations: parsedResults.change_management_plan?.pilot_recommendations || null,

      // Technology recommendations
      technology_recommendations: [
        ...(parsedResults.tier1_citizen_led || []),
        ...(parsedResults.tier2_hybrid || []),
        ...(parsedResults.tier3_technical || [])
      ],
      existing_tool_opportunities: parsedResults.existing_tool_opportunities || null,

      // Analysis
      maturity_assessment: parsedResults.maturity_assessment || null,
      priority_matrix: parsedResults.executive_summary || null,
      risk_considerations: parsedResults.risk_mitigation || null,

      // Change management
      change_management_plan: parsedResults.change_management_plan || null,
      training_recommendations: {
        approach: parsedResults.change_management_plan?.training_approach,
        resources: []
      },
      success_metrics: parsedResults.success_metrics || null,

      // Project tracking - temporarily commented out due to schema cache issue
      // project_tracking: parsedResults.project_tracking || null,

      // Long-term vision
      long_term_vision: parsedResults.long_term_vision || null,

      // Regeneration tracking
      regeneration_count: newRegenerationCount,

      // Metadata
      generated_by: 'claude',
      model_version: 'claude-sonnet-4-20250514',
      prompt_tokens: message.usage.input_tokens,
      completion_tokens: message.usage.output_tokens,
      generated_at: new Date().toISOString()
    };

    // Upsert (insert or update)
    const { data: savedResults, error: saveError } = await supabase
      .from('assessment_results')
      .upsert(resultsData, {
        onConflict: 'assessment_id'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving results:', saveError);
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      results: savedResults,
      cached: false,
      regeneration_count: newRegenerationCount,
      regenerations_remaining: 2 - newRegenerationCount,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Error generating assessment results:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
