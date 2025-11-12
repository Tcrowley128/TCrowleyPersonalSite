import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all votes for a retro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    // Get all cards for this retro first
    const { data: cards } = await supabase
      .from('retro_cards')
      .select('id')
      .eq('retro_id', retroId);

    if (!cards || cards.length === 0) {
      return NextResponse.json([]);
    }

    const cardIds = cards.map(c => c.id);

    // Get all votes for these cards
    const { data: votes, error } = await supabase
      .from('retro_votes')
      .select('*')
      .in('card_id', cardIds);

    if (error) {
      console.error('[Retro Votes GET] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    return NextResponse.json(votes || []);
  } catch (error) {
    console.error('[Retro Votes GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST - Add a vote to a card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const body = await request.json();
    const { cardId, userId, userName } = body;

    if (!cardId || !userId) {
      return NextResponse.json(
        { error: 'Card ID and User ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if vote already exists (without .single() to avoid error when not found)
    const { data: existingVotes } = await supabase
      .from('retro_votes')
      .select('id')
      .eq('card_id', cardId)
      .eq('user_id', userId);

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'Already voted on this card' },
        { status: 409 }
      );
    }

    // Add vote
    const { data, error } = await supabase
      .from('retro_votes')
      .insert({
        card_id: cardId,
        user_id: userId,
        user_name: userName,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate key constraint violation specifically
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already voted on this card' },
          { status: 409 }
        );
      }
      console.error('[Retro Votes POST] Error:', error);
      return NextResponse.json(
        { error: 'Failed to add vote' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Votes POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add vote' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a vote from a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const userId = searchParams.get('userId');

    if (!cardId || !userId) {
      return NextResponse.json(
        { error: 'Card ID and User ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('retro_votes')
      .delete()
      .eq('card_id', cardId)
      .eq('user_id', userId);

    if (error) {
      console.error('[Retro Votes DELETE] Error:', error);
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Retro Votes DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
}
