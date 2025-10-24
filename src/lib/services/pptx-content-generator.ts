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
      currentState: string;
      capabilities: string[];
      gaps: string[];
      targetState: string;
      keyInitiatives: string[];
    };
  };
  quickWins: Array<{
    title: string;
    description: string;
    timeline: string;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    outcome: string;
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
  };
  successMetrics: {
    business: Array<{
      metric: string;
      target: string;
      measure: string;
    }>;
    adoption: Array<{
      metric: string;
      target: string;
      measure: string;
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
}

const CONTENT_GENERATION_PROMPT = `You are an expert at creating professional Digital Transformation Assessment presentations for technology companies. You have access to assessment data and need to generate detailed, actionable content for each slide.

**CRITICAL INSTRUCTIONS:**
1. Generate content that is SPECIFIC to the company's actual assessment results
2. Use the assessment scores, answers, and data to create personalized insights
3. Follow the Bosch template structure EXACTLY
4. Be professional, actionable, and data-driven
5. Provide concrete recommendations based on the actual maturity scores
6. Return ONLY valid JSON - no additional text, markdown formatting, or explanations

**Assessment Data Format:**
The assessment includes:
- Overall maturity score (1-5 scale)
- Five pillar scores: Data Strategy, Automation, AI Integration, People & Culture, User Experience
- User responses to strategic questions
- Company information (name, industry, etc.)

**Output Format:**
You MUST return a JSON object with this exact structure:

{
  "currentState": {
    "summary": "2-3 sentences describing the organization's current digital maturity level based on their scores",
    "painPoints": ["Top pain point 1 based on lowest scores", "Pain point 2", "Pain point 3"],
    "techStack": {
      "current": ["Current tool/platform 1", "Current tool 2", "Current tool 3"],
      "underutilized": ["Underutilized technology 1", "Under utilized technology 2"]
    }
  },
  "pillars": {
    "data_strategy": {
      "currentState": "Detailed assessment of current data capabilities based on score",
      "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
      "gaps": ["Gap 1 to address", "Gap 2 to address", "Gap 3 to address"],
      "targetState": "Vision for improved data strategy",
      "keyInitiatives": ["Initiative 1", "Initiative 2", "Initiative 3"]
    },
    "automation": {
      "currentState": "Detailed assessment of current automation capabilities",
      "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
      "gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "targetState": "Vision for improved automation",
      "keyInitiatives": ["Initiative 1", "Initiative 2", "Initiative 3"]
    },
    "ai_integration": {
      "currentState": "Detailed assessment of current AI capabilities",
      "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
      "gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "targetState": "Vision for AI integration",
      "keyInitiatives": ["Initiative 1", "Initiative 2", "Initiative 3"]
    },
    "people_culture": {
      "currentState": "Detailed assessment of organizational readiness",
      "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
      "gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "targetState": "Vision for digital culture",
      "keyInitiatives": ["Initiative 1", "Initiative 2", "Initiative 3"]
    },
    "user_experience": {
      "currentState": "Detailed assessment of UX maturity",
      "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
      "gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "targetState": "Vision for improved UX",
      "keyInitiatives": ["Initiative 1", "Initiative 2", "Initiative 3"]
    }
  },
  "quickWins": [
    {
      "title": "Quick Win 1 Title",
      "description": "Detailed description of the initiative",
      "timeline": "1-2 weeks",
      "effort": "LOW",
      "impact": "HIGH",
      "outcome": "Expected outcome and business value"
    },
    // Include 5-6 quick wins total
  ],
  "roadmap": {
    "month1": [
      {"week": "Week 1", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"},
      {"week": "Week 2", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"},
      {"week": "Week 3", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"},
      {"week": "Week 4", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"}
    ],
    "month2": [
      {"weeks": "Week 5-6", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"},
      {"weeks": "Week 7-8", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"}
    ],
    "month3": [
      {"weeks": "Week 9-10", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"},
      {"weeks": "Week 11-12", "owner": "Role/Team", "action": "Specific action", "outcome": "Expected outcome"}
    ]
  },
  "changeManagement": {
    "communication": {
      "leadership": "Leadership alignment approach",
      "employee": "Employee engagement strategy",
      "stakeholder": "Stakeholder management approach"
    },
    "training": {
      "foundational": ["Training program 1", "Training program 2", "Training program 3"],
      "advanced": ["Advanced skill 1", "Advanced skill 2", "Advanced skill 3"],
      "leadership": ["Leadership program 1", "Leadership program 2"]
    }
  },
  "successMetrics": {
    "business": [
      {"metric": "Efficiency Gains", "target": "30% reduction in manual processing", "measure": "Hours saved per month"},
      {"metric": "Cost Savings", "target": "$500K annual savings", "measure": "ROI analysis"},
      {"metric": "Revenue Growth", "target": "15% increase", "measure": "Sales analytics"}
    ],
    "adoption": [
      {"metric": "User Engagement", "target": "80% adoption", "measure": "Active user counts"},
      {"metric": "Satisfaction", "target": "4.5/5 score", "measure": "Quarterly NPS surveys"},
      {"metric": "Innovation", "target": "50 solutions deployed", "measure": "Solution inventory"}
    ]
  },
  "nextSteps": {
    "week1": [
      {"action": "Secure Executive Sponsorship", "owner": "CEO/CTO"},
      {"action": "Form Steering Committee", "owner": "Leadership Team"},
      {"action": "Launch Quick Win #1", "owner": "Project Lead"},
      {"action": "Identify Champions", "owner": "HR/IT"}
    ],
    "month1": [
      {"priority": "Execute Month 1 Roadmap", "description": "Deliver all Week 1-4 milestones"},
      {"priority": "Measure & Communicate", "description": "Track KPIs and share weekly updates"},
      {"priority": "Remove Blockers", "description": "Address issues quickly"},
      {"priority": "Celebrate Wins", "description": "Recognition events to build enthusiasm"}
    ]
  }
}

**Remember:**
- Base ALL content on the actual assessment data provided
- Use the specific maturity scores to inform recommendations
- Reference the company's actual industry and context
- Make quick wins achievable and relevant to their score gaps
- Prioritize initiatives based on lowest-scoring pillars
- Return ONLY the JSON object - no markdown, no explanations, no additional text`;

export async function generatePresentationContent(
  assessmentData: AssessmentData,
  resultsData: any
): Promise<SlideContent> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${CONTENT_GENERATION_PROMPT}

**COMPANY ASSESSMENT DATA:**

Company: ${assessmentData.company_name}
Industry: ${assessmentData.industry || 'Technology'}
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

Generate comprehensive, personalized presentation content based on this data. Return ONLY the JSON object.`,
        },
      ],
    });

    // Extract the JSON from Claude's response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to extract JSON if Claude wrapped it in markdown
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const content: SlideContent = JSON.parse(jsonText);
    return content;
  } catch (error) {
    console.error('Error generating presentation content:', error);
    throw new Error(`Failed to generate presentation content: ${error}`);
  }
}
