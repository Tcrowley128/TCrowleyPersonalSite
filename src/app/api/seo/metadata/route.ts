import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Get metadata for a specific page
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    const supabase = createAdminClient();

    if (path) {
      const { data: metadata, error } = await supabase
        .from('page_metadata')
        .select('*')
        .eq('path', path)
        .single();

      if (error || !metadata) {
        return NextResponse.json(
          { error: 'Metadata not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(metadata);
    }

    // Get all metadata
    const { data: allMetadata, error } = await supabase
      .from('page_metadata')
      .select('*')
      .order('path', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ metadata: allMetadata });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

// Create or update metadata for a page
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const {
      path,
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      canonicalUrl,
      noIndex,
      noFollow,
    } = body;

    // Validation
    if (!path || !title || !description) {
      return NextResponse.json(
        { error: 'Path, title, and description are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if metadata exists
    const { data: existing } = await supabase
      .from('page_metadata')
      .select('*')
      .eq('path', path)
      .single();

    let metadata;
    if (existing) {
      // Update existing metadata
      const { data, error } = await supabase
        .from('page_metadata')
        .update({
          title,
          description,
          keywords: keywords || null,
          og_title: ogTitle || null,
          og_description: ogDescription || null,
          og_image: ogImage || null,
          twitter_card: twitterCard || 'summary_large_image',
          canonical_url: canonicalUrl || null,
          no_index: noIndex || false,
          no_follow: noFollow || false,
        })
        .eq('path', path)
        .select()
        .single();

      if (error) throw error;
      metadata = data;
    } else {
      // Create new metadata
      const { data, error } = await supabase
        .from('page_metadata')
        .insert({
          path,
          title,
          description,
          keywords: keywords || null,
          og_title: ogTitle || null,
          og_description: ogDescription || null,
          og_image: ogImage || null,
          twitter_card: twitterCard || 'summary_large_image',
          canonical_url: canonicalUrl || null,
          no_index: noIndex || false,
          no_follow: noFollow || false,
        })
        .select()
        .single();

      if (error) throw error;
      metadata = data;
    }

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Error saving metadata:', error);
    return NextResponse.json(
      { error: 'Failed to save metadata' },
      { status: 500 }
    );
  }
}

// Delete metadata
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('page_metadata')
      .delete()
      .eq('path', path);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metadata:', error);
    return NextResponse.json(
      { error: 'Failed to delete metadata' },
      { status: 500 }
    );
  }
}
