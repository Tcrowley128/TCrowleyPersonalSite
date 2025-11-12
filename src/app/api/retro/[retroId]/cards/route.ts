import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all cards for a retro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    const { data: cards, error } = await supabase
      .from('retro_cards')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    return NextResponse.json(cards || []);
  } catch (error) {
    console.error('[Retro Cards GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

// POST - Create a new card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retro_cards')
      .insert({
        retro_id: retroId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      console.error('[Retro Cards POST] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create card' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Cards POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

// PATCH - Update card (for position, content, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const body = await request.json();
    const { cardId, ...updates } = body;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retro_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (error) {
      console.error('[Retro Cards PATCH] Error:', error);
      return NextResponse.json(
        { error: 'Failed to update card' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Cards PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('retro_cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('[Retro Cards DELETE] Error:', error);
      return NextResponse.json(
        { error: 'Failed to delete card' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Retro Cards DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
