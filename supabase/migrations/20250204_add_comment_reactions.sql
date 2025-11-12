-- Add reactions support to comments
-- Reactions will be stored as JSONB: {"👍": ["user1@example.com", "user2@example.com"], "❤️": ["user3@example.com"]}

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- Create an index on reactions for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_reactions ON comments USING GIN (reactions);

-- Add a function to add a reaction to a comment
CREATE OR REPLACE FUNCTION add_comment_reaction(
  p_comment_id UUID,
  p_emoji TEXT,
  p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_reactions JSONB;
  v_users JSONB;
BEGIN
  -- Get current reactions
  SELECT reactions INTO v_reactions
  FROM comments
  WHERE id = p_comment_id;

  -- Get users who reacted with this emoji (or empty array if none)
  v_users := COALESCE(v_reactions -> p_emoji, '[]'::jsonb);

  -- Add user if not already in the array
  IF NOT (v_users @> to_jsonb(ARRAY[p_user_id])) THEN
    v_users := v_users || to_jsonb(ARRAY[p_user_id]);
    v_reactions := jsonb_set(v_reactions, ARRAY[p_emoji], v_users);

    -- Update the comment
    UPDATE comments
    SET reactions = v_reactions,
        updated_at = NOW()
    WHERE id = p_comment_id;
  END IF;

  RETURN v_reactions;
END;
$$;

-- Add a function to remove a reaction from a comment
CREATE OR REPLACE FUNCTION remove_comment_reaction(
  p_comment_id UUID,
  p_emoji TEXT,
  p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_reactions JSONB;
  v_users JSONB;
  v_filtered_users JSONB;
BEGIN
  -- Get current reactions
  SELECT reactions INTO v_reactions
  FROM comments
  WHERE id = p_comment_id;

  -- Get users who reacted with this emoji
  v_users := COALESCE(v_reactions -> p_emoji, '[]'::jsonb);

  -- Remove user from the array
  SELECT jsonb_agg(elem)
  INTO v_filtered_users
  FROM jsonb_array_elements_text(v_users) AS elem
  WHERE elem != p_user_id;

  -- If no users left for this emoji, remove the emoji key entirely
  IF v_filtered_users IS NULL OR jsonb_array_length(v_filtered_users) = 0 THEN
    v_reactions := v_reactions - p_emoji;
  ELSE
    v_reactions := jsonb_set(v_reactions, ARRAY[p_emoji], v_filtered_users);
  END IF;

  -- Update the comment
  UPDATE comments
  SET reactions = v_reactions,
      updated_at = NOW()
  WHERE id = p_comment_id;

  RETURN v_reactions;
END;
$$;
