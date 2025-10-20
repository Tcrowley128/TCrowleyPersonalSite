-- ============================================================================
-- Assessment Versions and Refinement System
-- Enables users to modify assessments and track version history
-- ============================================================================

-- ============================================================================
-- ASSESSMENT VERSIONS TABLE
-- Stores complete snapshots of assessment results at each version
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,

  -- Version Information
  version_number INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT true,

  -- Complete Snapshot
  results_snapshot JSONB NOT NULL,
  responses_snapshot JSONB NOT NULL,

  -- Change Tracking
  created_by TEXT NOT NULL,
  change_summary TEXT,
  changed_responses JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),

  -- Ensure unique version numbers per assessment
  UNIQUE(assessment_id, version_number)
);

-- ============================================================================
-- UPDATE ASSESSMENT_RESULTS
-- Add current version tracking
-- ============================================================================
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1 NOT NULL;

-- ============================================================================
-- UPDATE CHAT_CONVERSATIONS (if it exists)
-- Link conversations to specific assessment versions
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
    ALTER TABLE chat_conversations
    ADD COLUMN IF NOT EXISTS assessment_version INTEGER;

    COMMENT ON COLUMN chat_conversations.assessment_version IS 'The version of the assessment this conversation is associated with';
  END IF;
END $$;

-- ============================================================================
-- FUNCTIONS FOR VERSION MANAGEMENT
-- ============================================================================

-- Function to create a new version snapshot
CREATE OR REPLACE FUNCTION create_assessment_version(
  p_assessment_id UUID,
  p_created_by TEXT,
  p_change_summary TEXT DEFAULT NULL,
  p_changed_responses JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_results_snapshot JSONB;
  v_responses_snapshot JSONB;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM assessment_versions
  WHERE assessment_id = p_assessment_id;

  -- Get current results snapshot
  SELECT row_to_json(ar.*)::jsonb
  INTO v_results_snapshot
  FROM assessment_results ar
  WHERE ar.assessment_id = p_assessment_id;

  -- Get all responses as array
  SELECT jsonb_agg(row_to_json(ar.*)::jsonb)
  INTO v_responses_snapshot
  FROM assessment_responses ar
  WHERE ar.assessment_id = p_assessment_id
  ORDER BY ar.step_number, ar.question_key;

  -- Set all previous versions to not current
  UPDATE assessment_versions
  SET is_current = false
  WHERE assessment_id = p_assessment_id;

  -- Create new version
  INSERT INTO assessment_versions (
    assessment_id,
    version_number,
    is_current,
    results_snapshot,
    responses_snapshot,
    created_by,
    change_summary,
    changed_responses
  ) VALUES (
    p_assessment_id,
    v_version_number,
    true,
    v_results_snapshot,
    COALESCE(v_responses_snapshot, '[]'::jsonb),
    p_created_by,
    p_change_summary,
    p_changed_responses
  )
  RETURNING id INTO v_version_id;

  -- Update current version in results
  UPDATE assessment_results
  SET current_version = v_version_number
  WHERE assessment_id = p_assessment_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a previous version
CREATE OR REPLACE FUNCTION restore_assessment_version(
  p_assessment_id UUID,
  p_version_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_version RECORD;
BEGIN
  -- Get the version to restore
  SELECT * INTO v_version
  FROM assessment_versions
  WHERE assessment_id = p_assessment_id
    AND version_number = p_version_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version % not found for assessment %', p_version_number, p_assessment_id;
  END IF;

  -- Delete current responses
  DELETE FROM assessment_responses
  WHERE assessment_id = p_assessment_id;

  -- Restore responses from snapshot
  INSERT INTO assessment_responses (
    assessment_id,
    step_number,
    question_key,
    question_text,
    answer_value,
    created_at
  )
  SELECT
    p_assessment_id,
    (value->>'step_number')::INTEGER,
    value->>'question_key',
    value->>'question_text',
    (value->>'answer_value')::jsonb,
    (value->>'created_at')::TIMESTAMP
  FROM jsonb_array_elements(v_version.responses_snapshot);

  -- Update assessment_results with snapshot data
  UPDATE assessment_results
  SET
    data_strategy = (v_version.results_snapshot->>'data_strategy')::jsonb,
    automation_strategy = (v_version.results_snapshot->>'automation_strategy')::jsonb,
    ai_strategy = (v_version.results_snapshot->>'ai_strategy')::jsonb,
    people_strategy = (v_version.results_snapshot->>'people_strategy')::jsonb,
    agile_framework = (v_version.results_snapshot->>'agile_framework')::jsonb,
    tier1_citizen_led = (v_version.results_snapshot->>'tier1_citizen_led')::jsonb,
    tier2_hybrid = (v_version.results_snapshot->>'tier2_hybrid')::jsonb,
    tier3_technical = (v_version.results_snapshot->>'tier3_technical')::jsonb,
    quick_wins = (v_version.results_snapshot->>'quick_wins')::jsonb,
    roadmap = (v_version.results_snapshot->>'roadmap')::jsonb,
    pilot_recommendations = (v_version.results_snapshot->>'pilot_recommendations')::jsonb,
    technology_recommendations = (v_version.results_snapshot->>'technology_recommendations')::jsonb,
    existing_tool_opportunities = (v_version.results_snapshot->>'existing_tool_opportunities')::jsonb,
    maturity_assessment = (v_version.results_snapshot->>'maturity_assessment')::jsonb,
    priority_matrix = (v_version.results_snapshot->>'priority_matrix')::jsonb,
    risk_considerations = (v_version.results_snapshot->>'risk_considerations')::jsonb,
    change_management_plan = (v_version.results_snapshot->>'change_management_plan')::jsonb,
    training_recommendations = (v_version.results_snapshot->>'training_recommendations')::jsonb,
    success_metrics = (v_version.results_snapshot->>'success_metrics')::jsonb,
    current_version = p_version_number
  WHERE assessment_id = p_assessment_id;

  -- Mark this version as current
  UPDATE assessment_versions
  SET is_current = false
  WHERE assessment_id = p_assessment_id;

  UPDATE assessment_versions
  SET is_current = true
  WHERE assessment_id = p_assessment_id
    AND version_number = p_version_number;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assessment_versions_assessment_id ON assessment_versions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_versions_version_number ON assessment_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_assessment_versions_is_current ON assessment_versions(is_current);
CREATE INDEX IF NOT EXISTS idx_assessment_versions_created_at ON assessment_versions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE assessment_versions ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view their own assessment versions" ON assessment_versions;
DROP POLICY IF EXISTS "Users can create versions of their own assessments" ON assessment_versions;
DROP POLICY IF EXISTS "Allow version updates" ON assessment_versions;

CREATE POLICY "Users can view their own assessment versions"
  ON assessment_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_versions.assessment_id
      AND (assessments.user_id = auth.uid() OR assessments.session_id = current_setting('app.session_id', true))
    )
  );

CREATE POLICY "Users can create versions of their own assessments"
  ON assessment_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_versions.assessment_id
      AND (assessments.user_id = auth.uid() OR assessments.session_id = current_setting('app.session_id', true))
    )
  );

CREATE POLICY "Allow version updates"
  ON assessment_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_versions.assessment_id
      AND (assessments.user_id = auth.uid() OR assessments.session_id = current_setting('app.session_id', true))
    )
  );

-- ============================================================================
-- TRIGGER TO AUTO-CREATE INITIAL VERSION
-- ============================================================================

-- Drop trigger if exists (for re-running script)
DROP TRIGGER IF EXISTS auto_create_initial_version_trigger ON assessment_results;

CREATE OR REPLACE FUNCTION auto_create_initial_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_assessment_version(
      NEW.assessment_id,
      'initial',
      'Initial assessment results generated',
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_initial_version_trigger
  AFTER INSERT ON assessment_results
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_initial_version();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE assessment_versions IS 'Version history and snapshots of assessment results - enables undo/redo and comparison';
COMMENT ON FUNCTION create_assessment_version IS 'Creates a new version snapshot of the current assessment state';
COMMENT ON FUNCTION restore_assessment_version IS 'Restores an assessment to a previous version';
