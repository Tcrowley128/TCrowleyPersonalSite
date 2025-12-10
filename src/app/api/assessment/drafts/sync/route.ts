import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/assessment/drafts/sync - Sync draft to server
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to sync drafts' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { session_id, answers, current_step, timestamp } = body;

    // Validate required fields
    if (!session_id || !answers || current_step === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, answers, current_step' },
        { status: 400 }
      );
    }

    // Validate current_step is a positive integer
    if (typeof current_step !== 'number' || current_step < 1) {
      return NextResponse.json(
        { error: 'current_step must be a positive integer' },
        { status: 400 }
      );
    }

    // Check if backend has an existing draft
    const { data: existing, error: fetchError } = await supabase
      .from('assessment_drafts')
      .select('id, updated_at, answers, current_step')
      .eq('user_id', user.id)
      .eq('session_id', session_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('Error fetching existing draft:', fetchError);
      throw fetchError;
    }

    const localTimestamp = timestamp ? new Date(timestamp) : new Date();
    const serverTimestamp = existing ? new Date(existing.updated_at) : null;

    // "Latest draft wins" logic - compare timestamps
    if (existing && serverTimestamp && serverTimestamp > localTimestamp) {
      // Server has newer version - return conflict
      console.log('Draft conflict detected:', {
        session_id,
        local: localTimestamp.toISOString(),
        server: serverTimestamp.toISOString()
      });

      return NextResponse.json({
        success: true,
        conflict: true,
        server_draft: {
          answers: existing.answers,
          current_step: existing.current_step,
          timestamp: existing.updated_at
        },
        message: 'Server has newer draft'
      });
    }

    // Local is newer or no server draft exists - upsert
    const { data, error } = await supabase
      .from('assessment_drafts')
      .upsert({
        user_id: user.id,
        session_id,
        answers,
        current_step,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting draft:', error);
      throw error;
    }

    console.log('Draft synced successfully:', {
      session_id,
      step: current_step,
      answers_count: Object.keys(answers).length
    });

    return NextResponse.json({
      success: true,
      conflict: false,
      draft: data,
      message: 'Draft synced successfully'
    });

  } catch (error) {
    console.error('Error in draft sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/assessment/drafts/sync?session_id=xxx - Fetch draft from server
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch draft for this user and session
    const { data, error } = await supabase
      .from('assessment_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', session_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('Error fetching draft:', error);
      throw error;
    }

    if (error && error.code === 'PGRST116') {
      // No draft found - this is not an error
      return NextResponse.json({
        success: true,
        draft: null,
        message: 'No draft found for this session'
      });
    }

    console.log('Draft fetched successfully:', {
      session_id,
      step: data.current_step,
      answers_count: Object.keys(data.answers).length,
      updated_at: data.updated_at
    });

    return NextResponse.json({
      success: true,
      draft: data
    });

  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
