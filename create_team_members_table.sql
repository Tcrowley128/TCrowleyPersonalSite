-- Create team_members table to store unique team member names for autocomplete
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- Create index on last_used_at for sorting by recent usage
CREATE INDEX IF NOT EXISTS idx_team_members_last_used ON public.team_members(last_used_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read team members
CREATE POLICY "Allow authenticated users to read team members"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow all authenticated users to insert team members
CREATE POLICY "Allow authenticated users to insert team members"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow all authenticated users to update team members
CREATE POLICY "Allow authenticated users to update team members"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Populate with existing team members from PBIs
INSERT INTO public.team_members (email, last_used_at)
SELECT DISTINCT
  assigned_to as email,
  NOW() as last_used_at
FROM public.product_backlog_items
WHERE assigned_to IS NOT NULL
  AND assigned_to != ''
ON CONFLICT (email) DO NOTHING;

-- Populate with existing team members from tasks
INSERT INTO public.team_members (email, last_used_at)
SELECT DISTINCT
  assigned_to as email,
  NOW() as last_used_at
FROM public.tasks
WHERE assigned_to IS NOT NULL
  AND assigned_to != ''
ON CONFLICT (email) DO NOTHING;

-- Populate with existing team members from risks
INSERT INTO public.team_members (email, last_used_at)
SELECT DISTINCT
  owner as email,
  NOW() as last_used_at
FROM public.risks
WHERE owner IS NOT NULL
  AND owner != ''
ON CONFLICT (email) DO NOTHING;
