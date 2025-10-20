-- Create assessment_conversations table
CREATE TABLE IF NOT EXISTS assessment_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assessment_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_assessment_id ON assessment_conversations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON assessment_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON conversation_messages(created_at);

-- Enable Row Level Security
ALTER TABLE assessment_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_conversations
-- Allow users to see conversations for their own assessments
CREATE POLICY "Users can view their own conversations"
  ON assessment_conversations
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Allow users to create conversations for their assessments
CREATE POLICY "Users can create conversations for their assessments"
  ON assessment_conversations
  FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Allow users to update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON assessment_conversations
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for conversation_messages
-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON conversation_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM assessment_conversations
      WHERE user_id = auth.uid()
      OR assessment_id IN (
        SELECT id FROM assessments WHERE user_id = auth.uid()
      )
    )
  );

-- Allow users to create messages in their conversations
CREATE POLICY "Users can create messages in their conversations"
  ON conversation_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM assessment_conversations
      WHERE assessment_id IN (
        SELECT id FROM assessments WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assessment_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
