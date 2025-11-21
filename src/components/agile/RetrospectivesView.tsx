'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Calendar, Users, CheckCircle2, Clock } from 'lucide-react';

interface Retrospective {
  id: string;
  project_id: string;
  sprint_id?: string;
  template_id: string;
  title: string;
  status: string;
  facilitator_name?: string;
  created_at: string;
  completed_at?: string;
  sprint?: {
    name: string;
    sprint_number: number;
  };
}

interface RetrospectivesViewProps {
  projectId: string;
  onNavigateToSprints?: () => void;
}

export function RetrospectivesView({ projectId, onNavigateToSprints }: RetrospectivesViewProps) {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchRetrospectives();
  }, [projectId]);

  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/retro?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();

        // Fetch sprint data for each retro
        const retrosWithSprints = await Promise.all(
          (data || []).map(async (retro: Retrospective) => {
            if (retro.sprint_id) {
              try {
                const sprintResponse = await fetch(`/api/projects/${projectId}/sprints/${retro.sprint_id}`);
                if (sprintResponse.ok) {
                  const sprintData = await sprintResponse.json();
                  return {
                    ...retro,
                    sprint: {
                      name: sprintData.name,
                      sprint_number: sprintData.sprint_number,
                    },
                  };
                }
              } catch (err) {
                console.error('Error fetching sprint:', err);
              }
            }
            return retro;
          })
        );

        setRetrospectives(retrosWithSprints);
      }
    } catch (error) {
      console.error('Error fetching retrospectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateInfo = (templateId: string) => {
    const templates: Record<string, { name: string; icon: string }> = {
      'start-stop-continue': { name: 'Start, Stop, Continue', icon: '🔄' },
      'mad-sad-glad': { name: 'Mad, Sad, Glad', icon: '😊' },
      'four-ls': { name: '4 Ls', icon: '💡' },
      'sailboat': { name: 'Sailboat', icon: '⛵' },
      'went-well-improve': { name: 'Went Well / To Improve', icon: '🎯' },
      'rose-bud-thorn': { name: 'Rose, Bud, Thorn', icon: '🌹' },
      'keep-drop-add': { name: 'Keep, Drop, Add', icon: '📋' },
    };
    return templates[templateId] || { name: templateId, icon: '📝' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredRetros = retrospectives.filter((retro) => {
    if (filter === 'all') return true;
    return retro.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (retrospectives.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Retrospectives Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete a sprint and run a retrospective to start collecting team insights
        </p>
        <button
          onClick={() => onNavigateToSprints?.()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
        >
          View Completed Sprints
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Retrospectives
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredRetros.length} retrospective{filteredRetros.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'in_progress'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Retrospectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRetros.map((retro) => {
          const template = getTemplateInfo(retro.template_id);

          return (
            <div
              key={retro.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-all overflow-hidden group cursor-pointer"
              onClick={() => (window.location.href = `/retro/${retro.id}?return=${encodeURIComponent(`/projects/${projectId}`)}`)}
            >
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{template.icon}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      retro.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {retro.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-white">{retro.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{template.name}</p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {retro.sprint && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Sprint #{retro.sprint.sprint_number}: {retro.sprint.name}
                    </span>
                  </div>
                )}

                {retro.facilitator_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{retro.facilitator_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(retro.created_at)}</span>
                </div>

                {retro.completed_at && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed {formatDate(retro.completed_at)}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-900">
                <button className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors">
                  View Retrospective
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
