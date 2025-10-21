'use client';

import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface QuickResultEditorProps {
  fieldName: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  label?: string;
  multiline?: boolean;
}

export default function QuickResultEditor({
  fieldName,
  value,
  onSave,
  label,
  multiline = false,
}: QuickResultEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="group relative flex items-start gap-2">
        <div className="flex-1">
          {multiline ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{value}</p>
          ) : (
            <span className="text-gray-700 dark:text-gray-300">{value}</span>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-shrink-0 opacity-40 group-hover:opacity-100 hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
          title={`Edit ${label || fieldName}`}
        >
          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <textarea
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-blue-500 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          rows={4}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-blue-500 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      )}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
        title="Save"
      >
        <Save className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
