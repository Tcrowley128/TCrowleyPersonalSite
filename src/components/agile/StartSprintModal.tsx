'use client';

import { useState } from 'react';
import { X, Calendar, Target, Save, Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface StartSprintModalProps {
  projectId: string;
  selectedPbiIds: string[];
  totalStoryPoints: number;
  onClose: () => void;
  onSprintCreated: () => void;
}

export function StartSprintModal({ projectId, selectedPbiIds, totalStoryPoints, onClose, onSprintCreated }: StartSprintModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks default
    team_capacity_hours: '',
    planned_velocity: totalStoryPoints.toString() // Auto-fill from selected items
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingGoal, setGeneratingGoal] = useState(false);
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSprintGoal = async () => {
    setGeneratingGoal(true);
    setError(null);

    try {
      // Fetch the PBI details for all selected items
      const pbiDetailsPromises = selectedPbiIds.map(id =>
        fetch(`/api/pbis/${id}`).then(res => res.json())
      );
      const pbiDetails = await Promise.all(pbiDetailsPromises);

      // Call AI endpoint to generate sprint goals
      const response = await fetch(`/api/ai/generate-sprint-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          pbis: pbiDetails.map(d => d.pbi),
          totalStoryPoints,
          sprintDuration: Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))
        })
      });

      if (response.ok) {
        const { suggestions } = await response.json();
        setGoalSuggestions(suggestions);
        setShowSuggestions(true);
        // Auto-fill the first suggestion
        if (suggestions.length > 0) {
          setFormData({ ...formData, goal: suggestions[0] });
        }
      } else {
        setError('Failed to generate sprint goal. Please write one manually.');
      }
    } catch (err) {
      console.error('Error generating sprint goal:', err);
      setError('Failed to generate sprint goal. Please write one manually.');
    } finally {
      setGeneratingGoal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the sprint
      const committedPoints = formData.planned_velocity ? parseInt(formData.planned_velocity) : totalStoryPoints;
      const response = await fetch(`/api/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'active',
          team_capacity_hours: formData.team_capacity_hours ? parseFloat(formData.team_capacity_hours) : null,
          planned_velocity: committedPoints,
          committed_story_points: committedPoints
        })
      });

      if (response.ok) {
        const { sprint } = await response.json();

        // Assign selected PBIs to the sprint and set their status to 'new'
        await Promise.all(
          selectedPbiIds.map(pbiId =>
            fetch(`/api/pbis/${pbiId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sprint_id: sprint.id,
                status: 'new' // Set to 'new' so they appear in the "To Do" column
              })
            })
          )
        );

        onSprintCreated();
      } else {
        setError('Failed to create sprint');
      }
    } catch (err) {
      setError('An error occurred while creating the sprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start New Sprint</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your sprint settings and begin tracking work
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Sprint Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sprint Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sprint 1"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sprint Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Target size={16} className="inline mr-1" />
                  Sprint Goal *
                </label>
                <button
                  type="button"
                  onClick={generateSprintGoal}
                  disabled={generatingGoal || selectedPbiIds.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingGoal ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                required
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="What does the team want to achieve in this sprint?"
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />

              {/* AI Suggestions */}
              {showSuggestions && goalSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      AI Suggested Goals (click to use):
                    </p>
                    <button
                      type="button"
                      onClick={generateSprintGoal}
                      disabled={generatingGoal}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                  </div>
                  {goalSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: suggestion })}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        formData.goal === suggestion
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Capacity Planning */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Capacity (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.team_capacity_hours}
                  onChange={(e) => setFormData({ ...formData, team_capacity_hours: e.target.value })}
                  placeholder="e.g., 80"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Planned Velocity (story points)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.planned_velocity}
                  onChange={(e) => setFormData({ ...formData, planned_velocity: e.target.value })}
                  placeholder="e.g., 21"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Start Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
