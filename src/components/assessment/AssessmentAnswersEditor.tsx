'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit2, Save, X, RefreshCw, Loader2 } from 'lucide-react';

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
}

export default function AssessmentAnswersEditor({ assessmentId, onRegenerateComplete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            Your Assessment Answers
          </h3>
          {hasChanges && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded">
              Unsaved Changes
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading answers...</span>
                </div>
              ) : (
                <>
                  {Object.entries(groupedResponses).map(([step, stepResponses]) => (
                    <div key={step} className="space-y-4">
                      <h4 className="font-semibold text-md text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Step {step}
                      </h4>
                      {stepResponses.map((response) => {
                        const isEditing = editingKeys.has(response.question_key);
                        const currentValue = editedResponses[response.question_key] ?? response.answer_value;

                        return (
                          <div
                            key={response.id}
                            className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-2"
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

                  {hasChanges && (
                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
