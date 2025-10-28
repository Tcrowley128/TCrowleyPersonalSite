'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ChatUpdate {
  updateType: string;
  sectionPath: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

interface Insight {
  type: string;
  summary: string;
  suggestedUpdate: {
    sectionPath: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
  };
  confidence: number;
}

interface ChatUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: Insight[];
  assessmentId: string;
  messageId: string;
  conversationId: string;
  onSuccess?: () => void;
}

export default function ChatUpdateModal({
  isOpen,
  onClose,
  insights,
  assessmentId,
  messageId,
  conversationId,
  onSuccess,
}: ChatUpdateModalProps) {
  const [selectedInsights, setSelectedInsights] = useState<number[]>(
    insights.map((_, i) => i)
  );
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleInsight = (index: number) => {
    setSelectedInsights((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getUpdateTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      tool_recommendation: 'Tool Recommendation',
      timeline: 'Timeline',
      quick_win: 'Quick Win',
      roadmap: 'Roadmap',
    };
    return labels[type] || type;
  };

  const handleApply = async () => {
    setIsApplying(true);
    setError('');

    try {
      const updates: ChatUpdate[] = selectedInsights.map((index) => {
        const insight = insights[index];
        return {
          updateType: insight.type,
          sectionPath: insight.suggestedUpdate.sectionPath,
          oldValue: insight.suggestedUpdate.currentValue,
          newValue: insight.suggestedUpdate.suggestedValue,
          reason: insight.suggestedUpdate.reason,
        };
      });

      const response = await fetch(
        `/api/assessment/${assessmentId}/chat/apply-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            conversationId,
            updates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply updates');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error applying updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply updates');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between flex-shrink-0 rounded-t-lg">
            <div>
              <h3 className="font-bold text-lg">Review Suggested Updates</h3>
              <p className="text-xs text-blue-100">
                Select which changes you'd like to apply to your assessment
              </p>
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
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Updates Applied Successfully!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your assessment results have been updated.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const isSelected = selectedInsights.includes(index);
                  return (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => toggleInsight(index)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleInsight(index)}
                          className="mt-1 text-blue-600 focus:ring-blue-500 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {getUpdateTypeLabel(insight.type)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Confidence: {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>

                          {/* Summary */}
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            {insight.summary}
                          </p>

                          {/* Changes */}
                          <div className="space-y-3">
                            {/* Before */}
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-1">
                                Current Value:
                              </p>
                              <pre className="text-xs text-red-800 dark:text-red-300 whitespace-pre-wrap break-words">
                                {formatValue(insight.suggestedUpdate.currentValue)}
                              </pre>
                            </div>

                            {/* After */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-green-900 dark:text-green-200 mb-1">
                                Suggested Value:
                              </p>
                              <pre className="text-xs text-green-800 dark:text-green-300 whitespace-pre-wrap break-words">
                                {formatValue(insight.suggestedUpdate.suggestedValue)}
                              </pre>
                            </div>

                            {/* Reason */}
                            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{insight.suggestedUpdate.reason}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                      Failed to Apply Updates
                    </h4>
                    <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedInsights.length} of {insights.length} updates selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  disabled={isApplying}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={selectedInsights.length === 0 || isApplying}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Changes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
