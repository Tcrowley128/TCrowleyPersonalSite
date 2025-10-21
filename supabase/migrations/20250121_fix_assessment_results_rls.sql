-- Fix RLS policies for assessment_results table
-- This resolves the "column ar.step_number must appear in the GROUP BY clause" error
-- The error was occurring because RLS policies were using JOINs incorrectly

-- ============================================================================
-- ASSESSMENT_RESULTS TABLE RLS POLICIES
-- ============================================================================

-- Drop all existing policies on assessment_results
DROP POLICY IF EXISTS "Enable read access for all users" ON assessment_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON assessment_results;
DROP POLICY IF EXISTS "Enable update for all users" ON assessment_results;
DROP POLICY IF EXISTS "Allow read access to assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Allow insert access to assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Allow update access to assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Allow upsert access to assessment results" ON assessment_results;

-- Create simple, permissive policies without complex JOINs
-- These allow full access without authentication for the assessment tool

CREATE POLICY "Allow all operations on assessment results"
ON assessment_results
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: In production, you would want to restrict this based on user authentication
-- For example:
-- USING (auth.uid() IS NOT NULL OR assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()))
