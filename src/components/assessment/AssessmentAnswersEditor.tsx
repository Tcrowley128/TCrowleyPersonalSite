'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit2, Save, X, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

interface Response {
  id: string;
  step_number: number;
  question_key: string;
  question_text: string;
  answer_value: any;
  created_at: string;
}

interface Props {
  assessmentId: string;
  onRegenerateComplete?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssessmentAnswersEditor({ assessmentId, onRegenerateComplete, isOpen, onClose }: Props) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [editedResponses, setEditedResponses] = useState<Record<string, any>>({});
  const [editingKeys, setEditingKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && responses.length === 0) {
      loadResponses();
    }
  }, [isOpen]);

  const loadResponses = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/answers`);
      if (!response.ok) throw new Error('Failed to load responses');

      const data = await response.json();
      setResponses(data.responses || []);
    } catch (err) {
      console.error('Error loading responses:', err);
      setError('Failed to load assessment answers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleCloseWithoutSaving = () => {
    setShowUnsavedWarning(false);
    setEditedResponses({});
    setEditingKeys(new Set());
    setHasChanges(false);
    onClose();
  };

  const handleSaveAndClose = async () => {
    await saveAllChanges();
    setShowUnsavedWarning(false);
    onClose();
  };

  const startEditing = (questionKey: string, currentValue: any) => {
    setEditingKeys(prev => new Set(prev).add(questionKey));
    setEditedResponses(prev => ({
      ...prev,
      [questionKey]: currentValue,
    }));
  };

  const cancelEditing = (questionKey: string) => {
    setEditingKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionKey);
      return newSet;
    });
    setEditedResponses(prev => {
      const newEdited = { ...prev };
      delete newEdited[questionKey];
      return newEdited;
    });
  };

  const saveEdit = (questionKey: string) => {
    setEditingKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionKey);
      return newSet;
    });
    setHasChanges(true);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    setError('');

    try {
      const updates = Object.entries(editedResponses).map(([question_key, answer_value]) => ({
        question_key,
        answer_value,
      }));

      const response = await fetch(`/api/assessment/${assessmentId}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      // Update local state
      setResponses(prev =>
        prev.map(r => ({
          ...r,
          answer_value: editedResponses[r.question_key] ?? r.answer_value,
        }))
      );

      setEditedResponses({});
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateAssessment = async () => {
    setIsRegenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changesSummary: `Updated ${Object.keys(editedResponses).length} responses`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to regenerate');
      }

      // Clear edited responses
      setEditedResponses({});
      setHasChanges(false);

      // Notify parent component
      if (onRegenerateComplete) {
        onRegenerateComplete();
      }

      // Reload the page to show new results
      window.location.reload();
    } catch (err: any) {
      console.error('Error regenerating assessment:', err);
      setError(err.message || 'Failed to regenerate assessment');
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatAnswer = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const groupedResponses = responses.reduce((acc: Record<number, Response[]>, resp) => {
    if (!acc[resp.step_number]) {
      acc[resp.step_number] = [];
    }
    acc[resp.step_number].push(resp);
    return acc;
  }, {});

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Assessment Answers
                  </h2>
                  {hasChanges && (
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200 mb-6">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading answers...</span>
                  </div>
                ) : responses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      This assessment was created before detailed response tracking was enabled.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      You can still regenerate results, but individual answer editing is not available for this assessment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedResponses).map(([step, stepResponses]) => (
                      <div key={step} className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Step {step}
                        </h3>
                        {stepResponses.map((response) => {
                          const isEditing = editingKeys.has(response.question_key);
                          const currentValue = editedResponses[response.question_key] ?? response.answer_value;

                          return (
                            <div
                              key={response.id}
                              className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {response.question_text || response.question_key}
                                  </p>
                                  {isEditing ? (
                                    <textarea
                                      value={formatAnswer(currentValue)}
                                      onChange={(e) =>
                                        setEditedResponses(prev => ({
                                          ...prev,
                                          [response.question_key]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                      rows={3}
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {formatAnswer(currentValue)}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => saveEdit(response.question_key)}
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        title="Save"
                                      >
                                        <Save className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => cancelEditing(response.question_key)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Cancel"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => startEditing(response.question_key, response.answer_value)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {hasChanges && responses.length > 0 && (
                <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={saveAllChanges}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={regenerateAssessment}
                    disabled={isRegenerating || !Object.keys(editedResponses).length}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Save & Regenerate Results
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Warning Modal */}
      <AnimatePresence>
        {showUnsavedWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Unsaved Changes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    You have unsaved changes. Do you want to save them before closing?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveAndClose}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Save & Close
                    </button>
                    <button
                      onClick={handleCloseWithoutSaving}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                    >
                      Don't Save
                    </button>
                    <button
                      onClick={() => setShowUnsavedWarning(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
