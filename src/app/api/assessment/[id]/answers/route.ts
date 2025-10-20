import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/assessment/[id]/answers
// Fetch all assessment responses for display and editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = params;

    // Fetch all responses ordered by step and question
    const { data: responses, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('step_number', { ascending: true })
      .order('question_key', { ascending: true });

    if (error) {
      console.error('Error fetching assessment responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessment responses' },
        { status: 500 }
      );
    }

    // Also fetch assessment metadata
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, company_name, company_size, industry, user_role, created_at, updated_at')
      .eq('id', assessmentId)
      .single();

    if (assessmentError) {
      console.error('Error fetching assessment:', assessmentError);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assessment,
      responses: responses || [],
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/assessment/[id]/answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/assessment/[id]/answers
// Update specific assessment responses
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = params;
    const body = await request.json();

    const { updates } = body; // Array of { question_key, answer_value }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Verify assessment exists and user has access
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Update each response
    const updatePromises = updates.map(async (update: { question_key: string; answer_value: any }) => {
      const { error } = await supabase
        .from('assessment_responses')
        .update({
          answer_value: update.answer_value,
        })
        .eq('assessment_id', assessmentId)
        .eq('question_key', update.question_key);

      if (error) {
        console.error(`Error updating response ${update.question_key}:`, error);
        throw error;
      }

      return update.question_key;
    });

    await Promise.all(updatePromises);

    // Update the assessment's updated_at timestamp
    await supabase
      .from('assessments')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', assessmentId);

    return NextResponse.json({
      success: true,
      updated: updates.map(u => u.question_key),
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/assessment/[id]/answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
