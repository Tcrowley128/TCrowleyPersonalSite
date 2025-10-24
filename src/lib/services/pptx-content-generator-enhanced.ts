import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AssessmentData {
  company_name: string;
  industry?: string;
  created_at: string;
  maturity_assessment?: any;
  quick_wins?: any[];
  priority_matrix?: any;
  strategic_initiatives?: any;
  technology_recommendations?: any;
  change_management?: any;
  success_metrics?: any;
}

export interface ImageRecommendation {
  slideType: string;
  searchQuery: string;
  description: string;
  placement: 'background' | 'icon' | 'illustration' | 'chart';
}

export interface SlideContent {
  currentState: {
    summary: string;
    painPoints: string[];
    techStack: {
      current: string[];
      underutilized: string[];
    };
  };
  pillars: {
    [key: string]: {
      score?: number;
      currentState: string;
      capabilities: string[];
      gaps: string[];
      targetState: string;
      keyInitiatives: string[];
      recommendations?: string[];
      subScores?: {
        [subCategory: string]: {
          score: number;
          quickWin?: string;
          currentState?: string;
          bestPractice?: string;
          description?: string;
        };
      };
      industryBenchmark?: {
        average: number;
        topPerformers: number;
        source: string;
      };
    };
  };
  technologyRecommendations?: Array<{
    name: string;
    rationale: string;
    useCases: string[];
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  strategicInitiatives?: {
    shortTerm?: string[];
    midTerm?: string[];
    longTerm?: string[];
  };
  quickWins: Array<{
    title: string;
    description: string;
    timeline: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    outcome: string;
    industryExample?: string;
  }>;
  roadmap: {
    month1: Array<{
      week: string;
      owner: string;
      action: string;
      outcome: string;
    }>;
    month2: Array<{
      weeks: string;
      owner: string;
      action: string;
      outcome: string;
    }>;
    month3: Array<{
      weeks: string;
      owner: string;
      action: string;
      outcome: string;
    }>;
  };
  changeManagement: {
    communication: {
      leadership: string;
      employee: string;
      stakeholder: string;
    };
    training: {
      foundational: string[];
      advanced: string[];
      leadership: string[];
    };
    stakeholderEngagement?: {
      sponsors?: string[];
      champions?: string[];
      users?: string[];
    };
  };
  successMetrics: {
    business: Array<{
      metric: string;
      target: string;
      measure: string;
      industryBenchmark?: string;
    }>;
    adoption: Array<{
      metric: string;
      target: string;
      measure: string;
      industryBenchmark?: string;
    }>;
  };
  nextSteps: {
    week1: Array<{
      action: string;
      owner: string;
    }>;
    month1: Array<{
      priority: string;
      description: string;
    }>;
  };
  imageRecommendations: ImageRecommendation[];
  industryInsights: {
    digitalTransformationTrends: string[];
    competitivePositioning: string;
    emergingTechnologies: string[];
  };
}

const ENHANCED_CONTENT_GENERATION_PROMPT = `You are an expert digital transformation consultant with access to web search. You will create a comprehensive, data-driven Digital Transformation Assessment presentation.

**YOUR CAPABILITIES:**
- You can search the web for industry best practices and benchmarks
- You can find recent digital transformation trends and statistics
- You can research competitive positioning and market data
- You can identify relevant case studies and success metrics

**YOUR TASK:**
1. USE ALL THE DETAILED ASSESSMENT DATA PROVIDED - every pillar score, every capability, every gap, every recommendation
2. Extract ALL content from the assessment results JSON including:
   - Complete maturity scores and detailed breakdowns for all 5 pillars
   - Current state, capabilities, and gaps for each pillar
   - Quick wins with timelines and impact
   - Full 90-day roadmap (Month 1, 2, 3)
   - Strategic initiatives and long-term strategy
   - Change management plans (communication, training, stakeholder engagement)
   - Success metrics and KPIs
3. Search the web for relevant industry benchmarks to COMPLEMENT (not replace) the assessment data
4. Find current digital transformation trends for the specific industry
5. Research typical maturity scores to compare against the actual scores
6. Add industry context and validation to the detailed assessment findings
7. Recommend relevant images/visuals for the presentation

**WEB SEARCH INSTRUCTIONS:**
- Search for "{INDUSTRY} digital transformation benchmarks 2024-2025"
- Search for "digital maturity assessment industry average {INDUSTRY}"
- Search for "successful digital transformation case studies {INDUSTRY}"
- Search for "{PILLAR} best practices {INDUSTRY}" for each pillar
- Search for "digital transformation ROI metrics {INDUSTRY}"
- Find statistics, percentages, and concrete numbers to include

**IMAGE RECOMMENDATIONS:**
For each slide type, recommend appropriate image searches:
- Executive summary: Professional business technology imagery
- Pillar analysis: Icons or diagrams representing each pillar
- Roadmap: Timeline or journey visualizations
- Technology stack: Platform/tool logos or dashboards
- Success metrics: Chart or graph visualizations

**CRITICAL INSTRUCTIONS:**
1. PRESERVE ALL ORIGINAL ASSESSMENT DATA - Do not lose any details from the provided assessment results
2. Extract EVERY pillar's complete data: scores, current state, capabilities, gaps, target state, initiatives
3. Include ALL quick wins with their timelines, effort, and impact ratings
4. Include the COMPLETE 90-day roadmap with all months and weeks
5. Include ALL change management content: communication plans, training programs, stakeholder engagement
6. Include ALL strategic initiatives and long-term strategy details
7. Include ALL success metrics with specific targets and measures
8. Use web search to ADD industry benchmarks and context to complement (not replace) the assessment data
9. Include specific numbers, percentages, and data points from your research
10. Reference sources when citing industry data
11. Make recommendations based on current best practices (2024-2025)
12. Be specific to the company's industry
13. Return ONLY valid JSON - no markdown, no explanations

**OUTPUT FORMAT:**
Return a JSON object with this exact structure (with industry-researched data):

{
  "currentState": {
    "summary": "2-3 sentences with industry context",
    "painPoints": ["Pain points validated against industry challenges"],
    "techStack": {
      "current": ["Tools based on industry standards"],
      "underutilized": ["Commonly underutilized tools in this industry"]
    }
  },
  "pillars": {
    "data_strategy": {
      "score": 2,
      "currentState": "DETAILED description from the assessment data",
      "capabilities": ["ALL current capabilities from assessment - be comprehensive"],
      "gaps": ["ALL gaps identified in assessment - don't omit any"],
      "targetState": "Complete target state vision from assessment",
      "keyInitiatives": ["ALL key initiatives from assessment - include every one"],
      "recommendations": ["Specific recommendations from assessment"],
      "subScores": {
        "Data Quality & Governance": {
          "score": 2,
          "quickWin": "Implement automated data quality monitoring in Power BI",
          "currentState": "Inconsistent data quality with no systematic governance framework",
          "bestPractice": "Data governance reduces errors by 50% and increases trust in analytics"
        },
        "Data Integration & Accessibility": {
          "score": 2,
          "quickWin": "Connect top 3 data sources to unified Power BI workspace",
          "currentState": "Data scattered across Salesforce, Excel, and departmental systems",
          "bestPractice": "Unified data platforms increase analyst productivity by 40%"
        },
        "Analytics & Insights": {
          "score": 2,
          "quickWin": "Deploy executive dashboard with real-time KPIs",
          "currentState": "Manual reporting with 2-3 day lag for decision-critical insights",
          "bestPractice": "Real-time analytics improves decision speed by 5x"
        },
        "Data Culture & Literacy": {
          "score": 1,
          "quickWin": "Launch monthly data literacy training sessions",
          "currentState": "Limited data skills outside IT department, inhibiting self-service analytics",
          "bestPractice": "Data-literate organizations are 3x more likely to achieve strategic goals"
        }
      },
      "industryBenchmark": {
        "average": 2.8,
        "topPerformers": 4.2,
        "source": "Source from web search"
      }
    },
    "automation": {
      "score": 2,
      "currentState": "DETAILED description from assessment",
      "capabilities": ["ALL automation capabilities"],
      "gaps": ["ALL automation gaps"],
      "targetState": "Complete target state",
      "keyInitiatives": ["ALL automation initiatives"],
      "recommendations": ["Automation recommendations"],
      "subScores": {
        "Process Automation": {
          "score": 2,
          "quickWin": "Automate invoice processing with Power Automate",
          "currentState": "High-volume manual processes like invoice processing, onboarding remain unautomated",
          "bestPractice": "RPA reduces processing time by 60-80% while improving accuracy"
        },
        "Workflow Optimization": {
          "score": 2,
          "quickWin": "Map and optimize approval workflows in top 3 processes",
          "currentState": "Multi-step approval processes causing delays and bottlenecks",
          "bestPractice": "Workflow automation cuts approval time from days to hours"
        },
        "Integration & Orchestration": {
          "score": 1,
          "quickWin": "Build Power Automate flows connecting Salesforce to Microsoft 365",
          "currentState": "Disconnected systems requiring manual data transfer and updates",
          "bestPractice": "Integrated systems eliminate 70% of manual data entry tasks"
        },
        "Automation Governance": {
          "score": 1,
          "quickWin": "Establish CoE with automation standards and templates",
          "currentState": "Ad-hoc automation without oversight, reusability, or best practices",
          "bestPractice": "Automation CoEs increase ROI by 3x through reuse and standards"
        }
      },
      "industryBenchmark": { "average": 2.5, "topPerformers": 4.0, "source": "Industry source" }
    },
    "ai_integration": {
      "score": 1,
      "currentState": "DETAILED AI current state",
      "capabilities": ["ALL AI capabilities"],
      "gaps": ["ALL AI gaps"],
      "targetState": "Complete AI target state",
      "keyInitiatives": ["ALL AI initiatives"],
      "recommendations": ["AI recommendations"],
      "subScores": {
        "AI-Powered Analytics": {
          "score": 1,
          "quickWin": "Enable Power BI AI insights for automatic pattern detection",
          "currentState": "Basic analytics without AI enhancement or predictive capabilities",
          "bestPractice": "95% of technology firms invest in AI with 27.8% market share in digital transformation"
        },
        "Generative AI & LLMs": {
          "score": 1,
          "quickWin": "Deploy Microsoft Copilot for Teams",
          "currentState": "No systematic use of generative AI for content creation or process optimization",
          "bestPractice": "Technology companies see 40-50% reduction in content creation time with GenAI implementation"
        },
        "AI Agents & Copilots": {
          "score": 1,
          "quickWin": "Implement Cognigy chatbot for internal IT support",
          "currentState": "Customer support and document analysis opportunities not leveraged",
          "bestPractice": "AI agents deliver double-digit productivity gains within first 6 months"
        },
        "ML Operations": {
          "score": 1,
          "quickWin": "Start with pre-built ML models in Power Platform",
          "currentState": "No structured approach to machine learning model deployment or management",
          "bestPractice": "MLOps implementation reduces model deployment time by 75% and improves reliability"
        }
      },
      "industryBenchmark": { "average": 2.2, "topPerformers": 4.5, "source": "Industry source" }
    },
    "people_culture": {
      "score": 2,
      "currentState": "DETAILED people & culture state",
      "capabilities": ["ALL people capabilities"],
      "gaps": ["ALL culture gaps"],
      "targetState": "Complete people target state",
      "keyInitiatives": ["ALL people initiatives"],
      "recommendations": ["People recommendations"],
      "subScores": {
        "Digital Skills & Training": {
          "score": 2,
          "quickWin": "Launch Power Platform fundamentals training for 15 champions",
          "currentState": "Technology skills concentrated in IT with limited upskilling programs",
          "bestPractice": "Continuous learning programs increase innovation by 50%"
        },
        "Change Management": {
          "score": 2,
          "quickWin": "Create change champion network with monthly meetings",
          "currentState": "Technology changes rolled out without systematic change management",
          "bestPractice": "Structured change management increases adoption rates by 6x"
        },
        "Innovation Culture": {
          "score": 2,
          "quickWin": "Launch innovation challenge with recognition for citizen developers",
          "currentState": "Risk-averse culture limiting experimentation and employee-driven innovation",
          "bestPractice": "Innovation programs generate 10x ROI from employee-led improvements"
        },
        "Leadership & Vision": {
          "score": 2,
          "quickWin": "Establish monthly digital transformation steering committee",
          "currentState": "Digital transformation vision exists but lacks executive sponsorship and resources",
          "bestPractice": "Executive sponsorship is #1 predictor of transformation success"
        }
      },
      "industryBenchmark": { "average": 2.9, "topPerformers": 4.1, "source": "Industry source" }
    },
    "user_experience": {
      "score": 2,
      "currentState": "DETAILED UX state",
      "capabilities": ["ALL UX capabilities"],
      "gaps": ["ALL UX gaps"],
      "targetState": "Complete UX target state",
      "keyInitiatives": ["ALL UX initiatives"],
      "recommendations": ["UX recommendations"],
      "subScores": {
        "User Research & Testing": {
          "score": 2,
          "quickWin": "Deploy Microsoft Forms for monthly user satisfaction surveys",
          "currentState": "Limited user feedback collection and no systematic usability testing",
          "bestPractice": "Technology companies conduct quarterly user research with 85%+ participation rates"
        },
        "Interface Design & Usability": {
          "score": 2,
          "quickWin": "Redesign top 3 most-used applications using design system",
          "currentState": "Inconsistent interface patterns creating user confusion and training burden",
          "bestPractice": "Design systems reduce development time by 30% and increase user satisfaction by 45%"
        },
        "Onboarding & Training": {
          "score": 1,
          "quickWin": "Create interactive Power Apps onboarding wizard with progress tracking",
          "currentState": "Manual, document-heavy onboarding taking 3+ days per new employee",
          "bestPractice": "Modern onboarding reduces time-to-productivity by 50% and increases retention by 25%"
        },
        "Accessibility & Inclusion": {
          "score": 1,
          "quickWin": "Run accessibility audit and fix critical WCAG compliance issues",
          "currentState": "Minimal accessibility consideration in application design and development",
          "bestPractice": "Accessible design reaches 15% larger audience and improves overall usability"
        }
      },
      "industryBenchmark": { "average": 3.0, "topPerformers": 4.3, "source": "Industry source" }
    }
  },
  "technologyRecommendations": [
    {
      "name": "Technology Name (e.g., Microsoft Power Platform)",
      "rationale": "Why this technology from assessment",
      "useCases": ["Use case 1", "Use case 2", "Use case 3"],
      "priority": "HIGH"
    }
    // Include 3-4 technology recommendations from assessment
  ],
  "quickWins": [
    {
      "title": "Quick Win Title",
      "description": "Description",
      "timeline": "1-2 weeks",
      "effort": "LOW",
      "impact": "HIGH",
      "outcome": "Outcome with industry benchmark",
      "industryExample": "Example: Company X achieved Y% improvement"
    }
  ],
  "roadmap": {
    "month1": [
      {
        "week": "Week 1",
        "owner": "Role from assessment",
        "action": "Specific action from assessment",
        "outcome": "Expected outcome from assessment"
      }
      // Include ALL Week 1-4 activities from assessment
    ],
    "month2": [
      {
        "weeks": "Weeks 5-6",
        "owner": "Role",
        "action": "Action",
        "outcome": "Outcome"
      }
      // Include ALL Month 2 activities from assessment
    ],
    "month3": [
      {
        "weeks": "Weeks 9-12",
        "owner": "Role",
        "action": "Action",
        "outcome": "Outcome"
      }
      // Include ALL Month 3 activities from assessment
    ]
  },
  "strategicInitiatives": {
    "shortTerm": ["ALL short-term initiatives from assessment"],
    "midTerm": ["ALL mid-term initiatives"],
    "longTerm": ["ALL long-term strategic initiatives"]
  },
  "changeManagement": {
    "communication": {
      "leadership": "Complete leadership communication plan from assessment",
      "employee": "Complete employee communication plan from assessment",
      "stakeholder": "Complete stakeholder communication plan from assessment"
    },
    "training": {
      "foundational": ["ALL foundational training programs from assessment"],
      "advanced": ["ALL advanced training programs from assessment"],
      "leadership": ["ALL leadership training programs from assessment"]
    },
    "stakeholderEngagement": {
      "sponsors": ["How to engage sponsors from assessment"],
      "champions": ["How to engage champions from assessment"],
      "users": ["How to engage end users from assessment"]
    }
  },
  "successMetrics": {
    "business": [
      {
        "metric": "Efficiency Gains",
        "target": "30% reduction (based on industry data)",
        "measure": "Hours saved per month",
        "industryBenchmark": "Industry average: 25-35% improvement"
      }
    ],
    "adoption": [
      {
        "metric": "User Engagement",
        "target": "80% adoption",
        "measure": "Active user counts",
        "industryBenchmark": "Industry leaders achieve 85%+"
      }
    ]
  },
  "nextSteps": {
    // ... as before ...
  },
  "imageRecommendations": [
    {
      "slideType": "title",
      "searchQuery": "professional digital transformation technology background",
      "description": "Modern, professional technology imagery",
      "placement": "background"
    },
    {
      "slideType": "data_strategy",
      "searchQuery": "data analytics dashboard visualization",
      "description": "Data analytics and BI visualization",
      "placement": "illustration"
    },
    {
      "slideType": "automation",
      "searchQuery": "process automation workflow diagram",
      "description": "Automation workflow visualization",
      "placement": "illustration"
    },
    {
      "slideType": "ai_integration",
      "searchQuery": "artificial intelligence machine learning",
      "description": "AI/ML technology imagery",
      "placement": "illustration"
    },
    {
      "slideType": "roadmap",
      "searchQuery": "digital transformation timeline infographic",
      "description": "Implementation timeline visual",
      "placement": "illustration"
    }
  ],
  "industryInsights": {
    "digitalTransformationTrends": [
      "Trend 1 from web search with statistics",
      "Trend 2 from web search with data",
      "Trend 3 from recent research"
    ],
    "competitivePositioning": "Analysis of company position vs industry average",
    "emergingTechnologies": [
      "Technology 1 relevant to this industry",
      "Technology 2 gaining adoption",
      "Technology 3 to watch"
    ]
  }
}

**REMEMBER:**
- Use web search extensively to find current, accurate industry data
- Include specific statistics and percentages from your research
- Reference sources for benchmarks
- Make all recommendations data-driven
- Be specific to the {INDUSTRY} industry
- Return ONLY the JSON object

**MOST IMPORTANT - DATA EXTRACTION:**
You will receive a DETAILED ASSESSMENT RESULTS JSON below with comprehensive information about:
- Each pillar's maturity scores (out of 5)
- Current state descriptions for each pillar
- Specific capabilities identified
- Specific gaps identified
- Target states defined
- Key initiatives planned
- Quick wins with timelines
- 90-day roadmap with weekly/monthly breakdowns
- Change management strategies
- Success metrics with targets

YOU MUST EXTRACT AND USE ALL OF THIS DETAILED INFORMATION. Do not generate generic content when specific assessment data is provided. The assessment results JSON contains the actual findings from analyzing this company - use every detail from it.`;

export async function generatePresentationContentEnhanced(
  assessmentData: AssessmentData,
  resultsData: any
): Promise<SlideContent> {
  try {
    console.log('[Content Generator] Starting enhanced content generation with web search...');

    const industry = assessmentData.industry || 'Technology';
    const companyName = assessmentData.company_name;

    // Use Claude's extended thinking model which has web search capabilities
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: ENHANCED_CONTENT_GENERATION_PROMPT
            .replace(/\{INDUSTRY\}/g, industry)
            .replace(/\{PILLAR\}/g, 'data strategy')
            + `

**COMPANY ASSESSMENT DATA:**

Company: ${companyName}
Industry: ${industry}
Assessment Date: ${new Date(assessmentData.created_at).toLocaleDateString()}

**MATURITY SCORES:**
Overall: ${resultsData.maturity_assessment?.overall_score || 2}/5

Pillar Scores:
- Data Strategy: ${resultsData.maturity_assessment?.pillars?.data_strategy?.score || 2}/5
- Automation: ${resultsData.maturity_assessment?.pillars?.automation?.score || 2}/5
- AI Integration: ${resultsData.maturity_assessment?.pillars?.ai_integration?.score || 1}/5
- People & Culture: ${resultsData.maturity_assessment?.pillars?.people_culture?.score || 2}/5
- User Experience: ${resultsData.maturity_assessment?.pillars?.user_experience?.score || 2}/5

**DETAILED ASSESSMENT RESULTS:**
${JSON.stringify(resultsData, null, 2)}

**CRITICAL INSTRUCTIONS:**
1. Use web search to find industry benchmarks for ${industry} companies
2. Research current digital transformation trends in ${industry}
3. Find typical ROI metrics and success stories
4. Recommend specific images/visuals for each slide type
5. Include concrete statistics and data points from your research
6. Generate comprehensive, data-driven presentation content

**CRITICAL OUTPUT REQUIREMENT:**
You MUST output ONLY the JSON object - no explanations, no introductions, no thinking process.
Start your response with the opening brace { and end with the closing brace }.
Do NOT include any text before or after the JSON.`,
        },
      ],
    });

    console.log('[Content Generator] Claude response received');

    // Extract the JSON from Claude's response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Content Generator] Response preview:', responseText.substring(0, 200));

    // Try to extract JSON if Claude wrapped it in markdown or added text
    let jsonText = responseText.trim();

    // Remove markdown code blocks
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // If Claude added text before the JSON, extract just the JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const content: SlideContent = JSON.parse(jsonText);

    console.log('[Content Generator] Content parsed successfully');
    console.log('[Content Generator] Image recommendations:', content.imageRecommendations?.length || 0);
    console.log('[Content Generator] Industry insights included:', !!content.industryInsights);

    return content;
  } catch (error) {
    console.error('[Content Generator] Error generating presentation content:', error);
    throw new Error(`Failed to generate presentation content: ${error}`);
  }
}

// Helper function to search for and download images (using Unsplash API)
export async function searchAndDownloadImage(
  query: string,
  imageType: 'background' | 'icon' | 'illustration' | 'chart'
): Promise<string | null> {
  try {
    // Use Unsplash API for free, high-quality images
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('[Image Search] Unsplash API key not configured, skipping image search');
      return null;
    }

    const orientation = imageType === 'background' ? 'landscape' : 'squarish';
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn('[Image Search] Failed to fetch from Unsplash:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log('[Image Search] Found image for query:', query);
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error('[Image Search] Error searching for image:', error);
    return null;
  }
}

// Helper to download image as base64 for embedding in PPTX
export async function downloadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('[Image Download] Error downloading image:', error);
    return null;
  }
}
