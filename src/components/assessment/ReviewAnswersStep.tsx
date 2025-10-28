'use client';

import { motion } from 'framer-motion';
import { Edit2, CheckCircle, ArrowRight } from 'lucide-react';
import { assessmentSteps } from '@/lib/assessment/questions';

interface ReviewAnswersStepProps {
  answers: Record<string, any>;
  onEdit: (stepId: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewAnswersStep({
  answers,
  onEdit,
  onSubmit,
  isSubmitting
}: ReviewAnswersStepProps) {
  // Format answer value for display
  const formatAnswerValue = (value: any, questionKey: string): string => {
    if (value === undefined || value === null || value === '') {
      return 'Not answered';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not answered';
      // Find the question to get option labels
      for (const step of assessmentSteps) {
        const question = step.questions.find(q => q.key === questionKey);
        if (question?.options) {
          const labels = value.map(v => {
            const option = question.options?.find(opt => opt.value === v);
            return option?.label || v;
          });
          return labels.join(', ');
        }
      }
      return value.join(', ');
    }

    // For single-select, find the label
    for (const step of assessmentSteps) {
      const question = step.questions.find(q => q.key === questionKey);
      if (question?.options) {
        const option = question.options.find(opt => opt.value === value);
        if (option) return option.label;
      }
    }

    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <CheckCircle size={16} />
          All Questions Answered
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Review Your Answers
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Take a moment to review your responses before generating your digital transformation roadmap
        </p>
      </div>

      {/* Review Sections by Step */}
      <div className="space-y-6">
        {assessmentSteps.map((step) => {
          // Get all questions from this step that have answers
          const answeredQuestions = step.questions.filter(q => {
            // Skip conditional questions that shouldn't be shown
            if (q.key === 'industry_other' && answers.industry !== 'other') {
              return false;
            }
            if (q.key === 'erp_system_other') {
              return Array.isArray(answers.erp_system) && answers.erp_system.includes('other');
            }
            return answers[q.key] !== undefined;
          });

          if (answeredQuestions.length === 0) return null;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <button
                  onClick={() => onEdit(step.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                {answeredQuestions.map((question) => {
                  const answerValue = formatAnswerValue(answers[question.key], question.key);
                  const isAnswered = answerValue !== 'Not answered';

                  return (
                    <div
                      key={question.key}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {question.question}
                        </p>
                      </div>
                      <div className="sm:text-right sm:max-w-md">
                        <p className={`text-sm ${
                          isAnswered
                            ? 'text-gray-900 dark:text-white font-medium'
                            : 'text-gray-400 dark:text-gray-500 italic'
                        }`}>
                          {answerValue}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 pt-6"
      >
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:shadow-xl hover:scale-105'
          } bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg`}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <CheckCircle size={24} />
              </motion.div>
              Generating Your Roadmap...
            </>
          ) : (
            <>
              <CheckCircle size={24} />
              Generate My Digital Transformation Roadmap
              <ArrowRight size={20} />
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This will take about 30-60 seconds to analyze your responses and create personalized recommendations
        </p>
      </motion.div>
    </div>
  );
}
