import { useState, useEffect } from 'react';
import { X, Save, Users, Target, Calendar, DollarSign, TrendingUp, AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CommentsSection } from '@/components/collaboration/CommentsSection';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  assessment_id: string;
  title: string;
  description: string | null;
  category: string | null;
  operational_area: string | null;
  status: string;
  priority: string;
  complexity: string;
  progress_percentage: number;
  health_status: string;

  // Timeline
  start_date: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  estimated_timeline_days: number | null;

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

  // Quantitative Metrics
  expected_roi_percentage: number | null;
  expected_cost_savings_cents: number | null;
  expected_time_savings_hours: number | null;
  expected_efficiency_gain_percentage: number | null;
  users_impacted: number | null;
  processes_improved: number | null;

  // Qualitative Metrics
  expected_business_impact: string | null;
  success_criteria: string | null;
  kpis: any;

  // Risk Management
  risk_level: string | null;
  risks: any;
  dependencies: any;
  blockers: any;
  mitigation_strategies: string | null;

  // Change Management
  training_required: boolean;
  training_plan: string | null;
  communication_plan: string | null;
  adoption_rate_percentage: number | null;

  // Documentation & Notes
  documentation_links: any;
  lessons_learned: string | null;
  comments: any;
  comment_count?: number;
  notes: string | null;

  // Metadata
  source_recommendation_id: string | null;
  source_type: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;

  tasks?: any[];
}

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (projectId: string, updates: any) => void;
}

export function ProjectDetailsModal({ project, onClose, onUpdate }: ProjectDetailsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'metrics' | 'risks' | 'notes' | 'comments'>('overview');
  const [formData, setFormData] = useState<Project>(project);
  const [hasChanges, setHasChanges] = useState(false);

  // Get current user from auth context
  const currentUserId = user?.email || '';
  const currentUserName = user?.user_metadata?.full_name || user?.email || 'Team Member';

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleArrayChange = (field: keyof Project, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleChange(field, array);
  };

  const handleSave = () => {
    const updates = Object.keys(formData).reduce((acc, key) => {
      const value = formData[key as keyof Project];
      const originalValue = project[key as keyof Project];

      // Only include changed values that are not undefined
      if (value !== originalValue && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    // Remove metadata fields that shouldn't be updated
    delete updates.tasks;
    delete updates.created_at;
    delete updates.updated_at;

    if (Object.keys(updates).length > 0) {
      console.log('Sending updates:', updates);
      onUpdate(project.id, updates);
      setHasChanges(false);
    }
  };

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const complexityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' }
  ];

  const healthOptions = [
    { value: 'on_track', label: 'On Track' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'off_track', label: 'Off Track' },
    { value: 'completed', label: 'Completed' }
  ];

  const projectSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const riskLevelOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const formatCurrency = (cents: number | null) => {
    if (!cents) return '';
    return (cents / 100).toFixed(2);
  };

  const parseCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.round(num * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-[90vw] max-w-6xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <Target size={16} className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'team'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Team
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'metrics'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'risks'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <AlertTriangle size={16} className="inline mr-2" />
            Risks
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'notes'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Comments
            {(project.comment_count ?? 0) > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                {project.comment_count}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Status & Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {priorityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => handleChange('complexity', e.target.value)}
                    className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {complexityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Health Status
                  </label>
                  <select
                    value={formData.health_status}
                    onChange={(e) => handleChange('health_status', e.target.value)}
                    className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {healthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operational Area
                  </label>
                  <input
                    type="text"
                    value={formData.operational_area || ''}
                    onChange={(e) => handleChange('operational_area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress: {formData.progress_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => handleChange('progress_percentage', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    value={formData.target_completion_date || ''}
                    onChange={(e) => handleChange('target_completion_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Timeline (days)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_timeline_days || ''}
                    onChange={(e) => handleChange('estimated_timeline_days', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Size
                  </label>
                  <select
                    value={formData.project_size || ''}
                    onChange={(e) => handleChange('project_size', e.target.value)}
                    className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select size...</option>
                    {projectSizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Lead
                </label>
                <input
                  type="text"
                  value={formData.project_lead || ''}
                  onChange={(e) => handleChange('project_lead', e.target.value)}
                  placeholder="Name or email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Members
                </label>
                <input
                  type="text"
                  value={formData.team_members?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('team_members', e.target.value)}
                  placeholder="Comma-separated names"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Separate names with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stakeholders
                </label>
                <input
                  type="text"
                  value={formData.stakeholders?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('stakeholders', e.target.value)}
                  placeholder="Comma-separated names"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Separate names with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Executive Sponsor
                </label>
                <input
                  type="text"
                  value={formData.executive_sponsor || ''}
                  onChange={(e) => handleChange('executive_sponsor', e.target.value)}
                  placeholder="Name or email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.team_size || ''}
                    onChange={(e) => handleChange('team_size', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Allocated ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formatCurrency(formData.budget_allocated_cents)}
                    onChange={(e) => handleChange('budget_allocated_cents', parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Spent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formatCurrency(formData.budget_spent_cents)}
                    onChange={(e) => handleChange('budget_spent_cents', parseCurrency(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quantitative Metrics</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_roi_percentage || ''}
                      onChange={(e) => handleChange('expected_roi_percentage', parseFloat(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Cost Savings ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formatCurrency(formData.expected_cost_savings_cents)}
                      onChange={(e) => handleChange('expected_cost_savings_cents', parseCurrency(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Time Savings (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.expected_time_savings_hours || ''}
                      onChange={(e) => handleChange('expected_time_savings_hours', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Efficiency Gain (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_efficiency_gain_percentage || ''}
                      onChange={(e) => handleChange('expected_efficiency_gain_percentage', parseFloat(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Users Impacted
                    </label>
                    <input
                      type="number"
                      value={formData.users_impacted || ''}
                      onChange={(e) => handleChange('users_impacted', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Processes Improved
                    </label>
                    <input
                      type="number"
                      value={formData.processes_improved || ''}
                      onChange={(e) => handleChange('processes_improved', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualitative Metrics</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Business Impact
                    </label>
                    <textarea
                      value={formData.expected_business_impact || ''}
                      onChange={(e) => handleChange('expected_business_impact', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Success Criteria
                    </label>
                    <textarea
                      value={formData.success_criteria || ''}
                      onChange={(e) => handleChange('success_criteria', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Management</h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.training_required || false}
                      onChange={(e) => handleChange('training_required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Training Required
                    </label>
                  </div>

                  {formData.training_required && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Training Plan
                      </label>
                      <textarea
                        value={formData.training_plan || ''}
                        onChange={(e) => handleChange('training_plan', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Communication Plan
                    </label>
                    <textarea
                      value={formData.communication_plan || ''}
                      onChange={(e) => handleChange('communication_plan', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adoption Rate: {formData.adoption_rate_percentage || 0}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.adoption_rate_percentage || 0}
                      onChange={(e) => handleChange('adoption_rate_percentage', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Level
                </label>
                <select
                  value={formData.risk_level || ''}
                  onChange={(e) => handleChange('risk_level', e.target.value)}
                  className="w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Select risk level...</option>
                  {riskLevelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mitigation Strategies
                </label>
                <textarea
                  value={formData.mitigation_strategies || ''}
                  onChange={(e) => handleChange('mitigation_strategies', e.target.value)}
                  rows={4}
                  placeholder="Describe risk mitigation strategies..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={6}
                  placeholder="Add any additional notes about this project..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lessons Learned
                </label>
                <textarea
                  value={formData.lessons_learned || ''}
                  onChange={(e) => handleChange('lessons_learned', e.target.value)}
                  rows={6}
                  placeholder="Document lessons learned during project execution..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Tasks List */}
              {formData.tasks && formData.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    Tasks ({formData.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {formData.tasks.map((task: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <CommentsSection
              entityType="project"
              entityId={project.id}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
