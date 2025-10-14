'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Get the total scrollable height
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;

      // Calculate current scroll position
      const scrolled = window.scrollY;

      // Calculate progress percentage
      const progressPercentage = (scrolled / scrollableHeight) * 100;

      setProgress(progressPercentage);
    };

    // Update progress on mount
    updateProgress();

    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', updateProgress, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-gray-200 dark:bg-gray-700">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
