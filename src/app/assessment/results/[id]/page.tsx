'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Target, Zap, TrendingUp, Users, Shield,
  Calendar, Download, Mail, RefreshCw, CheckCircle,
  Lightbulb, BarChart3, Rocket
} from 'lucide-react';
import {
  OverviewTab,
  QuickWinsTab,
  RecommendationsTab,
  RoadmapTab,
  MaturityTab,
  LongTermVisionTab,
  ChangeManagementTab
} from '@/components/assessment/results/ResultComponents';
import SnakeGame from '@/components/assessment/SnakeGame';
import AssessmentChat, { AssessmentChatHandle } from '@/components/assessment/AssessmentChat';
import AssessmentAnswersEditor from '@/components/assessment/AssessmentAnswersEditor';
import VersionSelector from '@/components/assessment/VersionSelector';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default function AssessmentResults({ params }: ResultsPageProps) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(2);
  const chatRef = useRef<AssessmentChatHandle>(null);

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
      setResults(data.results);
      setRegenerationCount(data.regeneration_count || 0);
      setRegenerationsRemaining(data.regenerations_remaining ?? 2);
    } catch (err) {
      console.error('Error generating results:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate results');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    generateResults();
  }, [generateResults]);

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

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);

    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPos = 20;

      // Helper to check if we need a new page
      const checkPageBreak = (additionalHeight: number) => {
        if (yPos + additionalHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to add section header
      const addSectionHeader = (title: string) => {
        checkPageBreak(20);
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, yPos, maxWidth, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 2, yPos + 7);
        pdf.setTextColor(0, 0, 0);
        yPos += 15;
      };

      // Helper to add training resources with clickable links
      const addTrainingResources = (resources: any[]) => {
        if (!resources || resources.length === 0) return;

        checkPageBreak(15);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('Training Resources:', margin + 2, yPos);
        yPos += 5;

        resources.forEach((resource: any) => {
          checkPageBreak(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(59, 130, 246); // Blue color for links
          const resourceText = `• ${resource.title}${resource.duration ? ` (${resource.duration})` : ''}`;
          pdf.textWithLink(resourceText, margin + 4, yPos, { url: resource.url });
          pdf.setTextColor(0, 0, 0);
          yPos += 4;
        });
        yPos += 3;
      };

      // ===== TITLE PAGE =====
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 70, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Digital Transformation Roadmap', pageWidth / 2, 30, { align: 'center' });

      // Add company name if available
      if (results.company_name) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(results.company_name, pageWidth / 2, 43, { align: 'center' });
        pdf.setFontSize(11);
        pdf.text('Your Personalized Recommendations', pageWidth / 2, 53, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 62, { align: 'center' });
      } else {
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Your Personalized Recommendations', pageWidth / 2, 48, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 58, { align: 'center' });
      }

      // ===== TABLE OF CONTENTS =====
      pdf.setTextColor(0, 0, 0);
      yPos = 85;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Table of Contents', margin, yPos);
      yPos += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const existingOpportunitiesCount = results.existing_tool_opportunities?.length || 0;
      const tocItems = [
        { title: 'Executive Summary', page: 2 },
        { title: 'Digital Maturity Assessment', page: 2 },
        { title: 'Quick Wins - 30-Day Actions', page: 3 },
        { title: 'Hidden Gems - Underutilized Features', page: results.quick_wins?.length > 0 ? 4 : 3 },
        { title: 'Technology Recommendations', page: existingOpportunitiesCount > 0 ? 5 : 4 },
        { title: '90-Day Transformation Roadmap', page: existingOpportunitiesCount > 0 ? 6 : 5 },
        { title: 'Long-Term Vision (1-3 Years)', page: existingOpportunitiesCount > 0 ? 7 : 6 },
        { title: 'Change Management & Training', page: existingOpportunitiesCount > 0 ? 8 : 7 },
        { title: 'Success Metrics & KPIs', page: existingOpportunitiesCount > 0 ? 9 : 8 }
      ];

      tocItems.forEach((item) => {
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${item.title}`, margin + 3, yPos);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${item.page}`, pageWidth - margin - 10, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 7;
      });

      yPos += 5;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Note: Page numbers are approximate and may vary based on content length', margin, yPos);
      pdf.setTextColor(0, 0, 0);

      // ===== EXECUTIVE SUMMARY =====
      pdf.addPage();
      yPos = margin;
      addSectionHeader('Executive Summary');

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      if (results.priority_matrix) {
        // Current State
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPos, maxWidth, 8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(59, 130, 246);
        pdf.text('CURRENT STATE', margin + 3, yPos + 6);
        pdf.setTextColor(0, 0, 0);
        yPos += 11;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const currentLines = pdf.splitTextToSize(results.priority_matrix.current_state || '', maxWidth - 4);
        pdf.text(currentLines, margin + 2, yPos);
        yPos += currentLines.length * 5 + 6;
        checkPageBreak(20);

        // Key Opportunity
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPos, maxWidth, 8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(59, 130, 246);
        pdf.text('KEY OPPORTUNITY', margin + 3, yPos + 6);
        pdf.setTextColor(0, 0, 0);
        yPos += 11;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const oppLines = pdf.splitTextToSize(results.priority_matrix.key_opportunity || '', maxWidth - 4);
        pdf.text(oppLines, margin + 2, yPos);
        yPos += oppLines.length * 5 + 6;
        checkPageBreak(20);

        // Recommended Starting Point
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, yPos, maxWidth, 8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(59, 130, 246);
        pdf.text('RECOMMENDED STARTING POINT', margin + 3, yPos + 6);
        pdf.setTextColor(0, 0, 0);
        yPos += 11;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const startLines = pdf.splitTextToSize(results.priority_matrix.recommended_starting_point || '', maxWidth - 4);
        pdf.text(startLines, margin + 2, yPos);
        yPos += startLines.length * 5 + 8;
      }

      // ===== MATURITY ASSESSMENT =====
      addSectionHeader('Digital Maturity Assessment');

      const maturityData = results.maturity_assessment || {};
      const pillars = [
        { key: 'data_strategy', title: 'Data Strategy', data: maturityData.data_strategy },
        { key: 'automation_strategy', title: 'Automation Strategy', data: maturityData.automation_strategy },
        { key: 'ai_strategy', title: 'AI Strategy', data: maturityData.ai_strategy },
        { key: 'people_strategy', title: 'People & Change', data: maturityData.people_strategy }
      ];

      pillars.forEach((pillar) => {
        checkPageBreak(35);

        // Color-coded header based on score
        const score = pillar.data?.score || 0;
        if (score >= 4) {
          pdf.setFillColor(34, 197, 94); // Green
        } else if (score >= 3) {
          pdf.setFillColor(234, 179, 8); // Yellow
        } else {
          pdf.setFillColor(239, 68, 68); // Red
        }

        pdf.roundedRect(margin, yPos, maxWidth, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(`${pillar.title}: ${score}/5`, margin + 3, yPos + 7);
        pdf.setTextColor(0, 0, 0);
        yPos += 13;

        if (pillar.data?.gap_analysis) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const gapLines = pdf.splitTextToSize(pillar.data.gap_analysis, maxWidth);
          pdf.text(gapLines, margin + 2, yPos);
          yPos += gapLines.length * 4 + 5;
        }

        // Add sub-categories if available
        if (pillar.data?.sub_categories && pillar.data.sub_categories.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.text('Detailed Breakdown:', margin + 2, yPos);
          yPos += 5;

          pillar.data.sub_categories.forEach((subCat: any) => {
            checkPageBreak(20);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text(`• ${subCat.name}: ${subCat.score || 0}/5`, margin + 4, yPos);
            yPos += 4;

            if (subCat.best_practices) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(7);
              pdf.setTextColor(59, 130, 246); // Blue
              pdf.text(`Best Practice: ${subCat.best_practices}`, margin + 6, yPos);
              pdf.setTextColor(0, 0, 0);
              yPos += 4;
            }

            if (subCat.quick_win) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(7);
              pdf.setTextColor(34, 197, 94); // Green
              pdf.text(`Quick Win: ${subCat.quick_win}`, margin + 6, yPos);
              pdf.setTextColor(0, 0, 0);
              yPos += 5;
            }
          });
          yPos += 3;
        }

        if (pillar.data?.target) {
          checkPageBreak(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(59, 130, 246);
          pdf.text('90-Day Target:', margin + 2, yPos);
          yPos += 5;

          pdf.setFillColor(219, 234, 254); // Light blue background
          const targetLines = pdf.splitTextToSize(pillar.data.target, maxWidth - 8);
          const boxHeight = (targetLines.length * 4) + 4;
          pdf.roundedRect(margin, yPos - 2, maxWidth, boxHeight, 1, 1, 'F');

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.text(targetLines, margin + 3, yPos + 2);
          yPos += boxHeight + 5;
        } else {
          yPos += 5;
        }
      });

      // ===== QUICK WINS =====
      pdf.addPage();
      yPos = margin;
      addSectionHeader('Quick Wins - 30-Day Actions');

      const quickWins = results.quick_wins || [];
      quickWins.forEach((win: any, index: number) => {
        checkPageBreak(55);

        // Header with number badge
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 3, yPos + 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text(`${index + 1}`, margin + 3, yPos + 4, { align: 'center' });

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.text(win.title, margin + 8, yPos + 4);
        yPos += 10;

        // Light gray background box
        pdf.setFillColor(250, 250, 250);
        pdf.setDrawColor(220, 220, 220);
        const descLines = pdf.splitTextToSize(win.description, maxWidth - 8);
        const contentHeight = descLines.length * 5 + 15;
        pdf.roundedRect(margin, yPos, maxWidth, contentHeight, 2, 2, 'FD');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(descLines, margin + 3, yPos + 5);
        yPos += descLines.length * 5 + 8;

        // Metadata in smaller text
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Time: ${win.time_to_implement}`, margin + 3, yPos);
        pdf.text(`Saves: ${win.estimated_time_saved}`, margin + 50, yPos);
        if (win.difficulty) {
          pdf.text(`Difficulty: ${win.difficulty}`, margin + 100, yPos);
        }
        pdf.setTextColor(0, 0, 0);
        yPos += 5;

        pdf.setDrawColor(0, 0, 0); // Reset draw color

        // Add training resources
        if (win.training_resources && win.training_resources.length > 0) {
          addTrainingResources(win.training_resources);
        }

        yPos += 5;
      });

      // ===== EXISTING TOOL OPPORTUNITIES =====
      const existingOpportunities = results.existing_tool_opportunities || [];
      if (existingOpportunities.length > 0) {
        pdf.addPage();
        yPos = margin;
        addSectionHeader('Hidden Gems - Underutilized Features');

        existingOpportunities.forEach((opp: any, index: number) => {
          checkPageBreak(35);

          // Tool name header
          pdf.setFillColor(255, 248, 225); // Light yellow
          pdf.setDrawColor(240, 200, 80);
          pdf.roundedRect(margin, yPos, maxWidth, 9, 1, 1, 'FD');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(`${opp.tool} - ${opp.feature}`, margin + 3, yPos + 6);
          yPos += 11;

          // Use case
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const useCaseLines = pdf.splitTextToSize(opp.use_case, maxWidth - 4);
          pdf.text(useCaseLines, margin + 2, yPos);
          yPos += useCaseLines.length * 4.5 + 4;

          // Impact badge
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(34, 197, 94);
          pdf.text(`Impact: ${opp.impact}`, margin + 2, yPos);
          pdf.setTextColor(0, 0, 0);
          yPos += 7;

          pdf.setDrawColor(0, 0, 0); // Reset draw color
        });
      }

      // ===== TECHNOLOGY RECOMMENDATIONS =====
      pdf.addPage();
      yPos = margin;
      addSectionHeader('Technology Recommendations');

      const addToolSection = (title: string, tools: any[]) => {
        if (tools && tools.length > 0) {
          checkPageBreak(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text(title, margin, yPos);
          yPos += 7;

          tools.forEach((tool: any) => {
            checkPageBreak(35);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text(`• ${tool.name}`, margin + 2, yPos);
            yPos += 5;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const whyLines = pdf.splitTextToSize(tool.why_recommended || tool.description, maxWidth - 5);
            pdf.text(whyLines, margin + 5, yPos);
            yPos += whyLines.length * 4 + 2;

            // Add cost and difficulty if available
            if (tool.cost || tool.difficulty) {
              pdf.setFontSize(7);
              pdf.text(`Cost: ${tool.cost || 'N/A'} | Difficulty: ${tool.difficulty || 'N/A'}`, margin + 5, yPos);
              yPos += 3;
            }

            // Add training resources
            if (tool.training_resources && tool.training_resources.length > 0) {
              addTrainingResources(tool.training_resources);
            }

            yPos += 4;
          });
          yPos += 3;
        }
      };

      addToolSection('Citizen-Led Solutions (No IT Required)', results.tier1_citizen_led);
      addToolSection('Hybrid Solutions (Business + IT)', results.tier2_hybrid);
      addToolSection('Technical/Enterprise Solutions', results.tier3_technical);

      // ===== 90-DAY ROADMAP =====
      pdf.addPage();
      yPos = margin;
      addSectionHeader('90-Day Transformation Roadmap');

      const roadmap = results.roadmap || {};
      const months = [
        { key: 'month_1', title: 'Days 1-30: Foundation', data: roadmap.month_1 },
        { key: 'month_2', title: 'Days 31-60: Scale', data: roadmap.month_2 },
        { key: 'month_3', title: 'Days 61-90: Optimize', data: roadmap.month_3 }
      ];

      months.forEach((month) => {
        if (month.data) {
          checkPageBreak(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text(month.title, margin, yPos);
          yPos += 7;

          if (month.data.focus) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('Focus:', margin + 2, yPos);
            yPos += 4;
            pdf.setFont('helvetica', 'normal');
            const focusLines = pdf.splitTextToSize(month.data.focus, maxWidth - 5);
            pdf.text(focusLines, margin + 5, yPos);
            yPos += focusLines.length * 4 + 4;
          }

          if (month.data.actions && month.data.actions.length > 0) {
            month.data.actions.forEach((action: any) => {
              checkPageBreak(15);
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(9);
              pdf.text(`Week ${action.week}: ${action.action}`, margin + 2, yPos);
              yPos += 4;
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(8);
              pdf.text(`Owner: ${action.owner} | Outcome: ${action.outcome}`, margin + 5, yPos);
              yPos += 5;
            });
          }
          yPos += 4;
        }
      });

      // ===== LONG-TERM VISION =====
      if (results.long_term_vision) {
        pdf.addPage();
        yPos = margin;
        addSectionHeader('Long-Term Vision (1-3 Years)');

        const vision = results.long_term_vision;

        if (vision.year_1_goals) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('Year 1 Goals', margin, yPos);
          yPos += 7;

          Object.entries(vision.year_1_goals).forEach(([key, value]: [string, any]) => {
            checkPageBreak(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, margin + 2, yPos);
            yPos += 4;
            pdf.setFont('helvetica', 'normal');
            const goalLines = pdf.splitTextToSize(value, maxWidth - 5);
            pdf.text(goalLines, margin + 5, yPos);
            yPos += goalLines.length * 4 + 4;
          });
        }

        if (vision.year_2_3_aspirations) {
          checkPageBreak(15);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('Years 2-3 Aspirations', margin, yPos);
          yPos += 7;

          Object.entries(vision.year_2_3_aspirations).forEach(([key, value]: [string, any]) => {
            checkPageBreak(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, margin + 2, yPos);
            yPos += 4;
            pdf.setFont('helvetica', 'normal');
            const aspLines = pdf.splitTextToSize(value, maxWidth - 5);
            pdf.text(aspLines, margin + 5, yPos);
            yPos += aspLines.length * 4 + 4;
          });
        }
      }

      // ===== CHANGE MANAGEMENT =====
      const changeMgmt = results.change_management_plan || {};
      if (Object.keys(changeMgmt).length > 0) {
        pdf.addPage();
        yPos = margin;
        addSectionHeader('Change Management & Training');

        const changeSections = [
          { key: 'communication_strategy', title: 'Communication Strategy' },
          { key: 'stakeholder_engagement', title: 'Stakeholder Engagement' },
          { key: 'training_approach', title: 'Training Approach' },
          { key: 'pilot_recommendations', title: 'Pilot Recommendations' }
        ];

        changeSections.forEach((section) => {
          if (changeMgmt[section.key]) {
            checkPageBreak(15);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(section.title, margin, yPos);
            yPos += 6;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const sectionLines = pdf.splitTextToSize(changeMgmt[section.key], maxWidth);
            pdf.text(sectionLines, margin, yPos);
            yPos += sectionLines.length * 4 + 6;
          }
        });
      }

      // ===== SUCCESS METRICS =====
      if (results.success_metrics) {
        pdf.addPage();
        yPos = margin;
        addSectionHeader('Success Metrics & KPIs');

        const metrics = results.success_metrics;
        ['30_day_kpis', '60_day_kpis', '90_day_kpis'].forEach((period) => {
          if (metrics[period] && metrics[period].length > 0) {
            checkPageBreak(15);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(period.replace('_', ' ').replace('day', 'Day').toUpperCase(), margin, yPos);
            yPos += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            metrics[period].forEach((kpi: string) => {
              checkPageBreak(6);
              pdf.text(`• ${kpi}`, margin + 2, yPos);
              yPos += 4;
            });
            yPos += 4;
          }
        });
      }

      // ===== FOOTER ON EVERY PAGE =====
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Digital Transformation Roadmap | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`digital-transformation-roadmap-${id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
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
        const newResults = JSON.parse(JSON.stringify(prev));

        if (path) {
          // Handle nested updates starting from the field
          // e.g., field="priority_matrix", path="current_state"
          // or field="quick_wins", path="items[0].title"
          if (!newResults[field]) {
            console.error('Field not found in results:', field);
            return prev;
          }

          const keys = path.split('.');
          let current: any = newResults[field];

          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            // Handle array indices like items[0]
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
              const arrayKey = arrayMatch[1];
              const index = parseInt(arrayMatch[2]);
              current = current[arrayKey][index];
            } else {
              current = current[key];
            }
          }

          // Set the final value
          const lastKey = keys[keys.length - 1];
          const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
          if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            current[arrayKey][index] = value;
          } else {
            current[lastKey] = value;
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
    { id: 'quick-wins', label: 'Quick Wins', icon: Zap },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar },
    { id: 'maturity', label: 'Maturity', icon: BarChart3 },
    { id: 'long-term', label: 'Long-term Vision', icon: Rocket },
    { id: 'change-mgmt', label: 'Change Management', icon: Users }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analyzing Your Assessment...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Claude is generating your personalized roadmap. This may take a few minutes.
            </p>

            {/* Button to show snake game */}
            {!showSnakeGame ? (
              <button
                onClick={() => setShowSnakeGame(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md"
              >
                <span>🎮</span>
                <span>Play Snake While You Wait</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSnakeGame(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all text-sm"
              >
                <span>Hide Game</span>
              </button>
            )}
          </div>

          {/* Snake game - only shown when button is clicked */}
          {showSnakeGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <SnakeGame />
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle size={16} />
            Assessment Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">{results.company_name || 'Your'}</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">Digital Transformation Roadmap</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || regenerationCount >= 2}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={isGenerating ? 'animate-spin' : ''} size={20} />
              {isGenerating ? 'Regenerating...' : regenerationCount >= 2 ? 'Regeneration Limit Reached' : `Regenerate (${regenerationsRemaining} left)`}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={isDownloadingPDF ? 'animate-bounce' : ''} size={20} />
              {isDownloadingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-blue-600 transition-colors"
            >
              <Mail size={20} />
              Email Me
            </button>
          </div>
        </motion.div>

        {/* Version Selector & Assessment Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VersionSelector assessmentId={id} />
          <AssessmentAnswersEditor
            assessmentId={id}
            onRegenerateComplete={() => {
              window.location.reload();
            }}
          />
        </motion.div>

        {/* Tabs */}
        <div id="results-content" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8 overflow-x-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-hidden">
            <div className="flex overflow-x-auto justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
          <div className="p-6 overflow-x-hidden max-w-full">
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

              {activeTab === 'quick-wins' && (
                <TabContent key="quick-wins">
                  <QuickWinsTab
                    quickWins={quickWins}
                    existing={existingOpportunities}
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
                    onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                  />
                </TabContent>
              )}

              {activeTab === 'roadmap' && (
                <TabContent key="roadmap">
                  <RoadmapTab roadmap={roadmap} onQuickEdit={handleQuickEdit} />
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
                  <LongTermVisionTab vision={results.long_term_vision} onQuickEdit={handleQuickEdit} />
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
                  <Mail className="text-purple-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
