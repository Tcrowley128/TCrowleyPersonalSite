'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Kanban, AlertTriangle, Users, FolderKanban, HelpCircle, Rocket } from 'lucide-react';

interface IntroductionTourProps {
  onComplete: () => void;
  onChangeSection?: (section: 'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration') => void;
}

interface Hotspot {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  section: 'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration';
  selector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export default function IntroductionTour({ onComplete, onChangeSection }: IntroductionTourProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [completedHotspots, setCompletedHotspots] = useState<Set<string>>(new Set());
  const [showCongrats, setShowCongrats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration'>('projects');
  const [showBanner, setShowBanner] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);

  // Start on the projects section when tour begins
  useEffect(() => {
    if (onChangeSection) {
      onChangeSection('projects');
    }
    setCurrentSection('projects');
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setMounted(true);
    }, 500);
  }, [onChangeSection]);

  const hotspots: Hotspot[] = [
    {
      id: '1-projects',
      title: 'Projects Overview',
      description: 'This is your central hub for all transformation projects. View, filter, and manage all your initiatives in one place. Track status, priority, and progress across your entire portfolio.',
      icon: <FolderKanban className="w-6 h-6" />,
      section: 'projects',
      selector: '.project-list',
      position: 'top',
    },
    {
      id: '2-dashboard',
      title: 'Executive Dashboard',
      description: 'Get a high-level view of your transformation ROI, total savings, and break-even timeline. These metrics update in real-time as you complete projects and track progress.',
      icon: <BarChart3 className="w-6 h-6" />,
      section: 'dashboard',
      selector: '.dashboard-metrics',
      position: 'bottom',
    },
    {
      id: '3-sprints',
      title: 'Sprint Management',
      description: 'Manage your active projects using agile methodology. Create sprints, manage product backlog items (PBIs), track velocity, and keep your team aligned on deliverables.',
      icon: <Kanban className="w-6 h-6" />,
      section: 'sprints',
      selector: '.sprint-management',
      position: 'top',
    },
    {
      id: '4-risks',
      title: 'Risk Overview',
      description: 'Monitor and manage risks across all projects. Identify potential blockers early, add mitigation strategies, and keep your transformation on track.',
      icon: <AlertTriangle className="w-6 h-6" />,
      section: 'risks',
      selector: '.risk-overview',
      position: 'top',
    },
    {
      id: '5-collaboration',
      title: 'Team Collaboration',
      description: 'Stay connected with your team! View activity feeds, share updates, mention colleagues, and track who\'s working on what. Keep everyone aligned on the transformation journey.',
      icon: <Users className="w-6 h-6" />,
      section: 'collaboration',
      selector: '.team-collaboration-tab',
      position: 'bottom',
    },
  ];

  const handleStartTour = () => {
    setShowBanner(false);
    setTourStarted(true);
    // Start with the first hotspot
    const firstHotspot = hotspots[0];
    if (firstHotspot) {
      if (onChangeSection && firstHotspot.section !== currentSection) {
        onChangeSection(firstHotspot.section);
        setCurrentSection(firstHotspot.section);
      }
      setTimeout(() => {
        setActiveHotspot(firstHotspot.id);
      }, 300);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    onComplete(); // Mark as seen so it doesn't show again
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    // Change to the appropriate section
    if (onChangeSection && hotspot.section !== currentSection) {
      onChangeSection(hotspot.section);
      setCurrentSection(hotspot.section);
    }

    // Wait a moment for section to render, then show the popup
    setTimeout(() => {
      setActiveHotspot(hotspot.id);
    }, 300);
  };

  const handleClosePopup = () => {
    if (activeHotspot) {
      setCompletedHotspots(prev => new Set([...prev, activeHotspot]));
      setActiveHotspot(null);

      // Check if all hotspots are completed
      if (completedHotspots.size + 1 === hotspots.length) {
        setShowCongrats(true);
      }
    }
  };

  const handleNextTip = () => {
    if (activeHotspot) {
      const currentIndex = hotspots.findIndex(h => h.id === activeHotspot);
      setCompletedHotspots(prev => new Set([...prev, activeHotspot]));

      // Find next incomplete hotspot
      const nextHotspot = hotspots.find((h, i) => i > currentIndex && !completedHotspots.has(h.id));

      if (nextHotspot) {
        // Switch section if needed
        if (nextHotspot.section !== currentSection) {
          if (onChangeSection) {
            onChangeSection(nextHotspot.section);
          }
          setCurrentSection(nextHotspot.section);
        }

        // Wait for DOM to update, then show next tip
        setTimeout(() => {
          setActiveHotspot(nextHotspot.id);
        }, 400);
      } else {
        // All done!
        setActiveHotspot(null);
        setShowCongrats(true);
      }
    }
  };

  const handleFinish = () => {
    setShowCongrats(false);
    onComplete();
  };

  // Get position for hotspot indicator
  const getHotspotPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY + rect.height / 2 - 20,
      left: rect.left + window.scrollX + rect.width / 2 - 20,
    };
  };

  // Get position for popup
  const getPopupPosition = (selector: string, position: string) => {
    const element = document.querySelector(selector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const popupWidth = 400;
    const popupHeight = 200;
    const offset = 20;

    switch (position) {
      case 'top':
        return {
          top: rect.top + window.scrollY - popupHeight - offset,
          left: rect.left + window.scrollX + rect.width / 2 - popupWidth / 2,
        };
      case 'bottom':
        return {
          top: rect.top + window.scrollY + rect.height + offset,
          left: rect.left + window.scrollX + rect.width / 2 - popupWidth / 2,
        };
      case 'left':
        return {
          top: rect.top + window.scrollY + rect.height / 2 - popupHeight / 2,
          left: rect.left + window.scrollX - popupWidth - offset,
        };
      case 'right':
        return {
          top: rect.top + window.scrollY + rect.height / 2 - popupHeight / 2,
          left: rect.left + window.scrollX + rect.width + offset,
        };
      default:
        return {
          top: rect.top + window.scrollY + rect.height + offset,
          left: rect.left + window.scrollX + rect.width / 2 - popupWidth / 2,
        };
    }
  };

  const activeHotspotData = hotspots.find(h => h.id === activeHotspot);
  // Only show hotspots for the current section that haven't been completed
  const remainingHotspots = hotspots.filter(h =>
    !completedHotspots.has(h.id) &&
    h.id !== activeHotspot &&
    h.section === currentSection
  );

  // Check if there's a next hotspot
  const currentIndex = activeHotspotData ? hotspots.findIndex(h => h.id === activeHotspotData.id) : -1;
  const hasNextTip = currentIndex >= 0 && currentIndex < hotspots.length - 1;

  // Don't render until mounted
  if (!mounted) return null;

  return (
    <>
      {/* Welcome Banner - Fixed at top */}
      <AnimatePresence>
        {showBanner && !tourStarted && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-3xl z-[9998] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-2xl overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 opacity-20 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200 dark:bg-purple-800 opacity-20 rounded-full -ml-12 -mb-12" />

            {/* Content */}
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Welcome to Your Transformation Journey! 🎉
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Take a quick guided tour to discover all the powerful features at your fingertips. Learn how to manage projects, track progress, and drive your digital transformation forward.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartTour}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <Rocket className="w-4 h-4" />
                    Start Tour
                  </button>
                  <button
                    onClick={handleDismissBanner}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  You can restart this tour anytime using the help (?) button in the top right
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismissBanner}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Popup */}
      <AnimatePresence>
        {activeHotspotData && (() => {
          const position = getPopupPosition(activeHotspotData.selector, activeHotspotData.position);
          if (!position) return null;

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[9997]"
                onClick={handleClosePopup}
              />

              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                style={{
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                  zIndex: 9999,
                  width: '400px',
                }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6"
              >
                {/* Close button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Icon and Title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {activeHotspotData.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {activeHotspotData.title}
                    </h3>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full inline-block">
                      {completedHotspots.size + 1} of {hotspots.length}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {activeHotspotData.description}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {hasNextTip ? (
                    <>
                      <button
                        onClick={handleClosePopup}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        onClick={handleNextTip}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        Next Tip →
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleClosePopup}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Finish Tour
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Congratulations Modal */}
      <AnimatePresence>
        {showCongrats && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              {/* Celebration icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                You're All Set!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You've explored all the key features of your transformation workspace. Ready to start managing your digital transformation journey?
              </p>

              <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Start Transforming
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
