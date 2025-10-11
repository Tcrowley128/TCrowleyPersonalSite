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
    <section id="accomplishments" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Accomplishments
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Some projects and achievements I&apos;m proud of
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {accomplishments.map((accomplishment, index) => {
            const isLarge = index === 0 || index === 3; // Make first and fourth cards larger
            return (
              <motion.div
                key={accomplishment.id}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`
                  ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
                  bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                  border border-gray-200 hover:border-blue-300 overflow-hidden group
                `}
              >
                {/* Refined header with subtle styling */}
                <div className="bg-gray-50 border-b border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {accomplishment.title}
                      </h3>
                    </div>
                    {accomplishment.link && (
                      <a
                        href={accomplishment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>

                  {/* Subtle project indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      Project #{accomplishment.id}
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {accomplishment.description}
                  </p>

                  {/* Unified tag styling */}
                  <div className="flex flex-wrap gap-2">
                    {accomplishment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent hover:border-blue-200"
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