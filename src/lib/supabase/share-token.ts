import { createAdminClient } from './admin';

export interface ShareTokenValidation {
  isValid: boolean;
  assessmentId?: string;
  permissionLevel?: 'view' | 'edit';
  error?: string;
  shareToken?: any;
}

/**
 * Validates a share token and returns assessment access information
 */
export async function validateShareToken(token: string): Promise<ShareTokenValidation> {
  try {
    const supabase = createAdminClient();

    // Verify token exists and is active
    const { data: shareToken, error: tokenError } = await supabase
      .from('assessment_share_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !shareToken) {
      return {
        isValid: false,
        error: 'Invalid or expired share link'
      };
    }

    // Check if token has expired
    if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
      return {
        isValid: false,
        error: 'This share link has expired'
      };
    }

    // Check if view limit has been reached
    if (shareToken.max_views && shareToken.view_count >= shareToken.max_views) {
      return {
        isValid: false,
        error: 'This share link has reached its view limit'
      };
    }

    return {
      isValid: true,
      assessmentId: shareToken.assessment_id,
      permissionLevel: shareToken.permission_level || 'view',
      shareToken
    };
  } catch (error) {
    console.error('Error validating share token:', error);
    return {
      isValid: false,
      error: 'Failed to validate share token'
    };
  }
}

/**
 * Increment view count for a share token (async, non-blocking)
 */
export async function incrementShareTokenViewCount(tokenId: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase
      .from('assessment_share_tokens')
      .update({
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', tokenId);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}

/**
 * Extract share token from request headers or query params
 */
export function extractShareToken(request: Request): string | null {
  const url = new URL(request.url);

  // Check query parameter
  const queryToken = url.searchParams.get('share_token');
  if (queryToken) return queryToken;

  // Check header
  const headerToken = request.headers.get('X-Share-Token');
  if (headerToken) return headerToken;

  return null;
}
