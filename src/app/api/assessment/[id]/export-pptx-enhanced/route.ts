import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generatePresentationContentEnhanced,
  searchAndDownloadImage,
  downloadImageAsBase64,
} from '@/lib/services/pptx-content-generator-enhanced';
import { BUSINESS_ICONS, ICON_MAPPING } from '@/lib/services/business-icons';

// Bosch Template Colors (matching the PDF template)
const COLORS = {
  darkBg: '0A1628',        // Dark blue background from Bosch template
  contentBg: '0A1628',     // Same dark background for consistency
  accent: '7B9CFF',        // Light blue accent
  secondary: 'A78BFF',     // Purple accent
  highlight: 'FFB800',     // Amber/gold highlight
  white: 'FFFFFF',
  textLight: 'B8C5D6',     // Light blue-gray for secondary text
  gridColor: '1E2A4A',     // Subtle grid lines
  cardBg: '1A2642',        // Card background (slightly lighter than main bg)
};

// Icon mappings (using PptxGenJS shapes to simulate icons)
const ICON_CONFIG = {
  // Pillar icons
  data_strategy: { shape: 'rect', color: COLORS.accent },
  automation: { shape: 'rect', color: COLORS.accent },
  ai_integration: { shape: 'rect', color: COLORS.secondary },
  people_culture: { shape: 'rect', color: COLORS.accent },
  user_experience: { shape: 'rect', color: COLORS.accent },

  // Sub-category icons
  quality: { shape: 'ellipse', color: COLORS.accent },
  integration: { shape: 'rect', color: COLORS.accent },
  analytics: { shape: 'rect', color: COLORS.accent },
  culture: { shape: 'ellipse', color: COLORS.accent },
  process: { shape: 'ellipse', color: COLORS.accent },
  workflow: { shape: 'rect', color: COLORS.accent },
  orchestration: { shape: 'rect', color: COLORS.accent },
  governance: { shape: 'ellipse', color: COLORS.accent },
  skills: { shape: 'rect', color: COLORS.accent },
  change: { shape: 'rect', color: COLORS.accent },
  innovation: { shape: 'ellipse', color: COLORS.accent },
  leadership: { shape: 'rect', color: COLORS.accent },
  aiAnalytics: { shape: 'rect', color: COLORS.secondary },
  genAI: { shape: 'ellipse', color: COLORS.secondary },
  aiAgents: { shape: 'rect', color: COLORS.secondary },
  mlOps: { shape: 'rect', color: COLORS.secondary },
  research: { shape: 'rect', color: COLORS.accent },
  design: { shape: 'rect', color: COLORS.accent },
  onboarding: { shape: 'ellipse', color: COLORS.accent },
  accessibility: { shape: 'ellipse', color: COLORS.accent },

  // Opportunity icons
  search: { shape: 'ellipse', color: COLORS.accent },
  chart: { shape: 'ellipse', color: COLORS.accent },
  timer: { shape: 'ellipse', color: COLORS.accent },
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    console.log('[PPTX Export] Starting export for assessment:', id);

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
        { error: 'Assessment results not found. Please generate assessment results first.' },
        { status: 404 }
      );
    }

    const results = resultsArray[0];

    console.log('[PPTX Export] Generating content with Claude API (with web search)...');

    // Generate presentation content using Claude API with web search
    const slideContent = await generatePresentationContentEnhanced(assessment, results);

    console.log('[PPTX Export] Content generated with industry insights');
    console.log('[PPTX Export] Fetching images for presentation...');

    // Fetch images based on Claude's recommendations
    const images: Record<string, string | null> = {};
    if (slideContent.imageRecommendations && slideContent.imageRecommendations.length > 0) {
      for (const imgRec of slideContent.imageRecommendations) {
        console.log(`[PPTX Export] Searching for image: ${imgRec.searchQuery}`);
        const imageUrl = await searchAndDownloadImage(imgRec.searchQuery, imgRec.placement);
        if (imageUrl) {
          const base64Image = await downloadImageAsBase64(imageUrl);
          if (base64Image) {
            images[imgRec.slideType] = base64Image;
            console.log(`[PPTX Export] Image found for ${imgRec.slideType}`);
          }
        }
      }
    }

    console.log('[PPTX Export] Creating presentation with enhanced content...');

    // Create presentation
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Digital Transformation Assessment';
    pptx.company = assessment.company_name || 'Company';
    pptx.title = `${assessment.company_name} - Digital Transformation Assessment`;

    // Helper function to truncate text to prevent overflow
    const truncateText = (text: string, maxLength: number): string => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    // Helper function to smartly shorten text by removing last sentence if needed
    const smartShortenText = (text: string, maxLength: number): string => {
      if (!text) return '';
      if (text.length <= maxLength) return text;

      // Split by sentence endings (. ! ?)
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      // If only one sentence or no sentences, just truncate without "..."
      if (sentences.length <= 1) {
        return text.substring(0, maxLength).trim();
      }

      // Remove sentences from the end until it fits
      let result = text;
      while (result.length > maxLength && sentences.length > 0) {
        sentences.pop();
        result = sentences.join('').trim();
      }

      return result || text.substring(0, maxLength).trim();
    };

    // Helper function to add icon using SVG
    const addIcon = (slide: any, x: number, y: number, iconKey: string, size: number = 0.4) => {
      // Check if it's a direct icon name (like 'searchWhite') or needs mapping
      let iconName = iconKey;
      if (!BUSINESS_ICONS[iconKey]) {
        // Map the icon key to actual icon name
        iconName = ICON_MAPPING[iconKey as keyof typeof ICON_MAPPING] || 'target';
      }
      const icon = BUSINESS_ICONS[iconName];

      console.log(`[Icon] Adding icon: ${iconKey} -> ${iconName}, exists: ${!!icon}`);

      if (icon && icon.base64) {
        try {
          slide.addImage({
            data: icon.base64,
            x,
            y,
            w: size,
            h: size,
          });
          console.log(`[Icon] Successfully added ${iconName} at (${x}, ${y})`);
        } catch (error) {
          console.error(`[Icon] Failed to add icon ${iconName}:`, error);
          // Fallback to colored circle
          slide.addShape(pptx.ShapeType.ellipse, {
            x, y, w: size, h: size,
            fill: { color: COLORS.highlight },
            line: { type: 'none' }
          });
        }
      } else {
        console.warn(`[Icon] Icon not found: ${iconKey} -> ${iconName}`);
        // Fallback to colored circle if icon not found
        slide.addShape(pptx.ShapeType.ellipse, {
          x, y, w: size, h: size,
          fill: { color: COLORS.highlight },
          line: { type: 'none' }
        });
      }
    };

    // Helper function to add numbered badge
    const addNumberBadge = (slide: any, x: number, y: number, number: string, size: number = 0.6) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: size, h: size,
        fill: { color: COLORS.accent },
        line: { type: 'none' }
      });

      slide.addText(number, {
        x, y, w: size, h: size,
        fontSize: 20, bold: true, color: COLORS.darkBg,
        align: 'center', valign: 'middle',
        fontFace: 'Arial'
      });
    };

    // Helper function to add progress bar
    const addProgressBar = (slide: any, x: number, y: number, width: number, score: number, maxScore: number = 5) => {
      // Background
      slide.addShape(pptx.ShapeType.rect, {
        x, y, w: width, h: 0.25,
        fill: { color: COLORS.gridColor },
        line: { type: 'none' }
      });

      // Fill
      const fillWidth = width * (score / maxScore);
      slide.addShape(pptx.ShapeType.rect, {
        x, y, w: fillWidth, h: 0.25,
        fill: { color: score >= 3 ? COLORS.accent : COLORS.highlight },
        line: { type: 'none' }
      });
    };

    // Helper function to add TylerCrowley.com branding (subtle, upper right)
    const addBranding = (slide: any) => {
      slide.addText('TylerCrowley.com', {
        x: 7.5, y: 0.15, w: 2.3, h: 0.25,
        fontSize: 10,
        color: COLORS.textLight,
        align: 'right',
        fontFace: 'Arial',
        transparency: 30 // Make it subtle
      });
    };

    // Helper function to create section divider slide
    const addSectionDivider = (number: string, title: string, subtitle: string, imagePath?: string) => {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.darkBg };

      // Add image if provided
      if (imagePath && images[imagePath]) {
        slide.addImage({
          data: images[imagePath]!,
          x: 5, y: 0, w: 5, h: 5.625,
          sizing: { type: 'cover', w: 5, h: 5.625 }
        });
      }

      slide.addText(number, {
        x: 0.5, y: 2, w: 4.5, h: 0.6,
        fontSize: 32, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      slide.addText(title, {
        x: 0.5, y: 2.8, w: 4.5, h: 0.8,
        fontSize: 44, bold: true, color: COLORS.white,
        fontFace: 'Arial',
        wrap: false
      });

      slide.addText(subtitle, {
        x: 0.5, y: 3.8, w: 9, h: 0.4,
        fontSize: 18, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: false
      });

      // Add branding
      addBranding(slide);

      return slide;
    };

    // Extract scores for easy access
    const overallScore = results.maturity_assessment?.overall_score || 2;
    const pillars = [
      { name: 'Data Strategy', key: 'data_strategy', score: results.maturity_assessment?.pillars?.data_strategy?.score || 2 },
      { name: 'Automation', key: 'automation', score: results.maturity_assessment?.pillars?.automation?.score || 2 },
      { name: 'AI Integration', key: 'ai_integration', score: results.maturity_assessment?.pillars?.ai_integration?.score || 1 },
      { name: 'People & Culture', key: 'people_culture', score: results.maturity_assessment?.pillars?.people_culture?.score || 2 },
      { name: 'User Experience', key: 'user_experience', score: results.maturity_assessment?.pillars?.user_experience?.score || 2 }
    ];

    // ======================
    // SLIDE 1: TITLE SLIDE
    // ======================
    const slide1 = pptx.addSlide();
    slide1.background = { color: COLORS.darkBg };

    // Add background image if available
    if (images['title']) {
      slide1.addImage({
        data: images['title'],
        x: 0, y: 0, w: 10, h: 5.625,
        sizing: { type: 'cover', w: 10, h: 5.625 }
      });

      // Add dark overlay for text readability
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 5.625,
        fill: { color: '000000', transparency: 40 },
        line: { type: 'none' }
      });
    }

    // Title with text wrapping enabled to prevent overflow
    const titleText = `${assessment.company_name || 'Company'} - Digital Transformation Assessment`;
    slide1.addText(titleText, {
      x: 0.5, y: 2.2, w: 9, h: 1,
      fontSize: titleText.length > 60 ? 28 : 32,
      bold: true, color: COLORS.white,
      fontFace: 'Arial',
      wrap: true,
      align: 'left'
    });

    slide1.addText('Strategic Roadmap for Digital Excellence', {
      x: 0.5, y: 3.2, w: 9, h: 0.6,
      fontSize: 24, color: COLORS.accent,
      fontFace: 'Arial'
    });

    // Add disclaimer
    slide1.addText('⚠️ AI-Generated Content: Please review and verify all recommendations before implementation.', {
      x: 0.5, y: 3.85, w: 9, h: 0.3,
      fontSize: 11, color: COLORS.textLight,
      fontFace: 'Arial',
      italic: true
    });

    slide1.addText(new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }), {
      x: 0.5, y: 4.3, w: 9, h: 0.3,
      fontSize: 14, color: COLORS.textLight,
      fontFace: 'Arial'
    });

    // Add branding
    addBranding(slide1);

    // ======================
    // SLIDE 2: AGENDA (Navigation)
    // ======================
    const slide2 = pptx.addSlide();
    slide2.background = { color: COLORS.darkBg };

    slide2.addText('Navigation', {
      x: 0.5, y: 0.4, w: 9, h: 0.4,
      fontSize: 14, color: COLORS.accent,
      fontFace: 'Arial'
    });

    slide2.addText('Agenda', {
      x: 0.5, y: 0.7, w: 9, h: 0.5,
      fontSize: 36, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const agendaItems = [
      { num: '01', title: 'Executive Summary', desc: 'Current state and key opportunities' },
      { num: '02', title: 'Digital Maturity Assessment', desc: 'Five-pillar evaluation framework' },
      { num: '03', title: 'Strategic Priorities', desc: 'Data, Automation, AI, People, and UX strategies' },
      { num: '04', title: 'Quick Wins', desc: '30-day high-impact actions' },
      { num: '05', title: 'Technology Roadmap', desc: 'Recommended tools and platforms' },
      { num: '06', title: '90-Day Implementation Plan', desc: 'Phased transformation approach' },
      { num: '07', title: 'Change Management', desc: 'Communication and training strategy' },
      { num: '08', title: 'Next Steps', desc: 'Getting started with your transformation' }
    ];

    const agendaY = 1.5;
    agendaItems.forEach((item, index) => {
      const col = index < 4 ? 0 : 1;
      const x = col === 0 ? 0.5 : 5.2;
      const y = agendaY + (index % 4) * 1.0;

      // Add accent line
      slide2.addShape(pptx.ShapeType.rect, {
        x, y: y + 0.38, w: 4, h: 0.02,
        fill: { color: COLORS.accent },
        line: { type: 'none' }
      });

      slide2.addText(item.num, {
        x, y, w: 0.6, h: 0.4,
        fontSize: 14, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      slide2.addText(item.title, {
        x: x + 0.8, y, w: 3.6, h: 0.4,
        fontSize: 16, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide2.addText(item.desc, {
        x: x + 0.8, y: y + 0.35, w: 3.6, h: 0.3,
        fontSize: 10, color: COLORS.textLight,
        fontFace: 'Arial'
      });
    });

    // Add branding
    addBranding(slide2);

    // ======================
    // SLIDE 3: SECTION DIVIDER - Executive Summary
    // ======================
    addSectionDivider('01', 'Executive Summary', 'Current state and key opportunities', 'executive_summary');

    // ======================
    // SLIDE 4: CURRENT STATE ASSESSMENT
    // ======================
    const slide4 = pptx.addSlide();
    slide4.background = { color: COLORS.darkBg };

    slide4.addText('Current State Assessment', {
      x: 0.5, y: 0.4, w: 9, h: 0.5,
      fontSize: 28, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Summary text - use EXACT text from assessment results database (priority_matrix.current_state)
    // This ensures consistency with what's shown in the web UI Overview tab
    const exactCurrentState = results.priority_matrix?.current_state || slideContent.currentState.summary || '';

    // Shorten if needed for PowerPoint space constraints
    const summaryText = smartShortenText(exactCurrentState, 280);

    // Display the exact current state statement from the database
    slide4.addText(summaryText, {
      x: 0.5, y: 1.0, w: 9, h: 0.6,
      fontSize: 11,
      color: COLORS.white,
      fontFace: 'Arial',
      wrap: true
    });

    // Gap analysis sentence - single line
    const gapAnalysis = slideContent.currentState.painPoints && slideContent.currentState.painPoints[0]
      ? truncateText(slideContent.currentState.painPoints[0], 140)
      : 'Key gaps identified in data integration, automation workflows, and digital skill development.';

    slide4.addText(`Gap Analysis: ${gapAnalysis}`, {
      x: 0.5, y: 1.75, w: 9, h: 0.25,
      fontSize: 10, color: COLORS.textLight,
      fontFace: 'Arial',
      wrap: false
    });

    slide4.addText('Maturity Scores by Pillar', {
      x: 0.5, y: 2.2, w: 9, h: 0.3,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const pillarY = 2.7;
    pillars.forEach((pillar, idx) => {
      const percentage = (pillar.score / 5) * 100;
      const pillarContent = slideContent.pillars[pillar.key];

      // Create a more compact layout matching the PDF
      const isTopRow = idx < 3;
      const x = isTopRow ? (0.5 + (idx * 3)) : (2 + ((idx - 3) * 3));
      const y = isTopRow ? pillarY : pillarY + 1.3;

      // Progress bar background (dark)
      slide4.addShape(pptx.ShapeType.rect, {
        x, y, w: 2.2, h: 0.4,
        fill: { color: COLORS.gridColor },
        line: { type: 'none' }
      });

      // Progress bar fill (accent color)
      const fillWidth = 2.2 * (pillar.score / 5);
      slide4.addShape(pptx.ShapeType.rect, {
        x, y, w: fillWidth, h: 0.4,
        fill: { color: pillar.score === 1 ? '9B7DFF' : COLORS.accent },
        line: { type: 'none' }
      });

      // Percentage on right side of bar
      slide4.addText(`${percentage}%`, {
        x: x + 2.3, y, w: 0.7, h: 0.4,
        fontSize: 14, bold: true, color: COLORS.white,
        align: 'left', valign: 'middle',
        fontFace: 'Arial',
        wrap: false
      });

      // Pillar name below bar
      slide4.addText(pillar.name, {
        x, y: y + 0.5, w: 2.2, h: 0.25,
        fontSize: 11, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Description below name - smartly shorten text without "..."
      const description = pillarContent?.currentState || `${pillar.score === 1 ? 'Experimental initiatives' : pillar.score === 2 ? 'Limited deployment' : 'Developing capabilities'}`;
      const shortenedDesc = smartShortenText(description, 120);
      slide4.addText(`${pillar.score}/5 - ${shortenedDesc}`, {
        x, y: y + 0.75, w: 2.7, h: 0.35,
        fontSize: 8, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });
    });

    // Add branding
    addBranding(slide4);

    // ======================
    // SLIDE 5: KEY OPPORTUNITY
    // ======================
    const slide5 = pptx.addSlide();
    slide5.background = { color: COLORS.darkBg };

    slide5.addText('Key Opportunity', {
      x: 0.5, y: 0.6, w: 9, h: 0.6,
      fontSize: 28, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Use EXACT text from assessment results database (priority_matrix.key_opportunity)
    const exactKeyOpportunity = results.priority_matrix?.key_opportunity || 'Leverage existing technology ecosystem to create citizen-led solutions that directly address your top pain points';
    slide5.addText(truncateText(exactKeyOpportunity, 220), {
      x: 0.5, y: 1.4, w: 9, h: 0.8,
      fontSize: 13, color: COLORS.white,
      fontFace: 'Arial',
      wrap: true
    });

    // Three opportunity cards with white icons
    const opportunities = [
      { icon: 'searchWhite', title: 'Information findability', x: 1 },
      { icon: 'chartWhite', title: 'KPI visibility', x: 3.8 },
      { icon: 'clockWhite', title: 'Onboarding speed', x: 6.6 }
    ];

    opportunities.forEach(opp => {
      // Card background with rounded corners
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: opp.x, y: 2.5, w: 2.5, h: 1.5,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 1 }
      });

      // Icon circle background (subtle)
      slide5.addShape(pptx.ShapeType.ellipse, {
        x: opp.x + 0.85, y: 2.7, w: 0.8, h: 0.8,
        fill: { color: COLORS.accent, transparency: 30 },
        line: { type: 'none' }
      });

      // Actual white icon on top - perfectly centered in circle
      addIcon(slide5, opp.x + 1.0, 2.85, opp.icon, 0.5);

      // Title with better spacing - single line, moved up for balanced spacing
      slide5.addText(opp.title, {
        x: opp.x + 0.2, y: 3.6, w: 2.1, h: 0.3,
        fontSize: 12, bold: true, color: COLORS.white,
        align: 'center',
        fontFace: 'Arial',
        wrap: false
      });
    });

    slide5.addText('Build internal champions through quick wins that demonstrate immediate value and overcome change resistance.', {
      x: 0.5, y: 4.3, w: 9, h: 0.5,
      fontSize: 13, color: COLORS.textLight,
      fontFace: 'Arial'
    });

    // Add branding
    addBranding(slide5);

    // ======================
    // SLIDE 6: RECOMMENDED STARTING POINT
    // ======================
    const slide6 = pptx.addSlide();
    slide6.background = { color: COLORS.darkBg };

    slide6.addText('Recommended Starting Point', {
      x: 0.5, y: 0.4, w: 9, h: 0.6,
      fontSize: 28, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Use EXACT text from assessment results database (priority_matrix.recommended_starting_point)
    const exactStartingPoint = results.priority_matrix?.recommended_starting_point || '30-Day Power Platform Pilot';
    slide6.addText(truncateText(exactStartingPoint, 150), {
      x: 0.5, y: 1.2, w: 9, h: 0.5,
      fontSize: 20, bold: true, color: COLORS.accent,
      fontFace: 'Arial',
      wrap: true
    });

    // Left column - Launch details
    slide6.addText('Launch Focus', {
      x: 0.5, y: 2, w: 4, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // If the starting point is detailed enough, extract launch focus from it, otherwise use default
    const launchFocus = exactStartingPoint.length > 50
      ? truncateText(exactStartingPoint, 120)
      : 'Centralized information hub using SharePoint with Power BI dashboards';
    slide6.addText(launchFocus, {
      x: 0.5, y: 2.5, w: 4, h: 0.9,
      fontSize: 11, color: COLORS.textLight,
      fontFace: 'Arial',
      wrap: true
    });

    slide6.addText('Target Audience', {
      x: 0.5, y: 3.5, w: 4, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    slide6.addText('Your most change-ready team members as initial citizen developers', {
      x: 0.5, y: 4, w: 4, h: 0.6,
      fontSize: 12, color: COLORS.textLight,
      fontFace: 'Arial'
    });

    // Right column - Expected Outcomes
    slide6.addText('Expected Outcomes', {
      x: 5.2, y: 2, w: 4.3, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const outcomes = [
      'Immediate pain point relief (information access)',
      'Champion network established (10-15 advocates)',
      'Quick wins demonstrated (build momentum)',
      'Foundation for broader transformation'
    ];

    let outcomeY = 2.5;
    outcomes.forEach(outcome => {
      slide6.addText(`• ${outcome}`, {
        x: 5.2, y: outcomeY, w: 4.3, h: 0.4,
        fontSize: 12, color: COLORS.textLight,
        fontFace: 'Arial'
      });
      outcomeY += 0.45;
    });

    // Bottom info box
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 4.8, w: 9, h: 0.65,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.accent, width: 1 }
    });

    // Icon for "Why This Works"
    addIcon(slide6, 0.7, 4.95, 'lightbulb', 0.35);

    slide6.addText('Why This Works', {
      x: 1.15, y: 4.95, w: 1.5, h: 0.3,
      fontSize: 10, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    slide6.addText('Builds on existing Microsoft investment, requires minimal new technology, and creates internal advocates who will drive adoption across the organization.', {
      x: 2.7, y: 4.95, w: 6.65, h: 0.4,
      fontSize: 10, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Add branding
    addBranding(slide6);

    // ======================
    // SLIDE 7: SECTION DIVIDER - Digital Maturity Assessment
    // ======================
    addSectionDivider('02', 'Digital Maturity\nAssessment', 'Five-pillar evaluation framework', 'maturity_assessment');

    // ======================
    // SLIDE 8: FIVE-PILLAR FRAMEWORK
    // ======================
    const slide8 = pptx.addSlide();
    slide8.background = { color: COLORS.darkBg };

    slide8.addText('Five-Pillar Framework', {
      x: 0.5, y: 0.4, w: 9, h: 0.6,
      fontSize: 28, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Create 5 pillar cards in 3-2 layout
    const pillarCards = [
      { pillar: pillars[0], x: 0.5, y: 1.3 },
      { pillar: pillars[1], x: 3.5, y: 1.3 },
      { pillar: pillars[2], x: 6.5, y: 1.3 },
      { pillar: pillars[3], x: 2, y: 3.5 },
      { pillar: pillars[4], x: 5, y: 3.5 }
    ];

    pillarCards.forEach(({ pillar, x, y }) => {
      const pillarContent = slideContent.pillars[pillar.key];

      // Card background
      slide8.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 2.8, h: 1.8,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 2 }
      });

      // Icon
      addIcon(slide8, x + 0.2, y + 0.15, pillar.key, 0.5);

      // Title - moved up more
      slide8.addText(pillar.name, {
        x: x + 0.2, y: y + 0.68, w: 2.4, h: 0.28,
        fontSize: 14, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Current State label - moved up more
      slide8.addText('Current State:', {
        x: x + 0.2, y: y + 0.98, w: 2.4, h: 0.18,
        fontSize: 9, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      // Current State description - smartly shortened without "..."
      const currentState = pillarContent?.currentState || 'Assessment in progress';
      slide8.addText(smartShortenText(currentState, 100), {
        x: x + 0.2, y: y + 1.18, w: 2.4, h: 0.35,
        fontSize: 8, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      // Maturity Level - adjusted position for tighter spacing
      slide8.addText(`Maturity Level: ${pillar.score} out of 5`, {
        x: x + 0.2, y: y + 1.56, w: 2.4, h: 0.15,
        fontSize: 9, bold: true, color: pillar.score >= 3 ? COLORS.accent : COLORS.highlight,
        fontFace: 'Arial'
      });
    });

    // Add branding
    addBranding(slide8);

    // ======================
    // SLIDES 9-13: DETAILED PILLAR BREAKDOWNS (each pillar gets a divider + detail slide)
    // ======================
    pillars.forEach((pillar) => {
      const pillarContent = slideContent.pillars[pillar.key];

      // Section divider for this pillar
      const dividerSlide = pptx.addSlide();
      dividerSlide.background = { color: COLORS.darkBg };

      if (images[pillar.key]) {
        dividerSlide.addImage({
          data: images[pillar.key]!,
          x: 5, y: 0, w: 5, h: 5.625,
          sizing: { type: 'cover', w: 5, h: 5.625 }
        });
      }

      dividerSlide.addText('Detailed Assessment', {
        x: 0.5, y: 1.5, w: 8.4, h: 0.4,
        fontSize: 16, color: COLORS.accent,
        fontFace: 'Arial'
      });

      dividerSlide.addText(pillar.name, {
        x: 0.5, y: 2, w: 6.5, h: 0.8,
        fontSize: 42, bold: true, color: COLORS.white,
        fontFace: 'Arial',
        wrap: false
      });

      dividerSlide.addText(`Score: ${pillar.score} out of 5`, {
        x: 0.5, y: 3, w: 6.5, h: 0.4,
        fontSize: 18, bold: true, color: pillar.score >= 3 ? COLORS.accent : COLORS.highlight,
        fontFace: 'Arial'
      });

      dividerSlide.addText(`Gap Analysis: ${pillarContent?.currentState || 'Assessment details'}`, {
        x: 0.5, y: 3.6, w: 8, h: 0.6,
        fontSize: 12, color: COLORS.textLight,
        fontFace: 'Arial'
      });

      // Add branding to divider
      addBranding(dividerSlide);

      // Detail slide with 4 sub-categories
      const detailSlide = pptx.addSlide();
      detailSlide.background = { color: COLORS.darkBg };

      detailSlide.addText(`${pillar.name} - Score: ${pillar.score} out of 5`, {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Get sub-scores if available
      const subScores = pillarContent?.subScores || {};
      const subScoreEntries = Object.entries(subScores).slice(0, 4);

      if (subScoreEntries.length > 0) {
        let subY = 0.95;
        subScoreEntries.forEach(([subName, subData]: [string, any]) => {
          // Card background
          detailSlide.addShape(pptx.ShapeType.roundRect, {
            x: 0.5, y: subY, w: 9, h: 1.05,
            fill: { color: COLORS.cardBg },
            line: { color: COLORS.accent, width: 1 }
          });

          // Icon - prioritize longer/more specific keyword matches
          const subNameLower = subName.toLowerCase();
          let iconKey = 'quality';

          // Check for specific multi-word patterns first
          if (subNameLower.includes('visualization') || subNameLower.includes('dashboards')) iconKey = 'visualization';
          else if (subNameLower.includes('quality') || subNameLower.includes('governance')) iconKey = 'dataQuality';
          else if (subNameLower.includes('powered') || subNameLower.includes('analytics')) iconKey = 'analytics';
          else if (subNameLower.includes('generative') || subNameLower.includes('llm')) iconKey = 'brain';
          else if (subNameLower.includes('agents') || subNameLower.includes('copilot')) iconKey = 'robot';
          else if (subNameLower.includes('operations') || subNameLower.includes('ml ops')) iconKey = 'pipeline';
          else {
            // Fall back to single keyword matching (sorted by length, longest first)
            const matches = Object.keys(ICON_CONFIG)
              .filter(k => subNameLower.includes(k))
              .sort((a, b) => b.length - a.length);
            if (matches.length > 0) iconKey = matches[0];
          }

          addIcon(detailSlide, 0.7, subY + 0.15, iconKey, 0.45);

          // Sub-category name (truncate if too long)
          detailSlide.addText(truncateText(subName, 50), {
            x: 1.3, y: subY + 0.15, w: 4, h: 0.3,
            fontSize: 13, bold: true, color: COLORS.white,
            fontFace: 'Arial',
            wrap: true
          });

          // Score badge
          detailSlide.addShape(pptx.ShapeType.roundRect, {
            x: 8.5, y: subY + 0.15, w: 0.7, h: 0.35,
            fill: { color: subData.score >= 3 ? COLORS.accent : COLORS.highlight },
            line: { type: 'none' }
          });

          detailSlide.addText(`${subData.score}/5`, {
            x: 8.5, y: subY + 0.15, w: 0.7, h: 0.35,
            fontSize: 12, bold: true, color: COLORS.darkBg,
            align: 'center', valign: 'middle',
            fontFace: 'Arial'
          });

          // Quick Win - moved up for better spacing
          const quickWinText = `Score: ${subData.score}/5 | Quick Win: ${smartShortenText(subData.quickWin || 'Improve capabilities', 75)}`;
          detailSlide.addText(quickWinText, {
            x: 1.3, y: subY + 0.45, w: 7, h: 0.25,
            fontSize: 9, color: COLORS.textLight,
            fontFace: 'Arial',
            wrap: true
          });

          // Current State - moved up for better spacing
          const currentStateText = `Current State: ${smartShortenText(subData.currentState || subData.description || 'Assessment in progress', 95)}`;
          detailSlide.addText(currentStateText, {
            x: 1.3, y: subY + 0.65, w: 7.4, h: 0.2,
            fontSize: 8, color: COLORS.textLight,
            fontFace: 'Arial',
            wrap: true
          });

          // Best Practice - moved up for better spacing (if available)
          if (subData.bestPractice) {
            const bestPracticeText = `Best Practice: ${smartShortenText(subData.bestPractice, 95)}`;
            detailSlide.addText(bestPracticeText, {
              x: 1.3, y: subY + 0.80, w: 7.4, h: 0.2,
              fontSize: 8, color: COLORS.textLight,
              fontFace: 'Arial',
              wrap: true
            });
          }

          subY += 1.15;
        });
      } else {
        // Fallback: show current state, gaps, and recommendations
        let fallbackY = 1.2;

        if (pillarContent?.currentState) {
          detailSlide.addText('Current State', {
            x: 0.5, y: fallbackY, w: 9, h: 0.3,
            fontSize: 14, bold: true, color: COLORS.accent,
            fontFace: 'Arial'
          });
          detailSlide.addText(pillarContent.currentState, {
            x: 0.5, y: fallbackY + 0.35, w: 9, h: 0.6,
            fontSize: 11, color: COLORS.white,
            fontFace: 'Arial'
          });
          fallbackY += 1.2;
        }

        if (pillarContent?.gaps && pillarContent.gaps.length > 0) {
          detailSlide.addText('Key Gaps', {
            x: 0.5, y: fallbackY, w: 9, h: 0.3,
            fontSize: 14, bold: true, color: COLORS.accent,
            fontFace: 'Arial'
          });
          pillarContent.gaps.slice(0, 3).forEach((gap: string, idx: number) => {
            detailSlide.addText(`• ${gap}`, {
              x: 0.7, y: fallbackY + 0.35 + (idx * 0.3), w: 8.8, h: 0.25,
              fontSize: 10, color: COLORS.textLight,
              fontFace: 'Arial'
            });
          });
          fallbackY += 1.3;
        }

        if (pillarContent?.recommendations && pillarContent.recommendations.length > 0) {
          detailSlide.addText('Recommendations', {
            x: 0.5, y: fallbackY, w: 9, h: 0.3,
            fontSize: 14, bold: true, color: COLORS.accent,
            fontFace: 'Arial'
          });
          pillarContent.recommendations.slice(0, 3).forEach((rec: string, idx: number) => {
            detailSlide.addText(`• ${rec}`, {
              x: 0.7, y: fallbackY + 0.35 + (idx * 0.3), w: 8.8, h: 0.25,
              fontSize: 10, color: COLORS.white,
              fontFace: 'Arial'
            });
          });
        }
      }

      // Add branding to detail slide
      addBranding(detailSlide);
    });

    // ======================
    // SLIDE 14: SECTION DIVIDER - Quick Wins
    // ======================
    addSectionDivider('03', 'Quick Wins', '30-day high-impact actions', 'quick_wins');

    // ======================
    // SLIDES 15-16: QUICK WINS (split into 2 slides, 3 per slide)
    // ======================
    const quickWins = slideContent.quickWins || [];
    const quickWinsPages = [quickWins.slice(0, 3), quickWins.slice(3, 6)];

    quickWinsPages.forEach((pageWins, pageIdx) => {
      if (pageWins.length === 0) return;

      const slideQW = pptx.addSlide();
      slideQW.background = { color: COLORS.darkBg };

      slideQW.addText('Quick Wins - 30-Day Action Plan', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      let qwY = 1.1;
      pageWins.forEach((qw: any, idx: number) => {
        const winNumber = (pageIdx * 3) + idx + 1;

        // Card background
        slideQW.addShape(pptx.ShapeType.roundRect, {
          x: 0.5, y: qwY, w: 9, h: 1.2,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.accent, width: 1 }
        });

        // Number badge
        addNumberBadge(slideQW, 0.7, qwY + 0.15, winNumber.toString(), 0.5);

        // Title with truncation
        const qwTitle = qw.title || qw.name || `Quick Win ${winNumber}`;
        slideQW.addText(truncateText(qwTitle, 70), {
          x: 1.4, y: qwY + 0.15, w: 7.6, h: 0.35,
          fontSize: 15, bold: true, color: COLORS.white,
          fontFace: 'Arial',
          wrap: true
        });

        // Timeline, Effort, Impact badges
        const badges = [
          { label: `Timeline: ${qw.timeline || '2 weeks'}`, x: 1.4 },
          { label: `Effort: ${qw.effort || 'LOW'}`, x: 3.2 },
          { label: `Impact: ${qw.impact || 'HIGH'}`, x: 4.5 }
        ];

        badges.forEach(badge => {
          slideQW.addText(badge.label, {
            x: badge.x, y: qwY + 0.55, w: 1.5, h: 0.2,
            fontSize: 8, bold: true, color: COLORS.accent,
            fontFace: 'Arial'
          });
        });

        // Description with truncation - even spacing
        slideQW.addText(truncateText(qw.description || qw.action || '', 120), {
          x: 1.4, y: qwY + 0.75, w: 7.6, h: 0.25,
          fontSize: 10, color: COLORS.white,
          fontFace: 'Arial',
          wrap: true
        });

        // Expected Outcome with truncation - balanced spacing
        const outcome = qw.expectedOutcome || qw.outcome || 'Measurable improvement';
        slideQW.addText(`Expected Outcome: ${truncateText(outcome, 100)}`, {
          x: 1.4, y: qwY + 1.0, w: 7.6, h: 0.18,
          fontSize: 9, color: COLORS.textLight, italic: true,
          fontFace: 'Arial',
          wrap: true
        });

        qwY += 1.4;
      });

      // Add branding to Quick Wins slide
      addBranding(slideQW);
    });

    // ======================
    // SLIDE 17: SECTION DIVIDER - 90-Day Implementation Plan
    // ======================
    addSectionDivider('04', '90-Day\nRoadmap', 'Phased transformation approach', 'roadmap');

    // ======================
    // SLIDE 18: MONTH 1 ROADMAP
    // ======================
    const slide18 = pptx.addSlide();
    slide18.background = { color: COLORS.darkBg };

    slide18.addText('90-Day Implementation Roadmap', {
      x: 0.5, y: 0.3, w: 9, h: 0.5,
      fontSize: 26, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    slide18.addText('Month 1: Foundation Building and Quick Wins', {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 18, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    // Timeline with 4 weeks
    const timelineY = 1.6;
    const timelineStartX = 1.5;
    const timelineWidth = 7;
    const weekSpacing = timelineWidth / 3;

    // Timeline line
    slide18.addShape(pptx.ShapeType.rect, {
      x: timelineStartX, y: timelineY + 0.25, w: timelineWidth, h: 0.02,
      fill: { color: COLORS.accent },
      line: { type: 'none' }
    });

    // 4 weeks
    const month1Data = slideContent.roadmap?.month1 || [];
    [1, 2, 3, 4].forEach((weekNum, idx) => {
      const x = timelineStartX + (idx * weekSpacing);
      const weekData = month1Data.find((w: any) => w.week === `Week ${weekNum}`) ||
                       { action: `Week ${weekNum} activities`, owner: 'Team', outcome: 'Progress milestone' };

      // Number badge
      addNumberBadge(slide18, x - 0.3, timelineY, weekNum.toString(), 0.6);

      // Week label
      slide18.addText(`Week ${weekNum}`, {
        x: x - 0.5, y: timelineY + 0.7, w: 1, h: 0.3,
        fontSize: 12, bold: true, color: COLORS.white,
        align: 'center',
        fontFace: 'Arial'
      });

      // Owner
      slide18.addText(`Owner: ${weekData.owner || 'Team'}`, {
        x: x - 0.7, y: timelineY + 1.1, w: 1.4, h: 0.2,
        fontSize: 9, color: COLORS.accent,
        align: 'center',
        fontFace: 'Arial'
      });

      // Action - use smart shortening without "..."
      const action = smartShortenText(weekData.action || 'Execute plan', 120);
      slide18.addText(`Action: ${action}`, {
        x: x - 0.96, y: timelineY + 1.35, w: 1.92, h: 1.0,
        fontSize: 8, color: COLORS.white,
        align: 'center',
        fontFace: 'Arial',
        wrap: true
      });

      // Outcome - use smart shortening without "..."
      const outcome = smartShortenText(weekData.outcome || 'Milestone achieved', 120);
      slide18.addText(`Outcome: ${outcome}`, {
        x: x - 0.96, y: timelineY + 2.4, w: 1.92, h: 1.0,
        fontSize: 8, color: COLORS.textLight,
        align: 'center',
        fontFace: 'Arial',
        wrap: true
      });
    });

    // Add branding
    addBranding(slide18);

    // ======================
    // SLIDE 19: MONTH 2-3 ROADMAP
    // ======================
    const slide19 = pptx.addSlide();
    slide19.background = { color: COLORS.darkBg };

    slide19.addText('90-Day Implementation Roadmap', {
      x: 0.5, y: 0.3, w: 9, h: 0.5,
      fontSize: 26, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Month 2
    slide19.addText('Month 2: Scale and Integration', {
      x: 0.5, y: 1.2, w: 4.5, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const month2Data = slideContent.roadmap?.month2 || [];
    let m2Y = 1.7;
    month2Data.slice(0, 2).forEach((item: any) => {
      slide19.addText(item.week || 'Week 5-6', {
        x: 0.7, y: m2Y, w: 3.5, h: 0.25,
        fontSize: 11, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide19.addText(`Owner: ${item.owner || 'Team'}`, {
        x: 0.7, y: m2Y + 0.3, w: 3.5, h: 0.2,
        fontSize: 9, color: COLORS.accent,
        fontFace: 'Arial'
      });

      slide19.addText(`Action: ${item.action || 'Execute'}`, {
        x: 0.7, y: m2Y + 0.52, w: 4, h: 0.4,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      slide19.addText(`Outcome: ${item.outcome || 'Progress'}`, {
        x: 0.7, y: m2Y + 0.95, w: 4, h: 0.4,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      m2Y += 1.4;
    });

    // Month 3
    slide19.addText('Month 3: Optimization and Governance', {
      x: 5.2, y: 1.2, w: 4.5, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const month3Data = slideContent.roadmap?.month3 || [];
    let m3Y = 1.7;
    month3Data.slice(0, 2).forEach((item: any) => {
      slide19.addText(item.week || 'Week 9-10', {
        x: 5.4, y: m3Y, w: 3.5, h: 0.25,
        fontSize: 11, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide19.addText(`Owner: ${item.owner || 'Team'}`, {
        x: 5.4, y: m3Y + 0.3, w: 3.5, h: 0.2,
        fontSize: 9, color: COLORS.accent,
        fontFace: 'Arial'
      });

      slide19.addText(`Action: ${item.action || 'Execute'}`, {
        x: 5.4, y: m3Y + 0.52, w: 4, h: 0.4,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      slide19.addText(`Outcome: ${item.outcome || 'Progress'}`, {
        x: 5.4, y: m3Y + 0.95, w: 4, h: 0.4,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      m3Y += 1.4;
    });

    // Add branding
    addBranding(slide19);

    // ======================
    // SLIDE 20: SECTION DIVIDER - Technology Recommendations
    // ======================
    addSectionDivider('05', 'Technology Stack', 'Technology Recommendations\nImmediate Priorities', 'technology');

    // ======================
    // SLIDE 21: TECHNOLOGY RECOMMENDATIONS
    // ======================
    const slide21 = pptx.addSlide();
    slide21.background = { color: COLORS.darkBg };

    slide21.addText('Technology Recommendations', {
      x: 0.5, y: 0.3, w: 9, h: 0.5,
      fontSize: 26, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const techRecommendations = slideContent.technologyRecommendations?.slice(0, 3) || [
      { name: 'Microsoft Power Platform', rationale: 'Rapid development and citizen developer enablement', useCases: ['Power BI dashboards', 'Power Automate workflows', 'Power Apps'] },
      { name: 'Cloud Infrastructure', rationale: 'Scalability and AI services', useCases: ['Data lake', 'AI/ML services', 'DevOps'] },
      { name: 'Analytics Platform', rationale: 'Unified data and insights', useCases: ['Real-time dashboards', 'Predictive analytics', 'Reporting'] }
    ];

    // Default icons for tech recommendations (cycle through these)
    const techIcons = ['gearWhite', 'cloudWhite', 'analyticsWhite', 'robotWhite', 'databaseWhite', 'workflowWhite'];

    let techX = 0.7;
    techRecommendations.forEach((tech: any, techIndex: number) => {
      // Assign unique icon based on content keywords or use default from array
      let techIcon = techIcons[techIndex % techIcons.length];

      if (tech.name && !tech.icon) {
        const nameLower = tech.name.toLowerCase();
        if (nameLower.includes('power') || nameLower.includes('platform')) techIcon = 'gearWhite';
        else if (nameLower.includes('cloud') || nameLower.includes('azure') || nameLower.includes('aws')) techIcon = 'cloudWhite';
        else if (nameLower.includes('analytics') || nameLower.includes('bi') || nameLower.includes('data')) techIcon = 'analyticsWhite';
        else if (nameLower.includes('ai') || nameLower.includes('ml') || nameLower.includes('machine')) techIcon = 'robotWhite';
        else if (nameLower.includes('database') || nameLower.includes('storage') || nameLower.includes('sql')) techIcon = 'databaseWhite';
        else if (nameLower.includes('automation') || nameLower.includes('workflow') || nameLower.includes('process')) techIcon = 'workflowWhite';
      } else if (tech.icon) {
        techIcon = tech.icon;
      }
      // Card - expanded height to 4.04
      slide21.addShape(pptx.ShapeType.roundRect, {
        x: techX, y: 1.2, w: 2.8, h: 4.04,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 2 }
      });

      // Icon circle background
      slide21.addShape(pptx.ShapeType.ellipse, {
        x: techX + 1, y: 1.35, w: 0.8, h: 0.8,
        fill: { color: COLORS.accent, transparency: 20 },
        line: { type: 'none' }
      });

      // White icon specific to each technology
      addIcon(slide21, techX + 1.15, 1.5, techIcon, 0.5);

      // Name
      slide21.addText(tech.name, {
        x: techX + 0.2, y: 2.25, w: 2.4, h: 0.4,
        fontSize: 14, bold: true, color: COLORS.white,
        align: 'center',
        fontFace: 'Arial'
      });

      // Why label
      slide21.addText('Why:', {
        x: techX + 0.2, y: 2.72, w: 2.4, h: 0.2,
        fontSize: 10, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      // Rationale - expanded character limit and height, using smart shortening
      slide21.addText(smartShortenText(tech.rationale || '', 150), {
        x: techX + 0.2, y: 2.97, w: 2.4, h: 0.85,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      // Use Cases label - shifted down
      slide21.addText('Use Cases:', {
        x: techX + 0.2, y: 3.9, w: 2.4, h: 0.2,
        fontSize: 10, bold: true, color: COLORS.accent,
        fontFace: 'Arial'
      });

      // Use cases with truncation - shifted down
      const useCases = tech.useCases?.slice(0, 3) || [];
      let ucY = 4.15;
      useCases.forEach((uc: string) => {
        slide21.addText(`• ${truncateText(uc, 40)}`, {
          x: techX + 0.3, y: ucY, w: 2.2, h: 0.25,
          fontSize: 8, color: COLORS.white,
          fontFace: 'Arial',
          wrap: true
        });
        ucY += 0.27;
      });

      techX += 3.1;
    });

    // Add branding
    addBranding(slide21);

    // ======================
    // SLIDE 22: SECTION DIVIDER - Change Management
    // ======================
    addSectionDivider('06', 'Change Management', 'Communication & Training Strategies', 'change_management');

    // ======================
    // SLIDE 23: CHANGE MANAGEMENT STRATEGY
    // ======================
    const slide23 = pptx.addSlide();
    slide23.background = { color: COLORS.darkBg };

    slide23.addText('Change Management', {
      x: 0.5, y: 0.3, w: 9, h: 0.5,
      fontSize: 26, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    slide23.addText('A comprehensive approach to successful digital transformation.', {
      x: 0.5, y: 0.85, w: 9, h: 0.3,
      fontSize: 12, color: COLORS.textLight,
      fontFace: 'Arial'
    });

    // Left column - Communication Plan
    slide23.addText('Communication Plan', {
      x: 0.5, y: 1.3, w: 4.3, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const commSections = [
      { title: 'Leadership Alignment', items: ['Monthly executive briefings', 'Quarterly strategy reviews', 'Regular town halls'], icon: 'leadership' },
      { title: 'Employee Engagement', items: ['Weekly team updates', 'Monthly training sessions', 'Recognition programs'], icon: 'people' },
      { title: 'Stakeholder Management', items: ['Bi-weekly steering meetings', 'Risk management process', 'Regular pulse surveys'], icon: 'handshake' }
    ];

    let commY = 1.8;
    commSections.forEach(section => {
      // Card background
      slide23.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: commY, w: 4.3, h: 1.05,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 1 }
      });

      // Icon
      addIcon(slide23, 0.7, commY + 0.15, section.icon, 0.4);

      // Section title
      slide23.addText(section.title, {
        x: 1.3, y: commY + 0.15, w: 3.3, h: 0.25,
        fontSize: 11, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Items
      let itemY = commY + 0.45;
      section.items.forEach(item => {
        slide23.addText(`• ${item}`, {
          x: 1.3, y: itemY, w: 3.4, h: 0.18,
          fontSize: 8, color: COLORS.textLight,
          fontFace: 'Arial'
        });
        itemY += 0.2;
      });

      commY += 1.2;
    });

    // Right column - Training & Development
    slide23.addText('Training & Development', {
      x: 5.2, y: 1.3, w: 4.3, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const trainingSections = [
      { title: 'Foundational Training', items: ['Digital literacy basics', 'Microsoft 365 certification', 'Data analysis fundamentals'], icon: 'education' },
      { title: 'Advanced Skills', items: ['Power Platform developer', 'AI/ML practitioner training', 'Agile and design thinking'], icon: 'certificate' },
      { title: 'Leadership Development', items: ['Digital transformation leadership', 'Change management certification', 'Innovation mindset'], icon: 'growth' }
    ];

    let trainY = 1.8;
    trainingSections.forEach(section => {
      // Card background
      slide23.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: trainY, w: 4.3, h: 1.05,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 1 }
      });

      // Icon
      addIcon(slide23, 5.4, trainY + 0.15, section.icon, 0.4);

      // Section title
      slide23.addText(section.title, {
        x: 6, y: trainY + 0.15, w: 3.3, h: 0.25,
        fontSize: 11, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Items
      let itemY = trainY + 0.45;
      section.items.forEach(item => {
        slide23.addText(`• ${item}`, {
          x: 6, y: itemY, w: 3.4, h: 0.18,
          fontSize: 8, color: COLORS.textLight,
          fontFace: 'Arial'
        });
        itemY += 0.2;
      });

      trainY += 1.2;
    });

    // Add branding
    addBranding(slide23);

    // ======================
    // SLIDE 24: SUCCESS METRICS
    // ======================
    const slide24 = pptx.addSlide();
    slide24.background = { color: COLORS.darkBg };

    slide24.addText('Success Metrics', {
      x: 0.5, y: 0.3, w: 9, h: 0.5,
      fontSize: 26, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Left - Business Impact
    slide24.addText('Business Impact', {
      x: 0.5, y: 1, w: 4.3, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const businessMetrics = slideContent.successMetrics?.business?.slice(0, 3) || [
      { metric: 'Efficiency Gains', target: '30% reduction in manual time', measure: 'Hours saved per month', icon: 'speedometer' },
      { metric: 'Cost Savings', target: '$500K annual savings', measure: 'ROI analysis', icon: 'money' },
      { metric: 'Revenue Growth', target: '15% digital channel increase', measure: 'Sales analytics', icon: 'trendUp' }
    ];

    // Array of business impact icons to cycle through
    const businessIcons = ['speedometer', 'money', 'trendUp', 'productivity', 'roi', 'revenue', 'efficiency', 'qualityMetric', 'growthMetric', 'profit'];

    let bizY = 1.5;
    businessMetrics.forEach((metric: any, idx: number) => {
      // Card - taller for better spacing
      slide24.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: bizY, w: 4.3, h: 1.1,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 1 }
      });

      // Icon - use unique icon for each metric
      const iconKey = metric.icon || businessIcons[idx % businessIcons.length];
      addIcon(slide24, 0.7, bizY + 0.25, iconKey, 0.4);

      // Metric name
      slide24.addText(metric.metric, {
        x: 1.3, y: bizY + 0.2, w: 3.3, h: 0.25,
        fontSize: 12, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Target - more spacing
      slide24.addText(`Target: ${metric.target}`, {
        x: 1.3, y: bizY + 0.5, w: 3.3, h: 0.22,
        fontSize: 9, color: COLORS.accent,
        fontFace: 'Arial',
        wrap: true
      });

      // Measure - more spacing
      slide24.addText(`Measure: ${metric.measure}`, {
        x: 1.3, y: bizY + 0.78, w: 3.3, h: 0.22,
        fontSize: 8, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      bizY += 1.25;
    });

    // Right - Adoption Metrics
    slide24.addText('Adoption Metrics', {
      x: 5.2, y: 1, w: 4.3, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.accent,
      fontFace: 'Arial'
    });

    const adoptionMetrics = slideContent.successMetrics?.adoption?.slice(0, 3) || [
      { metric: 'User Engagement', target: '80% employee adoption', measure: 'Active user counts', icon: 'users' },
      { metric: 'Satisfaction', target: '4.5/5 satisfaction score', measure: 'Quarterly NPS surveys', icon: 'heart' },
      { metric: 'Innovation', target: '50 citizen developer solutions', measure: 'App inventory', icon: 'bulb' }
    ];

    // Array of adoption metric icons to cycle through
    const adoptionIcons = ['users', 'heart', 'bulb', 'engagement', 'satisfaction', 'training', 'collaboration', 'adoption', 'retention', 'feedback'];

    let adoptY = 1.5;
    adoptionMetrics.forEach((metric: any, idx: number) => {
      // Card - taller for better spacing
      slide24.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: adoptY, w: 4.3, h: 1.1,
        fill: { color: COLORS.cardBg },
        line: { color: COLORS.accent, width: 1 }
      });

      // Icon - use unique icon for each metric
      const iconKey = metric.icon || adoptionIcons[idx % adoptionIcons.length];
      addIcon(slide24, 5.4, adoptY + 0.25, iconKey, 0.4);

      // Metric name
      slide24.addText(metric.metric, {
        x: 6, y: adoptY + 0.2, w: 3.3, h: 0.25,
        fontSize: 12, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      // Target - more spacing
      slide24.addText(`Target: ${metric.target}`, {
        x: 6, y: adoptY + 0.5, w: 3.3, h: 0.22,
        fontSize: 9, color: COLORS.accent,
        fontFace: 'Arial',
        wrap: true
      });

      // Measure - more spacing
      slide24.addText(`Measure: ${metric.measure}`, {
        x: 6, y: adoptY + 0.78, w: 3.3, h: 0.22,
        fontSize: 8, color: COLORS.textLight,
        fontFace: 'Arial',
        wrap: true
      });

      adoptY += 1.25;
    });

    // Add branding
    addBranding(slide24);

    // ======================
    // SLIDE 25: SECTION DIVIDER - Next Steps
    // ======================
    addSectionDivider('07', 'Getting Started', 'Next Steps', 'next_steps');

    // ======================
    // SLIDE 26: NEXT STEPS
    // ======================
    const slide26 = pptx.addSlide();
    slide26.background = { color: COLORS.darkBg };

    slide26.addText('Getting Started', {
      x: 0.5, y: 0.25, w: 9, h: 0.4,
      fontSize: 16, color: COLORS.accent,
      fontFace: 'Arial'
    });

    slide26.addText('Next Steps', {
      x: 0.5, y: 0.7, w: 9, h: 0.6,
      fontSize: 32, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    // Immediate Actions grid
    slide26.addText('Immediate Actions (Week 1)', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const immediateActions = [
      { num: '01', title: 'Secure Executive Sponsorship', desc: 'Present assessment and get commitment', icon: 'handshakeWhite' },
      { num: '02', title: 'Form Steering Committee', desc: 'Identify key stakeholders and schedule kickoff', icon: 'teamWhite' },
      { num: '03', title: 'Identify Champions', desc: 'Recruit 10-15 citizen developers', icon: 'userWhite' },
      { num: '04', title: 'Select Project Management Tool', desc: 'Choose framework and tool for tracking initiatives', icon: 'kanbanWhite' }
    ];

    const actionY = 2.05;
    immediateActions.forEach((action, idx) => {
      const col = Math.floor(idx / 2);
      const x = col === 0 ? 0.5 : 5.2;
      const rowInCol = idx % 2;
      const y = actionY + rowInCol * 0.85;

      // Icon circle background
      slide26.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.05, y: y + 0.02, w: 0.45, h: 0.45,
        fill: { color: COLORS.accent, transparency: 20 },
        line: { type: 'none' }
      });

      // Icon
      addIcon(slide26, x + 0.15, y + 0.12, action.icon, 0.25);

      // Accent line
      slide26.addShape(pptx.ShapeType.rect, {
        x, y: y + 0.5, w: 4, h: 0.02,
        fill: { color: COLORS.accent },
        line: { type: 'none' }
      });

      slide26.addText(action.title, {
        x: x + 0.6, y: y + 0.02, w: 3.4, h: 0.28,
        fontSize: 13, bold: true, color: COLORS.white,
        fontFace: 'Arial'
      });

      slide26.addText(action.desc, {
        x: x + 0.6, y: y + 0.28, w: 3.4, h: 0.2,
        fontSize: 9, color: COLORS.textLight,
        fontFace: 'Arial'
      });
    });

    // First Month Priorities
    slide26.addText('First Month Priorities', {
      x: 0.5, y: 3.8, w: 9, h: 0.4,
      fontSize: 18, bold: true, color: COLORS.white,
      fontFace: 'Arial'
    });

    const priorities = [
      'Execute Month 1 Roadmap - Deliver all Week 1-4 milestones',
      'Measure & Communicate - Track KPIs and share weekly updates',
      'Remove Blockers - Address issues quickly to maintain momentum',
      'Celebrate Wins - Recognition events to build enthusiasm'
    ];

    let priorityY = 4.3;
    priorities.forEach((priority, idx) => {
      slide26.addText(`${idx + 1}. ${priority}`, {
        x: 0.7, y: priorityY, w: 8.8, h: 0.25,
        fontSize: 11, color: COLORS.textLight,
        fontFace: 'Arial'
      });
      priorityY += 0.3;
    });

    // Add branding
    addBranding(slide26);

    // Generate PPTX file
    console.log('[PPTX Export] Generating file...');
    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

    console.log('[PPTX Export] Presentation created successfully');

    // Return as downloadable file
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${assessment.company_name?.replace(/[^a-z0-9]/gi, '_') || 'assessment'}_digital_transformation.pptx"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('[PPTX Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
