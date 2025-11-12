'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface PBI {
  id: string;
  title: string;
  item_type: string;
}

interface AddPBIModalProps {
  projectId: string;
  onClose: () => void;
  onPBIAdded: () => void;
  parentPbiId?: string | null;
  sprintId?: string | null;
}

export function AddPBIModal({ projectId, onClose, onPBIAdded, parentPbiId = null, sprintId = null }: AddPBIModalProps) {
  const [loading, setLoading] = useState(false);
  const [availableEpics, setAvailableEpics] = useState<PBI[]>([]);
  const [availableUserStories, setAvailableUserStories] = useState<PBI[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptance_criteria: '',
    item_type: 'user_story',
    priority: 2,
    story_points: 3,
    parent_id: parentPbiId || ''
  });

  useEffect(() => {
    fetchPBIs();
  }, [projectId]);

  const fetchPBIs = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/pbis`);
      if (response.ok) {
        const data = await response.json();
        const epics = data.pbis.filter((pbi: PBI) => pbi.item_type === 'epic');
        const userStories = data.pbis.filter((pbi: PBI) => pbi.item_type === 'user_story');
        setAvailableEpics(epics);
        setAvailableUserStories(userStories);

        // If parentPbiId is provided, determine the appropriate item type
        if (parentPbiId) {
          const parent = data.pbis.find((pbi: PBI) => pbi.id === parentPbiId);
          if (parent) {
            const childType = parent.item_type === 'epic' ? 'user_story' : 'task';
            setFormData(prev => ({ ...prev, item_type: childType }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching PBIs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Convert empty strings to null for database (UUID fields don't accept empty strings)
      const submitData: any = {
        ...formData,
        parent_id: formData.parent_id || null,
        status: sprintId ? 'new' : 'backlog'
      };

      // Only add sprint fields if sprint ID is provided
      if (sprintId) {
        submitData.sprint_id = sprintId;
      }

      const response = await fetch(`/api/projects/${projectId}/pbis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        // If adding to sprint and it's a user story, update scope creep
        if (sprintId && formData.item_type === 'user_story' && formData.story_points > 0) {
          const sprintResponse = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`);
          if (sprintResponse.ok) {
            const { sprint } = await sprintResponse.json();
            await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                scope_creep_story_points: (sprint.scope_creep_story_points || 0) + formData.story_points
              })
            });
          }
        }

        onPBIAdded();
        onClose();
      } else {
        alert('Failed to create backlog item');
      }
    } catch (error) {
      console.error('Error creating PBI:', error);
      alert('An error occurred while creating the backlog item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sprintId ? 'Create Item for Sprint' : 'Add Backlog Item'}
            </h2>
            {sprintId && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                This item will be added directly to the sprint (scope creep tracked for user stories)
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              placeholder="e.g., As a user, I want to..."
            />
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Type *
            </label>
            <select
              required
              value={formData.item_type}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData({ ...formData, item_type: newType, parent_id: '' });
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

          {/* Parent Item (for hierarchy) */}
          {formData.item_type === 'user_story' && availableEpics.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Epic (Optional)
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">No parent (standalone user story)</option>
                {availableEpics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Link this user story to an epic to group related work
              </p>
            </div>
          )}

          {formData.item_type === 'task' && availableUserStories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent User Story (Optional)
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">No parent (standalone task)</option>
                {availableUserStories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Link this task to a user story
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="Detailed description of the work to be done..."
            />
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acceptance Criteria
            </label>
            <textarea
              value={formData.acceptance_criteria}
              onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="• Criterion 1&#10;• Criterion 2&#10;• Criterion 3"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use bullet points to define what &quot;done&quot; means for this item
            </p>
          </div>

          {/* Priority and Story Points Row */}
          <div className={`grid ${formData.item_type === 'user_story' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* Priority */}
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
                  <option value={1}>1 - Trivial</option>
                  <option value={2}>2 - Simple</option>
                  <option value={3}>3 - Medium</option>
                  <option value={5}>5 - Complex</option>
                  <option value={8}>8 - Very Complex</option>
                  <option value={13}>13 - Extremely Complex</option>
                  <option value={21}>21 - Epic</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                'Create Backlog Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
