-- Create pbi_activity_log table for tracking changes to product backlog items
CREATE TABLE IF NOT EXISTS pbi_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pbi_id UUID NOT NULL REFERENCES product_backlog_items(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,

  -- What changed
  activity_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', 'moved_to_sprint', 'priority_changed', etc.
  field_name VARCHAR(100), -- Which field changed (e.g., 'status', 'assigned_to', 'priority')
  old_value TEXT, -- Previous value
  new_value TEXT, -- New value

  -- Who and when
  changed_by VARCHAR(255), -- Email or user identifier
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Additional context
  description TEXT, -- Human-readable description of the change
  metadata JSONB -- For storing additional context if needed
);

-- Create indexes for better query performance
CREATE INDEX idx_pbi_activity_log_pbi_id ON pbi_activity_log(pbi_id);
CREATE INDEX idx_pbi_activity_log_project_id ON pbi_activity_log(project_id);
CREATE INDEX idx_pbi_activity_log_changed_at ON pbi_activity_log(changed_at DESC);
CREATE INDEX idx_pbi_activity_log_activity_type ON pbi_activity_log(activity_type);

-- Enable Row Level Security
ALTER TABLE pbi_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies (similar to other tables - adjust based on your auth setup)
CREATE POLICY "Users can view activity logs for their projects"
  ON pbi_activity_log FOR SELECT
  USING (true); -- Adjust based on your auth requirements

CREATE POLICY "Users can create activity logs"
  ON pbi_activity_log FOR INSERT
  WITH CHECK (true); -- Adjust based on your auth requirements

-- Add comment
COMMENT ON TABLE pbi_activity_log IS 'Activity log for tracking all changes to product backlog items';
