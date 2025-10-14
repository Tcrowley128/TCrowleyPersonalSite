'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Tag, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { trackPostView } from '@/lib/analytics';
import { getReadingTime } from '@/utils/readingTime';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  featured_image?: string;
  image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_image?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string);
    }
  }, [params.slug]);

  const fetchPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/posts/slug/${slug}`);

      if (response.status === 404) {
        setError('Post not found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data);

      // Track post view
      if (data.id) {
        trackPostView(data.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: post?.title || 'Post' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-800 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-20"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-800 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {error === 'Post not found' ? 'Post Not Found' : 'Error Loading Post'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {error === 'Post not found'
                  ? 'The blog post you are looking for does not exist or has been removed.'
                  : 'Something went wrong while loading the post. Please try again later.'
                }
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                Back to Blog
              </Link>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  const siteUrl = 'https://tylercrowley.vercel.app'; // Update with your actual domain
  const pageTitle = post.meta_title || post.title;
  const pageDescription = post.meta_description || post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const pageImage = post.og_image || post.featured_image || `${siteUrl}/images/default-og.jpg`;
  const pageUrl = post.canonical_url || `${siteUrl}/blog/${post.slug}`;

  return (
    <Layout>
      <Head>
        {/* Primary Meta Tags */}
        <title>{pageTitle} | Tyler Crowley</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDescription} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content="Tyler Crowley" />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:author" content={post.author.name} />
        {post.tags.map((tag) => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageImage} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-slate-800 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 mb-8"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </motion.div>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-slate-700 rounded-xl shadow-sm overflow-hidden"
          >
            {post.featured_image && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.image_alt || post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 md:p-12">
              <div className="mb-6">
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No date'}
                  </div>
                  <span>•</span>
                  <span>By {post.author.name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{getReadingTime(post.content)}</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {post.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-8">
                    <Tag size={16} className="text-gray-400 dark:text-gray-500" />
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-li:text-gray-700 dark:prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  lineHeight: '1.75'
                }}
              />
            </div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 mb-16 text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Back to All Posts
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}