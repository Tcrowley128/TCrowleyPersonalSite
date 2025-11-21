'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Target, Zap, TrendingUp, Users, Shield,
  Calendar, Download, Mail, RefreshCw, CheckCircle,
  Lightbulb, BarChart3, X, Edit2, MoreVertical,
  History, FileText, Briefcase, Rocket
} from 'lucide-react';
import {
  OverviewTab,
  QuickWinsTab,
  RecommendationsTab,
  RoadmapTab,
  MaturityTab,
  LongTermVisionTab,
  ChangeManagementTab,
  OperationalAreasTab
} from '@/components/assessment/results/ResultComponents';
import SnakeGame from '@/components/assessment/SnakeGame';
import AssessmentChat, { AssessmentChatHandle } from '@/components/assessment/AssessmentChat';
import AssessmentAnswersEditor from '@/components/assessment/AssessmentAnswersEditor';
import VersionSelector from '@/components/assessment/VersionSelector';
import ResultsSkeleton from '@/components/assessment/ResultsSkeleton';
import Confetti from '@/components/assessment/Confetti';
import { JourneyLoadingScreen } from '@/components/journey/JourneyLoadingScreen';
import { FloatingAIButton } from '@/components/journey/FloatingAIButton';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default function AssessmentResults({ params }: ResultsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [isDownloadingPPTX, setIsDownloadingPPTX] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(2);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showMenuTip, setShowMenuTip] = useState(true);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [hasExistingProjects, setHasExistingProjects] = useState(false);
  const [showJourneyBanner, setShowJourneyBanner] = useState(false);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const chatRef = useRef<AssessmentChatHandle>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const generateResults = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: id, regenerate: false })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate results');
      }

      const data = await response.json();
      console.log('DEBUG - Frontend received from API:', {
        hasResults: !!data.results,
        operational_areas: data.results?.operational_areas,
        operational_areas_type: typeof data.results?.operational_areas,
        operational_areas_isArray: Array.isArray(data.results?.operational_areas),
        operational_areas_length: data.results?.operational_areas?.length
      });
      setResults(data.results);
      setRegenerationCount(data.regeneration_count || 0);
      setRegenerationsRemaining(data.regenerations_remaining ?? 2);

      // Show confetti on first load
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error('Error generating results:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate results');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const checkExistingProjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessment/${id}/projects`);
      if (response.ok) {
        const data = await response.json();
        setHasExistingProjects(data.projects && data.projects.length > 0);
      }
    } catch (err) {
      console.error('Error checking existing projects:', err);
    }
  }, [id]);

  useEffect(() => {
    generateResults();
    checkExistingProjects();
  }, [generateResults, checkExistingProjects]);

  // Check if user has seen journey prompt before
  useEffect(() => {
    if (!results) return;

    const hasSeenJourneyPrompt = localStorage.getItem(`journey-prompt-seen-${id}`);
    const hasStartedJourney = localStorage.getItem(`journey-started-${id}`);

    if (!hasStartedJourney) {
      if (!hasSeenJourneyPrompt) {
        // First time viewing results - show prominent banner
        setShowJourneyBanner(true);
      } else {
        // Returning user who hasn't started journey - show sticky footer
        setShowStickyFooter(true);
      }
    }
  }, [results, id]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    }

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Hide menu tip when menu is opened
  useEffect(() => {
    if (showActionsMenu) {
      setShowMenuTip(false);
    }
  }, [showActionsMenu]);

  const handleRegenerate = async () => {
    if (regenerationCount >= 2) {
      setError('You have reached the maximum of 2 regenerations for this assessment.');
      return;
    }

    // Confirm before regenerating
    const remainingAfter = regenerationsRemaining - 1;
    const confirmMessage = remainingAfter > 0
      ? `This will regenerate your assessment. You will have ${remainingAfter} regeneration${remainingAfter === 1 ? '' : 's'} remaining after this. Continue?`
      : `This is your last regeneration. After this, you won't be able to regenerate again. Continue?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: id, regenerate: true })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setError(errorData.details || 'Regeneration limit reached');
        } else {
          throw new Error(errorData.details || 'Failed to regenerate results');
        }
        return;
      }

      const data = await response.json();
      setResults(data.results);
      setRegenerationCount(data.regeneration_count || 0);
      setRegenerationsRemaining(data.regenerations_remaining ?? 0);
    } catch (err) {
      console.error('Error regenerating results:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismissBanner = () => {
    localStorage.setItem(`journey-prompt-seen-${id}`, 'true');
    setShowJourneyBanner(false);
    setShowStickyFooter(true);
  };

  const handleDismissFooter = () => {
    setShowStickyFooter(false);
  };

  const handleStartJourney = async () => {
    setIsStartingJourney(true);
    setError('');

    // Mark journey as started in localStorage
    localStorage.setItem(`journey-started-${id}`, 'true');
    setShowJourneyBanner(false);
    setShowStickyFooter(false);

    try {
      // If projects already exist, just navigate to the journey page
      if (hasExistingProjects) {
        router.push(`/assessment/journey/${id}`);
        return;
      }

      // Otherwise, generate projects from assessment recommendations
      const response = await fetch(`/api/assessment/${id}/generate-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start journey');
      }

      const data = await response.json();
      console.log(`Created ${data.projects_created} projects from assessment`);

      // Navigate to journey workspace
      router.push(`/assessment/journey/${id}`);
    } catch (err) {
      console.error('Error starting journey:', err);
      setError(err instanceof Error ? err.message : 'Failed to start journey. Please try again.');
      setIsStartingJourney(false);
    }
  };

  const handleDownloadPPTX = async () => {
    setIsDownloadingPPTX(true);
    setPptxProgress('Initializing presentation generator...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const messages = [
          'Analyzing assessment data...',
          'Researching industry benchmarks...',
          'Finding relevant insights...',
          'Creating presentation slides...',
          'Applying design template...',
          'Finalizing your presentation...'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setPptxProgress(randomMessage);
      }, 3000);

      // Use the enhanced endpoint with Claude web search and images
      const response = await fetch(`/api/assessment/${id}/export-pptx-enhanced`);

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to generate PowerPoint presentation');
      }

      setPptxProgress('Downloading presentation...');

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results.company_name?.replace(/[^a-z0-9]/gi, '_') || 'assessment'}_results.pptx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating PowerPoint:', err);
      setError('Failed to generate PowerPoint. Please try again.');
    } finally {
      setIsDownloadingPPTX(false);
      setPptxProgress('');
    }
  };


  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    setPdfProgress('Preparing PDF...');

    try {
      const { toPng } = await import('html-to-image');
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Store original tab
      const originalTab = activeTab;

      // Define all tabs to capture
      const tabsToCapture = [
        { id: 'overview', label: 'Overview' },
        { id: 'operational-areas', label: 'Operational Focus Areas' },
        { id: 'quick-wins', label: 'Quick Wins' },
        { id: 'recommendations', label: 'Tech Recommendations' },
        { id: 'roadmap', label: 'Roadmap' },
        { id: 'maturity', label: 'Maturity Assessment' },
        { id: 'long-term', label: 'Long-term Vision' },
        { id: 'change-mgmt', label: 'Change Management' }
      ];

      setPdfProgress('Creating title page...');

      // ===== TITLE PAGE =====
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 70, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Digital Transformation Roadmap', pageWidth / 2, 30, { align: 'center' });

      if (results.company_name) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(results.company_name, pageWidth / 2, 43, { align: 'center' });
        pdf.setFontSize(11);
        pdf.text('Assessment Results', pageWidth / 2, 53, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 62, { align: 'center' });
      }

      // Capture each tab
      for (let i = 0; i < tabsToCapture.length; i++) {
        const tab = tabsToCapture[i];

        setPdfProgress(`Capturing ${tab.label} (${i + 1}/${tabsToCapture.length})...`);

        // Switch to the tab
        setActiveTab(tab.id);

        // Wait for tab to render (longer wait for complex content)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find the tab content element
        const tabContent = document.querySelector('.p-4.sm\\:p-6.overflow-x-hidden.max-w-full');

        if (tabContent) {
          // Capture the tab as PNG using html-to-image (better CSS support including oklch)
          const imgData = await toPng(tabContent as HTMLElement, {
            quality: 0.95, // Slightly compress for smaller file size
            pixelRatio: 2, // Balance between quality and file size
            backgroundColor: '#ffffff',
            cacheBust: true, // Prevent caching issues
          });

          // Create an image to get dimensions
          const img = new Image();
          img.src = imgData;
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          // Add new page for each tab
          pdf.addPage();

          // Add tab title at top
          pdf.setFillColor(59, 130, 246);
          pdf.rect(0, 0, pageWidth, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(tab.label, pageWidth / 2, 10, { align: 'center' });

          // Calculate image dimensions to fit page
          const imgWidth = pageWidth - 20; // 10mm margin on each side
          const imgHeight = (img.height * imgWidth) / img.width;

          // Check if image fits on one page
          if (imgHeight <= pageHeight - 25) {
            // Single page - add image
            pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
          } else {
            // Multi-page - split the image
            let yPosition = 0;
            let pageCount = 0;
            const pxToMmRatio = imgWidth / img.width; // Conversion ratio

            while (yPosition < img.height) {
              if (pageCount > 0) {
                pdf.addPage();
                // Add tab title on continuation pages
                pdf.setFillColor(59, 130, 246);
                pdf.rect(0, 0, pageWidth, 10, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.text(`${tab.label} (continued)`, pageWidth / 2, 7, { align: 'center' });
              }

              const startY = pageCount === 0 ? 20 : 15;
              const availableHeight = pageHeight - startY - 10; // More margin at bottom

              // Calculate how many pixels we can fit in this page
              const sourceHeightPx = Math.floor(availableHeight / pxToMmRatio);
              const actualSourceHeight = Math.min(sourceHeightPx, img.height - yPosition);

              // Create a temporary canvas for this slice
              const sliceCanvas = document.createElement('canvas');
              sliceCanvas.width = img.width;
              sliceCanvas.height = actualSourceHeight;

              const ctx = sliceCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(
                  img,
                  0, yPosition,
                  img.width, actualSourceHeight,
                  0, 0,
                  img.width, actualSourceHeight
                );

                const sliceImgData = sliceCanvas.toDataURL('image/png');
                const sliceImgHeightMm = actualSourceHeight * pxToMmRatio;
                pdf.addImage(sliceImgData, 'PNG', 10, startY, imgWidth, sliceImgHeightMm);
              }

              yPosition += actualSourceHeight;
              pageCount++;
            }
          }
        }
      }

      // Restore original tab
      setActiveTab(originalTab);

      setPdfProgress('Finalizing PDF...');

      // Add page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      setPdfProgress('Downloading PDF...');

      // Save PDF
      pdf.save(`${results.company_name?.replace(/[^a-z0-9]/gi, '_') || 'assessment'}_results.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
      setPdfProgress('');
    }
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);
    setError('');

    try {
      const response = await fetch('/api/assessment/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: id, recipient_email: email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
        setEmail('');
      }, 2000);
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handler for quick result editing (hybrid approach)
  const handleQuickEdit = async (field: string, value: string, path?: string) => {
    try {
      const response = await fetch(`/api/assessment/${id}/results`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value, path })
      });

      if (!response.ok) {
        throw new Error('Failed to save edit');
      }

      // Update local state to reflect the change
      setResults((prev: any) => {
        if (!prev) return prev;

        // Deep clone to avoid mutation
        let newResults;
        try {
          newResults = JSON.parse(JSON.stringify(prev));
        } catch (error) {
          console.error('Failed to clone results:', error);
          // Fallback to shallow clone
          newResults = { ...prev };
        }

        if (path) {
          // Handle nested updates starting from the field
          // e.g., field="priority_matrix", path="current_state"
          // or field="quick_wins", path="[0].title"
          if (!newResults[field]) {
            console.error('Field not found in results:', field);
            return prev;
          }

          const keys = path.split('.');
          let current: any = newResults[field];

          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];

            // Handle array index at the start like "[0]"
            if (key.startsWith('[')) {
              const match = key.match(/^\[(\d+)\]$/);
              if (match) {
                const index = parseInt(match[1]);
                current = current[index];
              }
            } else {
              // Handle array indices like "items[0]"
              const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
              if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                current = current[arrayKey][index];
              } else {
                current = current[key];
              }
            }
          }

          // Set the final value
          const lastKey = keys[keys.length - 1];
          if (lastKey.startsWith('[')) {
            const match = lastKey.match(/^\[(\d+)\]$/);
            if (match) {
              const index = parseInt(match[1]);
              current[index] = value;
            }
          } else {
            const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
              const arrayKey = arrayMatch[1];
              const index = parseInt(arrayMatch[2]);
              current[arrayKey][index] = value;
            } else {
              current[lastKey] = value;
            }
          }
        } else {
          // Simple field update
          newResults[field] = value;
        }
        return newResults;
      });
    } catch (err) {
      console.error('Error saving edit:', err);
      setError('Failed to save your edit. Please try again.');
      throw err;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'operational-areas', label: 'Focus Areas', icon: Briefcase },
    { id: 'solutions', label: 'Solutions', icon: Zap },
    { id: 'recommendations', label: 'Technology', icon: Lightbulb },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar },
    { id: 'maturity', label: 'Maturity Scores', icon: BarChart3 },
    { id: 'long-term', label: 'Vision', icon: TrendingUp },
    { id: 'change-mgmt', label: 'Change Mgmt', icon: Users }
  ];

  if (isLoading || isGenerating) {
    return (
      <>
        <ResultsSkeleton isRegenerating={isGenerating} />
        {/* Snake game overlay - optional */}
        {showSnakeGame && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Play While You Wait 🎮</h3>
                <button
                  onClick={() => setShowSnakeGame(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              <SnakeGame />
            </div>
          </div>
        )}
        {/* Show snake button - fixed position */}
        {!showSnakeGame && !isGenerating && (
          <button
            onClick={() => setShowSnakeGame(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-lg hover:shadow-xl"
          >
            <span>🎮</span>
            <span className="hidden sm:inline">Play Snake</span>
            <span className="sm:hidden">Snake</span>
          </button>
        )}
      </>
    );
  }

  if (error && !results) {
    return (
      <div className="min-h-screen bg-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something Went Wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={generateResults}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div>No results found</div>;
  }

  const maturityData = results.maturity_assessment || {};
  const quickWins = results.quick_wins || [];
  const roadmap = results.roadmap || {};
  const tier1 = results.tier1_citizen_led || [];
  const tier2 = results.tier2_hybrid || [];
  const tier3 = results.tier3_technical || [];
  const existingOpportunities = results.existing_tool_opportunities || [];
  const changeMgmt = results.change_management_plan || {};
  const projectTracking = results.project_tracking || null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 overflow-x-hidden">
      {showConfetti && <Confetti />}

      {/* Journey Loading Screen */}
      <JourneyLoadingScreen isVisible={isStartingJourney} />

      {/* PDF Generation Progress Toast */}
      {isDownloadingPDF && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px]">
            <Loader2 className="animate-spin flex-shrink-0" size={24} />
            <div>
              <div className="font-semibold text-base">{pdfProgress || 'Generating PDF...'}</div>
              <div className="text-sm text-blue-100 mt-0.5">Please wait, this may take a moment</div>
            </div>
          </div>
        </div>
      )}

      {isDownloadingPPTX && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px]">
            <Loader2 className="animate-spin flex-shrink-0" size={24} />
            <div>
              <div className="font-semibold text-base">{pptxProgress || 'Generating PowerPoint...'}</div>
              <div className="text-sm text-blue-100 mt-0.5">This may take a few minutes</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="text-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              <CheckCircle size={14} className="sm:w-4 sm:h-4" />
              Assessment Complete
            </div>
          </div>

          <div className="relative pr-12 sm:pr-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4">
              <span className="text-gray-900 dark:text-white block sm:inline">{results.company_name || 'Your'}</span>{' '}
              <span className="text-gray-600 dark:text-gray-400 block sm:inline">Digital Transformation Roadmap</span>
            </h1>

            {/* Three-Dot Menu - Positioned in top right, vertically centered with title */}
            <div className="absolute top-0 sm:top-1/2 sm:-translate-y-1/2 right-0 flex-shrink-0" ref={menuRef}>
              <div className="relative">
                {/* Pulsing Tip Icon */}
                {showMenuTip && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse z-10"></div>
                )}

                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 transition-colors"
                  title="More actions"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Dropdown Menu */}
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleStartJourney();
                        setShowActionsMenu(false);
                      }}
                      disabled={isStartingJourney}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-b-2 border-blue-200 dark:border-blue-800"
                    >
                      <Rocket className={`text-blue-600 ${isStartingJourney ? 'animate-bounce' : ''}`} size={18} />
                      <div className="flex-1">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {isStartingJourney
                            ? (hasExistingProjects ? 'Opening Journey...' : 'Starting Journey...')
                            : (hasExistingProjects ? 'Go to Transformation Journey' : 'Start Your Journey')
                          }
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {isStartingJourney
                            ? (hasExistingProjects ? 'Loading your projects...' : 'Creating projects...')
                            : (hasExistingProjects ? 'Continue managing your projects' : 'Track progress and manage projects')
                          }
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadPDF();
                        setShowActionsMenu(false);
                      }}
                      disabled={isDownloadingPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className={isDownloadingPDF ? 'animate-bounce' : ''} size={18} />
                      <div className="flex-1">
                        <div className="font-medium">{isDownloadingPDF ? pdfProgress || 'Generating PDF...' : 'Download PDF'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isDownloadingPDF ? 'Please wait, this may take a moment...' : 'Visual screenshot of each section'}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadPPTX();
                        setShowActionsMenu(false);
                      }}
                      disabled={isDownloadingPPTX}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className={isDownloadingPPTX ? 'animate-bounce' : ''} size={18} />
                      <div className="flex-1">
                        <div className="font-medium">{isDownloadingPPTX ? pptxProgress || 'Generating...' : 'Export to PowerPoint'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isDownloadingPPTX ? 'Please wait, this may take a few minutes...' : 'AI-powered presentation with industry insights'}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 size={18} />
                      <span className="font-medium">Edit Original Answers</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowVersionModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <History size={18} />
                      <span className="font-medium">Restore Old Version</span>
                    </button>
                    <button
                      onClick={() => {
                        handleRegenerate();
                        setShowActionsMenu(false);
                      }}
                      disabled={isGenerating || regenerationCount >= 2}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={isGenerating ? 'animate-spin' : ''} size={18} />
                      <div className="flex-1">
                        <div className="font-medium">Regenerate Results</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isGenerating ? 'Regenerating...' : regenerationCount >= 2 ? 'Limit reached' : `${regenerationsRemaining} remaining`}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Mail size={18} />
                      <span className="font-medium">Email Me Results</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-center">
            Personalized recommendations powered by Tyler's AI
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
            </motion.div>
          )}

          {/* Journey Banner - First time viewers */}
          <AnimatePresence>
            {showJourneyBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-400 dark:border-blue-500 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready to Start Your Transformation Journey?
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        You've reviewed your roadmap - now it's time to take action! Our Journey Management Platform
                        helps you track progress, manage projects, and achieve your digital transformation goals.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleStartJourney}
                          disabled={isStartingJourney}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          <Rocket className={isStartingJourney ? 'animate-bounce' : ''} size={20} />
                          {isStartingJourney
                            ? (hasExistingProjects ? 'Opening Journey...' : 'Starting Journey...')
                            : (hasExistingProjects ? 'Go to Journey' : 'Start Your Journey')
                          }
                        </button>
                        <button
                          onClick={handleDismissBanner}
                          className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                        >
                          Maybe Later
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleDismissBanner}
                      className="flex-shrink-0 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                    >
                      <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* Version Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VersionSelector assessmentId={id} />
        </motion.div>

        {/* Assessment Editor Modal */}
        <AssessmentAnswersEditor
          assessmentId={id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onRegenerateComplete={() => {
            window.location.reload();
          }}
        />

        {/* Version History Modal */}
        <AnimatePresence>
          {showVersionModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowVersionModal(false)}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Version History</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Restore a previous version of your assessment results
                      </p>
                    </div>
                    <button
                      onClick={() => setShowVersionModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6">
                    <VersionSelector assessmentId={id} onVersionRestore={() => setShowVersionModal(false)} />
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div id="results-content" className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            {/* Mobile: Dropdown selector */}
            <div className="md:hidden px-4 py-3">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: Horizontal tabs */}
            <div className="hidden md:flex overflow-x-auto justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors outline-none focus:outline-none ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 overflow-x-hidden max-w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <TabContent key="overview">
                  <OverviewTab
                    maturity={maturityData}
                    priority={results.priority_matrix}
                    quickWinsCount={quickWins.length}
                    onQuickEdit={handleQuickEdit}
                  />
                </TabContent>
              )}

              {activeTab === 'operational-areas' && (
                <TabContent key="operational-areas">
                  <OperationalAreasTab
                    operationalAreas={results.operational_areas || []}
                    results={results}
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                  />
                </TabContent>
              )}

              {activeTab === 'solutions' && (
                <TabContent key="solutions">
                  <QuickWinsTab
                    quickWins={quickWins}
                    operationalAreas={results.operational_areas || []}
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                    onQuickEdit={handleQuickEdit}
                  />
                </TabContent>
              )}

              {activeTab === 'recommendations' && (
                <TabContent key="recommendations">
                  <RecommendationsTab
                    tier1={tier1}
                    tier2={tier2}
                    tier3={tier3}
                    existing={existingOpportunities}
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                  />
                </TabContent>
              )}

              {activeTab === 'roadmap' && (
                <TabContent key="roadmap">
                  <RoadmapTab roadmap={roadmap} onQuickEdit={handleQuickEdit} onAskAI={(message: string) => chatRef.current?.openWithMessage(message)} />
                </TabContent>
              )}

              {activeTab === 'maturity' && (
                <TabContent key="maturity">
                  <MaturityTab
                    maturity={maturityData}
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                  />
                </TabContent>
              )}

              {activeTab === 'long-term' && (
                <TabContent key="long-term">
                  <LongTermVisionTab vision={results.long_term_vision} onQuickEdit={handleQuickEdit} onAskAI={(message: string) => chatRef.current?.openWithMessage(message)} />
                </TabContent>
              )}

              {activeTab === 'change-mgmt' && (
                <TabContent key="change-mgmt">
                  <ChangeManagementTab
                    changeMgmt={changeMgmt}
                    successMetrics={results.success_metrics}
                    projectTracking={projectTracking}
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                    onQuickEdit={handleQuickEdit}
                  />
                </TabContent>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Chat Assistant */}
        <AssessmentChat ref={chatRef} assessmentId={id} />

        {/* Floating AI Button */}
        <FloatingAIButton
          onClick={() => chatRef.current?.openWithMessage("")}
        />

        {/* Sticky Footer - Returning users */}
        <AnimatePresence>
          {showStickyFooter && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-t-2 border-blue-500 dark:border-blue-400 shadow-2xl backdrop-blur-sm"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center flex-shrink-0 shadow-md">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Ready to take action on your roadmap?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                        Track progress and manage your transformation projects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartJourney}
                      disabled={isStartingJourney}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 whitespace-nowrap"
                    >
                      <Rocket className={isStartingJourney ? 'animate-bounce' : ''} size={18} />
                      {isStartingJourney
                        ? 'Starting...'
                        : (hasExistingProjects ? 'Go to Journey' : 'Start Journey')
                      }
                    </button>
                    <button
                      onClick={handleDismissFooter}
                      className="p-2 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded transition-colors"
                      title="Dismiss"
                    >
                      <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEmailModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="text-blue-600" />
                  Email Your Roadmap
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {emailSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Email Sent Successfully!</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Check your inbox for your roadmap summary.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Enter your email address to receive a summary of your digital transformation roadmap.
                  </p>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendEmail()}
                  />

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={20} />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab Content Wrapper with Animation
function TabContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
