-- Add project_tracking column to assessment_results table
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS project_tracking JSONB;

COMMENT ON COLUMN assessment_results.project_tracking IS 'Project tracking recommendations including tools, best practices, and recommended approach for managing transformation projects';
