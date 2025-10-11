import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, email),
        tags:_PostToTag(tag:tags(*))
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Flatten tags structure to match Prisma format
    const formattedPost = {
      ...post,
      tags: post.tags?.map((t: any) => t.tag) || []
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
