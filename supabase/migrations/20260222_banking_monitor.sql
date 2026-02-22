-- Banking regulatory monitor: tracks press releases and their analysis
-- Prevents duplicate email alerts and stores relevance analysis per item

CREATE TABLE IF NOT EXISTS banking_monitor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMPTZ,
  description TEXT,
  -- Claude analysis fields
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low', 'not_relevant')),
  summary TEXT,
  impact_analysis TEXT,
  action_required BOOLEAN DEFAULT false,
  action_details TEXT,
  -- Tracking fields
  email_sent BOOLEAN DEFAULT false,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banking_monitor_url ON banking_monitor_items(url);
CREATE INDEX IF NOT EXISTS idx_banking_monitor_email_sent ON banking_monitor_items(email_sent);
CREATE INDEX IF NOT EXISTS idx_banking_monitor_priority ON banking_monitor_items(priority);
CREATE INDEX IF NOT EXISTS idx_banking_monitor_created_at ON banking_monitor_items(created_at DESC);

-- Allow service role full access (used by the monitor agent)
ALTER TABLE banking_monitor_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON banking_monitor_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
