import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/assessment/shared/[token] - Access shared assessment results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Use admin client to bypass RLS for public access
    const supabase = createAdminClient();

    // Verify token exists and is valid
    const { data: shareToken, error: tokenError } = await supabase
      .from('assessment_share_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !shareToken) {
      console.log('Token not found or inactive:', token);
      return NextResponse.json(
        { error: 'Invalid or expired share link' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
      console.log('Token expired:', {
        token,
        expires_at: shareToken.expires_at
      });
      return NextResponse.json(
        { error: 'This share link has expired' },
        { status: 410 } // 410 Gone
      );
    }

    // Check if view limit has been reached
    if (shareToken.max_views && shareToken.view_count >= shareToken.max_views) {
      console.log('View limit reached:', {
        token,
        view_count: shareToken.view_count,
        max_views: shareToken.max_views
      });
      return NextResponse.json(
        { error: 'This share link has reached its view limit' },
        { status: 410 } // 410 Gone
      );
    }

    // Fetch assessment metadata
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('company_name, company_size, industry, user_id')
      .eq('id', shareToken.assessment_id)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment not found for token:', shareToken.assessment_id);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Fetch assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', shareToken.assessment_id)
      .single();

    if (resultsError || !results) {
      console.error('Results not found for assessment:', shareToken.assessment_id);
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    // Fetch operational areas from responses
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', shareToken.assessment_id);

    const operationalAreasResponse = responses?.find((r: any) => r.question_key === 'operational_areas');
    let operationalAreas = operationalAreasResponse?.answer_value || [];

    // Handle case where operational_areas is stored as a comma-separated string
    if (typeof operationalAreas === 'string') {
      operationalAreas = operationalAreas.split(',').map((area: string) => area.trim()).filter(Boolean);
    }

    // Ensure it's an array
    if (!Array.isArray(operationalAreas)) {
      operationalAreas = [];
    }

    // Increment view count asynchronously (don't wait for it)
    supabase
      .from('assessment_share_tokens')
      .update({
        view_count: shareToken.view_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', shareToken.id)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to increment view count:', error);
        }
      });

    console.log('Shared assessment accessed:', {
      token,
      assessment_id: shareToken.assessment_id,
      view_count: shareToken.view_count + 1
    });

    // Return results with metadata and share info
    return NextResponse.json({
      success: true,
      results: {
        ...results,
        company_name: assessment.company_name,
        company_size: assessment.company_size,
        industry: assessment.industry,
        operational_areas: operationalAreas
      },
      share_info: {
        view_count: shareToken.view_count + 1,
        max_views: shareToken.max_views,
        expires_at: shareToken.expires_at,
        permission_level: shareToken.permission_level,
        created_at: shareToken.created_at
      },
      is_shared_view: true
    });

  } catch (error) {
    console.error('Error accessing shared results:', error);
    return NextResponse.json(
      {
        error: 'Failed to access shared results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
