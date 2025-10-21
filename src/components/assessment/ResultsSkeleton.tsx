'use client';

import { motion } from 'framer-motion';

export default function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading Message - Moved to Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analyzing Your Assessment...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              Claude is generating your personalized roadmap. This may take a few minutes.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              While you wait, our AI is analyzing your responses across 5 strategic pillars to create custom recommendations tailored to your business needs.
            </p>
          </div>
        </motion.div>

        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse h-8 w-48"></div>

          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse max-w-2xl mx-auto"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse max-w-md mx-auto"></div>

          {/* Button Skeletons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Content Card Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="hidden md:flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-6">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Executive Summary Skeleton */}
            <div className="bg-gray-100 dark:bg-slate-700 rounded-xl p-6 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-64 animate-pulse mb-4"></div>

              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6 animate-pulse"></div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
