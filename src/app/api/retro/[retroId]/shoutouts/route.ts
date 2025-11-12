import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all shoutouts for a retro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const supabase = createAdminClient();

    const { data: shoutouts, error } = await supabase
      .from('retro_shoutouts')
      .select('*')
      .eq('retro_id', retroId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch shoutouts' },
        { status: 500 }
      );
    }

    return NextResponse.json(shoutouts || []);
  } catch (error) {
    console.error('[Retro Shoutouts GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoutouts' },
      { status: 500 }
    );
  }
}

// POST - Create a new shoutout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { retroId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('retro_shoutouts')
      .insert({
        retro_id: retroId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      console.error('[Retro Shoutouts POST] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create shoutout' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Retro Shoutouts POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create shoutout' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a shoutout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ retroId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const shoutoutId = searchParams.get('shoutoutId');

    if (!shoutoutId) {
      return NextResponse.json(
        { error: 'Shoutout ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('retro_shoutouts')
      .delete()
      .eq('id', shoutoutId);

    if (error) {
      console.error('[Retro Shoutouts DELETE] Error:', error);
      return NextResponse.json(
        { error: 'Failed to delete shoutout' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Retro Shoutouts DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shoutout' },
      { status: 500 }
    );
  }
}
