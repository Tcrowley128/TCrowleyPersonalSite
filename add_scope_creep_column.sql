-- Add scope_creep_story_points column to sprints table
ALTER TABLE public.sprints
ADD COLUMN IF NOT EXISTS scope_creep_story_points INTEGER DEFAULT 0;

-- Update existing sprints to have 0 scope creep
UPDATE public.sprints
SET scope_creep_story_points = 0
WHERE scope_creep_story_points IS NULL;
