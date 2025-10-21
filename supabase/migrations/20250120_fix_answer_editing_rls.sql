-- Fix RLS policies for answer editing functionality
-- This migration ensures that assessments and assessment_responses tables
-- allow read and update access for answer editing

-- ============================================================================
-- ASSESSMENTS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Allow read access to assessments" ON assessments;

-- Create a permissive SELECT policy for assessments
-- This allows reading assessments without authentication restrictions
CREATE POLICY "Allow read access to assessments"
ON assessments
FOR SELECT
USING (true);

-- ============================================================================
-- ASSESSMENT_RESPONSES TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to assessment responses" ON assessment_responses;
DROP POLICY IF EXISTS "Allow update access to assessment responses" ON assessment_responses;

-- Create a permissive SELECT policy for assessment_responses
CREATE POLICY "Allow read access to assessment responses"
ON assessment_responses
FOR SELECT
USING (true);

-- Create a permissive UPDATE policy for assessment_responses
CREATE POLICY "Allow update access to assessment responses"
ON assessment_responses
FOR UPDATE
USING (true)
WITH CHECK (true);
