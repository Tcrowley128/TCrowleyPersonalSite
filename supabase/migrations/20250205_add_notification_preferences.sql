-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,

    -- Comment notifications
    notify_all_comments BOOLEAN DEFAULT FALSE,
    notify_mentions BOOLEAN DEFAULT TRUE,
    notify_comment_replies BOOLEAN DEFAULT TRUE,

    -- Status change notifications
    notify_any_status_change BOOLEAN DEFAULT FALSE,
    notify_assigned_status_change BOOLEAN DEFAULT TRUE,
    notify_watched_status_change BOOLEAN DEFAULT TRUE,

    -- Assignment notifications
    notify_assigned_to_me BOOLEAN DEFAULT TRUE,
    notify_team_assignments BOOLEAN DEFAULT FALSE,

    -- Sprint/Project notifications
    notify_sprint_changes BOOLEAN DEFAULT TRUE,
    notify_project_updates BOOLEAN DEFAULT FALSE,

    -- Risk notifications
    notify_risk_created BOOLEAN DEFAULT TRUE,
    notify_risk_escalated BOOLEAN DEFAULT TRUE,

    -- Deadline notifications
    notify_deadline_approaching BOOLEAN DEFAULT TRUE,
    notify_deadline_passed BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
    ON notification_preferences
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
    ON notification_preferences
    FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
    ON notification_preferences
    FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to get or create user notification preferences with defaults
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id TEXT)
RETURNS notification_preferences
LANGUAGE plpgsql
AS $$
DECLARE
    v_preferences notification_preferences;
BEGIN
    -- Try to get existing preferences
    SELECT * INTO v_preferences
    FROM notification_preferences
    WHERE user_id = p_user_id;

    -- If not found, create with defaults
    IF NOT FOUND THEN
        INSERT INTO notification_preferences (user_id)
        VALUES (p_user_id)
        RETURNING * INTO v_preferences;
    END IF;

    RETURN v_preferences;
END;
$$;

-- Function to check if user should be notified
CREATE OR REPLACE FUNCTION should_notify_user(
    p_user_id TEXT,
    p_notification_type TEXT,
    p_is_assigned BOOLEAN DEFAULT FALSE,
    p_is_mentioned BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefs notification_preferences;
    v_should_notify BOOLEAN := FALSE;
BEGIN
    -- Get user preferences
    SELECT * INTO v_prefs
    FROM notification_preferences
    WHERE user_id = p_user_id;

    -- If no preferences exist, use defaults
    IF NOT FOUND THEN
        v_prefs := get_notification_preferences(p_user_id);
    END IF;

    -- Check based on notification type
    CASE p_notification_type
        WHEN 'comment' THEN
            v_should_notify := v_prefs.notify_all_comments OR
                             (p_is_mentioned AND v_prefs.notify_mentions);

        WHEN 'status_change' THEN
            v_should_notify := v_prefs.notify_any_status_change OR
                             (p_is_assigned AND v_prefs.notify_assigned_status_change);

        WHEN 'assignment' THEN
            v_should_notify := v_prefs.notify_assigned_to_me;

        WHEN 'deadline' THEN
            v_should_notify := v_prefs.notify_deadline_approaching;

        WHEN 'risk' THEN
            v_should_notify := v_prefs.notify_risk_created;

        ELSE
            v_should_notify := TRUE; -- Default to notify for unknown types
    END CASE;

    RETURN v_should_notify;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add comment for documentation
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences and settings';
COMMENT ON FUNCTION should_notify_user IS 'Determines if a user should receive a notification based on their preferences';
