-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'mention', 'assignment', 'status_change', 'deadline', etc.
    title TEXT NOT NULL,
    message TEXT,
    entity_type TEXT, -- 'pbi', 'task', 'comment', 'project', 'sprint', etc.
    entity_id UUID,
    link_url TEXT,
    from_user_id TEXT,
    from_user_name TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id TEXT,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_link_url TEXT DEFAULT NULL,
    p_from_user_id TEXT DEFAULT NULL,
    p_from_user_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        link_url,
        from_user_id,
        from_user_name
    )
    VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_entity_type,
        p_entity_id,
        p_link_url,
        p_from_user_id,
        p_from_user_name
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications
    FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications
    FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Service role can insert notifications (for system-generated notifications)
CREATE POLICY "Service role can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for mentions, assignments, status changes, and deadlines';
COMMENT ON COLUMN notifications.type IS 'Type of notification: mention, assignment, status_change, deadline';
COMMENT ON COLUMN notifications.entity_type IS 'Type of entity this notification refers to: pbi, task, comment, project, sprint';
COMMENT ON COLUMN notifications.entity_id IS 'UUID of the entity this notification refers to';
COMMENT ON COLUMN notifications.link_url IS 'URL to navigate to when notification is clicked';
