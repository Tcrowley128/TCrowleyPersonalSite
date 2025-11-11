'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Calendar, TrendingUp, AlertCircle, ChevronDown, ChevronRight, Zap, Bug, FileText, Lightbulb, Layout, MessageSquare, Plus, Sparkles, Brain, RefreshCw } from 'lucide-react';

interface PBI {
  id: string;
  title: string;
  item_type: string;
  story_points: number;
  status: string;
  sprint_id: string;
  assigned_to: string;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  status: string;
  committed_story_points: number;
  completed_story_points: number;
  scope_creep_story_points?: number;
  actual_completed?: number;
  actual_committed?: number;
  pbis?: PBI[];
  retrospectives?: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
}

interface CompletedSprintsViewProps {
  projectId: string;
}

export function CompletedSprintsView({ projectId }: CompletedSprintsViewProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [selectedSprintForRetro, setSelectedSprintForRetro] = useState<Sprint | null>(null);

  useEffect(() => {
    fetchCompletedSprints();
  }, [projectId]);

  const fetchCompletedSprints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/sprints?status=completed`);
      if (response.ok) {
        const data = await response.json();
        const sprintsData = data.sprints || [];

        // Fetch PBIs and retrospectives for each sprint
        const sprintsWithActuals = await Promise.all(
          sprintsData.map(async (sprint: Sprint) => {
            try {
              const [pbisResponse, retrosResponse] = await Promise.all([
                fetch(`/api/projects/${projectId}/pbis?sprint_id=${sprint.id}`),
                fetch(`/api/retro?projectId=${projectId}`)
              ]);

              let pbis: PBI[] = [];
              if (pbisResponse.ok) {
                const pbisData = await pbisResponse.json();
                pbis = pbisData.pbis || [];
              }

              let retrospectives: any[] = [];
              if (retrosResponse.ok) {
                const retrosData = await retrosResponse.json();
                retrospectives = (retrosData || []).filter((r: any) => r.sprint_id === sprint.id);
              }

              // Calculate actual committed (all PBIs in sprint)
              const actual_committed = pbis.reduce((sum, pbi) => sum + (pbi.story_points || 0), 0);

              // Calculate actual completed (only done PBIs)
              const actual_completed = pbis
                .filter(pbi => pbi.status === 'done')
                .reduce((sum, pbi) => sum + (pbi.story_points || 0), 0);

              return {
                ...sprint,
                actual_committed,
                actual_completed,
                pbis: pbis.filter(pbi => pbi.status === 'done'), // Only store completed items
                retrospectives
              };
            } catch (err) {
              console.error(`Error fetching data for sprint ${sprint.id}:`, err);
            }
            return sprint;
          })
        );

        setSprints(sprintsWithActuals);
      }
    } catch (error) {
      console.error('Error fetching completed sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateVelocity = (sprint: Sprint) => {
    // Use actual_completed if available, fallback to database value
    return sprint.actual_completed ?? sprint.completed_story_points;
  };

  const calculateCompletionRate = (sprint: Sprint) => {
    // Use actual values if available, fallback to database values
    const committed = sprint.actual_committed ?? sprint.committed_story_points;
    const completed = sprint.actual_completed ?? sprint.completed_story_points;

    if (committed === 0) return 0;
    return Math.round((completed / committed) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Completed Sprints Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your first sprint to see it here with metrics and insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sprints</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{sprints.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Velocity</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(sprints.reduce((sum, s) => sum + calculateVelocity(s), 0) / sprints.length)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Completion</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(sprints.reduce((sum, s) => sum + calculateCompletionRate(s), 0) / sprints.length)}%
          </div>
        </div>
      </div>

      {/* Sprint List */}
      <div className="space-y-3">
        {sprints.map(sprint => {
          const isExpanded = expandedSprint === sprint.id;
          const completionRate = calculateCompletionRate(sprint);
          const velocity = calculateVelocity(sprint);

          return (
            <div
              key={sprint.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Sprint Header */}
              <button
                onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {sprint.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sprint #{sprint.sprint_number} • {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Velocity Badge */}
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{velocity}</div>
                    </div>

                    {/* Completion Rate Badge */}
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion</div>
                      <div className={`text-lg font-bold ${
                        completionRate >= 90 ? 'text-green-600 dark:text-green-400' :
                        completionRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {completionRate}%
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Completed
                    </span>

                    {/* Retrospective Button */}
                    {sprint.retrospectives && sprint.retrospectives.length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/retro/${sprint.retrospectives![0].id}`;
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <MessageSquare size={14} />
                        View Retro
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSprintForRetro(sprint);
                          setShowRetroModal(true);
                        }}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <Plus size={14} />
                        Run Retro
                      </button>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-900">
                  <div className="space-y-4">
                    {/* Sprint Goal */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sprint Goal</h4>
                      <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded p-3 border border-gray-200 dark:border-gray-700">
                        {sprint.goal || 'No goal set'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Metrics */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Story Points</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Committed:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {sprint.actual_committed ?? sprint.committed_story_points}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {sprint.actual_completed ?? sprint.completed_story_points}
                            </span>
                          </div>
                          {sprint.scope_creep_story_points !== undefined && sprint.scope_creep_story_points > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Scope Creep:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">{sprint.scope_creep_story_points}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Completion Rate</h4>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className={`h-full rounded-full transition-all ${
                                completionRate >= 90 ? 'bg-green-500' :
                                completionRate >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(completionRate, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {sprint.actual_completed ?? sprint.completed_story_points} of {sprint.actual_committed ?? sprint.committed_story_points} points completed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Retrospectives */}
                    {sprint.retrospectives && sprint.retrospectives.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Retrospectives ({sprint.retrospectives.length})
                        </h4>
                        <div className="space-y-2">
                          {sprint.retrospectives.map((retro) => (
                            <div
                              key={retro.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {retro.title}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(retro.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    retro.status === 'completed'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {retro.status === 'completed' ? 'Completed' : 'In Progress'}
                                </span>
                                <button
                                  onClick={() => (window.location.href = `/retro/${retro.id}`)}
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Items */}
                    {sprint.pbis && sprint.pbis.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Completed Items ({sprint.pbis.length})</h4>
                        <div className="space-y-2">
                          {sprint.pbis.map(pbi => {
                            const typeConfig = {
                              user_story: { icon: Zap, color: 'blue', label: 'Story' },
                              bug: { icon: Bug, color: 'red', label: 'Bug' },
                              task: { icon: FileText, color: 'gray', label: 'Task' },
                              spike: { icon: Lightbulb, color: 'yellow', label: 'Spike' },
                              epic: { icon: Layout, color: 'purple', label: 'Epic' }
                            };
                            const config = typeConfig[pbi.item_type as keyof typeof typeConfig] || typeConfig.task;
                            const TypeIcon = config.icon;

                            return (
                              <div key={pbi.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">
                                <TypeIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400 flex-shrink-0`} />
                                <span className="flex-1 text-sm text-gray-900 dark:text-white">{pbi.title}</span>
                                {pbi.assigned_to && (
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{pbi.assigned_to}</span>
                                )}
                                {pbi.item_type === 'user_story' && pbi.story_points && (
                                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center justify-center text-xs font-bold">
                                    {pbi.story_points}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Retrospective Modal */}
      {showRetroModal && selectedSprintForRetro && (
        <CreateRetroModal
          projectId={projectId}
          sprint={selectedSprintForRetro}
          onClose={() => {
            setShowRetroModal(false);
            setSelectedSprintForRetro(null);
          }}
          onRetroCreated={(retroId) => {
            setShowRetroModal(false);
            setSelectedSprintForRetro(null);
            window.location.href = `/retro/${retroId}`;
          }}
        />
      )}
    </div>
  );
}

// Create Retro Modal Component
function CreateRetroModal({
  projectId,
  sprint,
  onClose,
  onRetroCreated,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
  onRetroCreated: (retroId: string) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState(`${sprint.name} Retrospective`);
  const [facilitator, setFacilitator] = useState('');
  const [creating, setCreating] = useState(false);
  const [analyzingSprint, setAnalyzingSprint] = useState(false);
  const [sprintAnalysis, setSprintAnalysis] = useState<{
    summary: string;
    recommendedTemplate: string;
    recommendedReason: string;
    suggestedTopics: string[];
    metrics: {
      velocityTrend: string;
      completionRate: string;
      keyInsights: string[];
    };
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const templates = [
    { id: 'start-stop-continue', name: 'Start, Stop, Continue', icon: '🔄', description: 'Classic retrospective format' },
    { id: 'mad-sad-glad', name: 'Mad, Sad, Glad', icon: '😊', description: 'Emotional sentiment analysis' },
    { id: 'four-ls', name: '4 Ls', icon: '💡', description: 'Liked, Learned, Lacked, Longed For' },
    { id: 'sailboat', name: 'Sailboat', icon: '⛵', description: 'Navigate towards your goals' },
    { id: 'went-well-improve', name: 'Went Well / To Improve', icon: '🎯', description: 'Simple two-column format' },
    { id: 'rose-bud-thorn', name: 'Rose, Bud, Thorn', icon: '🌹', description: 'Highlights, opportunities, challenges' },
  ];

  const analyzeSprint = async () => {
    setAnalyzingSprint(true);
    try {
      const response = await fetch(`/api/ai/analyze-sprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: sprint.id,
          projectId
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setSprintAnalysis(analysis);
        setShowAnalysis(true);
        // Auto-select the recommended template
        if (analysis.recommendedTemplate) {
          setSelectedTemplate(analysis.recommendedTemplate);
        }
      } else {
        console.error('Failed to analyze sprint');
      }
    } catch (error) {
      console.error('Error analyzing sprint:', error);
    } finally {
      setAnalyzingSprint(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !title.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/retro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sprintId: sprint.id,
          templateId: selectedTemplate,
          title: title.trim(),
          facilitatorName: facilitator.trim() || 'Anonymous',
        }),
      });

      if (!response.ok) throw new Error('Failed to create retrospective');

      const retro = await response.json();
      onRetroCreated(retro.id);
    } catch (error) {
      console.error('[CreateRetroModal] Error:', error);
      alert('Failed to create retrospective');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Create Sprint Retrospective</h2>
          <p className="text-sm text-purple-100">{sprint.name}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Sprint Analysis Button */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 dark:bg-blue-500 rounded-lg p-2">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Sprint Analysis</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get AI-powered insights to guide your retrospective</p>
                </div>
              </div>
              <button
                type="button"
                onClick={analyzeSprint}
                disabled={analyzingSprint}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {analyzingSprint ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Sprint
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results */}
            {showAnalysis && sprintAnalysis && (
              <div className="mt-4 space-y-4">
                {/* Sprint Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Sprint Performance Summary</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{sprintAnalysis.summary}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.completionRate}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity Trend</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.velocityTrend}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key Insights</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.keyInsights.length}</div>
                  </div>
                </div>

                {/* Recommended Template */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Recommended Template</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{templates.find(t => t.id === sprintAnalysis.recommendedTemplate)?.name}</span>
                        {' - '}
                        {sprintAnalysis.recommendedReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggested Discussion Topics */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Suggested Discussion Topics</h4>
                  <div className="space-y-2">
                    {sprintAnalysis.suggestedTopics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={analyzeSprint}
                  disabled={analyzingSprint}
                  className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-1 py-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate Analysis
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retrospective Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Sprint 1 Retrospective"
            />
          </div>

          {/* Facilitator Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facilitator Name (Optional)
            </label>
            <input
              type="text"
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Your name"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{template.icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {template.name}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end bg-gray-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate || !title.trim() || creating}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Create Retrospective
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
