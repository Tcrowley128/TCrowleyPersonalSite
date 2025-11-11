import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all team members (sorted by most recently used)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('*')
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Error in GET /api/team-members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Add or update a team member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Upsert team member (insert or update last_used_at)
    const { data, error } = await supabase
      .from('team_members')
      .upsert(
        {
          email,
          name: name || null,
          last_used_at: new Date().toISOString()
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting team member:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teamMember: data });
  } catch (error) {
    console.error('Error in POST /api/team-members:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}
