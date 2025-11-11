import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/comments/[commentId]/reactions - Add or remove a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params;
    const body = await request.json();
    const { emoji, user_id, action } = body; // action: 'add' or 'remove'

    if (!emoji || !user_id || !action) {
      return NextResponse.json(
        { error: 'emoji, user_id, and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { error: 'action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Call the appropriate function based on action
    const functionName = action === 'add' ? 'add_comment_reaction' : 'remove_comment_reaction';
    const { data: reactions, error } = await supabase.rpc(functionName, {
      p_comment_id: commentId,
      p_emoji: emoji,
      p_user_id: user_id
    });

    if (error) {
      console.error(`Error ${action}ing reaction:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} reaction` },
        { status: 500 }
      );
    }

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error in POST /api/comments/[commentId]/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
