import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  console.log('[Submit] Received POST request to /api/assessment/submit');
  try {
    const body = await request.json();
    console.log('[Submit] Parsed body keys:', Object.keys(body));
    console.log('[Submit] Body sample:', JSON.stringify(body).substring(0, 300));

    // The body might be the assessment data directly, or nested under an "assessment" key
    const assessment = body.assessment || body;
    const responses = body.responses || [];

    if (!assessment || (!assessment.name && !assessment.company_name)) {
      console.error('[Submit] Missing required assessment data in request');
      console.error('[Submit] Available keys:', Object.keys(assessment || {}));
      return NextResponse.json(
        { error: 'Assessment data with name or company name is required' },
        { status: 400 }
      );
    }

    console.log('[Submit] Creating admin client...');
    const supabase = createAdminClient();

    // Get IP address for analytics
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] :
                     request.headers.get('x-real-ip') || undefined;

    // Get user agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // Insert assessment
    const now = new Date().toISOString();
    console.log('[Submit] Inserting assessment into database...');

    // Only include fields that exist in the assessments table schema
    // All other fields should be in assessment_responses table
    const validAssessmentFields = [
      'session_id', 'user_id', 'company_name', 'company_size', 'industry', 'user_role',
      'technical_capability', 'team_comfort_level', 'existing_tools',
      'change_readiness_score', 'transformation_approach', 'has_champion',
      'contact_name', 'email', 'wants_consultation',
      'status', 'current_step', 'completed_at', 'referrer'
    ];

    const dataToInsert: any = {
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: now,
      updated_at: now,
      status: 'COMPLETED' // Mark as completed when submitted
    };

    // Only add fields that exist in the schema
    for (const field of validAssessmentFields) {
      if (assessment[field] !== undefined) {
        dataToInsert[field] = assessment[field];
      }
    }

    console.log('[Submit] Data to insert keys:', Object.keys(dataToInsert));
    console.log('[Submit] Data to insert sample:', JSON.stringify(dataToInsert).substring(0, 500));

    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert(dataToInsert)
      .select()
      .single();

    if (assessmentError) {
      console.error('[Submit] Error creating assessment:');
      console.error('[Submit] Error code:', assessmentError.code);
      console.error('[Submit] Error message:', assessmentError.message);
      console.error('[Submit] Error details:', assessmentError.details);
      console.error('[Submit] Error hint:', assessmentError.hint);

      // Return detailed error information to client
      return NextResponse.json(
        {
          error: 'Failed to create assessment',
          message: assessmentError.message,
          code: assessmentError.code,
          details: assessmentError.details,
          hint: assessmentError.hint
        },
        { status: 500 }
      );
    }
    console.log('[Submit] Assessment created successfully with ID:', assessmentData.id);

    // Insert responses
    if (responses && responses.length > 0) {
      const responsesWithAssessmentId = responses.map((r: any) => ({
        ...r,
        assessment_id: assessmentData.id,
        created_at: now
      }));

      const { error: responsesError } = await supabase
        .from('assessment_responses')
        .insert(responsesWithAssessmentId);

      if (responsesError) {
        console.error('Error creating responses:', responsesError);
        // Don't fail the whole request if responses fail
      }
    }

    return NextResponse.json({
      success: true,
      assessment_id: assessmentData.id,
      message: 'Assessment submitted successfully'
    });

  } catch (error) {
    console.error('[Submit] Error submitting assessment:', error);

    // Extract error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : String(error);

    return NextResponse.json(
      {
        error: 'Failed to submit assessment',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}
