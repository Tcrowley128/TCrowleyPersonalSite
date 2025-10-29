'use client';

import { useState } from 'react';
import { Circle, Clock, TrendingUp, CheckCircle2, AlertCircle, Archive } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

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
  created_at: string;
}

interface Column {
  status: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const COLUMNS: Column[] = [
  {
    status: 'not_started',
    title: 'Not Started',
    icon: Circle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600'
  },
  {
    status: 'planning',
    title: 'Planning',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-600'
  },
  {
    status: 'in_progress',
    title: 'In Progress',
    icon: TrendingUp,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-600'
  },
  {
    status: 'blocked',
    title: 'Blocked',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-600'
  },
  {
    status: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-600'
  }
];

interface ProjectBoardProps {
  projects: Project[];
  onProjectUpdate: () => void;
}

export function ProjectBoard({ projects, onProjectUpdate }: ProjectBoardProps) {
  const getProjectsByStatus = (status: string) => {
    return projects.filter(p => p.status === status);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      onProjectUpdate();
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {COLUMNS.map(column => {
        const columnProjects = getProjectsByStatus(column.status);
        const Icon = column.icon;

        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-t-lg px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Icon className={column.color} size={20} />
                <h3 className={`font-semibold ${column.color}`}>
                  {column.title}
                </h3>
              </div>
              <span className={`${column.color} font-bold text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded`}>
                {columnProjects.length}
              </span>
            </div>

            {/* Column Content */}
            <div className={`${column.bgColor} ${column.borderColor} border-2 border-t-0 rounded-b-lg p-4 min-h-[400px] space-y-3 flex-1`}>
              {columnProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No projects
                </div>
              ) : (
                columnProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onStatusChange={(newStatus) => handleStatusChange(project.id, newStatus)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
