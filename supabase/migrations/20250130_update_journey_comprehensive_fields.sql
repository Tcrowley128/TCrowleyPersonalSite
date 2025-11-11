-- Add comprehensive tracking fields to assessment_projects table

-- Add operational area and health status
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS operational_area TEXT,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'on_track' CHECK (health_status IN ('on_track', 'at_risk', 'off_track', 'completed'));

-- Add start date
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add team and ownership fields
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS project_lead TEXT,
ADD COLUMN IF NOT EXISTS team_members TEXT[],
ADD COLUMN IF NOT EXISTS stakeholders TEXT[],
ADD COLUMN IF NOT EXISTS executive_sponsor TEXT;

-- Add project size and scope fields
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS project_size TEXT CHECK (project_size IN ('small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS budget_allocated_cents BIGINT,
ADD COLUMN IF NOT EXISTS budget_spent_cents BIGINT;

-- Add quantitative metrics (using NUMERIC for percentages, BIGINT for cents, INTEGER for hours/counts)
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS expected_roi_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS expected_cost_savings_cents BIGINT,
ADD COLUMN IF NOT EXISTS expected_time_savings_hours INTEGER,
ADD COLUMN IF NOT EXISTS expected_efficiency_gain_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS users_impacted INTEGER,
ADD COLUMN IF NOT EXISTS processes_improved INTEGER;

-- Add qualitative metrics
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS expected_business_impact TEXT,
ADD COLUMN IF NOT EXISTS success_criteria TEXT,
ADD COLUMN IF NOT EXISTS kpis JSONB;

-- Add risk management fields
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS risks JSONB,
ADD COLUMN IF NOT EXISTS dependencies JSONB,
ADD COLUMN IF NOT EXISTS blockers JSONB,
ADD COLUMN IF NOT EXISTS mitigation_strategies TEXT;

-- Add change management fields
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS training_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS training_plan TEXT,
ADD COLUMN IF NOT EXISTS communication_plan TEXT,
ADD COLUMN IF NOT EXISTS adoption_rate_percentage INTEGER CHECK (adoption_rate_percentage >= 0 AND adoption_rate_percentage <= 100);

-- Add documentation and notes
ALTER TABLE assessment_projects
ADD COLUMN IF NOT EXISTS documentation_links JSONB,
ADD COLUMN IF NOT EXISTS lessons_learned TEXT,
ADD COLUMN IF NOT EXISTS comments JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the status constraint to remove 'archived' and add 'on_hold'
ALTER TABLE assessment_projects DROP CONSTRAINT IF EXISTS assessment_projects_status_check;
ALTER TABLE assessment_projects ADD CONSTRAINT assessment_projects_status_check
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'on_hold'));

-- Update the complexity constraint to add 'very_high'
ALTER TABLE assessment_projects DROP CONSTRAINT IF EXISTS assessment_projects_complexity_check;
ALTER TABLE assessment_projects ADD CONSTRAINT assessment_projects_complexity_check
  CHECK (complexity IN ('low', 'medium', 'high', 'very_high'));

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_projects_operational_area ON assessment_projects(operational_area);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON assessment_projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_health_status ON assessment_projects(health_status);
CREATE INDEX IF NOT EXISTS idx_projects_risk_level ON assessment_projects(risk_level);
CREATE INDEX IF NOT EXISTS idx_projects_project_lead ON assessment_projects(project_lead);
