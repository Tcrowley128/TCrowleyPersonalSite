'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
  industry?: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxHeight?: string;
}

export default function SearchableMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  maxHeight = '300px'
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected option labels for display
  const selectedLabels = options
    .filter(opt => value.includes(opt.value))
    .map(opt => opt.label);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Items Display / Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[48px] px-4 py-2 border-2 rounded-lg cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
        } bg-white dark:bg-slate-700`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex flex-wrap gap-2 min-h-[32px] items-center">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => {
                const option = options.find(opt => opt.label === label);
                return (
                  <motion.span
                    key={option?.value || index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-md"
                  >
                    <span>{label}</span>
                    <button
                      onClick={(e) => handleRemoveOption(option!.value, e)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${label}`}
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                );
              })
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedLabels.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear all selections"
              >
                <X size={18} />
              </button>
            )}
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length > 0 ? (
                <div className="p-2">
                  {filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 dark:border-gray-500'
                            }`}
                          >
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleOption(option.value)}
                          className="sr-only"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No options found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer with selection count */}
            {filteredOptions.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 rounded-b-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedLabels.length} selected
                    {searchQuery && ` • ${filteredOptions.length} of ${options.length} shown`}
                  </span>
                  {selectedLabels.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
