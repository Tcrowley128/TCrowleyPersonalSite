import { useState } from 'react';
import { Calendar, Target, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { AvatarGroup, UserAvatar } from '@/components/common/UserAvatar';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  complexity: string;
  progress_percentage: number;
  estimated_timeline_days: number;
  target_completion_date: string | null;
  tasks?: { count: number }[];
  [key: string]: any;
}

interface ProjectCardProps {
  project: any; // Using any to allow flexible project structure from different sources
  onUpdate: (projectId: string, updates: any) => void;
  onNavigateToSprints?: (projectId: string) => void;
}

export function ProjectCard({ project, onUpdate, onNavigateToSprints }: ProjectCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    not_started: { color: 'gray', icon: Clock, label: 'Not Started' },
    in_progress: { color: 'blue', icon: Clock, label: 'In Progress' },
    completed: { color: 'green', icon: CheckCircle2, label: 'Completed' },
    blocked: { color: 'red', icon: AlertCircle, label: 'Blocked' }
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.not_started;
  const StatusIcon = config.icon;

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Status & Priority */}
        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900 dark:text-${config.color}-300`}>
            <StatusIcon size={14} />
            {config.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority as keyof typeof priorityColors]}`}>
            {project.priority}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{project.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-3">
            {project.estimated_timeline_days && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{project.estimated_timeline_days}d</span>
              </div>
            )}
          </div>
          {/* Team Members */}
          {(project.project_lead || (project.team_members && project.team_members.length > 0)) && (
            <div className="flex items-center gap-2">
              {project.project_lead && !project.team_members?.length && (
                <UserAvatar email={project.project_lead} size="xs" />
              )}
              {project.team_members && project.team_members.length > 0 && (
                <AvatarGroup
                  users={[
                    ...(project.project_lead ? [{ email: project.project_lead }] : []),
                    ...project.team_members.map((email: string) => ({ email }))
                  ]}
                  max={3}
                  size="xs"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <ProjectDetailsModal
          project={project}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
          onNavigateToSprints={onNavigateToSprints ? () => onNavigateToSprints(project.id) : undefined}
        />
      )}
    </>
  );
}
