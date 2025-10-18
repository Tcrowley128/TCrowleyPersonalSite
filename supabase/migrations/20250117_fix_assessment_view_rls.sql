-- Fix RLS for assessment_summary view
-- This ensures the view respects the same security policies as the assessments table

-- Enable RLS on the view
ALTER VIEW assessment_summary SET (security_invoker = true);

-- Alternative approach: If the above doesn't work in your Supabase version,
-- we can recreate the view with security_invoker option

-- Drop and recreate with security_invoker (this makes the view check RLS as the calling user)
DROP VIEW IF EXISTS assessment_summary;

CREATE VIEW assessment_summary WITH (security_invoker = true) AS
SELECT
  a.id,
  a.company_name,
  a.company_size,
  a.industry,
  a.technical_capability,
  a.transformation_approach,
  a.email,
  a.wants_consultation,
  a.status,
  a.completed_at,
  a.created_at,
  EXISTS (SELECT 1 FROM assessment_results ar WHERE ar.assessment_id = a.id) as has_results
FROM assessments a
WHERE a.status = 'COMPLETED'
ORDER BY a.completed_at DESC;

-- Add comment to track the security fix
COMMENT ON VIEW assessment_summary IS 'Digital Transformation Assessment summary view - v1.1 (RLS enforced)';
