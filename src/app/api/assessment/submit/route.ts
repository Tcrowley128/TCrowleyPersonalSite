import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  console.log('[Submit] Received POST request to /api/assessment/submit');
  try {
    const body = await request.json();
    console.log('[Submit] Parsed body:', { hasAssessment: !!body.assessment, hasResponses: !!body.responses });
    const { assessment, responses } = body;

    if (!assessment) {
      console.error('[Submit] Missing assessment data in request');
      return NextResponse.json(
        { error: 'Assessment data is required' },
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
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        ...assessment,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('[Submit] Error creating assessment:', assessmentError);
      throw assessmentError;
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
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
