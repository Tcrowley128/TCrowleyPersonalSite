-- Assessment Drafts: Enable Cross-Device Draft Sync
-- Allows authenticated users to sync assessment progress across devices
-- Date: 2025-02-09

-- ============================================================================
-- CREATE assessment_drafts TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,

  -- Draft data
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Unique constraint: one draft per user per session
  UNIQUE(user_id, session_id)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Fast lookup by user and session
CREATE INDEX IF NOT EXISTS idx_drafts_user_session
ON assessment_drafts(user_id, session_id);

-- Sort by most recently updated
CREATE INDEX IF NOT EXISTS idx_drafts_updated
ON assessment_drafts(updated_at DESC);

-- Fast lookup by user only (for listing all user's drafts)
CREATE INDEX IF NOT EXISTS idx_drafts_user
ON assessment_drafts(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE assessment_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view own drafts"
ON assessment_drafts FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts"
ON assessment_drafts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
ON assessment_drafts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
ON assessment_drafts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE FUNCTION TO AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_assessment_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_assessment_draft_timestamp
BEFORE UPDATE ON assessment_drafts
FOR EACH ROW
EXECUTE FUNCTION update_assessment_draft_timestamp();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_drafts') THEN
    RAISE EXCEPTION 'assessment_drafts table was not created';
  END IF;

  -- Verify RLS is enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'assessment_drafts') THEN
    RAISE EXCEPTION 'RLS is not enabled on assessment_drafts table';
  END IF;

  -- Verify unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'assessment_drafts'
    AND constraint_type = 'UNIQUE'
  ) THEN
    RAISE EXCEPTION 'Unique constraint on (user_id, session_id) was not created';
  END IF;

  RAISE NOTICE 'Assessment drafts table created and secured successfully';
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assessment_drafts IS 'Stores draft assessment progress for authenticated users to enable cross-device sync';
COMMENT ON COLUMN assessment_drafts.user_id IS 'References auth.users - owner of the draft';
COMMENT ON COLUMN assessment_drafts.session_id IS 'UUID session identifier from sessionStorage';
COMMENT ON COLUMN assessment_drafts.answers IS 'JSONB object containing all assessment question answers';
COMMENT ON COLUMN assessment_drafts.current_step IS 'Current step number in the assessment flow (1-based)';
COMMENT ON COLUMN assessment_drafts.updated_at IS 'Last modification timestamp - used for conflict resolution (latest wins)';
