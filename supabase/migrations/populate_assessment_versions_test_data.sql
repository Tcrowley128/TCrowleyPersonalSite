-- ============================================================================
-- Populate Assessment Versions Test Data for 4th Source
-- This creates a history of assessment improvements to display in the live feed
-- ============================================================================

DO $$
DECLARE
  v_assessment_id UUID;
  v_results JSONB;
  v_responses JSONB;
BEGIN
  -- Find the 4th Source assessment
  SELECT id INTO v_assessment_id
  FROM assessments
  WHERE company_name ILIKE '%4th Source%'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_assessment_id IS NULL THEN
    RAISE NOTICE '❌ No 4th Source assessment found';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Found assessment: %', v_assessment_id;

  -- Check if versions already exist
  IF EXISTS (SELECT 1 FROM assessment_versions WHERE assessment_id = v_assessment_id) THEN
    RAISE NOTICE '⚠️  Assessment already has versions. Skipping...';
    RETURN;
  END IF;

  -- Get current results for snapshot
  SELECT row_to_json(ar.*)::jsonb INTO v_results
  FROM assessment_results ar
  WHERE ar.assessment_id = v_assessment_id;

  -- Get responses for snapshot
  SELECT jsonb_agg(row_to_json(ar.*)::jsonb) INTO v_responses
  FROM assessment_responses ar
  WHERE ar.assessment_id = v_assessment_id
  ORDER BY ar.step_number, ar.question_key;

  IF v_results IS NULL THEN
    RAISE NOTICE '❌ No assessment results found';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Creating version history...';

  -- Version 1: Initial assessment
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 1, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'system', 'Initial assessment results generated',
    '2024-12-01 10:00:00'::timestamp
  );

  -- Version 2: Quick wins added
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 2, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'AI Assistant', 'Added 3 quick wins: Document digitization, Automated email routing, Cloud-based collaboration tools',
    '2024-12-15 14:30:00'::timestamp
  );

  -- Version 3: Timeline updated
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 3, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'Tyler Crowder', 'Updated timeline estimates based on team feedback - Extended Phase 1 by 2 months',
    '2025-01-05 09:15:00'::timestamp
  );

  -- Version 4: Automation strategy enhanced
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 4, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'AI Assistant', 'Enhanced automation strategy: Added RPA recommendations for invoice processing (Est. savings: $45K/year)',
    '2025-01-20 16:45:00'::timestamp
  );

  -- Version 5: Project completed
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 5, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'Tyler Crowder', 'Completed "Document Management System" project - Updated maturity score from 2.5 to 3.2',
    '2025-02-10 11:20:00'::timestamp
  );

  -- Version 6: Data strategy refined
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 6, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'AI Assistant', 'Refined data strategy: Added Power BI dashboard recommendations and data governance framework',
    '2025-03-01 13:00:00'::timestamp
  );

  -- Version 7: Sprint completed
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 7, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'Tyler Crowder', 'Sprint 1 completed: 5 quick wins deployed, team trained on new collaboration tools',
    '2025-03-15 10:30:00'::timestamp
  );

  -- Version 8: AI strategy enhanced
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 8, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'AI Assistant', 'AI strategy enhanced: Added Microsoft Copilot pilot program, estimated 15% productivity boost',
    '2025-04-02 14:15:00'::timestamp
  );

  -- Version 9: Priorities adjusted
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 9, false, v_results, COALESCE(v_responses, '[]'::jsonb),
    'Tyler Crowder', 'Adjusted priorities: Moved "Customer Portal" to high priority due to stakeholder feedback',
    '2025-04-20 09:45:00'::timestamp
  );

  -- Version 10: Latest - Current version
  INSERT INTO assessment_versions (
    assessment_id, version_number, is_current, results_snapshot,
    responses_snapshot, created_by, change_summary, created_at
  ) VALUES (
    v_assessment_id, 10, true, v_results, COALESCE(v_responses, '[]'::jsonb),
    'AI Assistant', 'Latest: Added change management recommendations and training plan for Q2 2025 initiatives',
    '2025-05-01 08:00:00'::timestamp
  );

  -- Update current version in assessment_results
  UPDATE assessment_results
  SET current_version = 10
  WHERE assessment_id = v_assessment_id;

  RAISE NOTICE '✅ Successfully created 10 assessment versions!';
  RAISE NOTICE '🎉 You can now view the live feed on the Executive Dashboard!';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;
