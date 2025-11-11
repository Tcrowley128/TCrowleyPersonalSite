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

interface JourneyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  assessmentId: string;
  conversationId: string;
}

export default function JourneyUpdateModal({
  isOpen,
  onClose,
  message,
  assessmentId,
  conversationId,
}: JourneyUpdateModalProps) {
  const insights = message.metadata?.insights || [];
  const [selectedInsights, setSelectedInsights] = useState<number[]>(
    insights.map((_, index) => index)
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedInsights, setEditedInsights] = useState<any[]>(insights);
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
        `/api/assessment/${assessmentId}/journey-chat/apply-update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: message.id,
            conversationId,
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
      console.error("[JourneyUpdateModal] Error applying updates:", err);
      setError(err instanceof Error ? err.message : "Failed to apply updates");
    } finally {
      setIsApplying(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📊';
      case 'pbi':
        return '📝';
      case 'risk':
        return '⚠️';
      case 'sprint':
        return '🏃';
      case 'new_pbi':
        return '✨';
      default:
        return '🔄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Project';
      case 'pbi':
        return 'PBI';
      case 'risk':
        return 'Risk';
      case 'sprint':
        return 'Sprint';
      case 'new_pbi':
        return 'New PBI';
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
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wand2 className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    Apply AI Suggestions to Journey
                  </h2>
                  <p className="text-sm text-green-100 mt-1">
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
                    Your journey has been updated. Refreshing...
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
                              ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleInsight(index)}
                              className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">
                                    {getTypeIcon(insight.type)}
                                  </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {getTypeLabel(insight.type)} Update
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                    Confidence: {Math.round(insight.confidence * 100)}%
                                  </span>
                                </div>
                                {!isEditing ? (
                                  <button
                                    onClick={() => handleEdit(index)}
                                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSaveEdit(index)}
                                    className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Save
                                  </button>
                                )}
                              </div>

                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {insight.summary}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Entity
                                  </label>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {insight.suggestedUpdate.entityName}
                                  </p>
                                </div>

                                {insight.suggestedUpdate.field && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      Field
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                      {insight.suggestedUpdate.field}
                                    </p>
                                  </div>
                                )}

                                {insight.suggestedUpdate.currentValue !== undefined && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      Current Value
                                    </label>
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {String(insight.suggestedUpdate.currentValue)}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    New Value
                                  </label>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={String(insight.suggestedUpdate.suggestedValue)}
                                      onChange={(e) =>
                                        handleEditChange(
                                          index,
                                          'suggestedUpdate.suggestedValue',
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                  ) : (
                                    <p className="text-green-700 dark:text-green-300 font-medium">
                                      {String(insight.suggestedUpdate.suggestedValue)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Reason
                                </label>
                                {isEditing ? (
                                  <textarea
                                    value={insight.suggestedUpdate.reason}
                                    onChange={(e) =>
                                      handleEditChange(
                                        index,
                                        'suggestedUpdate.reason',
                                        e.target.value
                                      )
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    {insight.suggestedUpdate.reason}
                                  </p>
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
            {!success && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between bg-gray-50 dark:bg-slate-900">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedInsights.length} of {editedInsights.length} selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isApplying}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={selectedInsights.length === 0 || isApplying}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isApplying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Apply Selected Updates
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
