'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, FileText, Target, Calendar, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  operational_area: string;
  complexity: string;
  priority: string;
  status: string;
  estimated_timeline_days: number;
  target_completion_date: string | null;
  start_date: string | null;
  progress_percentage: number;
  health_status: string;

  // Team & Ownership
  project_lead: string | null;
  team_members: string[] | null;
  stakeholders: string[] | null;
  executive_sponsor: string | null;

  // Project Size & Scope
  project_size: string | null;
  estimated_hours: number | null;
  team_size: number | null;
  budget_allocated_cents: number | null;
  budget_spent_cents: number | null;

  // Risk Management
  risk_level: string | null;
  mitigation_strategies: string | null;

  // Success Metrics
  expected_business_impact: string | null;
  success_criteria: string | null;
}

interface ProjectDetailsModalProps {
  projectId: string;
  onClose: () => void;
  onProjectUpdated: () => void;
}

export function ProjectDetailsModal({ projectId, onClose, onProjectUpdated }: ProjectDetailsModalProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        setError('Failed to load project details');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          category: project.category,
          operational_area: project.operational_area,
          complexity: project.complexity,
          priority: project.priority,
          status: project.status,
          estimated_timeline_days: project.estimated_timeline_days,
          target_completion_date: project.target_completion_date,
          start_date: project.start_date,
          progress_percentage: project.progress_percentage,
          health_status: project.health_status,
          project_lead: project.project_lead,
          team_members: project.team_members,
          stakeholders: project.stakeholders,
          executive_sponsor: project.executive_sponsor,
          project_size: project.project_size,
          estimated_hours: project.estimated_hours,
          team_size: project.team_size,
          budget_allocated_cents: project.budget_allocated_cents,
          budget_spent_cents: project.budget_spent_cents,
          risk_level: project.risk_level,
          mitigation_strategies: project.mitigation_strategies,
          expected_business_impact: project.expected_business_impact,
          success_criteria: project.success_criteria
        })
      });

      if (response.ok) {
        onProjectUpdated();
      } else {
        setError('Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('An error occurred while updating the project');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Project, value: any) => {
    if (project) {
      setProject({ ...project, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center shadow-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" />
              Edit Project Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update project information and settings
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={project.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={project.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category and Operational Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={project.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operational Area
                </label>
                <input
                  type="text"
                  value={project.operational_area || ''}
                  onChange={(e) => handleChange('operational_area', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Target size={16} className="inline mr-1" />
                  Status
                </label>
                <select
                  value={project.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={project.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp size={16} className="inline mr-1" />
                Complexity
              </label>
              <select
                value={project.complexity}
                onChange={(e) => handleChange('complexity', e.target.value)}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={project.start_date || ''}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Completion
                </label>
                <input
                  type="date"
                  value={project.target_completion_date || ''}
                  onChange={(e) => handleChange('target_completion_date', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeline (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={project.estimated_timeline_days}
                  onChange={(e) => handleChange('estimated_timeline_days', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Progress and Health */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Activity size={16} className="inline mr-1" />
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={project.progress_percentage}
                  onChange={(e) => handleChange('progress_percentage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CheckCircle2 size={16} className="inline mr-1" />
                  Health Status
                </label>
                <select
                  value={project.health_status}
                  onChange={(e) => handleChange('health_status', e.target.value)}
                  className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="on_track">On Track</option>
                  <option value="at_risk">At Risk</option>
                  <option value="off_track">Off Track</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* Team & Ownership Section */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="text-blue-600" />
                Team & Ownership
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Lead
                    </label>
                    <input
                      type="text"
                      value={project.project_lead || ''}
                      onChange={(e) => handleChange('project_lead', e.target.value)}
                      placeholder="Enter project lead name"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Executive Sponsor
                    </label>
                    <input
                      type="text"
                      value={project.executive_sponsor || ''}
                      onChange={(e) => handleChange('executive_sponsor', e.target.value)}
                      placeholder="Enter sponsor name"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Members (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={project.team_members?.join(', ') || ''}
                    onChange={(e) => handleChange('team_members', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
                    placeholder="John Doe, Jane Smith, etc."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stakeholders (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={project.stakeholders?.join(', ') || ''}
                    onChange={(e) => handleChange('stakeholders', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="Finance Team, Marketing, etc."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Project Size & Scope Section */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="text-blue-600" />
                Project Size & Scope
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Size
                    </label>
                    <select
                      value={project.project_size || ''}
                      onChange={(e) => handleChange('project_size', e.target.value)}
                      className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select size</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra_large">Extra Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={project.team_size || ''}
                      onChange={(e) => handleChange('team_size', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Number of people"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={project.estimated_hours || ''}
                      onChange={(e) => handleChange('estimated_hours', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Total hours"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" />
                Budget
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Allocated ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={project.budget_allocated_cents ? (project.budget_allocated_cents / 100).toFixed(2) : ''}
                    onChange={(e) => handleChange('budget_allocated_cents', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Spent ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={project.budget_spent_cents ? (project.budget_spent_cents / 100).toFixed(2) : ''}
                    onChange={(e) => handleChange('budget_spent_cents', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Risk Management Section */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-blue-600" />
                Risk Management
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={project.risk_level || ''}
                    onChange={(e) => handleChange('risk_level', e.target.value)}
                    className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Select risk level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mitigation Strategies
                  </label>
                  <textarea
                    value={project.mitigation_strategies || ''}
                    onChange={(e) => handleChange('mitigation_strategies', e.target.value)}
                    rows={3}
                    placeholder="Describe risk mitigation strategies..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Success Metrics Section */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" />
                Success Metrics
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Business Impact
                  </label>
                  <textarea
                    value={project.expected_business_impact || ''}
                    onChange={(e) => handleChange('expected_business_impact', e.target.value)}
                    rows={3}
                    placeholder="Describe the expected business impact..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Success Criteria
                  </label>
                  <textarea
                    value={project.success_criteria || ''}
                    onChange={(e) => handleChange('success_criteria', e.target.value)}
                    rows={3}
                    placeholder="Define success criteria..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
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
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
