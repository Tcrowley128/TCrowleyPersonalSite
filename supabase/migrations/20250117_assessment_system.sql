-- Digital Transformation Assessment System
-- Migration: Assessment tables and technology solutions database

-- ============================================================================
-- ASSESSMENTS TABLE
-- Stores the main assessment submission data
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Company Information
  company_name TEXT,
  company_size TEXT, -- <10, 10-50, 50-200, 200-500, 500+
  industry TEXT,
  user_role TEXT, -- Business Leader, Operations, IT/Technical, Consultant

  -- Technical Capabilities
  technical_capability TEXT, -- dedicated_team, 1-2_people, willing_to_hire, citizen_only
  team_comfort_level TEXT[], -- excel_power_users, no_code_learners, some_coding, technical_team
  existing_tools JSONB, -- Structured data about what tools they use

  -- Transformation Readiness
  change_readiness_score INTEGER, -- 1-5 scale
  transformation_approach TEXT, -- citizen_focus, hybrid, technical_excellence, show_options
  has_champion BOOLEAN DEFAULT false,

  -- Contact Information
  contact_name TEXT,
  email TEXT,
  wants_consultation BOOLEAN DEFAULT false,

  -- Assessment Status
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
  current_step INTEGER DEFAULT 1,
  completed_at TIMESTAMP,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ASSESSMENT RESPONSES TABLE
-- Stores individual question responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,

  step_number INTEGER NOT NULL,
  question_key TEXT NOT NULL,
  question_text TEXT,
  answer_value JSONB NOT NULL, -- Flexible storage for various answer types

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ASSESSMENT RESULTS TABLE
-- Stores AI-generated recommendations and analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,

  -- Strategic Recommendations (3-tier structure)
  data_strategy JSONB,
  automation_strategy JSONB,
  ai_strategy JSONB,
  people_strategy JSONB,
  agile_framework JSONB,

  -- Tiered Recommendations
  tier1_citizen_led JSONB, -- Quick wins, no-code solutions
  tier2_hybrid JSONB, -- Business + IT collaboration
  tier3_technical JSONB, -- Enterprise/developer solutions

  -- Actionable Plans
  quick_wins JSONB, -- 30-day action items
  roadmap JSONB, -- 90-day and beyond
  pilot_recommendations JSONB, -- Suggested pilot projects

  -- Technology Recommendations
  technology_recommendations JSONB, -- Matched solutions from tech database
  existing_tool_opportunities JSONB, -- Underutilized features

  -- Analysis
  maturity_assessment JSONB, -- Current state across pillars
  priority_matrix JSONB, -- Effort vs Impact
  risk_considerations JSONB,

  -- Change Management
  change_management_plan JSONB,
  training_recommendations JSONB,
  success_metrics JSONB,

  -- Metadata
  generated_by TEXT DEFAULT 'claude', -- AI model used
  model_version TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(assessment_id)
);

-- ============================================================================
-- TECHNOLOGY SOLUTIONS DATABASE
-- Curated database of tools and platforms
-- ============================================================================
CREATE TABLE IF NOT EXISTS technology_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  name TEXT NOT NULL,
  vendor TEXT,
  category TEXT NOT NULL, -- data, automation, ai, collaboration, etc.
  subcategory TEXT,
  description TEXT,
  tagline TEXT, -- Short one-liner

  -- Classification
  tier TEXT NOT NULL, -- CITIZEN, HYBRID, TECHNICAL
  complexity_level TEXT, -- LOW, MEDIUM, HIGH
  learning_curve TEXT, -- LOW, MEDIUM, HIGH

  -- Capabilities
  requires_developers BOOLEAN DEFAULT false,
  business_user_friendly BOOLEAN DEFAULT true,
  no_code BOOLEAN DEFAULT false,
  low_code BOOLEAN DEFAULT false,

  -- Pricing
  price_range TEXT, -- FREE, $, $$, $$$, $$$$
  pricing_model TEXT, -- free, freemium, subscription, enterprise, one_time
  free_tier_available BOOLEAN DEFAULT false,
  estimated_cost_range TEXT, -- "$10-100/month", "$5k-20k/year", etc.

  -- Implementation
  implementation_time TEXT, -- DAYS, WEEKS, MONTHS
  implementation_complexity TEXT, -- LOW, MEDIUM, HIGH
  time_to_value TEXT, -- How long until you see results

  -- Use Cases & Features
  use_cases JSONB, -- Array of specific use case strings
  key_features JSONB, -- Array of key features
  best_for JSONB, -- Array of scenarios/company types
  not_recommended_for JSONB,

  -- Integration & Requirements
  prerequisites TEXT[], -- "Microsoft 365", "Google Workspace", "SQL Database"
  integrations JSONB, -- What it connects with
  platforms TEXT[], -- web, desktop, mobile, api

  -- Industry & Company Size Fit
  industries JSONB, -- Array of industries it fits well
  company_sizes TEXT[], -- small, medium, large, enterprise

  -- Resources
  vendor_url TEXT,
  documentation_url TEXT,
  training_resources JSONB,
  community_support TEXT, -- strong, moderate, limited

  -- Ratings & Metadata
  popularity_score INTEGER, -- 1-10 for sorting/recommendations
  adoption_difficulty TEXT, -- How hard is it to get teams to adopt
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ASSESSMENT VIEWS (for admin analytics)
-- ============================================================================

-- View for completed assessments summary
CREATE OR REPLACE VIEW assessment_summary AS
SELECT
  a.id,
  a.company_name,
  a.company_size,
  a.industry,
  a.technical_capability,
  a.transformation_approach,
  a.email,
  a.wants_consultation,
  a.status,
  a.completed_at,
  a.created_at,
  EXISTS (SELECT 1 FROM assessment_results ar WHERE ar.assessment_id = a.id) as has_results
FROM assessments a
WHERE a.status = 'COMPLETED'
ORDER BY a.completed_at DESC;

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_email ON assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_industry ON assessments(industry);
CREATE INDEX IF NOT EXISTS idx_assessments_company_size ON assessments(company_size);

-- Assessment responses indexes
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_step ON assessment_responses(step_number);

-- Technology solutions indexes
CREATE INDEX IF NOT EXISTS idx_tech_solutions_category ON technology_solutions(category);
CREATE INDEX IF NOT EXISTS idx_tech_solutions_tier ON technology_solutions(tier);
CREATE INDEX IF NOT EXISTS idx_tech_solutions_active ON technology_solutions(is_active);
CREATE INDEX IF NOT EXISTS idx_tech_solutions_popularity ON technology_solutions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_tech_solutions_name ON technology_solutions(name);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_solutions ENABLE ROW LEVEL SECURITY;

-- Public read access to technology solutions
CREATE POLICY "Technology solutions are publicly readable"
  ON technology_solutions FOR SELECT
  USING (is_active = true);

-- Admin full access to all tables (you'll need to create an 'admin' role)
-- For now, we'll allow authenticated users with admin role
CREATE POLICY "Admins can view all assessments"
  ON assessments FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = user_id);

CREATE POLICY "Admins can update assessments"
  ON assessments FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users can insert their own assessments
CREATE POLICY "Anyone can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (true);

-- Users can view their own results
CREATE POLICY "Users can view their own results"
  ON assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_results.assessment_id
      AND (assessments.user_id = auth.uid() OR assessments.session_id = current_setting('app.session_id', true))
    )
  );

-- Similar policies for responses
CREATE POLICY "Anyone can insert assessment responses"
  ON assessment_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own responses"
  ON assessment_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND (assessments.user_id = auth.uid() OR assessments.session_id = current_setting('app.session_id', true))
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technology_solutions_updated_at BEFORE UPDATE ON technology_solutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL SEED DATA - Sample Technology Solutions
-- ============================================================================

-- Microsoft Power Platform
INSERT INTO technology_solutions (
  name, vendor, category, subcategory, tier, complexity_level, learning_curve,
  description, tagline, requires_developers, business_user_friendly, no_code, low_code,
  price_range, pricing_model, free_tier_available,
  implementation_time, use_cases, key_features, best_for, prerequisites,
  platforms, company_sizes, popularity_score, is_active
) VALUES
(
  'Microsoft Power Automate',
  'Microsoft',
  'automation',
  'workflow_automation',
  'CITIZEN',
  'LOW',
  'LOW',
  'Cloud-based automation service that allows users to create automated workflows between apps and services',
  'Automate repetitive tasks without coding',
  false,
  true,
  true,
  true,
  '$',
  'freemium',
  true,
  'DAYS',
  '["email_automation", "data_sync", "approval_workflows", "notifications", "document_processing"]'::jsonb,
  '["350+ connectors", "Desktop automation (RPA)", "AI Builder integration", "Templates library"]'::jsonb,
  '["Microsoft 365 users", "Small to medium businesses", "Citizen developers"]'::jsonb,
  ARRAY['Microsoft 365'],
  ARRAY['web', 'desktop'],
  ARRAY['small', 'medium', 'large', 'enterprise'],
  9,
  true
),
(
  'Power BI',
  'Microsoft',
  'data',
  'business_intelligence',
  'HYBRID',
  'MEDIUM',
  'MEDIUM',
  'Business analytics service that provides interactive visualizations and business intelligence',
  'Turn data into insights with self-service analytics',
  false,
  true,
  false,
  true,
  '$$',
  'freemium',
  true,
  'WEEKS',
  '["dashboards", "reporting", "data_visualization", "kpi_tracking", "self_service_analytics"]'::jsonb,
  '["Drag-and-drop interface", "Real-time dashboards", "Natural language Q&A", "Mobile apps"]'::jsonb,
  '["Data analysts", "Business users who need reporting", "Organizations with Excel-heavy workflows"]'::jsonb,
  ARRAY['Microsoft 365'],
  ARRAY['web', 'desktop', 'mobile'],
  ARRAY['small', 'medium', 'large', 'enterprise'],
  10,
  true
),
(
  'Alteryx',
  'Alteryx',
  'data',
  'data_preparation',
  'TECHNICAL',
  'MEDIUM',
  'MEDIUM',
  'Self-service data analytics platform for data preparation, blending, and advanced analytics',
  'Prepare, blend, and analyze data without code',
  false,
  true,
  true,
  false,
  '$$$',
  'subscription',
  false,
  'WEEKS',
  '["data_blending", "etl", "data_cleansing", "predictive_analytics", "spatial_analytics"]'::jsonb,
  '["Visual workflow designer", "200+ pre-built tools", "Predictive analytics", "Data profiling"]'::jsonb,
  '["Data analysts", "Citizen data scientists", "Organizations replacing complex Excel processes"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['desktop', 'web'],
  ARRAY['medium', 'large', 'enterprise'],
  8,
  true
),
(
  'UiPath',
  'UiPath',
  'automation',
  'rpa',
  'TECHNICAL',
  'HIGH',
  'MEDIUM',
  'Enterprise Robotic Process Automation platform for automating repetitive tasks',
  'Enterprise-grade intelligent automation',
  true,
  false,
  false,
  true,
  '$$$$',
  'enterprise',
  true,
  'MONTHS',
  '["process_automation", "attended_automation", "unattended_automation", "document_processing", "citrix_automation"]'::jsonb,
  '["Visual workflow", "Computer vision", "AI/ML integration", "Process mining", "Orchestrator"]'::jsonb,
  '["Large enterprises", "Organizations with complex automation needs", "IT-led automation initiatives"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['desktop', 'web'],
  ARRAY['large', 'enterprise'],
  9,
  true
),
(
  'ChatGPT / Claude',
  'OpenAI / Anthropic',
  'ai',
  'llm',
  'CITIZEN',
  'LOW',
  'LOW',
  'Large language models for content generation, analysis, and productivity',
  'AI assistant for writing, analysis, and problem-solving',
  false,
  true,
  true,
  false,
  '$',
  'freemium',
  true,
  'DAYS',
  '["content_creation", "data_analysis", "summarization", "research", "brainstorming", "code_generation"]'::jsonb,
  '["Natural language interface", "Long conversations", "Multi-modal (text/images)", "API access"]'::jsonb,
  '["Anyone looking to boost productivity", "Content creators", "Analysts", "Developers"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['web', 'mobile', 'api'],
  ARRAY['small', 'medium', 'large', 'enterprise'],
  10,
  true
),
(
  'Zapier',
  'Zapier',
  'automation',
  'integration',
  'CITIZEN',
  'LOW',
  'LOW',
  'Automation platform that connects your apps and automates workflows',
  'Connect your apps and automate workflows',
  false,
  true,
  true,
  false,
  '$$',
  'freemium',
  true,
  'DAYS',
  '["app_integration", "data_sync", "notifications", "lead_management", "workflow_automation"]'::jsonb,
  '["5000+ app integrations", "Multi-step workflows", "Filters and logic", "No coding required"]'::jsonb,
  '["Small businesses", "Startups", "Teams using multiple SaaS apps"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['web'],
  ARRAY['small', 'medium', 'large'],
  9,
  true
),
(
  'Airtable',
  'Airtable',
  'data',
  'database',
  'HYBRID',
  'LOW',
  'LOW',
  'Cloud collaboration service with spreadsheet-database hybrid functionality',
  'Flexible database that anyone can use',
  false,
  true,
  true,
  true,
  '$$',
  'freemium',
  true,
  'DAYS',
  '["project_management", "crm", "inventory", "content_calendar", "tracking"]'::jsonb,
  '["Spreadsheet interface", "Multiple views", "Automations", "Forms", "API access", "Integrations"]'::jsonb,
  '["Teams outgrowing Excel", "Project management", "Custom workflows"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['web', 'mobile', 'api'],
  ARRAY['small', 'medium', 'large'],
  8,
  true
),
(
  'Tableau',
  'Salesforce',
  'data',
  'business_intelligence',
  'HYBRID',
  'MEDIUM',
  'MEDIUM',
  'Visual analytics platform for business intelligence and data visualization',
  'See and understand your data',
  false,
  true,
  false,
  false,
  '$$$',
  'subscription',
  false,
  'WEEKS',
  '["data_visualization", "dashboards", "analytics", "reporting", "data_exploration"]'::jsonb,
  '["Drag-and-drop interface", "Real-time analytics", "Mobile support", "Advanced calculations"]'::jsonb,
  '["Medium to large organizations", "Data analysts", "Executive reporting needs"]'::jsonb,
  ARRAY[]::TEXT[],
  ARRAY['desktop', 'web', 'mobile'],
  ARRAY['medium', 'large', 'enterprise'],
  9,
  true
);

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Add comment to track migration
COMMENT ON TABLE assessments IS 'Digital Transformation Assessment submissions - v1.0';
COMMENT ON TABLE assessment_results IS 'AI-generated recommendations and analysis - v1.0';
COMMENT ON TABLE technology_solutions IS 'Curated technology solutions database - v1.0';
