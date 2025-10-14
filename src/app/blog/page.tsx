'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, ArrowRight, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

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

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags.map(tag => tag.name)))
  );

  // Filter posts based on search term and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || post.tags.some(tag => tag.name === selectedTag);

    return matchesSearch && matchesTag;
  });

  const breadcrumbItems = [
    { label: 'Blog' }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Thoughts, insights, and experiences from my journey in technology and beyond
            </p>

            <div className="flex justify-center mb-4">
              <a
                href="/admin"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                <ExternalLink size={20} />
                Admin Panel
              </a>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-sm mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent min-w-[200px]"
              >
                <option value="">All Categories</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedTag) && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Showing {filteredPosts.length} of {posts.length} posts</span>
                {(searchTerm || selectedTag) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Blog Posts */}
          <div className="space-y-8 pb-16">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </motion.div>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {searchTerm || selectedTag ? 'No posts found' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm || selectedTag
                    ? 'Try adjusting your search terms or filters.'
                    : 'Check back soon for new content!'
                  }
                </p>
                {!searchTerm && !selectedTag && (
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
                  >
                    <ExternalLink size={20} />
                    Create First Post
                  </a>
                )}
              </motion.div>
            ) : (
              filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="md:flex md:h-[320px]">
                    {post.featured_image && (
                      <div className="md:w-1/3 md:flex-shrink-0">
                        <div className="h-64 md:h-[320px] overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.image_alt || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}

                    <div className={`p-8 flex flex-col ${post.featured_image ? 'md:w-2/3' : 'w-full'}`}>
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-4">
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
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      <div className="flex-grow">
                        {post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        {!post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                            {post.content.substring(0, 200)}...
                          </p>
                        )}
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex gap-2 mb-6">
                          {post.tags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => setSelectedTag(tag.name)}
                              className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full hover:bg-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                          Read More
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}