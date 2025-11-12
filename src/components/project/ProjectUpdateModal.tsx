"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Check, Edit2, Save, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  id?: string;
  metadata?: {
    hasActionableInsights?: boolean;
    insights?: any[];
  };
}

interface ProjectUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  projectId: string;
}

export default function ProjectUpdateModal({
  isOpen,
  onClose,
  message,
  projectId,
}: ProjectUpdateModalProps) {
  const insights = message.metadata?.insights || [];
  const [selectedInsights, setSelectedInsights] = useState<number[]>(
    insights.map((_, index) => index)
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedInsights, setEditedInsights] = useState<any[]>(
    JSON.parse(JSON.stringify(insights))
  );
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleInsight = (index: number) => {
    setSelectedInsights((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    setEditingIndex(null);
  };

  const handleEditChange = (index: number, field: string, value: any) => {
    setEditedInsights((prev) => {
      const updated = [...prev];
      if (field.includes('.')) {
        // Handle nested fields like suggestedUpdate.suggestedValue
        const [parent, child] = field.split('.');
        updated[index] = {
          ...updated[index],
          [parent]: {
            ...updated[index][parent],
            [child]: value,
          },
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleApply = async () => {
    setIsApplying(true);
    setError("");

    try {
      const updatesToApply = selectedInsights.map((index) => {
        const insight = editedInsights[index];
        return {
          type: insight.type,
          action: insight.action || 'update',
          entityId: insight.suggestedUpdate.entityId,
          entityName: insight.suggestedUpdate.entityName,
          field: insight.suggestedUpdate.field,
          oldValue: insight.suggestedUpdate.currentValue,
          newValue: insight.suggestedUpdate.suggestedValue,
          reason: insight.suggestedUpdate.reason,
        };
      });

      const response = await fetch(
        `/api/projects/${projectId}/chat/apply-update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: message.id,
            updates: updatesToApply,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply updates");
      }

      const result = await response.json();
      setSuccess(true);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        // Reload page to show updates
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("[ProjectUpdateModal] Error applying updates:", err);
      setError(err instanceof Error ? err.message : "Failed to apply updates");
    } finally {
      setIsApplying(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pbi':
      case 'user_story':
        return '📝';
      case 'sprint':
        return '🏃';
      case 'new_pbi':
      case 'new_user_story':
        return '✨';
      case 'risk':
        return '⚠️';
      default:
        return '🔄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pbi':
      case 'user_story':
        return 'User Story';
      case 'sprint':
        return 'Sprint';
      case 'new_pbi':
      case 'new_user_story':
        return 'New User Story';
      case 'risk':
        return 'Risk';
      default:
        return 'Update';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wand2 className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    Apply AI Suggestions to Project
                  </h2>
                  <p className="text-sm text-purple-100 mt-1">
                    Review and apply {editedInsights.length} suggested update
                    {editedInsights.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Updates Applied Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Your project has been updated. Refreshing...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-200">
                          Error applying updates
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {editedInsights.map((insight, index) => {
                      const isSelected = selectedInsights.includes(index);
                      const isEditing = editingIndex === index;

                      return (
                        <div
                          key={index}
                          className={`border-2 rounded-xl p-4 transition-all ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleInsight(index)}
                              className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                                  {getTypeLabel(insight.type)}
                                </span>
                                {insight.action === 'create' && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                                    CREATE NEW
                                  </span>
                                )}
                              </div>

                              {/* Entity Name */}
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {insight.suggestedUpdate.entityName}
                              </h4>

                              {/* Field Being Updated */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Field
                                  </label>
                                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                                    {insight.suggestedUpdate.field}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Current Value
                                  </label>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {insight.suggestedUpdate.currentValue || <em className="text-gray-400">None</em>}
                                  </p>
                                </div>
                              </div>

                              {/* New Value (Editable) */}
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Suggested Value
                                  {isEditing && (
                                    <button
                                      onClick={() => handleSaveEdit(index)}
                                      className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                    >
                                      <Save className="w-3 h-3 inline" /> Save
                                    </button>
                                  )}
                                  {!isEditing && (
                                    <button
                                      onClick={() => handleEdit(index)}
                                      className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      <Edit2 className="w-3 h-3 inline" /> Edit
                                    </button>
                                  )}
                                </label>
                                {isEditing ? (
                                  <textarea
                                    value={editedInsights[index].suggestedUpdate.suggestedValue}
                                    onChange={(e) =>
                                      handleEditChange(index, 'suggestedUpdate.suggestedValue', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    {editedInsights[index].suggestedUpdate.suggestedValue}
                                  </p>
                                )}
                              </div>

                              {/* Reason */}
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                                  Why this change?
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                  {insight.suggestedUpdate.reason}
                                </p>
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
            {!success && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedInsights.length} of {editedInsights.length} update
                  {editedInsights.length > 1 ? 's' : ''} selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isApplying || selectedInsights.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isApplying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Apply {selectedInsights.length} Update
                        {selectedInsights.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
