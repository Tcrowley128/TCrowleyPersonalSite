'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressBar({ currentStep, totalSteps, stepTitles }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600"
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start gap-2">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div
              key={stepNumber}
              className="flex flex-col items-center flex-1"
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? '#10b981'
                    : isCurrent
                    ? '#3b82f6'
                    : '#e5e7eb'
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  isCompleted
                    ? 'bg-green-600'
                    : isCurrent
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="text-white" size={20} />
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <span
                className={`text-xs text-center hidden sm:block leading-relaxed px-1 ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: Current Step Info */}
      <div className="sm:hidden text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}: <span className="font-semibold">{stepTitles[currentStep - 1]}</span>
        </p>
      </div>
    </div>
  );
}
