import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { buildAssessmentPrompt } from '@/lib/assessment/ai-prompt';

export async function POST(request: NextRequest) {
  try {
    const { assessment_id, regenerate = false } = await request.json();

    if (!assessment_id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Try both variable names (fallback for local dev)
    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;

    // Debug logging for Vercel
    console.log('Environment check:', {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasAiKey: !!process.env.AI_API_KEY,
      usingKey: apiKey ? 'found' : 'missing',
      keyLength: apiKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      totalEnvVars: Object.keys(process.env).length,
      sampleEnvKeys: Object.keys(process.env).slice(0, 10)
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Anthropic client inside the function
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const supabase = createAdminClient();

    // Check if results already exist
    // Note: We explicitly list columns to avoid schema cache issues
    const { data: existingResults } = await supabase
      .from('assessment_results')
      .select(`
        id,
        assessment_id,
        data_strategy,
        automation_strategy,
        ai_strategy,
        people_strategy,
        agile_framework,
        tier1_citizen_led,
        tier2_hybrid,
        tier3_technical,
        quick_wins,
        roadmap,
        pilot_recommendations,
        technology_recommendations,
        existing_tool_opportunities,
        maturity_assessment,
        priority_matrix,
        risk_considerations,
        change_management_plan,
        training_recommendations,
        success_metrics,
        long_term_vision,
        project_tracking,
        regeneration_count,
        generated_by,
        model_version,
        prompt_tokens,
        completion_tokens,
        generated_at
      `)
      .eq('assessment_id', assessment_id)
      .single();

    if (!regenerate && existingResults) {
      // Fetch assessment metadata for cached results too
      const { data: assessment } = await supabase
        .from('assessments')
        .select('company_name, company_size, industry')
        .eq('id', assessment_id)
        .single();

      const resultsWithMetadata = {
        ...existingResults,
        company_name: assessment?.company_name,
        company_size: assessment?.company_size,
        industry: assessment?.industry
      };

      return NextResponse.json({
        success: true,
        results: resultsWithMetadata,
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

    // Build prompt with caching support
    const promptParts = buildAssessmentPrompt(assessment, responses || []);

    // Call Claude API with retry logic for rate limits and prompt caching
    console.log('Calling Claude API for assessment:', assessment_id);

    let message;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
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
            max_uses: 5
          }]
        });

        // Log cache usage
        console.log('Cache usage:', {
          cache_creation_input_tokens: (message.usage as any).cache_creation_input_tokens || 0,
          cache_read_input_tokens: (message.usage as any).cache_read_input_tokens || 0,
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens
        });

        break; // Success, exit retry loop
      } catch (error: any) {
        if (error.status === 429 && retryCount < maxRetries) {
          // Rate limit hit, wait and retry
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limit hit, retrying in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
        } else {
          throw error; // Re-throw if not rate limit or max retries reached
        }
      }
    }

    if (!message) {
      throw new Error('Failed to generate assessment after multiple retries');
    }

    // Check if response was truncated
    if (message.stop_reason === 'max_tokens') {
      console.warn('Claude response was truncated due to max_tokens limit');
    }

    // Extract the JSON response (handle tool use in content array)
    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    // Removed debug logging

    // Parse JSON response with better error handling
    let parsedResults;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      let jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

      // If JSON is incomplete, try to close it
      if (message.stop_reason === 'max_tokens') {
        // Count open braces and brackets
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        const openBrackets = (jsonString.match(/\[/g) || []).length;
        const closeBrackets = (jsonString.match(/\]/g) || []).length;

        // Add missing closing characters
        jsonString += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
        jsonString += '}'.repeat(Math.max(0, openBraces - closeBraces));
      }

      parsedResults = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Response length:', responseText.length);
      console.error('Stop reason:', message.stop_reason);
      console.error('Token usage:', message.usage);
      throw new Error('Failed to parse AI response. The response may have been truncated.');
    }

    // Calculate new regeneration count
    const newRegenerationCount = regenerate && existingResults
      ? (existingResults.regeneration_count || 0) + 1
      : 0;

    // Save results to database
    const resultsData = {
      assessment_id,

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

      // Project tracking
      project_tracking: parsedResults.project_tracking || null,

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

    // Add assessment metadata to results for frontend/PDF use
    const resultsWithMetadata = {
      ...savedResults,
      company_name: assessment.company_name,
      company_size: assessment.company_size,
      industry: assessment.industry
    };

    // Send email automatically on first generation (not regenerations)
    if (!regenerate && assessment.email) {
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/assessment/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assessment_id,
            recipient_email: assessment.email
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
          // Don't fail the whole request if email fails
        } else {
          console.log('Assessment results email sent successfully to:', assessment.email);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      results: resultsWithMetadata,
      cached: false,
      regeneration_count: newRegenerationCount,
      regenerations_remaining: 2 - newRegenerationCount,
      email_sent: !regenerate && assessment.email ? true : false,
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
