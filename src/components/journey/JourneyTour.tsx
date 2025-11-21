'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep, Driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import './journey-tour.css';

interface JourneyTourProps {
  assessmentId: string;
  run: boolean;
  onComplete: () => void;
  onChangeSection?: (section: 'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration') => void;
}

export default function JourneyTour({ assessmentId, run, onComplete, onChangeSection }: JourneyTourProps) {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (!run) {
      // Clean up driver if tour is stopped
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    // Define tour steps
    const steps: DriveStep[] = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Your Transformation Journey! 🚀',
          description: 'This is your command center for managing digital transformation projects. Let\'s take a quick tour!',
          side: 'over',
          align: 'center',
        },
      },
      {
        element: '.dashboard-metrics',
        popover: {
          title: 'Executive Dashboard 📊',
          description: 'Track your ROI, savings, and break-even timeline at a glance. These metrics update in real-time as you complete projects.',
          side: 'bottom',
        },
      },
      {
        element: '.gantt-chart',
        popover: {
          title: 'Visual Timeline 📅',
          description: 'See your project schedule at a glance with the Gantt chart. Hover over bars to see details, and watch for overdue projects marked in red.',
          side: 'top',
        },
      },
      {
        element: '.project-list',
        popover: {
          title: 'Your Projects 📋',
          description: 'All your transformation projects are listed here. Click any project to view details, manage tasks, and track progress.',
          side: 'top',
        },
      },
      {
        element: '.project-filters',
        popover: {
          title: 'Smart Filters 🔍',
          description: 'Filter projects by status, priority, or operational area to focus on what matters most.',
          side: 'top',
        },
      },
      {
        element: '.sprint-management',
        popover: {
          title: 'Sprint Management 🏃',
          description: 'This is where the magic happens! Manage active projects using agile sprint methodology. Only "In Progress" projects appear here.',
          side: 'top',
        },
      },
      {
        element: '.sprint-project-grid',
        popover: {
          title: 'Sprint Project Cards 📇',
          description: 'Click any project card to dive into sprint planning, manage your product backlog (PBIs), create tasks, and track velocity. Each project has its own dedicated sprint workspace.',
          side: 'top',
        },
      },
      {
        element: '.risk-overview',
        popover: {
          title: 'Risk Management ⚠️',
          description: 'Monitor and manage risks across all projects. Click to view details and add mitigation strategies.',
          side: 'top',
        },
      },
      {
        element: '.team-collaboration-tab',
        popover: {
          title: 'Team Collaboration 👥',
          description: 'Collaborate with your team! View team activity, share updates, mention colleagues, and track who\'s working on what. Keep everyone aligned on the transformation journey.',
          side: 'bottom',
        },
      },
      {
        element: 'body',
        popover: {
          title: 'You\'re All Set! 🎉',
          description: 'You can restart this tour anytime by clicking the help icon (?). Ready to transform your organization?',
          side: 'over',
          align: 'center',
        },
      },
    ];

    // Helper function to change section based on step index
    const changeSectionForStep = (stepIndex: number) => {
      const targetSection = getSectionForStep(stepIndex);
      if (targetSection && onChangeSection) {
        onChangeSection(targetSection);
      }
    };

    // Helper function to get section for a step
    const getSectionForStep = (index: number): 'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration' | null => {
      const step = steps[index];
      if (!step || !step.element) return null;

      const element = step.element as string;

      if (element === '.dashboard-metrics' || element === '.gantt-chart') {
        return 'dashboard';
      } else if (element === '.project-list' || element === '.project-filters') {
        return 'projects';
      } else if (element === '.sprint-management' || element === '.sprint-project-grid') {
        return 'sprints';
      } else if (element === '.risk-overview') {
        return 'risks';
      } else if (element === '.team-collaboration-tab') {
        return 'collaboration';
      }
      return null;
    };

    // Driver.js configuration
    const driverConfig: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps,
      onHighlightStarted: (element, step, options) => {
        // This fires BEFORE Driver.js tries to find the element
        // Change section and return a promise that resolves after DOM updates
        const currentIndex = options.state.activeIndex || 0;
        console.log('About to highlight step:', currentIndex, step);

        changeSectionForStep(currentIndex);

        // Return a promise that waits for the DOM to update
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('DOM should be ready for step:', currentIndex);
            resolve();
          }, 700); // Wait 700ms for section change and render
        });
      },
      onHighlighted: (element, step, options) => {
        // Confirmation that step was highlighted
        const currentIndex = options.state.activeIndex || 0;
        console.log('Step highlighted successfully:', currentIndex);
      },
      onDestroyStarted: () => {
        // Tour completed or closed
        if (driverRef.current) {
          driverRef.current.destroy();
          driverRef.current = null;
        }
        // Return to projects section
        if (onChangeSection) {
          onChangeSection('projects');
        }
        onComplete();
      },
      popoverClass: 'journey-tour-popover',
      // Wait for elements to appear (important for dynamic content)
      allowClose: true,
      overlayClickNext: false,
      smoothScroll: true,
      stagePadding: 10,
      stageRadius: 12,
      // Allow time for elements to render
      onPopoverRender: (popover, { config, state }) => {
        // Custom styling if needed
        const progressText = popover.progress;
        if (progressText) {
          progressText.innerText = `${state.activeIndex + 1} of ${config.steps?.length || 0}`;
        }
      },
    };

    // Initialize driver
    const driverObj = driver(driverConfig);
    driverRef.current = driverObj;

    // Start the tour
    driverObj.drive();

    // Cleanup on unmount
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [run, assessmentId, onComplete, onChangeSection]);

  // No UI to render - Driver.js handles everything
  return null;
}
