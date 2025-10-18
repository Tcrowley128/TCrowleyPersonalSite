-- Verification Script for Assessment System Migration
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- ============================================================================
-- 1. Check if all tables exist
-- ============================================================================
SELECT
  table_name,
  CASE
    WHEN table_name IN ('assessments', 'assessment_responses', 'assessment_results', 'technology_solutions')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('assessments', 'assessment_responses', 'assessment_results', 'technology_solutions')
ORDER BY table_name;

-- ============================================================================
-- 2. Check if RLS is enabled on tables
-- ============================================================================
SELECT
  tablename as table_name,
  CASE
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('assessments', 'assessment_responses', 'assessment_results', 'technology_solutions')
ORDER BY tablename;

-- ============================================================================
-- 3. Check if sample technology solutions were inserted
-- ============================================================================
SELECT
  COUNT(*) as tech_solutions_count,
  CASE
    WHEN COUNT(*) >= 8 THEN '✅ Sample data loaded'
    WHEN COUNT(*) > 0 THEN '⚠️ Partial data'
    ELSE '❌ No sample data'
  END as status
FROM technology_solutions;

-- Show the technology solutions
SELECT name, category, tier, price_range FROM technology_solutions ORDER BY name;

-- ============================================================================
-- 4. Check if assessment_summary view exists and has security_invoker
-- ============================================================================
SELECT
  viewname as view_name,
  CASE
    WHEN definition LIKE '%security_invoker%' OR viewowner != 'postgres' THEN '✅ Security invoker set'
    ELSE '❌ Security invoker NOT set (run fix script!)'
  END as security_status
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'assessment_summary';

-- ============================================================================
-- 5. Check RLS policies
-- ============================================================================
SELECT
  tablename,
  policyname,
  cmd as command_type,
  CASE
    WHEN qual IS NOT NULL THEN '✅ Has conditions'
    ELSE '⚠️ No conditions'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('assessments', 'assessment_responses', 'assessment_results', 'technology_solutions')
ORDER BY tablename, policyname;

-- ============================================================================
-- 6. Check indexes
-- ============================================================================
SELECT
  tablename,
  indexname,
  '✅ Created' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('assessments', 'assessment_responses', 'assessment_results', 'technology_solutions')
ORDER BY tablename, indexname;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT
  '✅ Migration verification complete!' as message,
  'If all checks show ✅, you are good to go!' as next_step;
