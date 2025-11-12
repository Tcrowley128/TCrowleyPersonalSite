import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch retrospective with all data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    // Get retrospective
    const { data: retro, error: retroError } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('id', retroId)
      .single();

    if (retroError || !retro) {
      return NextResponse.json(
        { error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    // Get cards
    const { data: cards } = await supabase
      .from('retro_cards')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: true });

    // Get actions
    const { data: actions } = await supabase
      .from('retro_actions')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: false });

    // Get shoutouts
    const { data: shoutouts } = await supabase
      .from('retro_shoutouts')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: false });

    // Get open actions from previous retros for the same project
    let previousOpenActions = [];
    if (retro.project_id) {
      // Find all previous retrospectives for the same project that were completed before this one
      const { data: previousRetros } = await supabase
        .from('retrospectives')
        .select('id, title, completed_at')
        .eq('project_id', retro.project_id)
        .eq('status', 'completed')
        .lt('created_at', retro.created_at)
        .order('completed_at', { ascending: false });

      if (previousRetros && previousRetros.length > 0) {
        const previousRetroIds = previousRetros.map((r: any) => r.id);

        // Fetch open actions from those retros
        const { data: openActions } = await supabase
          .from('retro_actions')
          .select('*, retrospective:retrospectives(title)')
          .in('retro_id', previousRetroIds)
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        previousOpenActions = openActions || [];
      }
    }

    return NextResponse.json({
      retrospective: retro,
      cards: cards || [],
      actions: actions || [],
      shoutouts: shoutouts || [],
      previousOpenActions: previousOpenActions || [],
    });
  } catch (error) {
    console.error('[Retro GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retrospective' },
      { status: 500 }
    );
  }
}

// PATCH - Update retrospective
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retrospectives')
      .update(body)
      .eq('id', retroId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update retrospective' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update retrospective' },
      { status: 500 }
    );
  }
}

// DELETE - Delete retrospective
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('retrospectives')
      .delete()
      .eq('id', retroId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete retrospective' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Retro DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete retrospective' },
      { status: 500 }
    );
  }
}
