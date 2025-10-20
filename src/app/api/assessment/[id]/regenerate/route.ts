import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

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

    // Generate new results using AI
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build prompt with updated responses
    const prompt = buildAssessmentPrompt(assessment, responses);

    console.log('Regenerating assessment with Claude...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const results = JSON.parse(jsonMatch[0]);

    // Update assessment_results
    const { error: updateError } = await supabase
      .from('assessment_results')
      .update({
        ...results,
        regeneration_count: regenerationCount + 1,
        generated_at: new Date().toISOString(),
        prompt_tokens: message.usage.input_tokens,
        completion_tokens: message.usage.output_tokens,
      })
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to build the assessment prompt
function buildAssessmentPrompt(assessment: any, responses: any[]): string {
  // Convert responses to a readable format
  const responsesByStep = responses.reduce((acc: any, resp) => {
    if (!acc[resp.step_number]) {
      acc[resp.step_number] = [];
    }
    acc[resp.step_number].push({
      question: resp.question_text || resp.question_key,
      answer: resp.answer_value,
    });
    return acc;
  }, {});

  return `You are a digital transformation consultant. Based on the following assessment responses, generate a comprehensive digital transformation strategy.

Company Information:
- Name: ${assessment.company_name || 'N/A'}
- Size: ${assessment.company_size || 'N/A'}
- Industry: ${assessment.industry || 'N/A'}
- Role: ${assessment.user_role || 'N/A'}

Assessment Responses:
${Object.entries(responsesByStep)
  .map(([step, questions]: [string, any]) => {
    return `Step ${step}:\n${questions
      .map((q: any) => `  Q: ${q.question}\n  A: ${JSON.stringify(q.answer)}`)
      .join('\n')}`;
  })
  .join('\n\n')}

Please provide a comprehensive analysis and recommendations in the following JSON structure:
{
  "data_strategy": { "overview": "", "quick_wins": [], "long_term": [] },
  "automation_strategy": { "overview": "", "quick_wins": [], "long_term": [] },
  "ai_strategy": { "overview": "", "quick_wins": [], "long_term": [] },
  "people_strategy": { "overview": "", "change_readiness": "", "recommendations": [] },
  "agile_framework": { "recommended_approach": "", "implementation_steps": [] },
  "tier1_citizen_led": { "tools": [], "use_cases": [] },
  "tier2_hybrid": { "tools": [], "use_cases": [] },
  "tier3_technical": { "tools": [], "use_cases": [] },
  "quick_wins": { "title": "", "items": [] },
  "roadmap": { "30_days": [], "90_days": [], "180_days": [] },
  "pilot_recommendations": { "recommended_pilots": [] },
  "technology_recommendations": { "top_tools": [] },
  "existing_tool_opportunities": { "opportunities": [] },
  "maturity_assessment": { "current_state": "", "target_state": "" },
  "priority_matrix": { "high_impact_low_effort": [], "high_impact_high_effort": [] },
  "risk_considerations": { "technical_risks": [], "organizational_risks": [] },
  "change_management_plan": { "communication_strategy": "", "key_milestones": [] },
  "training_recommendations": { "training_needs": [] },
  "success_metrics": { "kpis": [] }
}`;
}
