'use client';

import { useState, useEffect, useRef } from 'react';
import { User, ChevronDown } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  last_used_at: string;
}

interface TeamMemberAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function TeamMemberAutocomplete({
  value,
  onChange,
  placeholder = 'Enter email...',
  className = '',
  required = false
}: TeamMemberAutocompleteProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch team members on mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members based on input
  useEffect(() => {
    if (!value) {
      setFilteredMembers(teamMembers);
    } else {
      const filtered = teamMembers.filter(member =>
        member.email.toLowerCase().includes(value.toLowerCase()) ||
        (member.name && member.name.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredMembers(filtered);
    }
  }, [value, teamMembers]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleSelectMember = async (email: string) => {
    onChange(email);
    setShowDropdown(false);

    // Update last_used_at for this team member
    try {
      await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // Refresh the list to update sort order
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    // Add new team member if they typed an email
    if (value && !teamMembers.find(m => m.email === value)) {
      try {
        await fetch('/api/team-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value })
        });
        fetchTeamMembers();
      } catch (error) {
        console.error('Error adding team member:', error);
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        />
      </div>

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
