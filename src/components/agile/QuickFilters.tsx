'use client';

import { User, Filter, X, Zap, Bug, FileText, AlertCircle } from 'lucide-react';

interface Filters {
  assignedTo: string;
  status: string;
  itemType: string;
  blocked: boolean;
  myItems: boolean;
}

interface QuickFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function QuickFilters({ filters, onFilterChange }: QuickFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  const quickFilterButtons = [
    {
      label: 'My Items',
      icon: User,
      active: filters.myItems,
      onClick: () => onFilterChange({ ...filters, myItems: !filters.myItems })
    },
    {
      label: 'Blocked',
      icon: AlertCircle,
      active: filters.blocked,
      onClick: () => onFilterChange({ ...filters, blocked: !filters.blocked })
    },
    {
      label: 'Stories',
      icon: Zap,
      active: filters.itemType === 'user_story',
      onClick: () => onFilterChange({
        ...filters,
        itemType: filters.itemType === 'user_story' ? '' : 'user_story'
      })
    },
    {
      label: 'Bugs',
      icon: Bug,
      active: filters.itemType === 'bug',
      onClick: () => onFilterChange({
        ...filters,
        itemType: filters.itemType === 'bug' ? '' : 'bug'
      })
    },
    {
      label: 'Tasks',
      icon: FileText,
      active: filters.itemType === 'task',
      onClick: () => onFilterChange({
        ...filters,
        itemType: filters.itemType === 'task' ? '' : 'task'
      })
    }
  ];

  const clearAllFilters = () => {
    onFilterChange({
      assignedTo: '',
      status: '',
      itemType: '',
      blocked: false,
      myItems: false
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {quickFilterButtons.map((filter) => {
          const FilterIcon = filter.icon;
          return (
            <button
              key={filter.label}
              onClick={filter.onClick}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter.active
                  ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-md'
                  : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
              }`}
            >
              <FilterIcon size={16} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters (Optional) */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full px-3 pr-10 py-1.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="approved">Approved</option>
              <option value="committed">Committed</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              value={filters.assignedTo}
              onChange={(e) => onFilterChange({ ...filters, assignedTo: e.target.value })}
              placeholder="Enter name..."
              className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Item Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Type
            </label>
            <select
              value={filters.itemType}
              onChange={(e) => onFilterChange({ ...filters, itemType: e.target.value })}
              className="w-full px-3 pr-10 py-1.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="user_story">User Story</option>
              <option value="bug">Bug</option>
              <option value="task">Task</option>
              <option value="spike">Spike</option>
              <option value="epic">Epic</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
