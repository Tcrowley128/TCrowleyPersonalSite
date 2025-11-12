import { Rocket, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JourneyLoadingScreenProps {
  isVisible: boolean;
}

export function JourneyLoadingScreen({ isVisible }: JourneyLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Analyzing assessment recommendations...', duration: 1500 },
    { label: 'Identifying high-impact projects...', duration: 2000 },
    { label: 'Creating project roadmap...', duration: 1500 },
    { label: 'Generating tasks and milestones...', duration: 2000 },
    { label: 'Finalizing your transformation journey...', duration: 1000 }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    steps.forEach((step, index) => {
      cumulativeTime += step.duration;
      const timer = setTimeout(() => {
        setCurrentStep(index + 1);
      }, cumulativeTime);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-blue-500 max-w-md w-96 p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Rocket className="w-16 h-16 text-blue-600 animate-bounce" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Starting Your Journey
        </h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          Building your transformation roadmap
        </p>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={index} className="flex items-start gap-3">
                {/* Step Indicator */}
                <div className="flex-shrink-0 mt-1">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>

                {/* Step Label */}
                <div className={`flex-1 transition-all text-sm ${
                  isComplete
                    ? 'text-gray-600 dark:text-gray-400'
                    : isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {currentStep} of {steps.length} steps completed
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
