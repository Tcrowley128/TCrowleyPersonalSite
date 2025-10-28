'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import ProgressBar from '@/components/assessment/ProgressBar';
import QuestionCard from '@/components/assessment/QuestionCard';
import { assessmentSteps } from '@/lib/assessment/questions';
import { v4 as uuidv4 } from 'uuid';

export default function AssessmentStart() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize session and load saved progress
  useEffect(() => {
    const sid = sessionStorage.getItem('assessment_session_id') || uuidv4();
    sessionStorage.setItem('assessment_session_id', sid);
    setSessionId(sid);

    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem(`assessment_progress_${sid}`);
    if (savedProgress) {
      try {
        const { answers: savedAnswers, step } = JSON.parse(savedProgress);
        setAnswers(savedAnswers);
        setCurrentStep(step);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to load saved progress:', err);
      }
    }
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!sessionId || Object.keys(answers).length === 0) return;

    const saveProgress = () => {
      try {
        const progressData = {
          answers,
          step: currentStep,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`assessment_progress_${sessionId}`, JSON.stringify(progressData));
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    };

    // Save immediately on change (debounced)
    setIsSaving(true);
    const debounceTimeout = setTimeout(() => {
      saveProgress();
    }, 2000);

    // Also save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => {
      clearTimeout(debounceTimeout);
      clearInterval(autoSaveInterval);
    };
  }, [answers, currentStep, sessionId]);

  const currentStepData = assessmentSteps.find(s => s.id === currentStep);
  const totalSteps = assessmentSteps.length;
  const isLastStep = currentStep === totalSteps;

  // Calculate step completion counts
  const getStepCompletionCounts = () => {
    const counts: { [key: number]: { answered: number; total: number } } = {};

    assessmentSteps.forEach(step => {
      const requiredQuestions = step.questions.filter(q => {
        // Skip industry_other if industry is not 'other'
        if (q.key === 'industry_other' && answers.industry !== 'other') {
          return false;
        }
        // Skip erp_system_other if 'other' not selected in erp_system
        if (q.key === 'erp_system_other') {
          return Array.isArray(answers.erp_system) && answers.erp_system.includes('other');
        }
        return q.required;
      });

      const answeredQuestions = requiredQuestions.filter(q => {
        const answer = answers[q.key];
        if (q.type === 'multi-select') {
          return Array.isArray(answer) && answer.length > 0;
        }
        return answer !== undefined && answer !== '' && answer !== null;
      });

      counts[step.id] = {
        answered: answeredQuestions.length,
        total: requiredQuestions.length
      };
    });

    return counts;
  };

  const stepCompletionCounts = getStepCompletionCounts();

  // Check if current step is complete
  const isStepComplete = () => {
    if (!currentStepData) return false;

    const requiredQuestions = currentStepData.questions.filter(q => {
      // Skip industry_other if industry is not 'other'
      if (q.key === 'industry_other' && answers.industry !== 'other') {
        return false;
      }
      return q.required;
    });

    return requiredQuestions.every(q => {
      const answer = answers[q.key];
      if (q.type === 'multi-select') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== '' && answer !== null;
    });
  };

  const handleAnswerChange = (questionKey: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
    setError('');
  };

  const handleNext = () => {
    if (!isStepComplete()) {
      setError('Please answer all required questions before continuing.');
      // Scroll to the first unanswered question
      const firstUnansweredQuestion = currentStepData?.questions.find(q => {
        const answer = answers[q.key];
        if (q.type === 'multi-select') {
          return !Array.isArray(answer) || answer.length === 0;
        }
        return answer === undefined || answer === '' || answer === null;
      });
      if (firstUnansweredQuestion) {
        const element = document.getElementById(`question-${firstUnansweredQuestion.key}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: number) => {
    // Only allow navigating to current or completed steps
    if (step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare assessment data
      const assessmentData = {
        session_id: sessionId,
        company_size: answers.company_size,
        industry: answers.industry === 'other' && answers.industry_other ? answers.industry_other : answers.industry,
        operational_areas: answers.operational_areas || [],
        user_role: answers.user_role,
        technical_capability: answers.technical_capability,
        team_comfort_level: answers.team_comfort_level,
        existing_tools: {
          microsoft: answers.existing_microsoft || [],
          google: answers.existing_google || [],
          other: answers.existing_other_tools || []
        },
        change_readiness_score: answers.change_readiness === 'eager' ? 5 :
                                answers.change_readiness === 'open' ? 4 :
                                answers.change_readiness === 'hesitant' ? 2 : 1,
        transformation_approach: answers.transformation_approach,
        has_champion: answers.champions_identified && answers.champions_identified.length > 0,
        contact_name: answers.contact_name,
        email: answers.email,
        company_name: answers.company_name,
        wants_consultation: answers.wants_consultation === 'yes',
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      };

      // Save assessment
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: assessmentData,
          responses: Object.entries(answers).map(([key, value], index) => {
            // Find which step this question belongs to
            let stepNumber = 1;
            let questionText = '';
            for (const step of assessmentSteps) {
              const question = step.questions.find(q => q.key === key);
              if (question) {
                stepNumber = step.id;
                questionText = question.question;
                break;
              }
            }

            return {
              step_number: stepNumber,
              question_key: key,
              question_text: questionText,
              answer_value: value
            };
          })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();

      // Clear saved progress on successful submission
      if (sessionId) {
        localStorage.removeItem(`assessment_progress_${sessionId}`);
      }

      // Redirect to results page
      router.push(`/assessment/results/${data.assessment_id}`);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!currentStepData) {
    return <div>Loading...</div>;
  }

  const stepTitles = assessmentSteps.map(s => s.title);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
          onStepClick={handleStepClick}
          stepCompletionCounts={stepCompletionCounts}
        />

        {/* Step Header */}
        <motion.div
          key={`header-${currentStep}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStepData.subtitle}
          </p>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          <AnimatePresence mode="wait">
            {currentStepData.questions
              .filter(question => {
                // Only show industry_other field when industry is 'other'
                if (question.key === 'industry_other') {
                  return answers.industry === 'other';
                }
                // Only show erp_system_other field when 'other' is selected in erp_system
                if (question.key === 'erp_system_other') {
                  return Array.isArray(answers.erp_system) && answers.erp_system.includes('other');
                }
                return true;
              })
              .map((question, index) => {
                // Filter options based on industry for dynamic questions
                let processedQuestion = { ...question };
                if (question.key === 'erp_system' && question.options && answers.industry) {
                  processedQuestion = {
                    ...question,
                    options: question.options.filter(option => {
                      // Show all options without industry property (core systems)
                      if (!option.industry) return true;
                      // Show industry-specific options only if they match selected industry
                      return option.industry === answers.industry;
                    })
                  };
                }

                return (
                  <QuestionCard
                    key={`${currentStep}-${question.key}`}
                    question={processedQuestion}
                    value={answers[question.key]}
                    onChange={(value) => handleAnswerChange(question.key, value)}
                    allAnswers={answers}
                  />
                );
              })}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-gray-600'
            }`}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg'
            } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating Results...
              </>
            ) : isLastStep ? (
              <>
                <Check size={20} />
                Submit & Get Results
              </>
            ) : (
              <>
                Next
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Progress Text and Auto-Save Indicator */}
        <div className="text-center mt-6 space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
          {lastSaved && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={12} className="text-green-600" />
                  <span>Draft saved {new Date(lastSaved).toLocaleTimeString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
