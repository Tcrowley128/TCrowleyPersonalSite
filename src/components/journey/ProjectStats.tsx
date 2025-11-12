import { TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AskAIButton } from './AskAIButton';

interface Project {
  status: string;
  progress_percentage: number;
}

interface ProjectStatsProps {
  projects: Project[];
  onAskAI?: (message: string) => void;
}

export function ProjectStats({ projects, onAskAI }: ProjectStatsProps) {
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    blocked: projects.filter(p => p.status === 'blocked').length,
    avgProgress: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length)
      : 0
  };

  return (
    <div className="mb-8">
      {onAskAI && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Statistics</h2>
          <AskAIButton
            onClick={() => onAskAI(`Analyze my project statistics: ${stats.total} total projects, ${stats.in_progress} in progress, ${stats.completed} completed, ${stats.blocked} blocked. Average progress: ${stats.avgProgress}%. What insights can you provide?`)}
            label="Analyze Stats"
            size="sm"
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
          </div>
          <TrendingUp className="text-blue-600" size={32} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.in_progress}</p>
          </div>
          <Clock className="text-blue-600" size={32} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
          </div>
          <CheckCircle2 className="text-green-600" size={32} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.blocked}</p>
          </div>
          <AlertCircle className="text-red-600" size={32} />
        </div>
      </div>
      </div>
    </div>
  );
}
