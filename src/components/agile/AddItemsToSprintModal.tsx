'use client';

import { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, Zap, Bug, FileText, Lightbulb, Layout, PlusCircle } from 'lucide-react';
import { AddPBIModal } from './AddPBIModal';

interface PBI {
  id: string;
  title: string;
  description: string;
  item_type: string;
  priority: number;
  story_points: number;
  status: string;
  assigned_to: string;
  sprint_id: string | null;
}

interface AddItemsToSprintModalProps {
  projectId: string;
  sprintId: string;
  onClose: () => void;
  onItemsAdded: () => void;
}

export function AddItemsToSprintModal({ projectId, sprintId, onClose, onItemsAdded }: AddItemsToSprintModalProps) {
  const [backlogItems, setBacklogItems] = useState<PBI[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBacklogItems();
  }, [projectId]);

  const fetchBacklogItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/pbis`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only backlog items (not in any sprint)
        const backlogOnly = data.pbis.filter((pbi: PBI) => !pbi.sprint_id);
        setBacklogItems(backlogOnly);
      }
    } catch (error) {
      console.error('Error fetching backlog items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleAddItems = async () => {
    if (selectedItems.size === 0) return;

    try {
      setAdding(true);

      // Calculate scope creep (only user stories count)
      const selectedPbis = backlogItems.filter(pbi => selectedItems.has(pbi.id));
      const scopeCreepPoints = selectedPbis
        .filter(pbi => pbi.item_type === 'user_story')
        .reduce((sum, pbi) => sum + (pbi.story_points || 0), 0);

      // Add items to sprint
      await Promise.all(
        Array.from(selectedItems).map(pbiId =>
          fetch(`/api/pbis/${pbiId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sprint_id: sprintId,
              status: 'new'
            })
          })
        )
      );

      // Update sprint to track scope creep
      if (scopeCreepPoints > 0) {
        const sprintResponse = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`);
        if (sprintResponse.ok) {
          const { sprint } = await sprintResponse.json();

          await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scope_creep_story_points: (sprint.scope_creep_story_points || 0) + scopeCreepPoints
            })
          });
        }
      }

      onItemsAdded();
    } catch (error) {
      console.error('Error adding items to sprint:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleNewItemCreated = async () => {
    setShowCreateModal(false);
    // Refresh backlog items to show the newly created item
    await fetchBacklogItems();
  };

  const typeConfig = {
    user_story: { icon: Zap, color: 'blue', label: 'Story' },
    bug: { icon: Bug, color: 'red', label: 'Bug' },
    task: { icon: FileText, color: 'gray', label: 'Task' },
    spike: { icon: Lightbulb, color: 'yellow', label: 'Spike' },
    epic: { icon: Layout, color: 'purple', label: 'Epic' }
  };

  const selectedPbis = backlogItems.filter(pbi => selectedItems.has(pbi.id));
  const totalStoryPoints = selectedPbis
    .filter(pbi => pbi.item_type === 'user_story')
    .reduce((sum, pbi) => sum + (pbi.story_points || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus size={24} />
              Add Items to Sprint
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select backlog items or create a new item
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
            >
              <PlusCircle size={18} />
              Create New Item
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading backlog items...</p>
            </div>
          ) : backlogItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No backlog items available</p>
            </div>
          ) : (
            <>
              {/* Scope Creep Warning */}
              {totalStoryPoints > 0 && (
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-100">Scope Creep Warning</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Adding {totalStoryPoints} story points mid-sprint will be tracked as scope creep and reflected in the burndown chart.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Item List */}
              <div className="space-y-2">
                {backlogItems.map(pbi => {
                  const config = typeConfig[pbi.item_type as keyof typeof typeConfig] || typeConfig.task;
                  const TypeIcon = config.icon;
                  const isSelected = selectedItems.has(pbi.id);

                  return (
                    <div
                      key={pbi.id}
                      onClick={() => toggleItemSelection(pbi.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(pbi.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400 flex-shrink-0`} />
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {pbi.title}
                            </h4>
                          </div>
                          {pbi.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {pbi.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-900 text-${config.color}-800 dark:text-${config.color}-200`}>
                              {config.label}
                            </span>
                            {pbi.item_type === 'user_story' && pbi.story_points && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {pbi.story_points} pts
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            {totalStoryPoints > 0 && (
              <span className="ml-2 font-medium text-orange-600 dark:text-orange-400">
                (+{totalStoryPoints} story points)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItems}
              disabled={selectedItems.size === 0 || adding}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add to Sprint
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Create New Item Modal */}
      {showCreateModal && (
        <AddPBIModal
          projectId={projectId}
          sprintId={sprintId}
          onClose={() => setShowCreateModal(false)}
          onPBIAdded={handleNewItemCreated}
        />
      )}
    </div>
  );
}
