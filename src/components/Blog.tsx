'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
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

export default function Blog() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <section id="blog" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Thoughts, insights, and experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                See All Blogs
              </Link>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              >
                <ExternalLink size={20} />
                Admin Panel
              </a>
            </div>
          </motion.div>

          <div className="space-y-8">
            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to my blog!</h3>
                <p className="text-gray-600 mb-6">
                  This is where I&apos;ll share my thoughts, insights, and experiences.
                  Visit the admin panel to create your first blog post!
                </p>
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  <ExternalLink size={20} />
                  Go to Admin
                </a>
              </motion.div>
            ) : (
              <>
                {posts.slice(0, 3).map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
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
                        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
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

                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <div className="flex-grow">
                          {post.excerpt && (
                            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                              {post.excerpt}
                            </p>
                          )}

                          {!post.excerpt && (
                            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                              {post.content.substring(0, 200)}...
                            </p>
                          )}
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex gap-2 mb-6">
                            {post.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                          >
                            Read More
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}

                {posts.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center pt-8"
                  >
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      See More Blogs
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}