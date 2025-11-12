-- Enable Realtime for retrospective tables
-- This allows real-time subscriptions to table changes

-- Enable realtime for retrospectives table
ALTER PUBLICATION supabase_realtime ADD TABLE retrospectives;

-- Enable realtime for retro_cards table
ALTER PUBLICATION supabase_realtime ADD TABLE retro_cards;

-- Enable realtime for retro_votes table
ALTER PUBLICATION supabase_realtime ADD TABLE retro_votes;

-- Enable realtime for retro_actions table
ALTER PUBLICATION supabase_realtime ADD TABLE retro_actions;

-- Enable realtime for retro_shoutouts table
ALTER PUBLICATION supabase_realtime ADD TABLE retro_shoutouts;
