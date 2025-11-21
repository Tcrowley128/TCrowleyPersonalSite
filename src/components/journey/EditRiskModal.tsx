'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { TeamMemberAutocomplete } from '@/components/common/TeamMemberAutocomplete';
import { CommentsSection } from '@/components/collaboration/CommentsSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Risk {
  id: string;
  project_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  likelihood: string;
  probability: number;
  impact: string;
  response_strategy: string;
  response_plan: string;
  mitigation_plan: string;
  owner: string;
  identified_date: string;
  created_at: string;
  updated_at: string;
}

interface EditRiskModalProps {
  riskId: string;
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onRiskUpdated: () => void;
  onRiskDeleted?: () => void;
}

export function EditRiskModal({ riskId, projectId, projectTitle, onClose, onRiskUpdated, onRiskDeleted }: EditRiskModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'identified' as 'identified' | 'assessing' | 'mitigating' | 'resolved',
    likelihood: 'medium' as 'low' | 'medium' | 'high',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'technical' as 'technical' | 'schedule' | 'cost' | 'resource' | 'external' | 'organizational',
    mitigation_plan: '',
    response_strategy: 'accept' as 'avoid' | 'mitigate' | 'transfer' | 'accept',
    owner: ''
  });
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get current user from auth context
  const currentUserId = user?.email || '';
  const currentUserName = user?.user_metadata?.full_name || user?.email || 'Team Member';

  useEffect(() => {
    fetchRisk();
  }, [riskId]);

  // Track form changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/risks/${riskId}`);
      if (response.ok) {
        const data = await response.json();
        const risk = data.risk;

        // Map database values to frontend values
        const impactToSeverity: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
          very_low: 'low',
          low: 'low',
          medium: 'medium',
          high: 'high',
          very_high: 'critical'
        };

        const statusToFrontend: Record<string, 'identified' | 'assessing' | 'mitigating' | 'resolved'> = {
          identified: 'identified',
          analyzed: 'assessing',
          planned: 'mitigating',
          monitored: 'mitigating',
          closed: 'resolved'
        };

        const impactToFrontend: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
          very_low: 'low',
          low: 'low',
          medium: 'medium',
          high: 'high',
          very_high: 'critical'
        };

        const initialData = {
          title: risk.title || '',
          description: risk.description || '',
          severity: impactToSeverity[risk.impact] || 'medium',
          status: statusToFrontend[risk.status] || 'identified',
          likelihood: risk.likelihood || 'medium',
          impact: impactToFrontend[risk.impact] || 'medium',
          category: risk.category || 'technical',
          mitigation_plan: risk.mitigation_plan || '',
          response_strategy: risk.response_strategy || 'accept',
          owner: risk.owner || ''
        };
        setFormData(initialData);
        setOriginalFormData(initialData);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error fetching risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Map frontend values to database values
      const probabilityMap: Record<string, number> = { low: 25, medium: 50, high: 75 };
      const probability = probabilityMap[formData.likelihood] || 50;

      const impactMap: Record<string, string> = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'very_high'
      };
      const dbImpact = impactMap[formData.impact] || 'medium';

      const statusMap: Record<string, string> = {
        identified: 'identified',
        assessing: 'analyzed',
        mitigating: 'planned',
        resolved: 'closed'
      };
      const dbStatus = statusMap[formData.status] || 'identified';

      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: dbStatus,
        likelihood: formData.likelihood,
        probability: probability,
        impact: dbImpact,
        response_strategy: formData.response_strategy,
        response_plan: formData.mitigation_plan,
        mitigation_plan: formData.mitigation_plan,
        owner: formData.owner,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        showToast('Risk updated successfully', 'success');
        onRiskUpdated();
        onClose();
      } else {
        const data = await response.json();
        showToast(`Failed to update risk: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      showToast('An error occurred while updating the risk', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);

    try {
      setDeleting(true);
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Risk deleted successfully', 'success');
        onRiskDeleted?.();
        onClose();
      } else {
        showToast('Failed to delete risk', 'error');
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
      showToast('An error occurred while deleting the risk', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading risk details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Edit Risk
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Project: {projectTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} id="risk-edit-form" className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="Brief description of the risk"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="Detailed description of the risk and its potential impact"
            />
          </div>

          {/* Category and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="technical">Technical</option>
                <option value="schedule">Schedule</option>
                <option value="cost">Cost</option>
                <option value="resource">Resource</option>
                <option value="external">External</option>
                <option value="organizational">Organizational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="identified">Identified</option>
                <option value="assessing">Assessing</option>
                <option value="mitigating">Mitigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Likelihood and Impact Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Likelihood *
              </label>
              <select
                value={formData.likelihood}
                onChange={(e) => setFormData({ ...formData, likelihood: e.target.value as any })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact *
              </label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Response Strategy and Owner Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Strategy *
              </label>
              <select
                value={formData.response_strategy}
                onChange={(e) => setFormData({ ...formData, response_strategy: e.target.value as any })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="avoid">Avoid</option>
                <option value="mitigate">Mitigate</option>
                <option value="transfer">Transfer</option>
                <option value="accept">Accept</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner
              </label>
              <TeamMemberAutocomplete
                value={formData.owner}
                onChange={(value) => setFormData({ ...formData, owner: value })}
                placeholder="Risk owner email"
              />
            </div>
          </div>

          {/* Mitigation Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mitigation Plan / Response Plan
            </label>
            <textarea
              value={formData.mitigation_plan}
              onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="Steps to mitigate or manage this risk"
            />
          </div>
        </form>

        {/* Comments Section - Outside of form to avoid nested form error */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CommentsSection
            entityType="risk"
            entityId={riskId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>

        {/* Actions - At the bottom */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleting || saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="risk-edit-form"
              disabled={saving || deleting || !hasUnsavedChanges}
              className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                hasUnsavedChanges
                  ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Risk"
        message="Are you sure you want to delete this risk? This action cannot be undone."
        confirmLabel="Delete Risk"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
