'use client';

import { useState } from 'react';
import { MoreVertical, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  complexity: string;
  progress_percentage: number;
  estimated_timeline_days: number;
  target_completion_date: string | null;
}

interface ProjectCardProps {
  project: Project;
  onStatusChange: (newStatus: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  data: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  automation: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ai: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  ux: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  people: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-gray-600 dark:text-gray-400'
};

export function ProjectCard({ project, onStatusChange }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const categoryColor = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.other;
  const priorityColor = PRIORITY_COLORS[project.priority] || PRIORITY_COLORS.medium;

  return (
    <Link href={`/assessment/journey/project/${project.id}`}>
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer group">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
              {project.title}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColor} font-medium`}>
              {project.category}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {project.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className={priorityColor} />
            <span className={`${priorityColor} font-medium capitalize`}>
              {project.priority}
            </span>
          </div>

          {project.target_completion_date && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>{new Date(project.target_completion_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Complexity Badge */}
        <div className="mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {project.complexity} complexity
          </span>
        </div>
      </div>
    </Link>
  );
}
