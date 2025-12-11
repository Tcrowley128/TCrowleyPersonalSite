-- Add Admin Access to Assessments
-- Allows users with admin role (raw_app_meta_data->>'is_admin' = 'true') to access all assessments
-- Date: 2025-02-10

-- ============================================================================
-- DROP EXISTING ADMIN POLICIES (IF ANY)
-- ============================================================================

-- Drop admin policies if they already exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can update all assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can delete all assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can view all assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can update all assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can delete all assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can view all assessment responses" ON assessment_responses;
DROP POLICY IF EXISTS "Admins can update all assessment responses" ON assessment_responses;
DROP POLICY IF EXISTS "Admins can delete all assessment responses" ON assessment_responses;
DROP POLICY IF EXISTS "Admins can view all assessment drafts" ON assessment_drafts;
DROP POLICY IF EXISTS "Admins can update all assessment drafts" ON assessment_drafts;
DROP POLICY IF EXISTS "Admins can delete all assessment drafts" ON assessment_drafts;
DROP POLICY IF EXISTS "Admins can view all share tokens" ON assessment_share_tokens;
DROP POLICY IF EXISTS "Admins can create share tokens for any assessment" ON assessment_share_tokens;
DROP POLICY IF EXISTS "Admins can update all share tokens" ON assessment_share_tokens;
DROP POLICY IF EXISTS "Admins can delete all share tokens" ON assessment_share_tokens;

-- ============================================================================
-- CREATE HELPER FUNCTION TO CHECK ADMIN STATUS
-- ============================================================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated and has admin flag in metadata
  RETURN (
    auth.uid() IS NOT NULL
    AND (
      SELECT COALESCE(
        (raw_app_meta_data->>'is_admin')::boolean,
        false
      )
      FROM auth.users
      WHERE id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================================
-- ASSESSMENTS TABLE - Add Admin Policies
-- ============================================================================

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
ON assessments FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any assessment
CREATE POLICY "Admins can update all assessments"
ON assessments FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any assessment
CREATE POLICY "Admins can delete all assessments"
ON assessments FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================================
-- ASSESSMENT_RESULTS TABLE - Add Admin Policies
-- ============================================================================

-- Admins can view all assessment results
CREATE POLICY "Admins can view all assessment results"
ON assessment_results FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any assessment results
CREATE POLICY "Admins can update all assessment results"
ON assessment_results FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any assessment results
CREATE POLICY "Admins can delete all assessment results"
ON assessment_results FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================================
-- ASSESSMENT_RESPONSES TABLE - Add Admin Policies
-- ============================================================================

-- Admins can view all assessment responses
CREATE POLICY "Admins can view all assessment responses"
ON assessment_responses FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any assessment responses
CREATE POLICY "Admins can update all assessment responses"
ON assessment_responses FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any assessment responses
CREATE POLICY "Admins can delete all assessment responses"
ON assessment_responses FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================================
-- ASSESSMENT_DRAFTS TABLE - Add Admin Policies
-- ============================================================================

-- Admins can view all assessment drafts
CREATE POLICY "Admins can view all assessment drafts"
ON assessment_drafts FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any assessment drafts
CREATE POLICY "Admins can update all assessment drafts"
ON assessment_drafts FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any assessment drafts
CREATE POLICY "Admins can delete all assessment drafts"
ON assessment_drafts FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================================
-- ASSESSMENT_SHARE_TOKENS TABLE - Add Admin Policies
-- ============================================================================

-- Admins can view all assessment share tokens
CREATE POLICY "Admins can view all share tokens"
ON assessment_share_tokens FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can create share tokens for any assessment
CREATE POLICY "Admins can create share tokens for any assessment"
ON assessment_share_tokens FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Admins can update any share tokens
CREATE POLICY "Admins can update all share tokens"
ON assessment_share_tokens FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any share tokens
CREATE POLICY "Admins can delete all share tokens"
ON assessment_share_tokens FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================================
-- TRANSFORMATION JOURNEY TABLES - Add Admin Policies
-- ============================================================================

-- assessment_projects
CREATE POLICY "Admins can view all projects"
ON assessment_projects FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all projects"
ON assessment_projects FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all projects"
ON assessment_projects FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create projects for any assessment"
ON assessment_projects FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- project_tasks
CREATE POLICY "Admins can view all project tasks"
ON project_tasks FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all project tasks"
ON project_tasks FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all project tasks"
ON project_tasks FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create project tasks"
ON project_tasks FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ============================================================================
-- AGILE/SCRUM TABLES - Add Admin Policies
-- ============================================================================

-- sprints
CREATE POLICY "Admins can view all sprints"
ON sprints FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all sprints"
ON sprints FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all sprints"
ON sprints FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create sprints"
ON sprints FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- product_backlog_items
CREATE POLICY "Admins can view all PBIs"
ON product_backlog_items FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all PBIs"
ON product_backlog_items FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all PBIs"
ON product_backlog_items FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create PBIs"
ON product_backlog_items FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- sprint_tasks
CREATE POLICY "Admins can view all sprint tasks"
ON sprint_tasks FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all sprint tasks"
ON sprint_tasks FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all sprint tasks"
ON sprint_tasks FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create sprint tasks"
ON sprint_tasks FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- sprint_retrospectives
CREATE POLICY "Admins can view all retrospectives"
ON sprint_retrospectives FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all retrospectives"
ON sprint_retrospectives FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all retrospectives"
ON sprint_retrospectives FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create retrospectives"
ON sprint_retrospectives FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- sprint_reviews
CREATE POLICY "Admins can view all sprint reviews"
ON sprint_reviews FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all sprint reviews"
ON sprint_reviews FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all sprint reviews"
ON sprint_reviews FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create sprint reviews"
ON sprint_reviews FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- daily_standups
CREATE POLICY "Admins can view all standups"
ON daily_standups FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all standups"
ON daily_standups FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all standups"
ON daily_standups FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create standups"
ON daily_standups FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- sprint_planning_sessions
CREATE POLICY "Admins can view all planning sessions"
ON sprint_planning_sessions FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all planning sessions"
ON sprint_planning_sessions FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all planning sessions"
ON sprint_planning_sessions FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create planning sessions"
ON sprint_planning_sessions FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- sprint_burndown_data
CREATE POLICY "Admins can view all burndown data"
ON sprint_burndown_data FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all burndown data"
ON sprint_burndown_data FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all burndown data"
ON sprint_burndown_data FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create burndown data"
ON sprint_burndown_data FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- team_velocity_history
CREATE POLICY "Admins can view all velocity history"
ON team_velocity_history FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all velocity history"
ON team_velocity_history FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all velocity history"
ON team_velocity_history FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create velocity history"
ON team_velocity_history FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ai_scrum_master_interactions
CREATE POLICY "Admins can view all AI interactions"
ON ai_scrum_master_interactions FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all AI interactions"
ON ai_scrum_master_interactions FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all AI interactions"
ON ai_scrum_master_interactions FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create AI interactions"
ON ai_scrum_master_interactions FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ============================================================================
-- CONVERSATION TABLES - Add Admin Policies
-- ============================================================================

-- assessment_conversations
CREATE POLICY "Admins can view all conversations"
ON assessment_conversations FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all conversations"
ON assessment_conversations FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all conversations"
ON assessment_conversations FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create conversations"
ON assessment_conversations FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- conversation_messages
CREATE POLICY "Admins can view all conversation messages"
ON conversation_messages FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all conversation messages"
ON conversation_messages FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all conversation messages"
ON conversation_messages FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create conversation messages"
ON conversation_messages FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify helper function exists
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    RAISE EXCEPTION 'is_admin function was not created';
  END IF;

  -- Verify admin policies were created
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessments'
    AND policyname = 'Admins can view all assessments'
  ) THEN
    RAISE EXCEPTION 'Admin policies were not created for assessments table';
  END IF;

  RAISE NOTICE 'Admin access successfully configured for all assessment and transformation journey tables';
  RAISE NOTICE 'To make a user an admin, update their auth.users record:';
  RAISE NOTICE 'UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || ''{"is_admin": true}''::jsonb WHERE email = ''admin@example.com'';';
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION is_admin() IS 'Checks if the current authenticated user has admin privileges via raw_app_meta_data->is_admin flag';
