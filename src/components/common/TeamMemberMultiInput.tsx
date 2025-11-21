'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { User, X, ChevronDown } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  last_used_at: string;
}

interface TeamMemberMultiInputProps {
  value: string[]; // Array of emails
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  maxMembers?: number;
}

export function TeamMemberMultiInput({
  value = [],
  onChange,
  placeholder = 'Enter emails (comma-separated or one at a time)...',
  className = '',
  required = false,
  maxMembers
}: TeamMemberMultiInputProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch team members on mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members based on input and already selected members
  useEffect(() => {
    if (!inputValue) {
      setFilteredMembers(teamMembers.filter(m => !value.includes(m.email)));
    } else {
      const filtered = teamMembers.filter(member =>
        !value.includes(member.email) &&
        (member.email.toLowerCase().includes(inputValue.toLowerCase()) ||
        (member.name && member.name.toLowerCase().includes(inputValue.toLowerCase())))
      );
      setFilteredMembers(filtered);
    }
  }, [inputValue, teamMembers, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team-members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
        setFilteredMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addMember = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    // Check if already added
    if (value.includes(trimmedEmail)) {
      return;
    }

    // Check max members limit
    if (maxMembers && value.length >= maxMembers) {
      return;
    }

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return;
    }

    // Add to list
    onChange([...value, trimmedEmail]);

    // Update last_used_at for this team member
    try {
      await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });
      // Refresh the list to update sort order
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
    }

    setInputValue('');
  };

  const removeMember = (emailToRemove: string) => {
    onChange(value.filter(email => email !== emailToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Check for comma-separated input
    if (newValue.includes(',')) {
      const emails = newValue.split(',').map(e => e.trim()).filter(e => e);
      emails.forEach(email => {
        if (isValidEmail(email)) {
          addMember(email);
        }
      });
      setInputValue('');
    } else {
      setInputValue(newValue);
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addMember(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last member when backspace is pressed on empty input
      removeMember(value[value.length - 1]);
    }
  };

  const handleSelectMember = async (email: string) => {
    addMember(email);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = async () => {
    // Add member if they typed an email
    if (inputValue.trim() && isValidEmail(inputValue.trim())) {
      addMember(inputValue);
    } else {
      setInputValue('');
    }
  };

  return (
    <div className="relative">
      {/* Selected members as chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((email) => {
          const member = teamMembers.find(m => m.email === email);
          return (
            <div
              key={email}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
            >
              <User className="w-3 h-3" />
              <span className="max-w-[200px] truncate">
                {member?.name || email}
              </span>
              <button
                type="button"
                onClick={() => removeMember(email)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Input field */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : 'Add another...'}
          required={required && value.length === 0}
          disabled={maxMembers !== undefined && value.length >= maxMembers}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        <button
          type="button"
          onClick={() => {
            setShowDropdown(!showDropdown);
            inputRef.current?.focus();
          }}
          disabled={maxMembers !== undefined && value.length >= maxMembers}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Show team members"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Enter emails one at a time or paste comma-separated list
        {maxMembers && ` (max ${maxMembers})`}
      </p>

      {/* Dropdown */}
      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No team members found
            </div>
          ) : (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handleSelectMember(member.email);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.email}
                  </div>
                  {member.name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {member.name}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
