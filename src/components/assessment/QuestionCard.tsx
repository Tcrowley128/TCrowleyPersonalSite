'use client';

import { motion } from 'framer-motion';
import { Question } from '@/lib/assessment/questions';
import { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import SearchableMultiSelect from './SearchableMultiSelect';

interface QuestionCardProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  allAnswers?: Record<string, any>; // For conditional rendering based on other answers
}

export default function QuestionCard({ question, value, onChange, allAnswers }: QuestionCardProps) {
  // Check if this question is answered
  const isAnswered = () => {
    if (question.type === 'multi-select' || question.type === 'ranking') {
      return Array.isArray(value) && value.length > 0;
    }
    if (question.type === 'slider') {
      return value !== undefined && value !== null;
    }
    return value !== undefined && value !== '' && value !== null;
  };

  const answered = isAnswered();
  const showValidation = question.required;
  const [sliderValue, setSliderValue] = useState(value || question.min || 1);

  // Initialize slider value on mount if not already set
  useEffect(() => {
    if (question.type === 'slider' && !value) {
      const initialValue = question.min || 1;
      setSliderValue(initialValue);
      onChange(initialValue);
    }
  }, [question.type, question.min, value, onChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  const handleMultiSelectChange = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(newValues);
  };

  // Helper function to inject tooltips into text
  const renderTextWithTooltips = (text: string) => {
    if (!question.tooltips || question.tooltips.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let remainingText = text;
    let keyCounter = 0;

    // Sort tooltips by term length (longest first) to handle overlapping terms correctly
    const sortedTooltips = [...question.tooltips].sort((a, b) => b.term.length - a.term.length);

    for (const tooltip of sortedTooltips) {
      const regex = new RegExp(`(${tooltip.term})`, 'gi');
      const matches = Array.from(remainingText.matchAll(regex));

      if (matches.length > 0) {
        let lastIndex = 0;
        const newParts: React.ReactNode[] = [];

        matches.forEach((match) => {
          const matchIndex = match.index!;
          // Add text before the match
          if (matchIndex > lastIndex) {
            newParts.push(remainingText.substring(lastIndex, matchIndex));
          }
          // Add tooltip component
          newParts.push(
            <Tooltip
              key={`tooltip-${keyCounter++}`}
              term={match[0]}
              content={tooltip.explanation}
            />
          );
          lastIndex = matchIndex + match[0].length;
        });

        // Add remaining text after last match
        if (lastIndex < remainingText.length) {
          newParts.push(remainingText.substring(lastIndex));
        }

        // Replace remaining text with processed parts
        if (parts.length === 0) {
          parts.push(...newParts);
        } else {
          // If we already have parts, we need to process each string part
          const updatedParts: React.ReactNode[] = [];
          for (const part of parts) {
            if (typeof part === 'string') {
              // Process this string part
              const partText = part;
              let partLastIndex = 0;
              const partMatches = Array.from(partText.matchAll(regex));

              partMatches.forEach((match) => {
                const matchIndex = match.index!;
                if (matchIndex > partLastIndex) {
                  updatedParts.push(partText.substring(partLastIndex, matchIndex));
                }
                updatedParts.push(
                  <Tooltip
                    key={`tooltip-${keyCounter++}`}
                    term={match[0]}
                    content={tooltip.explanation}
                  />
                );
                partLastIndex = matchIndex + match[0].length;
              });

              if (partLastIndex < partText.length) {
                updatedParts.push(partText.substring(partLastIndex));
              }

              if (partMatches.length === 0) {
                updatedParts.push(part);
              }
            } else {
              updatedParts.push(part);
            }
          }
          parts.length = 0;
          parts.push(...updatedParts);
        }

        remainingText = '';
        break; // Process one tooltip at a time
      }
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 transition-colors ${
        showValidation && answered
          ? 'border-green-500 dark:border-green-600'
          : 'border-gray-200 dark:border-slate-700'
      }`}
      role="group"
      aria-labelledby={`question-${question.key}`}
    >
      {/* Question Text with Completion Indicator */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 id={`question-${question.key}`} className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
          {renderTextWithTooltips(question.question)}
          {question.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </h3>
        {showValidation && answered && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full p-1"
            title="Question answered"
          >
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Description */}
      {question.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {renderTextWithTooltips(question.description)}
        </p>
      )}

      {/* Question Type Rendering */}
      <div className="mt-4">
        {/* Single Select */}
        {question.type === 'single-select' && (
          <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${question.key}`}>
            {question.options?.map((option, index) => (
              <label
                key={option.value}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                  value === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(option.value);
                  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % (question.options?.length || 1);
                    const nextValue = question.options?.[nextIndex]?.value;
                    if (nextValue) onChange(nextValue);
                  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = index === 0 ? (question.options?.length || 1) - 1 : index - 1;
                    const prevValue = question.options?.[prevIndex]?.value;
                    if (prevValue) onChange(prevValue);
                  }
                }}
              >
                <input
                  type="radio"
                  name={question.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  aria-describedby={option.description ? `${question.key}-${option.value}-desc` : undefined}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {option.description && (
                    <p id={`${question.key}-${option.value}-desc`} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Multi Select */}
        {question.type === 'multi-select' && (() => {
          // Filter options based on conditions (e.g., industry filtering)
          const filteredOptions = question.options?.filter((option) => {
            // Filter operational areas based on selected industry
            if (question.key === 'operational_areas' && allAnswers?.industry) {
              const selectedIndustry = allAnswers.industry;
              // Show industry-specific options OR generic options (those without industry field)
              return !option.industry || option.industry === selectedIndustry;
            }
            return true;
          }) || [];

          // Use searchable dropdown if 5+ options, otherwise use regular checkboxes
          const useSearchable = filteredOptions.length >= 5;

          if (useSearchable) {
            return (
              <SearchableMultiSelect
                options={filteredOptions}
                value={Array.isArray(value) ? value : []}
                onChange={onChange}
                placeholder="Select options..."
                searchPlaceholder="Search options..."
              />
            );
          }

          // Regular checkbox list for fewer options
          return (
            <div className="space-y-3">
              {filteredOptions.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleMultiSelectChange(option.value)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          );
        })()}

        {/* Slider */}
        {question.type === 'slider' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {question.minLabel}
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sliderValue}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {question.maxLabel}
              </span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  ((sliderValue - (question.min || 1)) / ((question.max || 5) - (question.min || 1))) * 100
                }%, #e5e7eb ${
                  ((sliderValue - (question.min || 1)) / ((question.max || 5) - (question.min || 1))) * 100
                }%, #e5e7eb 100%)`
              }}
            />
          </div>
        )}

        {/* Text Input */}
        {question.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        )}

        {/* Email Input */}
        {question.type === 'email' && (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        )}

        {/* Textarea */}
        {question.type === 'textarea' && (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-y"
          />
        )}

        {/* Ranking */}
        {question.type === 'ranking' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select up to {question.maxSelection} items (in order of priority)
            </p>
            <div className="space-y-3">
              {question.options?.map((option, index) => {
                const selectedIndex = Array.isArray(value) ? value.indexOf(option.value) : -1;
                const isSelected = selectedIndex !== -1;

                return (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? [...value] : [];
                        if (e.target.checked) {
                          if (currentValues.length < (question.maxSelection || 3)) {
                            onChange([...currentValues, option.value]);
                          }
                        } else {
                          onChange(currentValues.filter(v => v !== option.value));
                        }
                      }}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    {isSelected && (
                      <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                        {selectedIndex + 1}
                      </span>
                    )}
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
