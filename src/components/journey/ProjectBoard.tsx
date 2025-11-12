import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { AskAIButton } from './AskAIButton';

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
  created_at: string;
  tasks?: { count: number }[];
}

interface ProjectBoardProps {
  projects: Project[];
  onProjectUpdate: (projectId: string, updates: any) => void;
  onRefresh: () => void;
  onAddProject?: () => void;
  onAskAI?: (message: string) => void;
}

export function ProjectBoard({ projects, onProjectUpdate, onRefresh, onAddProject, onAskAI }: ProjectBoardProps) {
  const [filter, setFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = [
    { value: 'not_started', label: 'Not Started', color: 'gray' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'blocked', label: 'Blocked', color: 'red' }
  ];

  // First apply search filter
  const searchFilteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  });

  // Then apply status filter
  const filteredProjects = searchFilteredProjects.filter(p =>
    filter === 'all' || p.status === filter
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 px-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs and Add Project Button */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            All ({searchFilteredProjects.length})
          </button>
          {statuses.map(status => {
            const count = searchFilteredProjects.filter(p => p.status === status.value).length;
            return (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === status.value
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {onAskAI && (
            <AskAIButton
              onClick={() => {
                const statusSummary = statuses.map(s => {
                  const count = searchFilteredProjects.filter(p => p.status === s.value).length;
                  return `${count} ${s.label}`;
                }).join(', ');
                onAskAI(`Help me prioritize and manage my projects. Current status: ${statusSummary}. What should I focus on? Any recommendations for moving projects forward?`);
              }}
              label="Get Recommendations"
              size="sm"
            />
          )}
          {onAddProject && (
            <button
              onClick={onAddProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={20} />
              Add Project
            </button>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No projects found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {searchQuery
              ? `No projects match "${searchQuery}"`
              : 'Click "Add Project" to create your first project'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onProjectUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
