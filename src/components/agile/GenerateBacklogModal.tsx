'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Info, Layout, Zap, FileText } from 'lucide-react';

interface PBI {
  id: string;
  title: string;
  item_type: string;
  parent_id: string | null;
}

interface GenerateBacklogModalProps {
  projectId: string;
  pbis: PBI[];
  onClose: () => void;
  onGenerated: () => void;
}

export function GenerateBacklogModal({ projectId, pbis, onClose, onGenerated }: GenerateBacklogModalProps) {
  const [itemType, setItemType] = useState<'epic' | 'user_story' | 'task'>('epic');
  const [parentId, setParentId] = useState<string>('');
  const [regenerateMode, setRegenerateMode] = useState<'add' | 'replace'>('add');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // Get available parents based on item type
  const getAvailableParents = () => {
    if (itemType === 'epic') {
      return []; // Epics don't need a parent
    } else if (itemType === 'user_story') {
      return pbis.filter(pbi => pbi.item_type === 'epic');
    } else if (itemType === 'task') {
      return pbis.filter(pbi => pbi.item_type === 'user_story');
    }
    return [];
  };

  const availableParents = getAvailableParents();
  const needsParent = itemType !== 'epic' && availableParents.length > 0;

  // Check if items of this type already exist
  const existingItems = () => {
    if (itemType === 'epic') {
      return pbis.filter(pbi => pbi.item_type === 'epic' && !pbi.parent_id);
    } else if (itemType === 'user_story' && parentId) {
      return pbis.filter(pbi => pbi.item_type === 'user_story' && pbi.parent_id === parentId);
    } else if (itemType === 'task' && parentId) {
      return pbis.filter(pbi => pbi.item_type === 'task' && pbi.parent_id === parentId);
    }
    return [];
  };

  const hasExistingItems = existingItems().length > 0;

  const handleGenerate = async () => {
    // Validate parent selection
    if (needsParent && !parentId) {
      setError(`Please select a ${itemType === 'user_story' ? 'epic' : 'user story'} to generate ${itemType === 'user_story' ? 'user stories' : 'tasks'} for.`);
      return;
    }

    // If generating user stories but no epics exist, show error
    if (itemType === 'user_story' && availableParents.length === 0) {
      setError('Please create or generate epics first before generating user stories.');
      return;
    }

    // If generating tasks but no user stories exist, show error
    if (itemType === 'task' && availableParents.length === 0) {
      setError('Please create or generate user stories first before generating tasks.');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      // If replace mode, delete existing items first
      if (regenerateMode === 'replace' && hasExistingItems) {
        const itemsToDelete = existingItems();

        // Delete all existing items of this type
        await Promise.all(
          itemsToDelete.map(item =>
            fetch(`/api/pbis/${item.id}`, {
              method: 'DELETE'
            })
          )
        );
      }

      const response = await fetch(`/api/projects/${projectId}/generate-backlog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          parentId: parentId || null
        })
      });

      if (response.ok) {
        onGenerated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to generate backlog items');
      }
    } catch (err) {
      console.error('Error generating backlog:', err);
      setError('An error occurred while generating backlog items');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Generate Backlog Items with AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Help Box */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">Understanding the Hierarchy:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li><strong>Epic:</strong> Large body of work (e.g., "User Authentication System")</li>
                <li><strong>User Story:</strong> Specific user need under an Epic (e.g., "User can log in with email")</li>
                <li><strong>Task:</strong> Technical work to complete a User Story (e.g., "Create login API endpoint")</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">💡 Tip: Start with Epics, then generate User Stories, then Tasks</p>
            </div>
          </div>
        </div>

        {/* Item Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What would you like to generate?
          </label>
          <div className="space-y-3">
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              itemType === 'epic'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
              <input
                type="radio"
                name="itemType"
                value="epic"
                checked={itemType === 'epic'}
                onChange={(e) => {
                  setItemType(e.target.value as 'epic');
                  setParentId('');
                  setError('');
                }}
                className="mr-3 mt-1 text-purple-600"
              />
              <Layout className="w-5 h-5 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Epics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Large initiatives that contain multiple user stories
                </div>
                <div className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-2 py-1 rounded inline-block">
                  No parent required • Start here
                </div>
              </div>
            </label>

            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              itemType === 'user_story'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
              <input
                type="radio"
                name="itemType"
                value="user_story"
                checked={itemType === 'user_story'}
                onChange={(e) => {
                  setItemType(e.target.value as 'user_story');
                  setParentId('');
                  setError('');
                }}
                className="mr-3 mt-1 text-blue-600"
              />
              <Zap className="w-5 h-5 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">User Stories</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Specific features from the user's perspective ("As a user, I want...")
                </div>
                <div className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded inline-block">
                  Requires Epic parent • Generate after Epics
                </div>
              </div>
            </label>

            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              itemType === 'task'
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}>
              <input
                type="radio"
                name="itemType"
                value="task"
                checked={itemType === 'task'}
                onChange={(e) => {
                  setItemType(e.target.value as 'task');
                  setParentId('');
                  setError('');
                }}
                className="mr-3 mt-1 text-gray-600"
              />
              <FileText className="w-5 h-5 mr-2 mt-0.5 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Tasks</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Technical implementation work to complete a User Story
                </div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded inline-block">
                  Requires User Story parent • Generate last
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Parent Selection */}
        {needsParent && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select {itemType === 'user_story' ? 'Epic' : 'User Story'}
            </label>
            <select
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                setError('');
              }}
              className="w-full px-3 pr-10 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            >
              <option value="">Choose a {itemType === 'user_story' ? 'epic' : 'user story'}...</option>
              {availableParents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              AI will generate {itemType === 'user_story' ? 'user stories' : 'tasks'} based on this {itemType === 'user_story' ? 'epic' : 'user story'}
            </p>
          </div>
        )}

        {/* Regenerate Mode Selection - only show if items already exist */}
        {hasExistingItems && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {existingItems().length} {itemType === 'epic' ? 'epic' : itemType === 'user_story' ? 'user story' : 'task'}
              {existingItems().length === 1 ? '' : 's'} already exist. What would you like to do?
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="regenerateMode"
                  value="add"
                  checked={regenerateMode === 'add'}
                  onChange={(e) => setRegenerateMode(e.target.value as 'add')}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Add New Items</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Generate new items alongside existing ones
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="regenerateMode"
                  value="replace"
                  checked={regenerateMode === 'replace'}
                  onChange={(e) => setRegenerateMode(e.target.value as 'replace')}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Replace All</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Delete existing {existingItems().length} item{existingItems().length === 1 ? '' : 's'} and generate fresh ones
                  </div>
                </div>
              </label>
            </div>
            {regenerateMode === 'replace' && (
              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-800 dark:text-orange-200">
                Warning: This will permanently delete {existingItems().length} existing item{existingItems().length === 1 ? '' : 's'}
              </div>
            )}
          </div>
        )}

        {/* Info message for epics */}
        {itemType === 'epic' && !hasExistingItems && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              AI will generate epics based on your project's goals and requirements.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
