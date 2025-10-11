import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/posts - Get all published posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('admin') === 'true';

    const supabase = createAdminClient();

    // Fetch posts
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('published', true);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // Fetch related data for each post
    const postsWithRelations = await Promise.all(
      (posts || []).map(async (post) => {
        // Fetch author
        const { data: author } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', post.author_id)
          .single();

        // Fetch tags
        const { data: postTagRelations } = await supabase
          .from('_PostToTag')
          .select('B')
          .eq('A', post.id);

        let tags: any[] = [];
        if (postTagRelations && postTagRelations.length > 0) {
          const tagIds = postTagRelations.map(pt => pt.B);
          const { data: tagsData } = await supabase
            .from('tags')
            .select('*')
            .in('id', tagIds);
          tags = tagsData || [];
        }

        return {
          ...post,
          author: author || null,
          tags
        };
      })
    );

    return NextResponse.json(postsWithRelations);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, published, tags, authorId, featuredImage, imageAlt, metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    const supabase = createAdminClient();

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists' },
        { status: 400 }
      );
    }

    // Get the authenticated user's ID from Supabase Auth
    const defaultAuthorId = authorId || 'cmg111s680000vaxk3usa0mm3';

    // Insert the post
    const now = new Date().toISOString();
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        excerpt,
        slug,
        published: published || false,
        published_at: published ? now : null,
        featured_image: featuredImage,
        image_alt: imageAlt,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        canonical_url: canonicalUrl || null,
        og_image: ogImage || null,
        author_id: defaultAuthorId,
        created_at: now,
        updated_at: now,
      })
      .select(`
        *,
        author:users(id, name, email)
      `)
      .single();

    if (postError) throw postError;

    // Handle tags if provided
    const postTags: any[] = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Try to find existing tag
        let { data: tag } = await supabase
          .from('tags')
          .select('*')
          .eq('name', tagName)
          .single();

        // Create tag if it doesn't exist
        if (!tag) {
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();

          if (tagError) throw tagError;
          tag = newTag;
        }

        // Create the post-tag relationship
        const { error: relationError } = await supabase
          .from('_PostToTag')
          .insert({
            A: post.id,
            B: tag.id,
          });

        if (relationError) throw relationError;
        postTags.push(tag);
      }
    }

    return NextResponse.json({ ...post, tags: postTags }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : String(error),
        fullError: error
      },
      { status: 500 }
    );
  }
}