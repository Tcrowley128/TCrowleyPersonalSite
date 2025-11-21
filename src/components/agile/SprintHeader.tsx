'use client';

import { useState } from 'react';
import { Calendar, Target, TrendingUp, Clock, CheckCircle2, Trash2, MoreVertical, Edit2, AlertTriangle, ChevronDown, ChevronUp, Plus, TrendingDown } from 'lucide-react';

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
}

interface SprintHeaderProps {
  sprint: Sprint;
  onComplete?: () => void;
  onDelete?: () => void;
  onUpdate?: (sprintId: string, updates: { name?: string; goal?: string }) => void;
  projectId?: string;
  burndownChart?: React.ReactNode;
  completedStoryPoints?: number;
  onAddItems?: () => void;
}

export function SprintHeader({ sprint, onComplete, onDelete, onUpdate, projectId, burndownChart, completedStoryPoints, onAddItems }: SprintHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState<'name' | 'goal' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [riskData, setRiskData] = useState({
    title: '',
    description: '',
    category: 'technical' as 'technical' | 'schedule' | 'cost' | 'resource' | 'external' | 'organizational',
    probability: 50,
    impact: 'medium' as 'very_low' | 'low' | 'medium' | 'high' | 'very_high',
    response_strategy: 'mitigate' as 'avoid' | 'mitigate' | 'transfer' | 'accept',
    response_plan: '',
    owner: ''
  });

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(sprint.end_date);
  const startDate = new Date(sprint.start_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  const progressPercentage = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

  // Ensure story points are numbers to avoid string concatenation
  const committedPoints = Number(sprint.committed_story_points) || 0;
  const completedPoints = Number(sprint.completed_story_points) || 0;
  const scopeCreepPoints = Number(sprint.scope_creep_story_points) || 0;

  // Calculate completion percentage
  const completionPercentage = committedPoints > 0
    ? Math.round((completedPoints / committedPoints) * 100)
    : 0;

  // Status badge
  const statusConfig = {
    planned: { color: 'gray', label: 'Planned' },
    active: { color: 'blue', label: 'Active' },
    completed: { color: 'green', label: 'Completed' },
    cancelled: { color: 'red', label: 'Cancelled' }
  };

  const config = statusConfig[sprint.status as keyof typeof statusConfig] || statusConfig.planned;

  const handleEdit = (field: 'name' | 'goal') => {
    setEditValue(field === 'name' ? sprint.name : sprint.goal);
    setShowEditModal(field);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!onUpdate || !projectId || !editValue.trim()) return;

    const updates = showEditModal === 'name' ? { name: editValue } : { goal: editValue };

    try {
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        onUpdate(sprint.id, updates);
        setShowEditModal(null);
      }
    } catch (error) {
      console.error('Error updating sprint:', error);
    }
  };

  const handleAddRisk = async () => {
    if (!projectId || !riskData.title.trim()) return;

    // Calculate risk score (Probability x Impact)
    const impactScores = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    const riskScore = (riskData.probability / 100) * impactScores[riskData.impact];

    try {
      const response = await fetch(`/api/projects/${projectId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...riskData,
          sprint_id: sprint.id,
          status: 'identified',
          risk_score: riskScore,
          identified_date: new Date().toISOString()
        })
      });

      if (response.ok) {
        setShowRiskModal(false);
        setRiskData({
          title: '',
          description: '',
          category: 'technical',
          probability: 50,
          impact: 'medium',
          response_strategy: 'mitigate',
          response_plan: '',
          owner: ''
        });
      }
    } catch (error) {
      console.error('Error adding risk:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {sprint.name}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Sprint {sprint.sprint_number}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900 dark:text-${config.color}-200`}>
              {config.label}
            </span>
          </div>
          {sprint.goal && (
            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <Target size={18} className="mt-0.5 flex-shrink-0 text-purple-600" />
              <p className="text-sm font-medium">{sprint.goal}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {sprint.status === 'active' && (
          <div className="flex items-center gap-2">
            {onAddItems && (
              <button
                onClick={onAddItems}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Items
              </button>
            )}
            {(onComplete || onDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Sprint actions"
                >
                  <MoreVertical size={20} />
                </button>

            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-12 z-20 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  {onUpdate && projectId && (
                    <>
                      <button
                        onClick={() => handleEdit('name')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
                        Rename Sprint
                      </button>
                      <button
                        onClick={() => handleEdit('goal')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Target size={16} className="text-purple-600 dark:text-purple-400" />
                        Edit Sprint Goal
                      </button>
                      <button
                        onClick={() => {
                          setShowRiskModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
                        Add Risk
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    </>
                  )}
                  {onComplete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onComplete();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                      Complete Sprint
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      Delete Sprint
                    </button>
                  )}
                </div>
              </>
            )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Metrics Summary (Always Visible) */}
      <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Timeline Summary */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {daysRemaining > 0 ? `${daysRemaining}d left` : 'Ended'}
            </span>
          </div>

          {/* Story Points Summary */}
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {completedPoints}/{committedPoints} pts ({completionPercentage}%)
            </span>
          </div>

          {/* Sprint Progress Summary */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Day {daysElapsed}/{totalDays} ({Math.round(progressPercentage)}%)
            </span>
          </div>

          {/* Burndown Indicator */}
          {burndownChart && (
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Burndown
              </span>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
          title={isMetricsExpanded ? "Hide detailed metrics" : "Show detailed metrics"}
        >
          <span className="hidden sm:inline">Details</span>
          {isMetricsExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Detailed Metrics and Burndown Chart (Expandable) */}
      {isMetricsExpanded && (
        <div className="space-y-4 mb-4">
          {/* Detailed Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timeline */}
            <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Timeline</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Sprint ended'}
                </span>
              </div>
            </div>

            {/* Story Points */}
            <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Story Points</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedPoints} / {committedPoints}
                {scopeCreepPoints > 0 && (
                  <span className="text-sm text-orange-600 dark:text-orange-400 ml-1">
                    (+{scopeCreepPoints})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {completionPercentage}% complete
              </div>
            </div>

            {/* Sprint Progress */}
            <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Sprint Progress</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Day {daysElapsed} of {totalDays}
              </div>
            </div>
          </div>

          {/* Burndown Chart */}
          {burndownChart}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {showEditModal === 'name' ? 'Rename Sprint' : 'Edit Sprint Goal'}
            </h3>

            {showEditModal === 'name' ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white mb-4"
                placeholder="Sprint name"
                autoFocus
              />
            ) : (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white mb-4"
                placeholder="Sprint goal"
                autoFocus
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editValue.trim()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Risk Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Identify Project Risk
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Following PMI Risk Management standards
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Risk Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Event *
                </label>
                <input
                  type="text"
                  value={riskData.title}
                  onChange={(e) => setRiskData({ ...riskData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  placeholder="e.g., Key team member may leave project"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Category *
                </label>
                <select
                  value={riskData.category}
                  onChange={(e) => setRiskData({ ...riskData, category: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="technical">Technical</option>
                  <option value="schedule">Schedule</option>
                  <option value="cost">Cost</option>
                  <option value="resource">Resource</option>
                  <option value="external">External</option>
                  <option value="organizational">Organizational</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Description
                </label>
                <textarea
                  value={riskData.description}
                  onChange={(e) => setRiskData({ ...riskData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  placeholder="Detailed description of the risk and its potential impact"
                />
              </div>

              {/* Probability and Impact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Probability (%) *
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={riskData.probability}
                    onChange={(e) => setRiskData({ ...riskData, probability: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-lg font-bold text-gray-900 dark:text-white">
                    {riskData.probability}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Impact *
                  </label>
                  <select
                    value={riskData.impact}
                    onChange={(e) => setRiskData({ ...riskData, impact: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>

              {/* Response Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Strategy *
                </label>
                <select
                  value={riskData.response_strategy}
                  onChange={(e) => setRiskData({ ...riskData, response_strategy: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="avoid">Avoid - Eliminate the threat</option>
                  <option value="mitigate">Mitigate - Reduce probability or impact</option>
                  <option value="transfer">Transfer - Shift impact to third party</option>
                  <option value="accept">Accept - Acknowledge without action</option>
                </select>
              </div>

              {/* Response Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Plan
                </label>
                <textarea
                  value={riskData.response_plan}
                  onChange={(e) => setRiskData({ ...riskData, response_plan: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  placeholder="Specific actions to implement the response strategy"
                />
              </div>

              {/* Risk Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Owner
                </label>
                <input
                  type="text"
                  value={riskData.owner}
                  onChange={(e) => setRiskData({ ...riskData, owner: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  placeholder="Person responsible for monitoring and responding"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRiskModal(false);
                  setRiskData({
                    title: '',
                    description: '',
                    category: 'technical',
                    probability: 50,
                    impact: 'medium',
                    response_strategy: 'mitigate',
                    response_plan: '',
                    owner: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRisk}
                disabled={!riskData.title.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                Identify Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
