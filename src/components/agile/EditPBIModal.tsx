'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Plus, CheckCircle2, Circle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { TeamMemberAutocomplete } from '@/components/common/TeamMemberAutocomplete';
import { ActivityLog } from './ActivityLog';
import { CommentsSection } from '@/components/collaboration/CommentsSection';
import { useAuth } from '@/contexts/AuthContext';

interface PBI {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  item_type: string;
  priority: number;
  story_points: number;
  parent_id: string | null;
  status: string;
  assigned_to: string;
}

interface EditPBIModalProps {
  pbiId: string;
  projectId: string;
  onClose: () => void;
  onPBIUpdated: () => void;
  onPBIDeleted?: () => void;
  onAddChild?: (parentId: string) => void;
}

export function EditPBIModal({ pbiId, projectId, onClose, onPBIUpdated, onPBIDeleted, onAddChild }: EditPBIModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [availableEpics, setAvailableEpics] = useState<PBI[]>([]);
  const [availableUserStories, setAvailableUserStories] = useState<PBI[]>([]);
  const [childTasks, setChildTasks] = useState<PBI[]>([]);
  const [showRelatedTasks, setShowRelatedTasks] = useState(false);
  const [formData, setFormData] = useState<Partial<PBI>>({
    title: '',
    description: '',
    acceptance_criteria: '',
    item_type: 'user_story',
    priority: 2,
    story_points: 3,
    parent_id: null,
    status: 'new',
    assigned_to: ''
  });
  const [originalFormData, setOriginalFormData] = useState<Partial<PBI>>(formData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get current user from auth context
  const currentUserId = user?.email || '';
  const currentUserName = user?.user_metadata?.full_name || user?.email || 'Team Member';

  useEffect(() => {
    fetchPBI();
    fetchParentOptions();
    fetchChildTasks();
  }, [pbiId]);

  // Track form changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  const fetchPBI = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pbis/${pbiId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data.pbi);
        setOriginalFormData(data.pbi);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error fetching PBI:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentOptions = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/pbis`);
      if (response.ok) {
        const data = await response.json();
        const epics = data.pbis.filter((pbi: PBI) => pbi.item_type === 'epic' && pbi.id !== pbiId);
        const userStories = data.pbis.filter((pbi: PBI) => pbi.item_type === 'user_story' && pbi.id !== pbiId);
        setAvailableEpics(epics);
        setAvailableUserStories(userStories);
      }
    } catch (error) {
      console.error('Error fetching parent options:', error);
    }
  };

  const fetchChildTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/pbis`);
      if (response.ok) {
        const data = await response.json();
        // Get all tasks that have this PBI as parent
        const tasks = data.pbis.filter((pbi: PBI) => pbi.parent_id === pbiId && pbi.item_type === 'task');
        setChildTasks(tasks);
      }
    } catch (error) {
      console.error('Error fetching child tasks:', error);
    }
  };

  const handleTaskStatusToggle = async (taskId: string, currentStatus: string) => {
    try {
      // Toggle between 'done' and the previous status
      const newStatus = currentStatus === 'done' ? 'in_progress' : 'done';

      const response = await fetch(`/api/pbis/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setChildTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      } else {
        alert('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('An error occurred while updating the task');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      // Convert empty string parent_id to null for database
      const submitData = {
        ...formData,
        parent_id: formData.parent_id || null
      };

      const response = await fetch(`/api/pbis/${pbiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        onPBIUpdated();
        onClose();
      } else {
        alert('Failed to update backlog item');
      }
    } catch (error) {
      console.error('Error updating PBI:', error);
      alert('An error occurred while updating the backlog item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this backlog item? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/pbis/${pbiId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onPBIDeleted?.();
        onClose();
      } else {
        alert('Failed to delete backlog item');
      }
    } catch (error) {
      console.error('Error deleting PBI:', error);
      alert('An error occurred while deleting the backlog item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Backlog Item
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Add Child Item Button */}
          {onAddChild && (formData.item_type === 'epic' || formData.item_type === 'user_story') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Add Child Item
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {formData.item_type === 'epic'
                      ? 'Add a User Story under this Epic'
                      : 'Add a Task under this User Story'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddChild(pbiId);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Add {formData.item_type === 'epic' ? 'User Story' : 'Task'}
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Item Type and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Type *
              </label>
              <select
                required
                value={formData.item_type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({ ...formData, item_type: newType, parent_id: null });
                }}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="epic">Epic</option>
                <option value="user_story">User Story</option>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="spike">Spike (Research)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="new">New</option>
                <option value="approved">Approved</option>
                <option value="committed">Committed</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          {/* Parent Item (for hierarchy) */}
          {formData.item_type === 'user_story' && availableEpics.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Epic (Optional)
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">No parent (standalone user story)</option>
                {availableEpics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.item_type === 'task' && availableUserStories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent User Story (Optional)
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">No parent (standalone task)</option>
                {availableUserStories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acceptance Criteria
            </label>
            <textarea
              value={formData.acceptance_criteria || ''}
              onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Priority, Story Points, and Assigned To Row */}
          <div className={`grid ${formData.item_type === 'user_story' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
                <option value={4}>4 - Critical</option>
              </select>
            </div>

            {/* Story Points - Only for User Stories */}
            {formData.item_type === 'user_story' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story Points
                </label>
                <select
                  value={formData.story_points}
                  onChange={(e) => setFormData({ ...formData, story_points: parseInt(e.target.value) })}
                  className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={13}>13</option>
                  <option value={21}>21</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned To
              </label>
              <TeamMemberAutocomplete
                value={formData.assigned_to || ''}
                onChange={(value) => setFormData({ ...formData, assigned_to: value })}
                placeholder="Team member email"
              />
            </div>
          </div>

          {/* Related Tasks Section - Only show for user stories */}
          {formData.item_type === 'user_story' && childTasks.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowRelatedTasks(!showRelatedTasks)}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Related Tasks ({childTasks.length})</span>
                {showRelatedTasks ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              {showRelatedTasks && (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                  {childTasks.map(task => {
                    const statusIcons = {
                      new: Circle,
                      in_progress: Clock,
                      done: CheckCircle2
                    };
                    const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
                    const statusColors = {
                      new: 'text-gray-400',
                      in_progress: 'text-blue-500',
                      done: 'text-green-500'
                    };
                    const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-gray-400';

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleTaskStatusToggle(task.id, task.status)}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                            title={task.status === 'done' ? 'Mark as in progress' : 'Mark as done'}
                          >
                            <StatusIcon className={`w-5 h-5 ${statusColor} ${task.status !== 'done' ? 'group-hover:text-green-500' : ''}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </p>
                            {task.assigned_to && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {task.assigned_to}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'done'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  {/* Task Summary */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-900 dark:text-blue-100 font-medium">Progress</span>
                      <span className="text-blue-700 dark:text-blue-300">
                        {childTasks.filter(t => t.status === 'done').length} of {childTasks.length} completed
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all"
                        style={{
                          width: `${childTasks.length > 0 ? (childTasks.filter(t => t.status === 'done').length / childTasks.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Activity Log Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity History
            </h3>
            <div className="max-h-96 overflow-y-auto">
              <ActivityLog pbiId={pbiId} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleDelete}
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
        </form>

        {/* Comments Section - Outside of form to avoid nested form error */}
        <div className="p-6 pt-0">
          <CommentsSection
            entityType="pbi"
            entityId={pbiId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>
    </div>
  );
}
