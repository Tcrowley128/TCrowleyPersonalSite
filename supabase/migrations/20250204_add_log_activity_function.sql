-- Create log_activity function for logging activities across different entity types
CREATE OR REPLACE FUNCTION log_activity(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_activity_type TEXT,
  p_user_id TEXT,
  p_user_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_field_name TEXT DEFAULT NULL,
  p_old_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_activity_id UUID;
  v_project_id UUID;
BEGIN
  -- For PBI entity type, log to pbi_activity_log table
  IF p_entity_type = 'pbi' THEN
    -- Get the project_id from the PBI
    SELECT project_id INTO v_project_id
    FROM product_backlog_items
    WHERE id = p_entity_id;

    IF v_project_id IS NULL THEN
      RAISE EXCEPTION 'PBI not found or has no project_id: %', p_entity_id;
    END IF;

    -- Insert into pbi_activity_log
    INSERT INTO pbi_activity_log (
      pbi_id,
      project_id,
      activity_type,
      field_name,
      old_value,
      new_value,
      changed_by,
      description,
      metadata
    ) VALUES (
      p_entity_id,
      v_project_id,
      p_activity_type,
      p_field_name,
      p_old_value,
      p_new_value,
      COALESCE(p_user_name, p_user_id),
      p_description,
      p_metadata
    )
    RETURNING id INTO v_activity_id;

  ELSE
    -- For other entity types, we could add additional logging logic here
    -- For now, just return NULL since we don't have a generic activity log table
    RETURN NULL;
  END IF;

  RETURN v_activity_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION log_activity IS 'Logs activity for various entity types (pbi, project, risk, etc.)';
