'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date';
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
  rows?: number;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  hint,
  error,
  className = '',
  rows = 3,
  options = [],
  min,
  max,
  step,
  disabled = false
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  // Determine if field is filled
  const isFilled = value !== '' && value !== null && value !== undefined;

  // Determine if field is valid
  const isValid = !required || (required && isFilled);

  // Show error state
  const showError = touched && !focused && (error || (required && !isFilled));

  // Show success state
  const showSuccess = touched && isValid && isFilled && !error;

  const handleBlur = () => {
    setTouched(true);
    setFocused(false);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const baseInputClasses = `
    w-full px-4 py-2 rounded-lg
    bg-white dark:bg-slate-900
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${showError
      ? 'border-2 border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : showSuccess
        ? 'border-2 border-green-500 dark:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'
        : focused
          ? 'border-2 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
          : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      <label
        htmlFor={name}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{label}</span>
        {required && (
          <span className="text-red-500 dark:text-red-400" title="Required field">
            *
          </span>
        )}
        {showSuccess && (
          <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
        )}
      </label>

      {/* Input Field */}
      <div className="relative">
        {renderInput()}

        {/* Status Icon */}
        {(showError || showSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {showError && (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
            {showSuccess && (
              <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
            )}
          </div>
        )}
      </div>

      {/* Hint or Error Message */}
      {showError && error ? (
        <div className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : showError && required && !isFilled ? (
        <div className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>This field is required</span>
        </div>
      ) : hint ? (
        <div className="flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  );
}
