import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/assessment/[id]/share - Create share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Verify ownership of the assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this assessment' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { expires_at, max_views } = body;

    // Validate max_views if provided
    if (max_views !== undefined && max_views !== null) {
      if (typeof max_views !== 'number' || max_views < 1) {
        return NextResponse.json(
          { error: 'max_views must be a positive integer' },
          { status: 400 }
        );
      }
    }

    // Generate secure token using database function
    const adminSupabase = createAdminClient();
    const { data: tokenResult, error: tokenError } = await adminSupabase
      .rpc('generate_share_token');

    if (tokenError || !tokenResult) {
      console.error('Error generating token:', tokenError);
      // Fallback to crypto if RPC fails
      const fallbackToken = Buffer.from(crypto.getRandomValues(new Uint8Array(24)))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const { data: shareToken, error } = await supabase
        .from('assessment_share_tokens')
        .insert({
          assessment_id: assessmentId,
          token: fallbackToken,
          created_by: user.id,
          permission_level: 'view',
          expires_at,
          max_views
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating share token:', error);
        throw error;
      }

      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/assessment/shared/${fallbackToken}`;

      return NextResponse.json({
        success: true,
        share_token: shareToken,
        share_url: shareUrl
      });
    }

    // Create share token with generated token
    const { data: shareToken, error } = await supabase
      .from('assessment_share_tokens')
      .insert({
        assessment_id: assessmentId,
        token: tokenResult,
        created_by: user.id,
        permission_level: 'view',
        expires_at,
        max_views
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating share token:', error);
      throw error;
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/assessment/shared/${tokenResult}`;

    console.log('Share link created:', {
      assessment_id: assessmentId,
      token_id: shareToken.id,
      expires_at,
      max_views
    });

    return NextResponse.json({
      success: true,
      share_token: shareToken,
      share_url: shareUrl
    });

  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      {
        error: 'Failed to create share link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/assessment/[id]/share - List share tokens for assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this assessment' },
        { status: 403 }
      );
    }

    // Fetch all active share tokens for this assessment
    const { data: tokens, error } = await supabase
      .from('assessment_share_tokens')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share tokens:', error);
      throw error;
    }

    console.log('Share tokens fetched:', {
      assessment_id: assessmentId,
      count: tokens?.length || 0
    });

    return NextResponse.json({
      success: true,
      share_tokens: tokens || []
    });

  } catch (error) {
    console.error('Error fetching share tokens:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch share tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/assessment/[id]/share?token_id=xxx - Revoke share token
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('token_id');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'token_id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Verify ownership of the assessment (the update policy will also check this)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this assessment' },
        { status: 403 }
      );
    }

    // Revoke the token (soft delete by setting is_active = false)
    const { error } = await supabase
      .from('assessment_share_tokens')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id
      })
      .eq('id', tokenId)
      .eq('assessment_id', assessmentId);

    if (error) {
      console.error('Error revoking share token:', error);
      throw error;
    }

    console.log('Share token revoked:', {
      token_id: tokenId,
      assessment_id: assessmentId
    });

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking share token:', error);
    return NextResponse.json(
      {
        error: 'Failed to revoke share link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
