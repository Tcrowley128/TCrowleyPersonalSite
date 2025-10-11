import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Get all redirects or a specific redirect
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromPath = searchParams.get('fromPath');

    const supabase = createAdminClient();

    if (fromPath) {
      const { data: redirect, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('fromPath', fromPath)
        .single();

      if (error) throw error;

      return NextResponse.json(redirect);
    }

    // Get all redirects
    const { data: redirects, error } = await supabase
      .from('redirects')
      .select('*')
      .order('fromPath', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redirects' },
      { status: 500 }
    );
  }
}

// Create a new redirect
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { fromPath, toPath, permanent, enabled } = body;

    // Validation
    if (!fromPath || !toPath) {
      return NextResponse.json(
        { error: 'From path and to path are required' },
        { status: 400 }
      );
    }

    // Check for circular redirects
    if (fromPath === toPath) {
      return NextResponse.json(
        { error: 'Cannot redirect a path to itself' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: redirect, error } = await supabase
      .from('redirects')
      .insert({
        fromPath,
        toPath,
        permanent: permanent !== false,
        enabled: enabled !== false,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A redirect for this path already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error('Error creating redirect:', error);
    return NextResponse.json(
      { error: 'Failed to create redirect' },
      { status: 500 }
    );
  }
}

// Update a redirect
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { id, fromPath, toPath, permanent, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Redirect ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: any = {};
    if (fromPath) updateData.fromPath = fromPath;
    if (toPath) updateData.toPath = toPath;
    if (permanent !== undefined) updateData.permanent = permanent;
    if (enabled !== undefined) updateData.enabled = enabled;

    const { data: redirect, error } = await supabase
      .from('redirects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error('Error updating redirect:', error);
    return NextResponse.json(
      { error: 'Failed to update redirect' },
      { status: 500 }
    );
  }
}

// Delete a redirect
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Redirect ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('redirects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    return NextResponse.json(
      { error: 'Failed to delete redirect' },
      { status: 500 }
    );
  }
}
