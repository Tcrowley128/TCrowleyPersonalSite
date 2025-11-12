-- Add metadata columns to activity_feed for better context and linking
ALTER TABLE activity_feed
ADD COLUMN IF NOT EXISTS entity_title TEXT,
ADD COLUMN IF NOT EXISTS project_title TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_feed_assessment ON activity_feed(assessment_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_project ON activity_feed(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_entity ON activity_feed(entity_type, entity_id);

-- Add comment explaining the new columns
COMMENT ON COLUMN activity_feed.entity_title IS 'Title of the entity (e.g., PBI title, Risk title) for display and linking';
COMMENT ON COLUMN activity_feed.project_title IS 'Title of the associated project for context';
