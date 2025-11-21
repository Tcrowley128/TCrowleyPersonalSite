'use client';

import { useState } from 'react';
import { X, Repeat, Calendar, Info } from 'lucide-react';

interface RecurringItemModalProps {
  pbiId?: string;
  projectId: string;
  onClose: () => void;
  onSaved: () => void;
  existingData?: {
    title: string;
    description: string;
    item_type: string;
    story_points: number;
    recurrence_pattern: string;
    recurrence_interval: number;
    recurrence_day_of_week?: number;
    recurrence_day_of_month?: number;
    recurrence_start_date: string;
    recurrence_end_date?: string;
  };
}

export function RecurringItemModal({
  pbiId,
  projectId,
  onClose,
  onSaved,
  existingData
}: RecurringItemModalProps) {
  const [formData, setFormData] = useState({
    title: existingData?.title || '',
    description: existingData?.description || '',
    item_type: existingData?.item_type || 'task',
    story_points: existingData?.story_points || 2,
    recurrence_pattern: existingData?.recurrence_pattern || 'weekly',
    recurrence_interval: existingData?.recurrence_interval || 1,
    recurrence_day_of_week: existingData?.recurrence_day_of_week ?? 1, // Monday by default
    recurrence_day_of_month: existingData?.recurrence_day_of_month ?? 1,
    recurrence_start_date: existingData?.recurrence_start_date || new Date().toISOString().split('T')[0],
    recurrence_end_date: existingData?.recurrence_end_date || ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const patterns = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'weekly', label: 'Weekly', description: 'Every week on a specific day' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Every month on a specific day' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' }
  ];

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...formData,
        is_recurring: true,
        next_occurrence_date: formData.recurrence_start_date,
        status: 'backlog' // Recurring templates stay in backlog
      };

      const url = pbiId
        ? `/api/pbis/${pbiId}`
        : `/api/projects/${projectId}/pbis`;

      const response = await fetch(url, {
        method: pbiId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSaved();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save recurring item');
      }
    } catch (err) {
      console.error('Error saving recurring item:', err);
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Repeat className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {pbiId ? 'Edit' : 'Create'} Recurring Work Item
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically generate work items on a schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">How Recurring Items Work:</p>
                <p className="text-blue-800 dark:text-blue-200">
                  This creates a template that automatically generates new work items based on your schedule.
                  Perfect for routine tasks like weekly reports, monthly maintenance, or quarterly reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Weekly Team Status Report"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="What needs to be done each time?"
            />
          </div>

          {/* Item Type & Story Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Type
              </label>
              <select
                value={formData.item_type}
                onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="task">Task</option>
                <option value="user_story">User Story</option>
                <option value="bug">Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Story Points
              </label>
              <input
                type="number"
                min="1"
                max="21"
                value={formData.story_points}
                onChange={(e) => setFormData({ ...formData, story_points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recurrence Pattern
            </label>
            <div className="grid grid-cols-2 gap-3">
              {patterns.map((pattern) => (
                <label
                  key={pattern.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.recurrence_pattern === pattern.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={pattern.value}
                    checked={formData.recurrence_pattern === pattern.value}
                    onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{pattern.label}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{pattern.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Day of Week (for weekly/biweekly) */}
          {(formData.recurrence_pattern === 'weekly' || formData.recurrence_pattern === 'biweekly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of Week
              </label>
              <select
                value={formData.recurrence_day_of_week}
                onChange={(e) => setFormData({ ...formData, recurrence_day_of_week: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Month (for monthly/quarterly) */}
          {(formData.recurrence_pattern === 'monthly' || formData.recurrence_pattern === 'quarterly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.recurrence_day_of_month}
                onChange={(e) => setFormData({ ...formData, recurrence_day_of_month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="1-31"
              />
            </div>
          )}

          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.recurrence_start_date}
                onChange={(e) => setFormData({ ...formData, recurrence_start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.recurrence_end_date}
                onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                min={formData.recurrence_start_date}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Repeat className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Repeat className="w-4 h-4" />
                {pbiId ? 'Update' : 'Create'} Recurring Item
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
