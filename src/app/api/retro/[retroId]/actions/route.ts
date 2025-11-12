import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all action items for a retro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    const { data: actions, error } = await supabase
      .from('retro_actions')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch actions' },
        { status: 500 }
      );
    }

    return NextResponse.json(actions || []);
  } catch (error) {
    console.error('[Retro Actions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    );
  }
}

// POST - Create a new action item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retro_actions')
      .insert({
        retro_id: retroId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      console.error('[Retro Actions POST] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create action' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Actions POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}

// PATCH - Update an action item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const body = await request.json();
    const { actionId, ...updates } = body;

    if (!actionId) {
      return NextResponse.json(
        { error: 'Action ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // If marking as completed, set completed_at
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('retro_actions')
      .update(updates)
      .eq('id', actionId)
      .select()
      .single();

    if (error) {
      console.error('[Retro Actions PATCH] Error:', error);
      return NextResponse.json(
        { error: 'Failed to update action' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Actions PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an action item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const actionId = searchParams.get('actionId');

    if (!actionId) {
      return NextResponse.json(
        { error: 'Action ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('retro_actions')
      .delete()
      .eq('id', actionId);

    if (error) {
      console.error('[Retro Actions DELETE] Error:', error);
      return NextResponse.json(
        { error: 'Failed to delete action' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Retro Actions DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
