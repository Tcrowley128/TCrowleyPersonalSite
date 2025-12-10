'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import ProgressBar from '@/components/assessment/ProgressBar';
import QuestionCard from '@/components/assessment/QuestionCard';
import ReviewAnswersStep from '@/components/assessment/ReviewAnswersStep';
import { assessmentSteps } from '@/lib/assessment/questions';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function AssessmentStart() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSyncConflict, setHasSyncConflict] = useState(false);
  const [serverDraft, setServerDraft] = useState<any>(null);

  // Check authentication before allowing assessment
  useEffect(() => {
    if (!authLoading && !user) {
      // User is not authenticated, show auth modal
      setShowAuthModal(true);
    }
  }, [authLoading, user]);

  // Sync draft to server
  const syncDraftToServer = async () => {
    if (!user || !sessionId || Object.keys(answers).length === 0) return;

    setIsSyncing(true);

    try {
      const response = await fetch('/api/assessment/drafts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          answers,
          current_step: currentStep,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.conflict && data.server_draft) {
        // Server has newer version
        setServerDraft(data.server_draft);
        setHasSyncConflict(true);
      }
    } catch (err) {
      console.error('Failed to sync draft:', err);
      // Fail silently - localStorage is fallback
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch server draft
  const fetchServerDraft = async (sid: string) => {
    try {
      const response = await fetch(`/api/assessment/drafts/sync?session_id=${sid}`);
      if (!response.ok) {
        console.error('Failed to fetch server draft:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data.draft) {
        const localProgress = localStorage.getItem(`assessment_progress_${sid}`);
        const localTimestamp = localProgress ? JSON.parse(localProgress).timestamp : null;
        const serverTimestamp = data.draft.updated_at;

        // Compare timestamps - server wins if newer
        if (!localTimestamp || new Date(serverTimestamp) > new Date(localTimestamp)) {
          setServerDraft(data.draft);
          setHasSyncConflict(true);
          setShowResumeBanner(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch server draft:', err);
      // Fail silently - localStorage is fallback
    }
  };

  // Initialize session and load saved progress
  useEffect(() => {
    // Only initialize if user is authenticated
    if (!user) return;

    const sid = sessionStorage.getItem('assessment_session_id') || uuidv4();
    sessionStorage.setItem('assessment_session_id', sid);
    setSessionId(sid);

    // Load saved progress from localStorage first (instant)
    const savedProgress = localStorage.getItem(`assessment_progress_${sid}`);
    if (savedProgress) {
      try {
        const { answers: savedAnswers, step, timestamp } = JSON.parse(savedProgress);
        setAnswers(savedAnswers);
        setCurrentStep(step);
        setLastSaved(new Date());
        setShowResumeBanner(true);
        setDraftTimestamp(timestamp);
      } catch (err) {
        console.error('Failed to load saved progress:', err);
      }
    }

    // Then fetch from server (background)
    fetchServerDraft(sid);
  }, [user]);

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
        // Save to localStorage first (instant)
        localStorage.setItem(`assessment_progress_${sessionId}`, JSON.stringify(progressData));
        setLastSaved(new Date());
        setIsSaving(false);

        // If authenticated, also sync to server (debounced)
        if (user) {
          syncDraftToServer();
        }
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
  }, [answers, currentStep, sessionId, user]);

  const currentStepData = assessmentSteps.find(s => s.id === currentStep);
  const totalSteps = assessmentSteps.length;
  const totalStepsWithReview = totalSteps + 1; // Add review step
  const isLastStep = currentStep === totalSteps;
  const isReviewStep = currentStep === totalStepsWithReview;

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
    // If on review step, submit
    if (isReviewStep) {
      handleSubmit();
      return;
    }

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

    // Move to next step (or review step if this was the last question step)
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleStartFresh = () => {
    if (confirm('Are you sure you want to start over? This will delete your saved progress.')) {
      if (sessionId) {
        localStorage.removeItem(`assessment_progress_${sessionId}`);
      }
      setAnswers({});
      setCurrentStep(1);
      setShowResumeBanner(false);
      setLastSaved(null);
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
        user_id: user?.id, // Link to authenticated user
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

        // Also delete from server
        if (user) {
          try {
            await fetch('/api/assessment/drafts/delete', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId })
            });
          } catch (err) {
            console.error('Failed to delete server draft:', err);
            // Non-critical error - don't block redirect
          }
        }
      }

      // Redirect to results page
      router.push(`/assessment/results/${data.assessment_id}`);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Allow review step even if currentStepData is undefined
  if (!currentStepData && !isReviewStep) {
    return <div>Loading...</div>;
  }

  const stepTitles = [...assessmentSteps.map(s => s.title), 'Review'];

  return (
    <>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => router.push('/assessment')}
        onSuccess={() => setShowAuthModal(false)}
        initialMode="signup"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalStepsWithReview}
          stepTitles={stepTitles}
          onStepClick={handleStepClick}
          stepCompletionCounts={stepCompletionCounts}
        />

        {/* Resume Draft Banner */}
        {showResumeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Welcome back!
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  We've restored your progress from {new Date(draftTimestamp).toLocaleString()}. You're on step {currentStep} of {totalSteps}.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowResumeBanner(false)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Continue where I left off
                  </button>
                  <span className="text-blue-300 dark:text-blue-700">•</span>
                  <button
                    onClick={handleStartFresh}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Start fresh
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowResumeBanner(false)}
                className="flex-shrink-0 text-blue-400 dark:text-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Review Step */}
        {isReviewStep ? (
          <ReviewAnswersStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <>
            {/* Step Header */}
            <motion.div
              key={`header-${currentStep}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStepData?.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData?.subtitle}
              </p>
            </motion.div>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              <AnimatePresence mode="wait">
                {currentStepData?.questions
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
            <div className="flex justify-between items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
              >
                {isLastStep ? (
                  <>
                    <span className="hidden sm:inline">Review Answers</span>
                    <span className="sm:hidden">Review</span>
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
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
          </>
        )}
      </div>
    </div>

    {/* Sync Conflict Resolution Modal */}
    {hasSyncConflict && serverDraft && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md shadow-2xl"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Sync Conflict Detected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have progress saved on another device. Which version would you like to keep?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                // Use server version
                setAnswers(serverDraft.answers);
                setCurrentStep(serverDraft.current_step);
                setHasSyncConflict(false);

                // Update localStorage to match server
                localStorage.setItem(`assessment_progress_${sessionId}`, JSON.stringify({
                  answers: serverDraft.answers,
                  step: serverDraft.current_step,
                  timestamp: serverDraft.updated_at
                }));
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Use Server Version (Latest: {new Date(serverDraft.updated_at).toLocaleString()})
            </button>

            <button
              onClick={() => {
                // Keep local version
                setHasSyncConflict(false);
                // Local version will sync on next save
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Keep This Device's Version
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
