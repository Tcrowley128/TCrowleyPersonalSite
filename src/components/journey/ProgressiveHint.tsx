'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

interface ProgressiveHintProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxShows?: number;
  delay?: number;
}

export default function ProgressiveHint({
  id,
  title,
  description,
  position = 'top',
  maxShows = 3,
  delay = 1000,
}: ProgressiveHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    // Check localStorage for hint status
    const hintKey = `hint-${id}`;
    const hintData = localStorage.getItem(hintKey);

    if (hintData) {
      const { count, dismissed } = JSON.parse(hintData);

      if (dismissed || count >= maxShows) {
        return; // Don't show hint
      }

      setShowCount(count);
    }

    // Show hint after delay
    const timer = setTimeout(() => {
      setIsVisible(true);

      // Update show count in localStorage
      const newCount = showCount + 1;
      localStorage.setItem(hintKey, JSON.stringify({
        count: newCount,
        dismissed: false,
      }));
      setShowCount(newCount);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, maxShows, delay, showCount]);

  const handleDismiss = () => {
    setIsVisible(false);

    // Mark as dismissed in localStorage
    const hintKey = `hint-${id}`;
    localStorage.setItem(hintKey, JSON.stringify({
      count: showCount,
      dismissed: true,
    }));
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${positionClasses[position]} z-50 w-80`}
        >
          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow-2xl p-4 relative">
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 bg-blue-600 dark:bg-blue-500 transform rotate-45 ${
                position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
                'left-[-6px] top-1/2 -translate-y-1/2'
              }`}
            />

            {/* Content */}
            <div className="relative">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{title}</h4>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-blue-50 pl-11">
                {description}
              </p>

              {showCount < maxShows && (
                <div className="flex items-center gap-1 mt-3 pl-11">
                  {Array.from({ length: maxShows }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < showCount ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-blue-100 ml-2">
                    {showCount}/{maxShows} shown
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
