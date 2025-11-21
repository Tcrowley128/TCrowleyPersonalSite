-- Add recurring work items support
-- This allows teams to create PBIs that automatically repeat (e.g., monthly maintenance, weekly reports)

-- Add columns to product_backlog_items table for recurrence
ALTER TABLE public.product_backlog_items
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly'
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1, -- e.g., every 2 weeks
ADD COLUMN IF NOT EXISTS recurrence_day_of_week INTEGER, -- 0-6 for weekly (0=Sunday)
ADD COLUMN IF NOT EXISTS recurrence_day_of_month INTEGER, -- 1-31 for monthly
ADD COLUMN IF NOT EXISTS recurrence_start_date DATE,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS parent_recurring_item_id UUID REFERENCES public.product_backlog_items(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS next_occurrence_date DATE,
ADD COLUMN IF NOT EXISTS last_generated_date DATE;

-- Create index for recurring items
CREATE INDEX IF NOT EXISTS idx_pbis_recurring ON public.product_backlog_items(is_recurring, next_occurrence_date)
WHERE is_recurring = TRUE;

-- Create index for parent recurring item lookups
CREATE INDEX IF NOT EXISTS idx_pbis_parent_recurring ON public.product_backlog_items(parent_recurring_item_id)
WHERE parent_recurring_item_id IS NOT NULL;

-- Add comment to explain the feature
COMMENT ON COLUMN public.product_backlog_items.is_recurring IS 'Indicates if this PBI is a recurring template';
COMMENT ON COLUMN public.product_backlog_items.recurrence_pattern IS 'Pattern: daily, weekly, biweekly, monthly, quarterly';
COMMENT ON COLUMN public.product_backlog_items.parent_recurring_item_id IS 'Links generated instances to their recurring template';
COMMENT ON COLUMN public.product_backlog_items.next_occurrence_date IS 'Next date when a new instance should be created';
