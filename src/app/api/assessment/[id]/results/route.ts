import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/assessment/[id]/results - Fetch assessment results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = createAdminClient();

    // Fetch assessment results
    const { data: results, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error) {
      console.error('Error fetching assessment results:', error);
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assessment results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
