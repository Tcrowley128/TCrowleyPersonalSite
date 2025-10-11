'use client';

import { useState, useEffect } from 'react';
import { BlogPost } from '@/types';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('blogPosts', JSON.stringify(newPosts));
  };

  const addPost = (title: string, content: string) => {
    const newPost: BlogPost = {
      id: Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    };

    const newPosts = [newPost, ...posts];
    savePosts(newPosts);
    return newPost;
  };

  const deletePost = (id: number) => {
    const newPosts = posts.filter(post => post.id !== id);
    savePosts(newPosts);
  };

  const updatePost = (id: number, title: string, content: string) => {
    const newPosts = posts.map(post =>
      post.id === id
        ? {
            ...post,
            title,
            content,
            slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
          }
        : post
    );
    savePosts(newPosts);
  };

  return {
    posts,
    addPost,
    deletePost,
    updatePost
  };
}