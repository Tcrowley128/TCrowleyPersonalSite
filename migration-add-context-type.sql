-- Add context_type column to assessment_conversations table
-- This allows us to distinguish between assessment conversations and journey conversations

ALTER TABLE assessment_conversations
ADD COLUMN IF NOT EXISTS context_type TEXT DEFAULT 'assessment';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_context_type
ON assessment_conversations(context_type);

-- Update existing conversations to have 'assessment' context type
UPDATE assessment_conversations
SET context_type = 'assessment'
WHERE context_type IS NULL;
