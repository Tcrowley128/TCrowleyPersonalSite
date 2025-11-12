'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink, Award } from 'lucide-react';
import { accomplishments } from '@/data/accomplishments';

export default function Accomplishments() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="accomplishments" className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Accomplishments
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Some projects and achievements I&apos;m proud of
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-6 md:grid-cols-2 gap-8">
          {accomplishments.map((accomplishment, index) => {
            // First 2 cards (Assessment Tool & Journey Platform) = 3 cols each (half width)
            // Cards 3 & 4 = 3 cols each (half width)
            // Cards 5+ = 2 cols each (third width)
            let colSpan = 'lg:col-span-2'; // Default 3 columns (1/3 width)
            if (index <= 1) {
              colSpan = 'lg:col-span-3'; // First two cards take half width
            } else if (index === 2 || index === 3) {
              colSpan = 'lg:col-span-3'; // Cards 3 & 4 take half width
            }

            return (
              <motion.div
                key={accomplishment.id}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${colSpan} bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 overflow-hidden group flex flex-col`}
              >
                {/* Refined header with subtle styling */}
                <div className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-gray-600 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {accomplishment.title}
                      </h3>
                    </div>
                    {accomplishment.link && (
                      <a
                        href={accomplishment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>

                  {/* Subtle project indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-full">
                      Project #{accomplishment.id}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-1">
                    {accomplishment.description}
                  </p>

                  {/* Unified tag styling */}
                  <div className="flex flex-wrap gap-2">
                    {accomplishment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent hover:border-blue-300 dark:hover:border-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subtle bottom accent */}
                <div className="h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}