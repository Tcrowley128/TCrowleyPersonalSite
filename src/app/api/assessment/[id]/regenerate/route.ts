import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildAssessmentPrompt } from '@/lib/assessment/ai-prompt';

// POST /api/assessment/[id]/regenerate
// Regenerate assessment results with updated responses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = await params;
    const body = await request.json();

    const { changesSummary } = body; // Optional: description of what changed

    // Fetch assessment and all responses
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('step_number', { ascending: true });

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    // Check regeneration limit
    const { data: currentResults } = await supabase
      .from('assessment_results')
      .select('regeneration_count')
      .eq('assessment_id', assessmentId)
      .single();

    const regenerationCount = currentResults?.regeneration_count || 0;

    if (regenerationCount >= 2) {
      return NextResponse.json(
        { error: 'Maximum regeneration limit (2) reached' },
        { status: 429 }
      );
    }

    // Generate new results using AI with streaming
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build prompt with updated responses using the proper prompt builder
    const promptParts = buildAssessmentPrompt(assessment, responses || []);

    console.log('Regenerating assessment with Claude using streaming...');

    // Use streaming to handle long responses and avoid timeout
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 24000,
      temperature: 0.7,
      system: promptParts.systemInstructions,
      messages: [
        {
          role: 'user',
          content: promptParts.userMessage
        }
      ],
      tools: [{
        type: "web_search_20250305" as const,
        name: "web_search",
        max_uses: 15
      }]
    });

    // Collect response text from stream
    let responseText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        responseText += chunk.delta.text;
      }
    }

    // Get final message with usage stats
    const finalMessage = await stream.finalMessage();

    // Log usage
    console.log('Regeneration usage:', {
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens
    });

    // Check if response was truncated
    if (finalMessage.stop_reason === 'max_tokens') {
      console.error('Regeneration response was truncated due to max_tokens limit');
      throw new Error('Assessment regeneration was incomplete due to length. Please try again.');
    }

    // Parse JSON response with better error handling
    let results;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

      results = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse regeneration response:', parseError);
      console.error('Response length:', responseText.length);
      throw new Error('Failed to parse AI response. The response may have been truncated.');
    }

    // Prepare results data for database update
    const resultsData = {
      assessment_id: assessmentId,

      // Strategic recommendations
      data_strategy: results.maturity_assessment?.data_strategy || null,
      automation_strategy: results.maturity_assessment?.automation_strategy || null,
      ai_strategy: results.maturity_assessment?.ai_strategy || null,
      people_strategy: results.maturity_assessment?.people_strategy || null,
      agile_framework: results.change_management_plan || null,

      // Tiered recommendations
      tier1_citizen_led: results.tier1_citizen_led || null,
      tier2_hybrid: results.tier2_hybrid || null,
      tier3_technical: results.tier3_technical || null,

      // Actionable plans
      quick_wins: results.quick_wins || null,
      roadmap: {
        month_1: results.roadmap_30_days,
        month_2: results.roadmap_60_days,
        month_3: results.roadmap_90_days
      },
      pilot_recommendations: results.change_management_plan?.pilot_recommendations || null,

      // Technology recommendations
      technology_recommendations: [
        ...(results.tier1_citizen_led || []),
        ...(results.tier2_hybrid || []),
        ...(results.tier3_technical || [])
      ],
      existing_tool_opportunities: results.existing_tool_opportunities || null,

      // Analysis
      maturity_assessment: results.maturity_assessment || null,
      priority_matrix: results.executive_summary || null,
      risk_considerations: results.risk_mitigation || null,

      // Change management
      change_management_plan: results.change_management_plan || null,
      training_recommendations: {
        approach: results.change_management_plan?.training_approach,
        resources: []
      },
      success_metrics: results.success_metrics || null,

      // Project tracking
      project_tracking: results.project_tracking || null,

      // Long-term vision
      long_term_vision: results.long_term_vision || null,

      // Regeneration tracking
      regeneration_count: regenerationCount + 1,

      // Metadata
      generated_by: 'claude',
      model_version: 'claude-sonnet-4-20250514',
      prompt_tokens: finalMessage.usage.input_tokens,
      completion_tokens: finalMessage.usage.output_tokens,
      generated_at: new Date().toISOString()
    };

    // Update assessment_results
    const { error: updateError } = await supabase
      .from('assessment_results')
      .update(resultsData)
      .eq('assessment_id', assessmentId);

    if (updateError) {
      console.error('Error updating results:', updateError);
      return NextResponse.json(
        { error: 'Failed to update results' },
        { status: 500 }
      );
    }

    // Create version snapshot via database function
    await supabase.rpc('create_assessment_version', {
      p_assessment_id: assessmentId,
      p_created_by: 'user',
      p_change_summary: changesSummary || 'User updated responses and regenerated',
      p_changed_responses: null,
    });

    return NextResponse.json({
      success: true,
      regeneration_count: regenerationCount + 1,
      message: 'Assessment regenerated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/assessment/[id]/regenerate:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
