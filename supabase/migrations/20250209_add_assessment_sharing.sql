-- Assessment Sharing: Public Share Links with Tokens
-- Enables token-based public sharing of assessment results with view-only access
-- Date: 2025-02-09

-- ============================================================================
-- CREATE assessment_share_tokens TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,

  -- Token details
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Access control
  permission_level TEXT NOT NULL DEFAULT 'view',
  expires_at TIMESTAMP WITH TIME ZONE,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0 NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT check_permission CHECK (permission_level IN ('view')),
  CONSTRAINT check_view_count CHECK (view_count >= 0),
  CONSTRAINT check_max_views CHECK (max_views IS NULL OR max_views > 0)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Fast lookup by token (most common query)
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_tokens_token
ON assessment_share_tokens(token);

-- Fast lookup by assessment
CREATE INDEX IF NOT EXISTS idx_share_tokens_assessment
ON assessment_share_tokens(assessment_id);

-- Fast filtering of active, non-expired tokens
CREATE INDEX IF NOT EXISTS idx_share_tokens_active
ON assessment_share_tokens(is_active, expires_at)
WHERE is_active = true;

-- Fast lookup of tokens created by user
CREATE INDEX IF NOT EXISTS idx_share_tokens_creator
ON assessment_share_tokens(created_by);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE assessment_share_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view share tokens for their own assessments
CREATE POLICY "Users can view share tokens for own assessments"
ON assessment_share_tokens FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_share_tokens.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- Users can create share tokens for their own assessments
CREATE POLICY "Users can create share tokens for own assessments"
ON assessment_share_tokens FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_share_tokens.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- Users can update (revoke) share tokens for their own assessments
CREATE POLICY "Users can update share tokens for own assessments"
ON assessment_share_tokens FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_share_tokens.assessment_id
    AND a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_share_tokens.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- Users can delete share tokens for their own assessments
CREATE POLICY "Users can delete share tokens for own assessments"
ON assessment_share_tokens FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_share_tokens.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- ============================================================================
-- CREATE FUNCTION TO GENERATE SECURE TOKENS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  -- Generate URL-safe random token until we get a unique one
  LOOP
    -- Generate 32-character URL-safe token (24 bytes = 32 base64 chars)
    token := REPLACE(REPLACE(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_');
    token := RTRIM(token, '='); -- Remove padding

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM assessment_share_tokens WHERE assessment_share_tokens.token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE FUNCTION TO AUTO-EXPIRE TOKENS
-- ============================================================================

-- Function to check if a token is still valid
CREATE OR REPLACE FUNCTION is_token_valid(
  p_token TEXT,
  OUT is_valid BOOLEAN,
  OUT reason TEXT
) AS $$
DECLARE
  v_token assessment_share_tokens%ROWTYPE;
BEGIN
  -- Fetch token
  SELECT * INTO v_token
  FROM assessment_share_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    is_valid := false;
    reason := 'Token not found';
    RETURN;
  END IF;

  -- Check if active
  IF NOT v_token.is_active THEN
    is_valid := false;
    reason := 'Token has been revoked';
    RETURN;
  END IF;

  -- Check if expired
  IF v_token.expires_at IS NOT NULL AND v_token.expires_at < NOW() THEN
    is_valid := false;
    reason := 'Token has expired';
    RETURN;
  END IF;

  -- Check view limit
  IF v_token.max_views IS NOT NULL AND v_token.view_count >= v_token.max_views THEN
    is_valid := false;
    reason := 'View limit reached';
    RETURN;
  END IF;

  is_valid := true;
  reason := 'Valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_share_tokens') THEN
    RAISE EXCEPTION 'assessment_share_tokens table was not created';
  END IF;

  -- Verify RLS is enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'assessment_share_tokens') THEN
    RAISE EXCEPTION 'RLS is not enabled on assessment_share_tokens table';
  END IF;

  -- Verify unique constraint on token exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'assessment_share_tokens'
    AND indexname = 'idx_share_tokens_token'
  ) THEN
    RAISE EXCEPTION 'Unique index on token was not created';
  END IF;

  -- Verify helper functions exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_share_token') THEN
    RAISE EXCEPTION 'generate_share_token function was not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_token_valid') THEN
    RAISE EXCEPTION 'is_token_valid function was not created';
  END IF;

  RAISE NOTICE 'Assessment sharing infrastructure created successfully';
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assessment_share_tokens IS 'Stores share tokens for public access to assessment results with view-only permissions';
COMMENT ON COLUMN assessment_share_tokens.token IS 'Unique URL-safe token for accessing shared assessment (32 chars)';
COMMENT ON COLUMN assessment_share_tokens.permission_level IS 'Access level granted by this token (currently only "view" supported)';
COMMENT ON COLUMN assessment_share_tokens.expires_at IS 'Optional expiration timestamp - NULL means never expires';
COMMENT ON COLUMN assessment_share_tokens.max_views IS 'Optional view limit - NULL means unlimited views';
COMMENT ON COLUMN assessment_share_tokens.view_count IS 'Number of times this shared link has been accessed';
COMMENT ON COLUMN assessment_share_tokens.is_active IS 'Whether this token is currently active (false = revoked)';
COMMENT ON FUNCTION generate_share_token() IS 'Generates a cryptographically secure unique URL-safe token';
COMMENT ON FUNCTION is_token_valid(TEXT) IS 'Validates a share token checking active status, expiration, and view limits';
