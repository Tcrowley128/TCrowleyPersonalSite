import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Track a blog post view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get IP address to prevent duplicate counting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] :
                     request.headers.get('x-real-ip') || undefined;

    const supabase = createAdminClient();

    // Check if this IP already viewed this post in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: existingView } = await supabase
      .from('post_views')
      .select('*')
      .eq('post_id', postId)
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo.toISOString())
      .single();

    // Only create a new view if not recently viewed
    if (!existingView) {
      const { data: postView, error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          ip_address: ipAddress,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, id: postView.id });
    }

    return NextResponse.json({ success: true, duplicate: true });
  } catch (error) {
    console.error('Error tracking post view:', error);
    return NextResponse.json(
      { error: 'Failed to track post view' },
      { status: 500 }
    );
  }
}

// Get post view statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    const supabase = createAdminClient();

    if (postId) {
      // Get views for a specific post
      const { count: viewCount } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      return NextResponse.json({ postId, views: viewCount || 0 });
    }

    // Get all posts with their view counts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, slug, published_at, author_id')
      .eq('published', true);

    // Get view counts for all posts
    const postsWithViews = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: viewCount } = await supabase
          .from('post_views')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Fetch author separately
        const { data: author } = await supabase
          .from('users')
          .select('name')
          .eq('id', post.author_id)
          .single();

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          views: viewCount || 0,
          author: author?.name || 'Unknown',
          publishedAt: post.published_at,
        };
      })
    );

    // Sort by views descending and take top 10
    const popularPosts = postsWithViews
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return NextResponse.json({
      popularPosts,
    });
  } catch (error) {
    console.error('Error fetching post views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post views' },
      { status: 500 }
    );
  }
}
