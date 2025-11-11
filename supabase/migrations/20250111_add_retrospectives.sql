-- Retrospective sessions
CREATE TABLE IF NOT EXISTS retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES assessment_projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES project_sprints(id) ON DELETE SET NULL,
  template_id VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  facilitator_id TEXT,
  facilitator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Retrospective cards (sticky notes)
CREATE TABLE IF NOT EXISTS retro_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  column_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  color VARCHAR(20) DEFAULT 'yellow',
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  votes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes on cards
CREATE TABLE IF NOT EXISTS retro_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES retro_cards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Action items from retros
CREATE TABLE IF NOT EXISTS retro_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  card_id UUID REFERENCES retro_cards(id) ON DELETE SET NULL,
  action_text TEXT NOT NULL,
  assigned_to TEXT,
  assigned_to_name TEXT,
  status VARCHAR(20) DEFAULT 'open',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Shoutouts
CREATE TABLE IF NOT EXISTS retro_shoutouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES retrospectives(id) ON DELETE CASCADE,
  from_user_id TEXT,
  from_user_name TEXT,
  to_user_id TEXT,
  to_user_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_retrospectives_project_id ON retrospectives(project_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_sprint_id ON retrospectives(sprint_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_status ON retrospectives(status);
CREATE INDEX IF NOT EXISTS idx_retro_cards_retro_id ON retro_cards(retro_id);
CREATE INDEX IF NOT EXISTS idx_retro_cards_column_id ON retro_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_retro_votes_card_id ON retro_votes(card_id);
CREATE INDEX IF NOT EXISTS idx_retro_actions_retro_id ON retro_actions(retro_id);
CREATE INDEX IF NOT EXISTS idx_retro_actions_status ON retro_actions(status);
CREATE INDEX IF NOT EXISTS idx_retro_shoutouts_retro_id ON retro_shoutouts(retro_id);

-- Enable Row Level Security
ALTER TABLE retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE retro_shoutouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retrospectives
CREATE POLICY "Users can view retrospectives for their projects"
  ON retrospectives
  FOR SELECT
  USING (
    project_id IN (
      SELECT ap.id FROM assessment_projects ap
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create retrospectives for their projects"
  ON retrospectives
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT ap.id FROM assessment_projects ap
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update retrospectives for their projects"
  ON retrospectives
  FOR UPDATE
  USING (
    project_id IN (
      SELECT ap.id FROM assessment_projects ap
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- RLS Policies for retro_cards
CREATE POLICY "Users can view cards in their project retros"
  ON retro_cards
  FOR SELECT
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their project retros"
  ON retro_cards
  FOR INSERT
  WITH CHECK (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their project retros"
  ON retro_cards
  FOR UPDATE
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cards"
  ON retro_cards
  FOR DELETE
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- RLS Policies for retro_votes (similar pattern)
CREATE POLICY "Users can view votes in their project retros"
  ON retro_votes
  FOR SELECT
  USING (
    card_id IN (
      SELECT rc.id FROM retro_cards rc
      INNER JOIN retrospectives r ON rc.retro_id = r.id
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can vote in their project retros"
  ON retro_votes
  FOR INSERT
  WITH CHECK (
    card_id IN (
      SELECT rc.id FROM retro_cards rc
      INNER JOIN retrospectives r ON rc.retro_id = r.id
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes"
  ON retro_votes
  FOR DELETE
  USING (
    card_id IN (
      SELECT rc.id FROM retro_cards rc
      INNER JOIN retrospectives r ON rc.retro_id = r.id
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- RLS Policies for retro_actions
CREATE POLICY "Users can view actions in their project retros"
  ON retro_actions
  FOR SELECT
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage actions in their project retros"
  ON retro_actions
  FOR ALL
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- RLS Policies for retro_shoutouts
CREATE POLICY "Users can view shoutouts in their project retros"
  ON retro_shoutouts
  FOR SELECT
  USING (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shoutouts in their project retros"
  ON retro_shoutouts
  FOR INSERT
  WITH CHECK (
    retro_id IN (
      SELECT r.id FROM retrospectives r
      INNER JOIN assessment_projects ap ON r.project_id = ap.id
      INNER JOIN assessments a ON ap.assessment_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Function to update card updated_at timestamp
CREATE OR REPLACE FUNCTION update_retro_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update card timestamp on update
CREATE TRIGGER update_retro_card_timestamp
  BEFORE UPDATE ON retro_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_retro_card_timestamp();

-- Function to update vote count on card
CREATE OR REPLACE FUNCTION update_card_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE retro_cards SET votes = votes + 1 WHERE id = NEW.card_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE retro_cards SET votes = votes - 1 WHERE id = OLD.card_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote count
CREATE TRIGGER update_card_vote_count_trigger
  AFTER INSERT OR DELETE ON retro_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_card_vote_count();
