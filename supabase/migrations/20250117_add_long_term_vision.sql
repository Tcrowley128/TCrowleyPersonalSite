-- Add long_term_vision column to assessment_results table
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS long_term_vision JSONB;

COMMENT ON COLUMN assessment_results.long_term_vision IS 'Long-term transformation vision including year 1 goals, years 2-3 aspirations, competitive advantages, and industry benchmarks';
