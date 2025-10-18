-- Add regeneration_count column to assessment_results table
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0 NOT NULL;

COMMENT ON COLUMN assessment_results.regeneration_count IS 'Number of times the assessment results have been regenerated (max 2 allowed)';
