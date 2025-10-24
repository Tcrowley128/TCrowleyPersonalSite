import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { createAdminClient } from '@/lib/supabase/admin';

// Night Sky Theme Colors
const COLORS = {
  darkBg: '0A0E27',        // Deep night blue
  contentBg: '141B3D',     // Slightly lighter for content
  accent: '00D9FF',        // Bright cyan (Hackett/Deloitte style)
  secondary: '7B68EE',     // Medium slate blue
  highlight: 'FFB800',     // Amber
  white: 'FFFFFF',
  textLight: 'B8C5D6',     // Light blue-gray
  gridColor: '1E2A4A',     // Subtle grid
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Fetch assessment results
    const { data: resultsArray, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', id)
      .limit(1);

    if (resultsError || !resultsArray || resultsArray.length === 0) {
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    const results = resultsArray[0];

    // Create presentation
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Digital Transformation Assessment';
    pptx.company = assessment.company_name || 'Company';
    pptx.title = `${assessment.company_name} - Digital Transformation Assessment`;

    // Helper function to add icon circle
    const addIconCircle = (slide: any, x: number, y: number, color: string) => {
      slide.addShape(pptx.ShapeType.ellipse, {
        x, y, w: 0.4, h: 0.4,
        fill: { color },
        line: { type: 'none' }
      });
    };

    // ======================
    // SLIDE 1: TITLE SLIDE
    // ======================
    const slide1 = pptx.addSlide();
    slide1.background = { color: COLORS.darkBg };

    slide1.addText(assessment.company_name || 'Company Name', {
      x: 0.5, y: 2.5, w: 9, h: 0.6,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    slide1.addText('Digital Transformation Assessment', {
      x: 0.5, y: 3.2, w: 9, h: 0.5,
      fontSize: 12, color: COLORS.accent,
      fontFace: 'Arial'
    });

    slide1.addText(new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }), {
      x: 0.5, y: 4.0, w: 9, h: 0.3,
      fontSize: 10, color: COLORS.textLight,
      fontFace: 'Arial'
    });

    addIconCircle(slide1, 9.2, 0.3, COLORS.accent);

    // ======================
    // SLIDE 2: EXECUTIVE SUMMARY
    // ======================
    const slide2 = pptx.addSlide();
    slide2.background = { color: COLORS.contentBg };

    slide2.addText('Executive Summary', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide2, 0.5, 1.2, COLORS.accent);

    const overallScore = results.maturity_assessment?.overall_score || 2;
    slide2.addText(`Current Digital Maturity: ${overallScore}/5`, {
      x: 1.0, y: 1.2, w: 8.5, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const summaryPoints = [
      'Comprehensive assessment across 5 key pillars of digital transformation',
      'Identified quick wins for immediate impact within 30 days',
      'Strategic roadmap for sustainable long-term growth',
      'Change management plan to ensure successful adoption'
    ];

    let summaryY = 2.0;
    summaryPoints.forEach(point => {
      slide2.addText(`• ${point}`, {
        x: 0.8, y: summaryY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      summaryY += 0.6;
    });

    // ======================
    // SLIDE 3: AGENDA & OBJECTIVES
    // ======================
    const slide3 = pptx.addSlide();
    slide3.background = { color: COLORS.contentBg };

    slide3.addText('Agenda & Objectives', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide3, 0.5, 1.2, COLORS.secondary);

    const agendaItems = [
      'Assessment Methodology',
      'Current State Analysis',
      'Digital Maturity Framework (5 Pillars)',
      'Strategic Priorities & Roadmap',
      'Implementation Plan & Timeline',
      'Next Steps & Engagement'
    ];

    let agendaY = 1.8;
    agendaItems.forEach((item, index) => {
      slide3.addText(`${index + 1}. ${item}`, {
        x: 1.0, y: agendaY, w: 8.5, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      agendaY += 0.7;
    });

    // ======================
    // SLIDE 4: ASSESSMENT METHODOLOGY
    // ======================
    const slide4 = pptx.addSlide();
    slide4.background = { color: COLORS.contentBg };

    slide4.addText('Assessment Methodology', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide4, 0.5, 1.2, COLORS.highlight);

    slide4.addText('Our 5-Pillar Framework', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const methodology = [
      'Data Strategy: Governance, analytics, and infrastructure',
      'Automation: Process optimization and workflow efficiency',
      'AI Integration: Intelligent systems and decision support',
      'People & Culture: Skills, training, and organizational readiness',
      'User Experience: Interface design and user satisfaction'
    ];

    let methodY = 2.2;
    methodology.forEach(item => {
      slide4.addText(`• ${item}`, {
        x: 0.8, y: methodY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      methodY += 0.7;
    });

    // ======================
    // SLIDE 5: CURRENT STATE OVERVIEW
    // ======================
    const slide5 = pptx.addSlide();
    slide5.background = { color: COLORS.contentBg };

    slide5.addText('Current State Overview', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide5, 0.5, 1.2, COLORS.accent);

    slide5.addText('Key Findings', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const currentState = [
      `Overall maturity level: ${overallScore}/5`,
      'Foundation for growth is in place',
      'Multiple opportunities for quick wins identified',
      'Strategic roadmap will accelerate transformation'
    ];

    let currentY = 2.2;
    currentState.forEach(item => {
      slide5.addText(`• ${item}`, {
        x: 0.8, y: currentY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      currentY += 0.7;
    });

    // ======================
    // SLIDE 6: DIGITAL MATURITY FRAMEWORK
    // ======================
    const slide6 = pptx.addSlide();
    slide6.background = { color: COLORS.contentBg };

    slide6.addText('Digital Maturity Framework', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const pillars = [
      { name: 'Data Strategy', score: results.maturity_assessment?.pillars?.data_strategy?.score || 2 },
      { name: 'Automation', score: results.maturity_assessment?.pillars?.automation?.score || 2 },
      { name: 'AI Integration', score: results.maturity_assessment?.pillars?.ai_integration?.score || 2 },
      { name: 'People & Culture', score: results.maturity_assessment?.pillars?.people_culture?.score || 2 },
      { name: 'User Experience', score: results.maturity_assessment?.pillars?.user_experience?.score || 2 }
    ];

    let pillarY = 1.5;
    pillars.forEach((pillar, index) => {
      addIconCircle(slide6, 0.8, pillarY, COLORS.accent);

      slide6.addText(pillar.name, {
        x: 1.4, y: pillarY, w: 3, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Score bar
      const barWidth = pillar.score * 0.8;
      slide6.addShape(pptx.ShapeType.rect, {
        x: 5, y: pillarY + 0.05, w: barWidth, h: 0.3,
        fill: { color: COLORS.accent },
        line: { type: 'none' }
      });

      slide6.addText(`${pillar.score}/5`, {
        x: 5 + barWidth + 0.2, y: pillarY, w: 1, h: 0.4,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });

      pillarY += 0.8;
    });

    // ======================
    // SLIDES 7-16: PILLAR DEEP DIVES (2 slides per pillar)
    // ======================
    pillars.forEach((pillar, index) => {
      // Current State Slide
      const currentSlide = pptx.addSlide();
      currentSlide.background = { color: COLORS.contentBg };

      currentSlide.addText(`${pillar.name} - Current State`, {
        x: 0.5, y: 0.4, w: 9, h: 0.5,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      addIconCircle(currentSlide, 0.5, 1.2, COLORS.accent);

      currentSlide.addText(`Maturity Score: ${pillar.score}/5`, {
        x: 1.0, y: 1.2, w: 8.5, h: 0.4,
        fontSize: 16, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      currentSlide.addText('Current Capabilities:', {
        x: 0.8, y: 1.9, w: 8.7, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      const capabilities = [
        'Foundation established with room for growth',
        'Key processes identified and documented',
        'Opportunities for optimization and automation'
      ];

      let capY = 2.4;
      capabilities.forEach(cap => {
        currentSlide.addText(`• ${cap}`, {
          x: 0.8, y: capY, w: 8.7, h: 0.5,
          fontSize: 12, color: COLORS.white,
          fontFace: 'Arial'
        });
        capY += 0.6;
      });

      // Target State & Roadmap Slide
      const targetSlide = pptx.addSlide();
      targetSlide.background = { color: COLORS.contentBg };

      targetSlide.addText(`${pillar.name} - Target State`, {
        x: 0.5, y: 0.4, w: 9, h: 0.5,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      addIconCircle(targetSlide, 0.5, 1.2, COLORS.secondary);

      targetSlide.addText('Target Maturity: 4-5/5', {
        x: 1.0, y: 1.2, w: 8.5, h: 0.4,
        fontSize: 14, bold: true, color: COLORS.highlight,
        fontFace: 'Arial'
      });

      // Timeline visualization
      targetSlide.addText('Implementation Timeline', {
        x: 0.8, y: 1.9, w: 8.7, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      const phases = ['30 Days', '60 Days', '90 Days'];
      let timelineX = 1.5;
      phases.forEach((phase, i) => {
        // Timeline node
        targetSlide.addShape(pptx.ShapeType.ellipse, {
          x: timelineX, y: 2.6, w: 0.3, h: 0.3,
          fill: { color: COLORS.accent },
          line: { type: 'none' }
        });

        if (i < phases.length - 1) {
          targetSlide.addShape(pptx.ShapeType.rect, {
            x: timelineX + 0.3, y: 2.73, w: 1.5, h: 0.04,
            fill: { color: COLORS.gridColor },
            line: { type: 'none' }
          });
        }

        targetSlide.addText(phase, {
          x: timelineX - 0.3, y: 3.0, w: 0.9, h: 0.3,
          fontSize: 10, color: COLORS.textLight,
          fontFace: 'Arial', align: 'center'
        });

        timelineX += 2.3;
      });

      targetSlide.addText('Key Initiatives:', {
        x: 0.8, y: 3.7, w: 8.7, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      const initiatives = [
        'Implement advanced capabilities',
        'Scale successful pilots across organization',
        'Measure and optimize for continuous improvement'
      ];

      let initY = 4.2;
      initiatives.forEach(init => {
        targetSlide.addText(`• ${init}`, {
          x: 0.8, y: initY, w: 8.7, h: 0.5,
          fontSize: 12, color: COLORS.white,
          fontFace: 'Arial'
        });
        initY += 0.6;
      });
    });

    // ======================
    // SLIDE 17: MATURITY SCORECARD
    // ======================
    const slide17 = pptx.addSlide();
    slide17.background = { color: COLORS.contentBg };

    slide17.addText('Maturity Scorecard', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide17, 0.5, 1.2, COLORS.accent);

    slide17.addText('Current vs Target State', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    let scoreY = 2.2;
    pillars.forEach(pillar => {
      slide17.addText(pillar.name, {
        x: 0.8, y: scoreY, w: 2.5, h: 0.3,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Current score
      slide17.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: scoreY, w: pillar.score * 0.6, h: 0.25,
        fill: { color: COLORS.accent },
        line: { type: 'none' }
      });

      // Target score (ghost bar)
      slide17.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: scoreY, w: 4 * 0.6, h: 0.25,
        fill: { color: COLORS.gridColor },
        line: { type: 'none' }
      });

      slide17.addText(`${pillar.score} → 4`, {
        x: 6.8, y: scoreY, w: 1, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      scoreY += 0.6;
    });

    // ======================
    // SLIDE 18: GAP ANALYSIS
    // ======================
    const slide18 = pptx.addSlide();
    slide18.background = { color: COLORS.contentBg };

    slide18.addText('Gap Analysis', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide18, 0.5, 1.2, COLORS.highlight);

    slide18.addText('Critical Gaps Identified', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const gaps = [
      { priority: 'HIGH', gap: 'Data integration and analytics capabilities', impact: 'Limits decision-making speed' },
      { priority: 'HIGH', gap: 'Automation of manual processes', impact: 'Reduces efficiency and scalability' },
      { priority: 'MEDIUM', gap: 'AI/ML implementation readiness', impact: 'Delays competitive advantage' },
      { priority: 'MEDIUM', gap: 'Change management processes', impact: 'Affects adoption rates' }
    ];

    let gapY = 2.2;
    gaps.forEach(item => {
      const priorityColor = item.priority === 'HIGH' ? COLORS.highlight : COLORS.secondary;

      slide18.addText(item.priority, {
        x: 0.8, y: gapY, w: 0.8, h: 0.3,
        fontSize: 12, bold: true, color: priorityColor,
        fontFace: 'Arial'
      });

      slide18.addText(item.gap, {
        x: 1.8, y: gapY, w: 4, h: 0.3,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide18.addText(`→ ${item.impact}`, {
        x: 6.0, y: gapY, w: 3.5, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial', italic: true
      });

      gapY += 0.7;
    });

    // ======================
    // SLIDE 19: INDUSTRY BENCHMARKING
    // ======================
    const slide19 = pptx.addSlide();
    slide19.background = { color: COLORS.contentBg };

    slide19.addText('Industry Benchmarking', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide19, 0.5, 1.2, COLORS.accent);

    slide19.addText('Competitive Positioning', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const benchmarks = [
      { category: 'Current Position', score: overallScore, label: 'Your Organization' },
      { category: 'Industry Average', score: 2.8, label: 'Peer Companies' },
      { category: 'Industry Leaders', score: 4.2, label: 'Top Performers' }
    ];

    let benchY = 2.5;
    benchmarks.forEach(bench => {
      slide19.addText(bench.category, {
        x: 0.8, y: benchY, w: 2.5, h: 0.3,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });

      const barColor = bench.category === 'Current Position' ? COLORS.accent : COLORS.gridColor;
      slide19.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: benchY, w: bench.score * 0.8, h: 0.25,
        fill: { color: barColor },
        line: { type: 'none' }
      });

      slide19.addText(bench.score.toFixed(1), {
        x: 7.5, y: benchY, w: 1, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      benchY += 0.8;
    });

    // ======================
    // SLIDE 20: STRATEGIC PRIORITIES OVERVIEW
    // ======================
    const slide20 = pptx.addSlide();
    slide20.background = { color: COLORS.contentBg };

    slide20.addText('Strategic Priorities', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide20, 0.5, 1.2, COLORS.highlight);

    slide20.addText('Top 3 Focus Areas', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const priorities = [
      { num: '1', title: 'Data-Driven Decision Making', impact: 'HIGH' },
      { num: '2', title: 'Process Automation & Efficiency', impact: 'HIGH' },
      { num: '3', title: 'AI/ML Integration', impact: 'MEDIUM' }
    ];

    let priorY = 2.4;
    priorities.forEach(priority => {
      addIconCircle(slide20, 0.8, priorY, COLORS.accent);

      slide20.addText(priority.num, {
        x: 0.88, y: priorY + 0.06, w: 0.25, h: 0.25,
        fontSize: 14, bold: true, color: COLORS.darkBg,
        fontFace: 'Arial', align: 'center'
      });

      slide20.addText(priority.title, {
        x: 1.4, y: priorY, w: 5, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide20.addText(`Impact: ${priority.impact}`, {
        x: 7, y: priorY, w: 2, h: 0.4,
        fontSize: 12, color: COLORS.highlight,
        fontFace: 'Arial'
      });

      priorY += 1.2;
    });

    // ======================
    // SLIDES 21-23: PRIORITY ACTION PLANS
    // ======================
    for (let i = 0; i < 3; i++) {
      const prioritySlide = pptx.addSlide();
      prioritySlide.background = { color: COLORS.contentBg };

      prioritySlide.addText(`Priority ${i + 1}: ${priorities[i].title}`, {
        x: 0.5, y: 0.4, w: 9, h: 0.5,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      addIconCircle(prioritySlide, 0.5, 1.2, COLORS.accent);

      prioritySlide.addText('Key Activities', {
        x: 0.8, y: 1.5, w: 8.7, h: 0.4,
        fontSize: 16, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      const activities = [
        'Assess current capabilities and define target state',
        'Identify and prioritize quick wins',
        'Develop detailed implementation roadmap',
        'Allocate resources and assign ownership'
      ];

      let actY = 2.1;
      activities.forEach(activity => {
        prioritySlide.addText(`• ${activity}`, {
          x: 0.8, y: actY, w: 8.7, h: 0.5,
          fontSize: 12, color: COLORS.white,
          fontFace: 'Arial'
        });
        actY += 0.6;
      });

      // Timeline
      prioritySlide.addText('Timeline', {
        x: 0.8, y: 4.5, w: 8.7, h: 0.4,
        fontSize: 16, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      const timePhases = ['Phase 1: 30 days', 'Phase 2: 60 days', 'Phase 3: 90 days'];
      let timeX = 1.5;
      timePhases.forEach(phase => {
        prioritySlide.addText(phase, {
          x: timeX, y: 5.0, w: 2, h: 0.3,
          fontSize: 10, color: COLORS.textLight,
          fontFace: 'Arial'
        });
        timeX += 2.3;
      });
    }

    // ======================
    // SLIDE 24: QUICK WINS
    // ======================
    const slide24 = pptx.addSlide();
    slide24.background = { color: COLORS.contentBg };

    slide24.addText('Quick Wins - 30-Day Initiatives', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide24, 0.5, 1.2, COLORS.highlight);

    const quickWins = results.quick_wins || [];
    const quickWinsList = quickWins.slice(0, 6);

    let qwY = 1.8;
    quickWinsList.forEach((qw: any, index: number) => {
      slide24.addText(`${index + 1}. ${qw.title || 'Quick Win Initiative'}`, {
        x: 0.8, y: qwY, w: 8.7, h: 0.4,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide24.addText(qw.description || 'High-impact initiative', {
        x: 1.2, y: qwY + 0.35, w: 8.3, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      qwY += 0.85;
    });

    // ======================
    // SLIDE 25: TECHNOLOGY ROADMAP OVERVIEW
    // ======================
    const slide25 = pptx.addSlide();
    slide25.background = { color: COLORS.contentBg };

    slide25.addText('Technology Roadmap', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide25, 0.5, 1.2, COLORS.accent);

    slide25.addText('Recommended Technology Stack', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const techStack = [
      { category: 'Data & Analytics', tools: 'Power BI, Tableau, SQL' },
      { category: 'Automation', tools: 'Power Automate, Zapier, n8n' },
      { category: 'AI/ML', tools: 'Azure AI, OpenAI, Claude' },
      { category: 'Collaboration', tools: 'Microsoft 365, Slack, Teams' },
      { category: 'Development', tools: 'Low-code platforms, APIs' }
    ];

    let techY = 2.3;
    techStack.forEach(tech => {
      slide25.addText(tech.category, {
        x: 0.8, y: techY, w: 2.5, h: 0.3,
        fontSize: 14, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide25.addText(tech.tools, {
        x: 3.5, y: techY, w: 5.5, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      techY += 0.7;
    });

    // ======================
    // SLIDE 26: RECOMMENDED TECHNOLOGY STACK
    // ======================
    const slide26 = pptx.addSlide();
    slide26.background = { color: COLORS.contentBg };

    slide26.addText('Recommended Platforms', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide26, 0.5, 1.2, COLORS.secondary);

    const platforms = [
      'Microsoft Power Platform for rapid application development',
      'Azure AI Services for intelligent automation',
      'Power BI for data visualization and analytics',
      'Microsoft 365 for collaboration and productivity',
      'Low-code solutions for citizen development'
    ];

    let platY = 2.0;
    platforms.forEach(platform => {
      slide26.addText(`• ${platform}`, {
        x: 0.8, y: platY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      platY += 0.8;
    });

    // ======================
    // SLIDE 27: 90-DAY IMPLEMENTATION TIMELINE
    // ======================
    const slide27 = pptx.addSlide();
    slide27.background = { color: COLORS.contentBg };

    slide27.addText('90-Day Implementation Timeline', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide27, 0.5, 1.2, COLORS.highlight);

    // Timeline visualization - consistent format
    const timelinePhases = [
      { days: '0-30', title: 'Foundation', color: COLORS.accent },
      { days: '31-60', title: 'Build', color: COLORS.secondary },
      { days: '61-90', title: 'Scale', color: COLORS.highlight }
    ];

    let phaseX = 1.5;
    timelinePhases.forEach((phase, i) => {
      // Phase circle
      slide27.addShape(pptx.ShapeType.ellipse, {
        x: phaseX, y: 2.0, w: 0.4, h: 0.4,
        fill: { color: phase.color },
        line: { type: 'none' }
      });

      // Connecting line
      if (i < timelinePhases.length - 1) {
        slide27.addShape(pptx.ShapeType.rect, {
          x: phaseX + 0.4, y: 2.18, w: 1.8, h: 0.04,
          fill: { color: COLORS.gridColor },
          line: { type: 'none' }
        });
      }

      slide27.addText(phase.title, {
        x: phaseX - 0.3, y: 2.5, w: 1, h: 0.3,
        fontSize: 14, bold: true, color: phase.color,
        fontFace: 'Arial', align: 'center'
      });

      slide27.addText(phase.days, {
        x: phaseX - 0.3, y: 2.8, w: 1, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial', align: 'center'
      });

      phaseX += 2.7;
    });

    slide27.addText('Key Milestones', {
      x: 0.8, y: 3.5, w: 8.7, h: 0.4,
        fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const milestones = [
      'Days 1-30: Quick wins deployed, foundation established',
      'Days 31-60: Core capabilities built, pilots running',
      'Days 61-90: Solutions scaled, metrics tracked'
    ];

    let mileY = 4.0;
    milestones.forEach(milestone => {
      slide27.addText(`• ${milestone}`, {
        x: 0.8, y: mileY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      mileY += 0.6;
    });

    // ======================
    // SLIDE 28: RESOURCE & BUDGET PLANNING
    // ======================
    const slide28 = pptx.addSlide();
    slide28.background = { color: COLORS.contentBg };

    slide28.addText('Resource & Budget Planning', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide28, 0.5, 1.2, COLORS.accent);

    slide28.addText('Resource Requirements', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const resources = [
      { role: 'Project Lead', commitment: 'Full-time', phase: 'All phases' },
      { role: 'Technical Resources', commitment: '2-3 FTE', phase: 'Build & Scale' },
      { role: 'Business SMEs', commitment: 'Part-time', phase: 'All phases' },
      { role: 'Change Champions', commitment: 'Part-time', phase: 'Foundation & Scale' }
    ];

    let resY = 2.2;
    resources.forEach(resource => {
      slide28.addText(resource.role, {
        x: 0.8, y: resY, w: 2.5, h: 0.3,
        fontSize: 18, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide28.addText(resource.commitment, {
        x: 3.5, y: resY, w: 2, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      slide28.addText(resource.phase, {
        x: 5.8, y: resY, w: 3, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      resY += 0.6;
    });

    // ======================
    // SLIDE 29: CHANGE MANAGEMENT & SUCCESS METRICS
    // ======================
    const slide29 = pptx.addSlide();
    slide29.background = { color: COLORS.contentBg };

    slide29.addText('Change Management & KPIs', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    addIconCircle(slide29, 0.5, 1.2, COLORS.secondary);

    slide29.addText('Change Management Strategy', {
      x: 0.8, y: 1.5, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const changeItems = [
      'Executive sponsorship and visible leadership',
      'Regular communication and progress updates',
      'Training and enablement programs',
      'Celebration of wins and continuous feedback'
    ];

    let changeY = 2.0;
    changeItems.forEach(item => {
      slide29.addText(`• ${item}`, {
        x: 0.8, y: changeY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      changeY += 0.5;
    });

    slide29.addText('Key Performance Indicators', {
      x: 0.8, y: 4.0, w: 8.7, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const kpis = [
      'User adoption rate and satisfaction scores',
      'Time savings and efficiency gains',
      'ROI and cost reduction metrics',
      'Process automation completion rates'
    ];

    let kpiY = 4.5;
    kpis.forEach(kpi => {
      slide29.addText(`• ${kpi}`, {
        x: 0.8, y: kpiY, w: 8.7, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      kpiY += 0.5;
    });

    // ======================
    // SLIDE 30: NEXT STEPS & CONTACT
    // ======================
    const slide30 = pptx.addSlide();
    slide30.background = { color: COLORS.darkBg };

    slide30.addText('Next Steps', {
      x: 0.5, y: 1.5, w: 9, h: 0.6,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const nextSteps = [
      'Review assessment findings and recommendations',
      'Prioritize initiatives based on business impact',
      'Schedule kickoff meeting for implementation',
      'Begin quick wins deployment (30 days)'
    ];

    let nextY = 2.8;
    nextSteps.forEach((step, index) => {
      slide30.addText(`${index + 1}. ${step}`, {
        x: 1.0, y: nextY, w: 8.5, h: 0.5,
        fontSize: 12, color: COLORS.white,
        fontFace: 'Arial'
      });
      nextY += 0.7;
    });

    slide30.addText('Thank you for your time', {
      x: 0.5, y: 5.5, w: 9, h: 0.4,
      fontSize: 12, color: COLORS.accent,
      fontFace: 'Arial', align: 'center'
    });

    addIconCircle(slide30, 9.2, 5.3, COLORS.highlight);

    // Generate and return the presentation
    const pptxData = await pptx.write({ outputType: 'arraybuffer' });

    return new NextResponse(pptxData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${assessment.company_name?.replace(/[^a-z0-9]/gi, '_') || 'assessment'}_presentation.pptx"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating PowerPoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate PowerPoint', details: error.message },
      { status: 500 }
    );
  }
}
