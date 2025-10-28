-- Create assessment_chat_updates table to track changes from chat conversations
CREATE TABLE IF NOT EXISTS assessment_chat_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES assessment_conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,
  update_type TEXT NOT NULL, -- 'tool_recommendation', 'timeline', 'quick_win', 'roadmap', etc.
  section_path TEXT NOT NULL, -- JSON path to updated section (e.g., 'tier1_citizen_led[0].name')
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by UUID REFERENCES auth.users(id)
);

-- Add columns to assessments table for tracking chat updates
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS last_chat_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chat_update_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_updates_assessment_id ON assessment_chat_updates(assessment_id);
CREATE INDEX IF NOT EXISTS idx_chat_updates_conversation_id ON assessment_chat_updates(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_updates_applied_at ON assessment_chat_updates(applied_at);

-- Enable Row Level Security
ALTER TABLE assessment_chat_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_chat_updates
-- Allow users to view updates for their own assessments
CREATE POLICY "Users can view their own chat updates"
  ON assessment_chat_updates
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Allow users to create updates for their own assessments
CREATE POLICY "Users can create chat updates for their assessments"
  ON assessment_chat_updates
  FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Function to update assessment after chat update
CREATE OR REPLACE FUNCTION update_assessment_after_chat_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assessments
  SET
    last_chat_update = NOW(),
    chat_update_count = COALESCE(chat_update_count, 0) + 1
  WHERE id = NEW.assessment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update assessment when chat update is applied
CREATE TRIGGER update_assessment_on_chat_update
  AFTER INSERT ON assessment_chat_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_after_chat_update();

-- Add metadata column to conversation_messages for storing actionable insights
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON conversation_messages USING GIN (metadata);
