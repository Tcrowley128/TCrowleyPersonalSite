import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/assessment/[id] - Fetch assessment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = await params;

    // Fetch assessment details
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, company_name, company_size, industry, user_role, created_at, updated_at')
      .eq('id', assessmentId)
      .single();

    if (error || !assessment) {
      console.error('Error fetching assessment:', error);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Error in GET /api/assessment/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
