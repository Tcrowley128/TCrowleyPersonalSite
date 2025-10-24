-- Create a test version for an existing assessment
-- This allows testing the version restore feature without regenerating
--
-- Usage: npx supabase db query --file create-test-version.sql
--
-- This will create version 1 from the current assessment results

DO $$
DECLARE
  v_assessment_id UUID := '2a163822-650f-4942-adea-dde3fe22d13c'::UUID;
  v_version_id UUID;
BEGIN
  -- Check if assessment exists
  IF NOT EXISTS (SELECT 1 FROM assessment_results WHERE assessment_id = v_assessment_id) THEN
    RAISE EXCEPTION 'Assessment % not found', v_assessment_id;
  END IF;

  -- Create initial version
  SELECT create_assessment_version(
    v_assessment_id,
    'manual_snapshot',
    'Initial version snapshot for testing restore functionality',
    NULL
  ) INTO v_version_id;

  RAISE NOTICE 'Version created successfully! Version ID: %', v_version_id;

  -- Show all versions
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'All versions for assessment:';
  RAISE NOTICE '==============================================';

  FOR v_version IN (
    SELECT version_number, is_current, created_by, change_summary, created_at
    FROM assessment_versions
    WHERE assessment_id = v_assessment_id
    ORDER BY version_number DESC
  ) LOOP
    RAISE NOTICE 'Version %: % (%) - Created: %',
      v_version.version_number,
      CASE WHEN v_version.is_current THEN 'CURRENT' ELSE 'historical' END,
      v_version.created_by,
      v_version.created_at;
    RAISE NOTICE '  Summary: %', v_version.change_summary;
  END LOOP;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'You can now test the restore feature!';
  RAISE NOTICE 'Go to: http://localhost:3002/assessment/results/%', v_assessment_id;
END $$;
