-- Fix Assessment Security: Proper RLS Policies
-- Critical security fix: Re-enable proper ownership-based access control
-- Date: 2025-02-09

-- ============================================================================
-- ASSESSMENTS TABLE - Fix RLS Policies
-- ============================================================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Anyone can create assessments" ON assessments;
DROP POLICY IF EXISTS "Allow all operations" ON assessments;

-- Users can view their own assessments (by user_id OR session_id for anonymous)
CREATE POLICY "Users can view own assessments"
ON assessments FOR SELECT
USING (
  auth.uid() = user_id
  OR session_id = current_setting('app.session_id', true)
);

-- Authenticated users can create assessments
CREATE POLICY "Authenticated users can create assessments"
ON assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
ON assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
ON assessments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- ASSESSMENT_RESULTS TABLE - Fix RLS Policies
-- ============================================================================

-- Drop the dangerous permissive policy that allows all access
DROP POLICY IF EXISTS "Allow all operations on assessment results" ON assessment_results;

-- Users can view assessment results for their own assessments
CREATE POLICY "Users can view own assessment results"
ON assessment_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_results.assessment_id
    AND (a.user_id = auth.uid() OR a.session_id = current_setting('app.session_id', true))
  )
);

-- System (service role) can insert assessment results
-- This is for when AI generates results via admin client
CREATE POLICY "System can insert assessment results"
ON assessment_results FOR INSERT
WITH CHECK (true);

-- Users can update results for their own assessments
CREATE POLICY "Users can update own assessment results"
ON assessment_results FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_results.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- Users can delete results for their own assessments
CREATE POLICY "Users can delete own assessment results"
ON assessment_results FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_results.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- ============================================================================
-- ASSESSMENT_RESPONSES TABLE - Fix RLS Policies
-- ============================================================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on assessment responses" ON assessment_responses;

-- Users can view responses for their own assessments
CREATE POLICY "Users can view own assessment responses"
ON assessment_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_responses.assessment_id
    AND (a.user_id = auth.uid() OR a.session_id = current_setting('app.session_id', true))
  )
);

-- Users can insert responses for their own assessments
CREATE POLICY "Users can insert own assessment responses"
ON assessment_responses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_responses.assessment_id
    AND (a.user_id = auth.uid() OR a.session_id = current_setting('app.session_id', true))
  )
);

-- Users can update responses for their own assessments
CREATE POLICY "Users can update own assessment responses"
ON assessment_responses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_responses.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- Users can delete responses for their own assessments
CREATE POLICY "Users can delete own assessment responses"
ON assessment_responses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_responses.assessment_id
    AND a.user_id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'assessments') THEN
    RAISE EXCEPTION 'RLS is not enabled on assessments table';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'assessment_results') THEN
    RAISE EXCEPTION 'RLS is not enabled on assessment_results table';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'assessment_responses') THEN
    RAISE EXCEPTION 'RLS is not enabled on assessment_responses table';
  END IF;
  RAISE NOTICE 'RLS verification passed - all assessment tables properly secured';
END $$;
