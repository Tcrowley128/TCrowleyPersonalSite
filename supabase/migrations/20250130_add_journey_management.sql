-- Add journey/project management tables for transformation tracking

-- Projects table: Store user-created projects from assessment recommendations
CREATE TABLE IF NOT EXISTS assessment_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,

  -- Project details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- data, automation, ai, ux, people

  -- Status tracking
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  complexity TEXT DEFAULT 'medium' CHECK (complexity IN ('low', 'medium', 'high')),

  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Timeline
  estimated_timeline_days INTEGER,
  target_completion_date DATE,
  actual_completion_date DATE,

  -- Source tracking
  source_recommendation_id TEXT, -- References which recommendation this came from
  source_type TEXT, -- quick_win, tier1, tier2, tier3

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Tasks table: Breakdown of project into actionable tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Assignment
  assigned_to TEXT,

  -- Timeline
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Ordering
  order_index INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_assessment ON assessment_projects(assessment_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON assessment_projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON assessment_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE assessment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing all for now, can be tightened based on auth)
CREATE POLICY "Allow all operations on projects" ON assessment_projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON project_tasks FOR ALL USING (true);
