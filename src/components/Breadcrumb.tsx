'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// Truncate text for mobile display
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 overflow-hidden"
    >
      <Link
        href="/"
        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex-shrink-0"
      >
        <Home size={14} className="sm:mr-1" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex-shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <>
              {/* Mobile: truncated title */}
              <span className="text-gray-900 dark:text-gray-100 font-medium sm:hidden truncate max-w-[180px]">
                {truncateText(item.label, 25)}
              </span>
              {/* Desktop: full title */}
              <span className="text-gray-900 dark:text-gray-100 font-medium hidden sm:inline">
                {item.label}
              </span>
            </>
          )}
        </div>
      ))}
    </motion.nav>
  );
}