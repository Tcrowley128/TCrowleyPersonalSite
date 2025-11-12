'use client';

import { useState } from 'react';
import { X, Calendar, Target, Play, Loader2, Sparkles } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  planned_velocity: number | null;
}

interface ActivateSprintModalProps {
  projectId: string;
  sprint: Sprint;
  sprintPBIs: any[];
  totalStoryPoints: number;
  onClose: () => void;
  onSprintActivated: () => void;
}

export function ActivateSprintModal({
  projectId,
  sprint,
  sprintPBIs,
  totalStoryPoints,
  onClose,
  onSprintActivated
}: ActivateSprintModalProps) {
  const [formData, setFormData] = useState({
    name: sprint.name,
    goal: sprint.goal || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: sprint.end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    team_capacity_hours: '',
    planned_velocity: sprint.planned_velocity?.toString() || totalStoryPoints.toString()
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
      // Fetch the PBI details for all items in the sprint
      const pbiDetailsPromises = sprintPBIs.map(pbi =>
        fetch(`/api/pbis/${pbi.id}`).then(res => res.json())
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
      // Update the sprint to active status
      const committedPoints = formData.planned_velocity ? parseInt(formData.planned_velocity) : totalStoryPoints;
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: 'PATCH',
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
        // Set all PBIs in this sprint to 'new' status (To Do column)
        await Promise.all(
          sprintPBIs.map(pbi =>
            fetch(`/api/pbis/${pbi.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'new' // Set to 'new' so they appear in the "To Do" column
              })
            })
          )
        );

        onSprintActivated();
      } else {
        setError('Failed to activate sprint');
      }
    } catch (err) {
      setError('An error occurred while activating the sprint');
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activate Sprint</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start "{sprint.name}" and begin tracking work
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sprint 1"
              />
            </div>

            {/* Sprint Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sprint Goal
                </label>
                <button
                  type="button"
                  onClick={generateSprintGoal}
                  disabled={generatingGoal || sprintPBIs.length === 0}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingGoal ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="What is the primary objective of this sprint?"
              />

              {/* AI Suggestions */}
              {showSuggestions && goalSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    AI-Generated Suggestions (click to use):
                  </p>
                  {goalSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: suggestion })}
                      className={`w-full text-left text-sm p-3 rounded-lg border-2 transition-colors ${
                        formData.goal === suggestion
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Capacity and Velocity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Capacity (hours)
                </label>
                <input
                  type="number"
                  value={formData.team_capacity_hours}
                  onChange={(e) => setFormData({ ...formData, team_capacity_hours: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Planned Velocity (story points)
                </label>
                <input
                  type="number"
                  value={formData.planned_velocity}
                  onChange={(e) => setFormData({ ...formData, planned_velocity: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={totalStoryPoints.toString()}
                />
              </div>
            </div>

            {/* Sprint Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Sprint Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Items:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{sprintPBIs.length}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{totalStoryPoints}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Sprint
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
