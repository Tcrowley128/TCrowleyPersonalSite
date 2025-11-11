-- Comprehensive Agile/Scrum Project Management System
-- Inspired by Azure DevOps, Jira, and Miro best practices

-- =============================================================================
-- 1. SPRINTS / ITERATIONS (Create first since PBIs reference it)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,

  -- Sprint details
  name TEXT NOT NULL, -- e.g., "Sprint 1", "Q1 Sprint 3"
  goal TEXT, -- Sprint goal
  sprint_number INTEGER,

  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),

  -- Capacity planning
  team_capacity_hours NUMERIC(10,2), -- Total team capacity
  planned_velocity INTEGER, -- Story points planned
  actual_velocity INTEGER, -- Story points completed

  -- Sprint metrics
  committed_story_points INTEGER DEFAULT 0,
  completed_story_points INTEGER DEFAULT 0,
  spill_over_story_points INTEGER DEFAULT 0,

  -- Ceremonies completed
  planning_completed BOOLEAN DEFAULT false,
  planning_date TIMESTAMPTZ,
  review_completed BOOLEAN DEFAULT false,
  review_date TIMESTAMPTZ,
  retrospective_completed BOOLEAN DEFAULT false,
  retrospective_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- =============================================================================
-- 2. PRODUCT BACKLOG ITEMS (PBIs) / USER STORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_backlog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,

  -- Type and classification
  item_type TEXT DEFAULT 'user_story' CHECK (item_type IN ('user_story', 'bug', 'task', 'spike', 'epic')),
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  story_points INTEGER, -- Fibonacci: 1, 2, 3, 5, 8, 13, 21
  business_value INTEGER, -- 1-100 scale

  -- Status and workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'committed', 'in_progress', 'done', 'removed')),
  state_reason TEXT, -- Why it's in this state

  -- Sprint assignment
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  backlog_order INTEGER DEFAULT 0, -- Order in backlog

  -- Assignment
  assigned_to TEXT,
  team TEXT, -- Team name if multiple teams

  -- Effort tracking
  original_estimate_hours NUMERIC(10,2),
  remaining_hours NUMERIC(10,2),
  completed_hours NUMERIC(10,2),

  -- Relationships
  parent_id UUID REFERENCES product_backlog_items(id) ON DELETE SET NULL, -- For epics/hierarchies
  linked_pbis JSONB, -- Array of {id, link_type} for dependencies, related, etc.

  -- Tags and metadata
  tags TEXT[],
  area_path TEXT, -- Organizational hierarchy
  iteration_path TEXT, -- Sprint/iteration path

  -- Dates
  created_date TIMESTAMPTZ DEFAULT NOW(),
  activated_date TIMESTAMPTZ,
  resolved_date TIMESTAMPTZ,
  closed_date TIMESTAMPTZ,
  target_date DATE,

  -- Additional context
  discussion JSONB, -- Array of {user, message, timestamp, reactions}
  attachments JSONB, -- Array of {name, url, type}
  test_cases JSONB, -- Array of test case references

  -- Metadata
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- =============================================================================
-- 3. SPRINT TASKS (Sub-items under PBIs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbi_id UUID NOT NULL REFERENCES product_backlog_items(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'development' CHECK (task_type IN ('development', 'testing', 'documentation', 'design', 'deployment', 'research')),

  -- Status
  status TEXT DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'blocked', 'done')),
  blocked_reason TEXT,

  -- Assignment
  assigned_to TEXT,

  -- Effort
  original_estimate_hours NUMERIC(10,2),
  remaining_hours NUMERIC(10,2),
  completed_hours NUMERIC(10,2),

  -- Order
  task_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- =============================================================================
-- 4. SPRINT RETROSPECTIVES
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Retrospective details
  facilitator TEXT,
  attendees TEXT[],
  date TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Structured feedback (What went well, What didn't, Actions)
  went_well JSONB, -- Array of {item, votes, discussed}
  to_improve JSONB, -- Array of {item, votes, discussed}
  action_items JSONB, -- Array of {action, owner, due_date, status, completed_date}

  -- Additional categories
  shoutouts JSONB, -- Team appreciation
  experiments JSONB, -- Things to try next sprint
  insights JSONB, -- Key learnings

  -- Templates/frameworks used
  framework TEXT, -- start_stop_continue, mad_sad_glad, 4Ls, sailboat, etc.

  -- Metrics
  team_mood INTEGER CHECK (team_mood >= 1 AND team_mood <= 5), -- 1-5 scale
  sprint_rating INTEGER CHECK (sprint_rating >= 1 AND sprint_rating <= 10), -- 1-10 scale

  -- Follow-up
  previous_actions_reviewed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. SPRINT REVIEWS / DEMOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Review details
  presenter TEXT,
  attendees TEXT[],
  stakeholders TEXT[],
  date TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Demonstrated items
  demonstrated_pbis JSONB, -- Array of {pbi_id, feedback, accepted}

  -- Feedback
  stakeholder_feedback JSONB, -- Array of {stakeholder, feedback, timestamp}
  new_requirements JSONB, -- New PBIs identified
  backlog_adjustments TEXT, -- Changes to backlog priority

  -- Metrics
  demo_success_rate INTEGER, -- Percentage of items successfully demoed
  stakeholder_satisfaction INTEGER CHECK (stakeholder_satisfaction >= 1 AND stakeholder_satisfaction <= 5),

  -- Recording/artifacts
  recording_url TEXT,
  presentation_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. DAILY STANDUPS
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_standups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,

  -- Standup details
  date DATE NOT NULL,
  facilitator TEXT,
  attendees TEXT[],
  absent_members TEXT[],

  -- Team updates
  updates JSONB, -- Array of {member, yesterday, today, blockers}

  -- Parking lot items (topics to discuss after)
  parking_lot JSONB,

  -- Follow-up actions
  actions JSONB,

  -- Metrics
  duration_minutes INTEGER,
  blockers_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. SPRINT PLANNING
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_planning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Planning details
  facilitator TEXT,
  product_owner TEXT,
  scrum_master TEXT,
  attendees TEXT[],
  date TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Part 1: What
  sprint_goal TEXT,
  selected_pbis JSONB, -- Array of PBI IDs with initial estimates

  -- Part 2: How
  task_breakdown JSONB, -- How PBIs were broken into tasks
  capacity_plan JSONB, -- Team member capacity

  -- Commitments
  committed_velocity INTEGER,
  committed_story_points INTEGER,

  -- Decisions and risks
  decisions JSONB,
  identified_risks JSONB,
  dependencies JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. BURNDOWN/BURNUP DATA (For charts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_burndown_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Daily snapshot
  snapshot_date DATE NOT NULL,

  -- Story points
  remaining_story_points INTEGER,
  completed_story_points INTEGER,
  added_story_points INTEGER DEFAULT 0, -- Scope changes

  -- Hours
  remaining_hours NUMERIC(10,2),
  completed_hours NUMERIC(10,2),

  -- Ideal burndown line
  ideal_remaining INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(sprint_id, snapshot_date)
);

-- =============================================================================
-- 9. TEAM VELOCITY HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_velocity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Velocity metrics
  planned_velocity INTEGER,
  actual_velocity INTEGER,
  capacity_hours NUMERIC(10,2),
  actual_hours NUMERIC(10,2),

  -- Quality metrics
  bugs_created INTEGER DEFAULT 0,
  bugs_fixed INTEGER DEFAULT 0,

  -- Sprint success indicators
  sprint_goal_met BOOLEAN,
  on_time_completion_rate INTEGER, -- Percentage

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. AI SCRUM MASTER INTERACTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_scrum_master_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,

  -- Interaction type
  interaction_type TEXT CHECK (interaction_type IN ('coaching', 'blocker_resolution', 'process_guidance', 'metrics_analysis', 'recommendation', 'facilitation')),

  -- Context
  context TEXT, -- What triggered this interaction
  user_query TEXT,
  ai_response TEXT,

  -- Recommendations
  recommendations JSONB,
  actions_taken JSONB,

  -- Outcome
  helpful_rating INTEGER CHECK (helpful_rating >= 1 AND helpful_rating <= 5),
  user_feedback TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Sprints
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);

-- PBIs
CREATE INDEX IF NOT EXISTS idx_pbis_project ON product_backlog_items(project_id);
CREATE INDEX IF NOT EXISTS idx_pbis_sprint ON product_backlog_items(sprint_id);
CREATE INDEX IF NOT EXISTS idx_pbis_status ON product_backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_pbis_assigned ON product_backlog_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pbis_backlog_order ON product_backlog_items(backlog_order);
CREATE INDEX IF NOT EXISTS idx_pbis_parent ON product_backlog_items(parent_id);

-- Sprint Tasks
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_pbi ON sprint_tasks(pbi_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint ON sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_assigned ON sprint_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_status ON sprint_tasks(status);

-- Retrospectives
CREATE INDEX IF NOT EXISTS idx_retros_sprint ON sprint_retrospectives(sprint_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_sprint ON sprint_reviews(sprint_id);

-- Standups
CREATE INDEX IF NOT EXISTS idx_standups_sprint ON daily_standups(sprint_id);
CREATE INDEX IF NOT EXISTS idx_standups_date ON daily_standups(date);

-- Planning
CREATE INDEX IF NOT EXISTS idx_planning_sprint ON sprint_planning_sessions(sprint_id);

-- Burndown
CREATE INDEX IF NOT EXISTS idx_burndown_sprint ON sprint_burndown_data(sprint_id);
CREATE INDEX IF NOT EXISTS idx_burndown_date ON sprint_burndown_data(snapshot_date);

-- Velocity
CREATE INDEX IF NOT EXISTS idx_velocity_project ON team_velocity_history(project_id);
CREATE INDEX IF NOT EXISTS idx_velocity_sprint ON team_velocity_history(sprint_id);

-- AI Interactions
CREATE INDEX IF NOT EXISTS idx_ai_project ON ai_scrum_master_interactions(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_sprint ON ai_scrum_master_interactions(sprint_id);
CREATE INDEX IF NOT EXISTS idx_ai_type ON ai_scrum_master_interactions(interaction_type);

-- =============================================================================
-- TRIGGERS FOR updated_at
-- =============================================================================

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pbis_updated_at
  BEFORE UPDATE ON product_backlog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprint_tasks_updated_at
  BEFORE UPDATE ON sprint_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retros_updated_at
  BEFORE UPDATE ON sprint_retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON sprint_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planning_updated_at
  BEFORE UPDATE ON sprint_planning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_planning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_burndown_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_velocity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scrum_master_interactions ENABLE ROW LEVEL SECURITY;

-- Allow all for now (can be tightened based on auth)
CREATE POLICY "Allow all operations on sprints" ON sprints FOR ALL USING (true);
CREATE POLICY "Allow all operations on pbis" ON product_backlog_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on sprint_tasks" ON sprint_tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on retros" ON sprint_retrospectives FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON sprint_reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on standups" ON daily_standups FOR ALL USING (true);
CREATE POLICY "Allow all operations on planning" ON sprint_planning_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on burndown" ON sprint_burndown_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on velocity" ON team_velocity_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai" ON ai_scrum_master_interactions FOR ALL USING (true);
