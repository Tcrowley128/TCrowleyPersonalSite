import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, email),
        tags:_PostToTag(tag:tags(*))
      `)
      .eq('id', id)
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
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, published, tags, featuredImage, imageAlt, metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage } = body;

    const supabase = createAdminClient();

    // Generate new slug if title changed
    let slug;
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      // Check if slug already exists (excluding current post)
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existingPost) {
        return NextResponse.json(
          { error: 'A post with this title already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (slug) updateData.slug = slug;
    if (featuredImage !== undefined) updateData.featured_image = featuredImage;
    if (imageAlt !== undefined) updateData.image_alt = imageAlt;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle || null;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription || null;
    if (metaKeywords !== undefined) updateData.meta_keywords = metaKeywords || null;
    if (canonicalUrl !== undefined) updateData.canonical_url = canonicalUrl || null;
    if (ogImage !== undefined) updateData.og_image = ogImage || null;
    if (published !== undefined) {
      updateData.published = published;
      updateData.published_at = published ? new Date().toISOString() : null;
    }

    // Update the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users(id, name, email)
      `)
      .single();

    if (postError) throw postError;

    // Update tags if provided
    let postTags: any[] = [];
    if (tags) {
      // Remove existing tag relationships
      await supabase
        .from('_PostToTag')
        .delete()
        .eq('A', id);

      // Add new tags
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
            A: id,
            B: tag.id,
          });

        if (relationError) throw relationError;
        postTags.push(tag);
      }
    } else {
      // Fetch existing tags
      const { data: existingTags } = await supabase
        .from('_PostToTag')
        .select('tag:tags(*)')
        .eq('A', id);

      postTags = existingTags?.map((t: any) => t.tag) || [];
    }

    return NextResponse.json({ ...post, tags: postTags });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Delete the post (cascading deletes will handle relationships)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
