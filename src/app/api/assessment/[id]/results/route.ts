import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PATCH /api/assessment/[id]/results
// Update specific fields in assessment results (for quick edits without full regeneration)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id: assessmentId } = await params;
    const body = await request.json();

    const { field, value, path } = body; // path is for nested JSONB updates

    console.log('[Quick Edit] Received:', { field, value, path });

    if (!field) {
      return NextResponse.json(
        { error: 'Field name is required' },
        { status: 400 }
      );
    }

    // If updating a nested field within JSONB, we need special handling
    let updateQuery;
    if (path) {
      // For nested updates like quick_wins.items[0].title
      // We'll fetch, modify, and update the entire JSONB field
      console.log('Fetching current results for field:', field, 'assessment_id:', assessmentId);

      const { data: currentResults, error: fetchError } = await supabase
        .from('assessment_results')
        .select(field)
        .eq('assessment_id', assessmentId)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error on empty result

      console.log('Fetch result:', { currentResults, fetchError });

      if (fetchError) {
        console.error('Error fetching current results:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch current results', details: fetchError.message },
          { status: 500 }
        );
      }

      if (!currentResults) {
        console.error('No assessment_results row found for assessment_id:', assessmentId);
        return NextResponse.json(
          { error: 'Results not found. Please ensure the assessment has been generated.', assessment_id: assessmentId },
          { status: 404 }
        );
      }

      if (!currentResults[field]) {
        console.error('Field not found in results:', field, 'Available fields:', Object.keys(currentResults));
        return NextResponse.json(
          { error: `Field '${field}' not found in results. Please ensure the assessment has been generated.` },
          { status: 404 }
        );
      }

      // Deep set the value using path
      const updatedField = setNestedValue(currentResults[field], path, value);

      updateQuery = supabase
        .from('assessment_results')
        .update({
          [field]: updatedField,
        })
        .eq('assessment_id', assessmentId);
    } else {
      // Simple field update
      updateQuery = supabase
        .from('assessment_results')
        .update({
          [field]: value,
        })
        .eq('assessment_id', assessmentId);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error('Error updating result field:', updateError);
      return NextResponse.json(
        { error: 'Failed to update result' },
        { status: 500 }
      );
    }

    // Try to update the assessment's updated_at timestamp (may fail with RLS, but not critical)
    try {
      await supabase
        .from('assessments')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', assessmentId);
    } catch (err) {
      console.log('Note: Could not update assessment timestamp (not critical):', err);
    }

    // Create a version snapshot to track manual edits
    try {
      await supabase.rpc('create_assessment_version', {
        p_assessment_id: assessmentId,
        p_created_by: 'user_quick_edit',
        p_change_summary: `Quick edit to ${field}${path ? ` (${path})` : ''}`,
        p_changed_responses: null,
      });
    } catch (err) {
      console.log('Note: Could not create version snapshot (not critical):', err);
    }

    return NextResponse.json({
      success: true,
      field,
      message: 'Result updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/assessment/[id]/results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to set nested values in objects
function setNestedValue(obj: any, path: string, value: any): any {
  const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone

  // Handle paths like "[0].title" or "items[0].title" or just "title"
  const pathParts = path.split('.');
  let current = newObj;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];

    // Handle array index at the start like "[0]"
    if (part.startsWith('[')) {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1]);
        current = current[index];
      }
    } else {
      // Handle array indices like "items[0]"
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const arrayKey = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        current = current[arrayKey][index];
      } else {
        current = current[part];
      }
    }
  }

  // Set the final value
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart.startsWith('[')) {
    const match = lastPart.match(/^\[(\d+)\]$/);
    if (match) {
      const index = parseInt(match[1]);
      current[index] = value;
    }
  } else {
    const arrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayKey = arrayMatch[1];
      const index = parseInt(arrayMatch[2]);
      current[arrayKey][index] = value;
    } else {
      current[lastPart] = value;
    }
  }

  return newObj;
}
