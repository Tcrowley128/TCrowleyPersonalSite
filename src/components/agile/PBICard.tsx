'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, User, Zap, Bug, FileText, Lightbulb, Layout, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  assigned_to: string;
  original_estimate_hours: number;
  remaining_hours: number;
}

interface PBI {
  id: string;
  title: string;
  description: string;
  item_type: string;
  priority: number;
  story_points: number;
  status: string;
  assigned_to: string;
  tasks?: Task[];
}

interface PBICardProps {
  pbi: PBI;
  onUpdate: (pbiId: string, updates: any) => void;
  onEdit?: (pbiId: string) => void;
}

export function PBICard({ pbi, onUpdate, onEdit }: PBICardProps) {
  const [showTasks, setShowTasks] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pbi.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Item type icons and colors
  const typeConfig = {
    user_story: { icon: Zap, color: 'blue', label: 'Story' },
    bug: { icon: Bug, color: 'red', label: 'Bug' },
    task: { icon: FileText, color: 'gray', label: 'Task' },
    spike: { icon: Lightbulb, color: 'yellow', label: 'Spike' },
    epic: { icon: Layout, color: 'purple', label: 'Epic' }
  };

  const config = typeConfig[pbi.item_type as keyof typeof typeConfig] || typeConfig.task;
  const TypeIcon = config.icon;

  // Priority colors
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

  // Task status icons
  const taskStatusIcons = {
    to_do: Circle,
    in_progress: AlertCircle,
    blocked: AlertCircle,
    done: CheckCircle2
  };

  const completedTasks = pbi.tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = pbi.tasks?.length || 0;

  // Status configuration
  const statusConfig = {
    to_do: { label: 'To Do', color: 'gray' },
    in_progress: { label: 'In Progress', color: 'blue' },
    blocked: { label: 'Blocked', color: 'red' },
    done: { label: 'Done', color: 'green' },
    ready_for_review: { label: 'Ready for Review', color: 'purple' }
  };

  const currentStatus = statusConfig[pbi.status as keyof typeof statusConfig] || statusConfig.to_do;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Drag Handle - separate from click area */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 right-2 cursor-move p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
        title="Drag to move"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
          <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      {/* Clickable card content */}
      <div
        onClick={() => onEdit?.(pbi.id)}
        className="cursor-pointer hover:opacity-80 transition-opacity relative pr-8"
      >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <TypeIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400 flex-shrink-0`} />
          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
            {pbi.title}
          </h4>
        </div>
        {pbi.item_type === 'user_story' && pbi.story_points && (
          <div className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-bold">
            {pbi.story_points}
          </div>
        )}
      </div>

      {/* Description */}
      {pbi.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {pbi.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-900 text-${config.color}-800 dark:text-${config.color}-200`}>
          {config.label}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[pbi.priority as keyof typeof priorityColors]}`}>
          {getPriorityLabel(pbi.priority)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${currentStatus.color}-100 dark:bg-${currentStatus.color}-900 text-${currentStatus.color}-800 dark:text-${currentStatus.color}-200`}>
          {currentStatus.label}
        </span>
        {pbi.assigned_to && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
            <User size={12} />
            <span className="text-gray-700 dark:text-gray-300">{pbi.assigned_to}</span>
          </div>
        )}
      </div>

      {/* Tasks Summary */}
      {totalTasks > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTasks(!showTasks);
            }}
            className="flex items-center justify-between w-full text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showTasks ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-medium">
                Tasks ({completedTasks}/{totalTasks})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </button>

          {/* Task List */}
          {showTasks && (
            <div className="mt-3 space-y-2">
              {pbi.tasks?.map(task => {
                const TaskStatusIcon = taskStatusIcons[task.status as keyof typeof taskStatusIcons] || Circle;
                const isComplete = task.status === 'done';
                const isBlocked = task.status === 'blocked';

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs p-2 rounded bg-gray-50 dark:bg-slate-900"
                  >
                    <TaskStatusIcon
                      size={14}
                      className={`flex-shrink-0 ${
                        isComplete
                          ? 'text-green-600 dark:text-green-400'
                          : isBlocked
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className={`flex-1 ${isComplete ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {task.title}
                    </span>
                    {task.remaining_hours !== undefined && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {task.remaining_hours}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

