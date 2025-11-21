'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Plus, Play, Calendar, Settings, Layout, LayoutGrid, AlertTriangle, CheckCircle2, MessageSquare, CalendarPlus } from 'lucide-react';
import { SprintBoard } from './SprintBoard';
import { BacklogView } from './BacklogView';
import { RisksView } from './RisksView';
import { CompletedSprintsView } from './CompletedSprintsView';
import { RetrospectivesView } from './RetrospectivesView';
import { StartSprintModal } from './StartSprintModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { SprintPlanningView } from './SprintPlanningView';
import { AskAIButton } from '../journey/AskAIButton';

interface Sprint {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Project {
  id: string;
  title: string;
}

interface SprintManagementProps {
  projectId: string;
  onAskAI?: (message: string) => void;
  selectedProjectId?: string;
  onProjectChange?: (projectId: string) => void;
  projects?: Project[];
  onOpenInNewTab?: () => void;
}

export function SprintManagement({ projectId, onAskAI, selectedProjectId, onProjectChange, projects, onOpenInNewTab }: SprintManagementProps) {
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartSprintModal, setShowStartSprintModal] = useState<false | { selectedPbiIds: string[], totalStoryPoints: number }>(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [view, setView] = useState<'backlog' | 'sprint' | 'planning' | 'risks' | 'completed' | 'retros'>('backlog');

  useEffect(() => {
    fetchActiveSprint();
  }, [projectId]);

  const fetchActiveSprint = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/sprints?status=active`);
      if (response.ok) {
        const data = await response.json();
        if (data.sprints && data.sprints.length > 0) {
          setActiveSprint(data.sprints[0]);
          setView('sprint'); // Auto-switch to sprint view if there's an active sprint
        } else {
          setActiveSprint(null);
          setView('backlog'); // Show backlog if no active sprint
        }
      }
    } catch (err) {
      console.error('Error fetching active sprint:', err);
      setError('Failed to load sprint data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = (selectedPbiIds: string[], totalStoryPoints: number) => {
    setShowStartSprintModal({ selectedPbiIds, totalStoryPoints });
  };

  const handleSprintCreated = () => {
    setShowStartSprintModal(false);
    fetchActiveSprint(); // Refresh to show the new sprint
  };

  const handleProjectUpdated = () => {
    setShowProjectDetailsModal(false);
    // Optionally refresh project data if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sprint Management Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sprint Management
        </h2>
      </div>

      {/* View Tabs - Streamlined Design */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setView('backlog')}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'backlog'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <LayoutGrid size={18} />
            Product Backlog
          </button>
          <button
            onClick={() => setView('sprint')}
            disabled={!activeSprint}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'sprint'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : activeSprint
                ? 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                : 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <Calendar size={18} />
            Active Sprint
            {activeSprint && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                Live
              </span>
            )}
          </button>
          <button
            onClick={() => setView('planning')}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'planning'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <CalendarPlus size={18} />
            Plan Future Sprint
            {activeSprint && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                New
              </span>
            )}
          </button>
          <button
            onClick={() => setView('risks')}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'risks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <AlertTriangle size={18} />
            Risks
          </button>
          <button
            onClick={() => setView('completed')}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'completed'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <CheckCircle2 size={18} />
            Completed
          </button>
          <button
            onClick={() => setView('retros')}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              view === 'retros'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <MessageSquare size={18} />
            Retros
          </button>
          <button
            onClick={() => setShowProjectDetailsModal(true)}
            className="ml-auto px-4 py-3 font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 flex items-center gap-2 whitespace-nowrap"
            title="Project Settings"
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Backlog View */}
      {view === 'backlog' && (
        <BacklogView
          projectId={projectId}
          activeSprint={activeSprint}
          onStartSprint={handleStartSprint}
          onRefresh={fetchActiveSprint}
        />
      )}

      {/* Sprint Board View */}
      {view === 'sprint' && activeSprint && (
        <SprintBoard projectId={projectId} sprintId={activeSprint.id} />
      )}

      {/* Sprint Planning View */}
      {view === 'planning' && (
        <SprintPlanningView
          projectId={projectId}
          activeSprint={activeSprint}
          onStartSprint={handleStartSprint}
          onRefresh={fetchActiveSprint}
        />
      )}

      {/* Sprint Board Empty State */}
      {view === 'sprint' && !activeSprint && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Sprint
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a sprint from the backlog to begin tracking work
          </p>
          <button
            onClick={() => setView('backlog')}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            Go to Backlog
          </button>
        </div>
      )}

      {/* Risks View */}
      {view === 'risks' && (
        <RisksView projectId={projectId} />
      )}

      {/* Completed Sprints View */}
      {view === 'completed' && (
        <CompletedSprintsView projectId={projectId} />
      )}

      {/* Retrospectives View */}
      {view === 'retros' && (
        <RetrospectivesView
          projectId={projectId}
          onNavigateToSprints={() => setView('completed')}
        />
      )}

      {/* Start Sprint Modal */}
      {showStartSprintModal && (
        <StartSprintModal
          projectId={projectId}
          selectedPbiIds={showStartSprintModal.selectedPbiIds}
          totalStoryPoints={showStartSprintModal.totalStoryPoints}
          onClose={() => setShowStartSprintModal(false)}
          onSprintCreated={handleSprintCreated}
        />
      )}

      {/* Project Details Modal */}
      {showProjectDetailsModal && (
        <ProjectDetailsModal
          projectId={projectId}
          onClose={() => setShowProjectDetailsModal(false)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
}
