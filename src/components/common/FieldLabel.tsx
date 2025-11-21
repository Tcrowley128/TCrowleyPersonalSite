'use client';

import { Info, AlertCircle } from 'lucide-react';

interface FieldLabelProps {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  className?: string;
}

export function FieldLabel({
  label,
  required = false,
  hint,
  htmlFor,
  className = ''
}: FieldLabelProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      >
        <span>{label}</span>
        {required && (
          <span className="text-red-500 dark:text-red-400" title="Required field">
            *
          </span>
        )}
      </label>
      {hint && (
        <div className="flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  show?: boolean;
}

export function FieldError({ error, show = true }: FieldErrorProps) {
  if (!show || !error) return null;

  return (
    <div className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

// Enhanced input classes utility
export const getInputClasses = (
  error?: boolean,
  success?: boolean,
  className?: string
) => {
  const baseClasses = 'w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200';

  const borderClasses = error
    ? 'border-2 border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
    : success
      ? 'border-2 border-green-500 dark:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'
      : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return `${baseClasses} ${borderClasses} ${className || ''}`.trim();
};
