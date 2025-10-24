-- Add token tracking columns to conversation_messages table
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT 'claude-sonnet-4-20250514';

-- Add summary columns to assessment_conversations for quick stats
ALTER TABLE assessment_conversations
ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10, 4) DEFAULT 0;

-- Function to update conversation stats when a message is added
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation statistics
  UPDATE assessment_conversations
  SET
    total_messages = (
      SELECT COUNT(*)
      FROM conversation_messages
      WHERE conversation_id = NEW.conversation_id
    ),
    total_tokens = (
      SELECT COALESCE(SUM(total_tokens), 0)
      FROM conversation_messages
      WHERE conversation_id = NEW.conversation_id
    ),
    total_cost = (
      SELECT COALESCE(
        SUM(
          (input_tokens / 1000000.0 * 3.00) +
          (output_tokens / 1000000.0 * 15.00)
        ),
        0
      )
      FROM conversation_messages
      WHERE conversation_id = NEW.conversation_id
    ),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the existing trigger with one that updates stats
DROP TRIGGER IF EXISTS update_conversation_on_message ON conversation_messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

-- Create a view for chat analytics
CREATE OR REPLACE VIEW chat_analytics AS
SELECT
  ac.id as conversation_id,
  ac.assessment_id,
  a.company_name,
  a.industry,
  ac.user_id,
  ac.title,
  ac.total_messages,
  ac.total_tokens,
  ac.total_cost,
  ac.created_at,
  ac.updated_at,
  DATE(ac.created_at) as conversation_date
FROM assessment_conversations ac
LEFT JOIN assessments a ON ac.assessment_id = a.id;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON assessment_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_tokens ON conversation_messages(total_tokens);

-- Grant access to the view (service role will have access via admin client)
COMMENT ON VIEW chat_analytics IS 'Analytics view for AI chat conversations';
