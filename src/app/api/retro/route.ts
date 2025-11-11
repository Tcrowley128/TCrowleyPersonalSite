import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all retrospectives for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: retrospectives, error } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch retrospectives' },
        { status: 500 }
      );
    }

    return NextResponse.json(retrospectives || []);
  } catch (error) {
    console.error('[Retro GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retrospectives' },
      { status: 500 }
    );
  }
}

// POST - Create a new retrospective
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, sprintId, templateId, title, facilitatorId, facilitatorName } = body;

    if (!projectId || !templateId || !title) {
      return NextResponse.json(
        { error: 'Project ID, template ID, and title are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retrospectives')
      .insert({
        project_id: projectId,
        sprint_id: sprintId,
        template_id: templateId,
        title,
        facilitator_id: facilitatorId,
        facilitator_name: facilitatorName,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      console.error('[Retro POST] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create retrospective' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create retrospective' },
      { status: 500 }
    );
  }
}
