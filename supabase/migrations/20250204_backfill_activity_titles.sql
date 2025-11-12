-- Backfill entity_title and project_title for existing activity_feed records

-- Update PBI activities
UPDATE activity_feed af
SET
  entity_title = pbi.title,
  project_title = proj.title
FROM product_backlog_items pbi
LEFT JOIN assessment_projects proj ON pbi.project_id = proj.id
WHERE af.entity_type = 'pbi'
  AND af.entity_id = pbi.id
  AND (af.entity_title IS NULL OR af.project_title IS NULL);

-- Update Project activities
UPDATE activity_feed af
SET
  entity_title = proj.title,
  project_title = proj.title
FROM assessment_projects proj
WHERE af.entity_type = 'project'
  AND af.entity_id = proj.id
  AND (af.entity_title IS NULL OR af.project_title IS NULL);

-- Update Risk activities
UPDATE activity_feed af
SET
  entity_title = risk.title,
  project_title = proj.title
FROM project_risks risk
LEFT JOIN assessment_projects proj ON risk.project_id = proj.id
WHERE af.entity_type = 'risk'
  AND af.entity_id = risk.id
  AND (af.entity_title IS NULL OR af.project_title IS NULL);

-- Show summary of what was updated
DO $$
DECLARE
  pbi_count INTEGER;
  project_count INTEGER;
  risk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pbi_count FROM activity_feed WHERE entity_type = 'pbi' AND entity_title IS NOT NULL;
  SELECT COUNT(*) INTO project_count FROM activity_feed WHERE entity_type = 'project' AND entity_title IS NOT NULL;
  SELECT COUNT(*) INTO risk_count FROM activity_feed WHERE entity_type = 'risk' AND entity_title IS NOT NULL;

  RAISE NOTICE 'Backfill complete:';
  RAISE NOTICE '  PBI activities: % records', pbi_count;
  RAISE NOTICE '  Project activities: % records', project_count;
  RAISE NOTICE '  Risk activities: % records', risk_count;
  RAISE NOTICE '  Total: % records', pbi_count + project_count + risk_count;
END $$;
