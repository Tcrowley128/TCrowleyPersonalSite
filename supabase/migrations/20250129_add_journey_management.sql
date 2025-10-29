-- Digital Transformation Journey Management System
-- Migration: Add project tracking, task management, and maturity history

-- ============================================================================
-- TRANSFORMATION_PROJECTS
-- Stores high-level initiatives (e.g., "Implement Power BI Dashboards")
-- ============================================================================
CREATE TABLE IF NOT EXISTS transformation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,

  -- Project Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- data, automation, ai, people, ux
  priority TEXT DEFAULT 'medium', -- high, medium, low
  complexity TEXT DEFAULT 'moderate', -- simple, moderate, complex

  -- From Assessment Recommendations
  source_recommendation_id TEXT, -- Maps to tier1/tier2/tier3 item
  recommendation_type TEXT, -- quick_win, 30_day, 60_day, 90_day, long_term
  recommended_tools JSONB, -- Technology solutions suggested

  -- Project Status
  status TEXT DEFAULT 'not_started', -- not_started, planning, in_progress, blocked, completed, archived
  progress_percentage INTEGER DEFAULT 0,

  -- Effort & Impact (from assessment)
  estimated_effort TEXT, -- low, medium, high
  estimated_impact TEXT, -- low, medium, high
  estimated_timeline_days INTEGER,

  -- Actual Tracking
  actual_start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,

  -- Resources
  assigned_owner TEXT,
  team_members JSONB, -- Array of names/emails
  budget_allocated DECIMAL,
  budget_spent DECIMAL,

  -- Notes
  notes TEXT,
  blockers TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT valid_status CHECK (status IN ('not_started', 'planning', 'in_progress', 'blocked', 'completed', 'archived')),
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT valid_complexity CHECK (complexity IN ('simple', 'moderate', 'complex')),
  CONSTRAINT valid_category CHECK (category IN ('data', 'automation', 'ai', 'people', 'ux', 'other')),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- ============================================================================
-- PROJECT_TASKS
-- Granular tasks within projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES transformation_projects(id) ON DELETE CASCADE,

  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT, -- research, planning, implementation, testing, training, documentation

  -- Status & Progress
  status TEXT DEFAULT 'todo', -- todo, in_progress, blocked, completed, cancelled
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,

  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES project_tasks(id), -- For subtasks

  -- Assignment
  assigned_to TEXT,
  due_date DATE,

  -- Checklist Items (optional sub-items)
  checklist_items JSONB, -- [{ text: string, completed: boolean }]

  -- AI-Generated or User-Created
  is_ai_generated BOOLEAN DEFAULT false,
  ai_generation_context TEXT, -- What prompt/context generated this

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT valid_task_status CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'cancelled'))
);

-- ============================================================================
-- PROJECT_MILESTONES
-- Key checkpoints in transformation journey
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES transformation_projects(id) ON DELETE CASCADE,

  -- Milestone Details
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT, -- assessment_based, user_defined, ai_suggested

  -- Timeline
  target_date DATE,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT false,

  -- Success Criteria
  success_criteria JSONB, -- Array of criteria to meet

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PROJECT_PROGRESS_LOG
-- Audit trail of progress updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_progress_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES transformation_projects(id) ON DELETE CASCADE,

  -- Progress Update
  update_type TEXT, -- status_change, progress_update, note, blocker, milestone_reached
  old_value TEXT,
  new_value TEXT,
  progress_percentage INTEGER,

  -- Update Details
  notes TEXT,
  blockers TEXT, -- What's blocking progress
  next_steps TEXT, -- What's coming next

  -- AI Interaction
  ai_advice_requested BOOLEAN DEFAULT false,
  ai_advice_given TEXT, -- If user asked AI for help

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- MATURITY_SCORE_HISTORY
-- Track maturity score changes over time
-- ============================================================================
CREATE TABLE IF NOT EXISTS maturity_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,

  -- Scores Snapshot
  data_maturity_score DECIMAL,
  automation_maturity_score DECIMAL,
  ai_maturity_score DECIMAL,
  ux_maturity_score DECIMAL,
  people_maturity_score DECIMAL,

  -- Aggregate
  overall_maturity_score DECIMAL,

  -- What Triggered This Snapshot
  trigger_type TEXT, -- initial_assessment, project_completion, manual_reassessment, scheduled_check
  trigger_details JSONB,

  -- Projects Completed Since Last Snapshot
  projects_completed_count INTEGER DEFAULT 0,
  projects_completed_ids UUID[],

  -- Metadata
  snapshot_date TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_assessment ON transformation_projects(assessment_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON transformation_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON transformation_projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_category ON transformation_projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON transformation_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON project_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON project_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_milestones_assessment ON project_milestones(assessment_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON project_milestones(is_completed);

CREATE INDEX IF NOT EXISTS idx_progress_log_project ON project_progress_log(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_log_created_at ON project_progress_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maturity_history_assessment ON maturity_score_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_maturity_history_snapshot_date ON maturity_score_history(snapshot_date DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE transformation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_score_history ENABLE ROW LEVEL SECURITY;

-- Projects: Users can access projects for their assessments
CREATE POLICY "Users can view their own projects"
  ON transformation_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = transformation_projects.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create projects for their assessments"
  ON transformation_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = transformation_projects.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their own projects"
  ON transformation_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = transformation_projects.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete their own projects"
  ON transformation_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = transformation_projects.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Tasks: Users can access tasks for their projects
CREATE POLICY "Users can view tasks for their projects"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_tasks.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create tasks for their projects"
  ON project_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_tasks.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update tasks for their projects"
  ON project_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_tasks.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete tasks for their projects"
  ON project_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_tasks.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Milestones: Similar to projects
CREATE POLICY "Users can view their milestones"
  ON project_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = project_milestones.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create milestones"
  ON project_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = project_milestones.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their milestones"
  ON project_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = project_milestones.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete their milestones"
  ON project_milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = project_milestones.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Progress Log: Similar to tasks
CREATE POLICY "Users can view progress logs"
  ON project_progress_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_progress_log.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create progress logs"
  ON project_progress_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transformation_projects p
      JOIN assessments a ON a.id = p.assessment_id
      WHERE p.id = project_progress_log.project_id
      AND (
        a.user_id = auth.uid()
        OR a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Maturity History: Read-only for users (system writes)
CREATE POLICY "Users can view their maturity history"
  ON maturity_score_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = maturity_score_history.assessment_id
      AND (
        assessments.user_id = auth.uid()
        OR assessments.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "System can create maturity snapshots"
  ON maturity_score_history FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON transformation_projects
  FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at();

-- Auto-create progress log entry when project status changes
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_progress_log (
      project_id,
      update_type,
      old_value,
      new_value,
      progress_percentage,
      notes
    ) VALUES (
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      NEW.progress_percentage,
      'Status automatically changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER project_status_change_log
  AFTER UPDATE ON transformation_projects
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_project_status_change();

-- Auto-update project progress when tasks are completed
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Get task counts for this project
  SELECT COUNT(*) INTO total_tasks
  FROM project_tasks
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  AND status != 'cancelled';

  SELECT COUNT(*) INTO completed_tasks
  FROM project_tasks
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  AND completed = true
  AND status != 'cancelled';

  -- Calculate new progress percentage
  IF total_tasks > 0 THEN
    new_progress := (completed_tasks::DECIMAL / total_tasks * 100)::INTEGER;

    -- Update the project
    UPDATE transformation_projects
    SET progress_percentage = new_progress
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER task_completion_updates_progress
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress();

-- ============================================================================
-- VIEWS for easier querying
-- ============================================================================

-- Project summary with task counts
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.*,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'blocked') AS blocked_tasks,
  a.company_name,
  a.industry
FROM transformation_projects p
LEFT JOIN project_tasks t ON t.project_id = p.id AND t.status != 'cancelled'
JOIN assessments a ON a.id = p.assessment_id
GROUP BY p.id, a.company_name, a.industry;

-- Active projects dashboard
CREATE OR REPLACE VIEW active_projects_dashboard AS
SELECT
  p.id,
  p.assessment_id,
  p.title,
  p.status,
  p.priority,
  p.category,
  p.progress_percentage,
  p.target_completion_date,
  COUNT(t.id) AS task_count,
  COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_task_count,
  a.company_name
FROM transformation_projects p
LEFT JOIN project_tasks t ON t.project_id = p.id
JOIN assessments a ON a.id = p.assessment_id
WHERE p.status NOT IN ('completed', 'archived')
GROUP BY p.id, a.company_name;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE transformation_projects IS 'User transformation projects derived from assessment recommendations';
COMMENT ON TABLE project_tasks IS 'Granular tasks within transformation projects';
COMMENT ON TABLE project_milestones IS 'Key checkpoints and milestones in transformation journey';
COMMENT ON TABLE project_progress_log IS 'Audit trail of project progress and updates';
COMMENT ON TABLE maturity_score_history IS 'Historical tracking of maturity scores over time';
