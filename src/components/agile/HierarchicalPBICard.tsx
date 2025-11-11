'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Zap, Bug, FileText, Lightbulb, Layout } from 'lucide-react';

interface PBI {
  id: string;
  title: string;
  description: string;
  item_type: string;
  priority: number;
  story_points: number;
  status: string;
  assigned_to: string;
  parent_id: string | null;
}

interface HierarchicalPBICardProps {
  pbi: PBI;
  childPbis?: PBI[];
  childrenMap?: Map<string, PBI[]>;
  selectedPbis: Set<string>;
  level: number;
  isSelected: boolean;
  onToggleSelect: (pbiId: string) => void;
  onEdit?: (pbiId: string) => void;
}

export function HierarchicalPBICard({ pbi, childPbis = [], childrenMap, selectedPbis, level, isSelected, onToggleSelect, onEdit }: HierarchicalPBICardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const typeConfig = {
    user_story: { icon: Zap, color: 'blue', label: 'Story' },
    bug: { icon: Bug, color: 'red', label: 'Bug' },
    task: { icon: FileText, color: 'gray', label: 'Task' },
    spike: { icon: Lightbulb, color: 'yellow', label: 'Spike' },
    epic: { icon: Layout, color: 'purple', label: 'Epic' }
  };

  const config = typeConfig[pbi.item_type as keyof typeof typeConfig] || typeConfig.task;
  const TypeIcon = config.icon;

  const priorityColors = {
    1: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    3: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    4: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const getPriorityLabel = (priority: number) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
    return labels[priority as keyof typeof labels] || 'Medium';
  };

  // Status configuration with better dark mode contrast
  const statusConfig = {
    new: { label: 'New', color: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100' },
    to_do: { label: 'To Do', color: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-100' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    committed: { label: 'Committed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    done: { label: 'Done', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    ready_for_review: { label: 'Ready for Review', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
  };

  const currentStatus = statusConfig[pbi.status as keyof typeof statusConfig] || statusConfig.new;
  const isDone = pbi.status === 'done';
  const hasChildren = childPbis.length > 0;

  return (
    <div className="space-y-2">
      {/* Main PBI Card */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
            title={isExpanded ? "Collapse children" : "Expand children"}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        ) : (
          <div className="w-7 flex-shrink-0" />
        )}

        {/* Checkbox - Disabled if done */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(pbi.id)}
          disabled={isDone}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={isDone ? "Done items cannot be added to sprints" : "Select for sprint"}
        />

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onEdit?.(pbi.id)}
        >
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400 flex-shrink-0`} />
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {pbi.title}
            </h4>
            {hasChildren && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({children.length} {children.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          {pbi.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {pbi.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
          {pbi.item_type === 'user_story' && pbi.story_points && (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-bold">
              {pbi.story_points}
            </div>
          )}
        </div>
      </div>

      {/* Child Items */}
      {hasChildren && isExpanded && (
        <div className="ml-8 space-y-2 relative">
          {/* Connecting line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-gray-300 to-transparent dark:from-gray-600 dark:via-gray-600" />

          <div className="pl-6 space-y-2">
            {childPbis.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Horizontal connector */}
                <div className="absolute left-0 top-1/2 w-6 h-px bg-gray-300 dark:bg-gray-600" />

                <HierarchicalPBICard
                  pbi={child}
                  childPbis={childrenMap?.get(child.id) || []}
                  childrenMap={childrenMap}
                  selectedPbis={selectedPbis}
                  level={level + 1}
                  isSelected={selectedPbis.has(child.id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
