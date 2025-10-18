'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  term: string;
}

export default function Tooltip({ content, term }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <span className="underline decoration-dotted decoration-blue-500 cursor-help">{term}</span>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        aria-label={`Learn more about ${term}`}
      >
        <HelpCircle size={16} />
      </button>

      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg p-3 shadow-lg">
          <div className="relative">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
