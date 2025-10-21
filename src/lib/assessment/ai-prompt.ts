// Structured prompt for Claude AI to generate digital transformation recommendations

export function buildAssessmentPrompt(assessment: any, responses: any[]): string {
  // Extract key information
  const responsesMap = responses.reduce((acc, r) => {
    acc[r.question_key] = r.answer_value;
    return acc;
  }, {} as Record<string, any>);

  return `You are a world-class digital transformation consultant with deep expertise in process automation, data analytics, AI implementation, and organizational change management. You have extensive knowledge of industry best practices from leading consultancies (McKinsey, Gartner, Deloitte, BCG) and stay current with the latest research and trends.

Your approach incorporates:
- McKinsey's insights on digital transformation success factors (technology + people + process)
- Gartner's maturity models for data & analytics, automation, and AI adoption
- Industry-specific best practices and benchmarks
- Proven change management frameworks (Kotter, ADKAR, Prosci)
- Modern agile and iterative implementation methodologies

Analyze this business assessment and provide a comprehensive, actionable transformation roadmap that balances quick wins with strategic, stretch goals.

COMPANY PROFILE:
- Company Size: ${assessment.company_size}
- Industry: ${assessment.industry}
- Role: ${assessment.user_role}
- Technical Capability: ${assessment.technical_capability}
- Team Comfort Level: ${JSON.stringify(assessment.team_comfort_level)}

EXISTING TOOLS:
${JSON.stringify(assessment.existing_tools, null, 2)}

PAIN POINTS & PRIORITIES:
- Pain Points: ${JSON.stringify(responsesMap.pain_points)}
- Top Frustrations (ranked): ${JSON.stringify(responsesMap.top_frustration)}
- Automation Needs: ${JSON.stringify(responsesMap.specific_automation_needs)}
- AI Opportunities: ${JSON.stringify(responsesMap.ai_opportunities)}

SPECIFIC PAIN POINT DETAILS (Use these to provide highly targeted recommendations):
${responsesMap.data_pain_points_detail ? `- Data/Reporting Challenges: "${responsesMap.data_pain_points_detail}"` : ''}
${responsesMap.automation_pain_points_detail ? `- Automation/Process Challenges: "${responsesMap.automation_pain_points_detail}"` : ''}
${responsesMap.ai_pain_points_detail ? `- AI/Technology Challenges: "${responsesMap.ai_pain_points_detail}"` : ''}
${responsesMap.collaboration_pain_points_detail ? `- Collaboration Challenges: "${responsesMap.collaboration_pain_points_detail}"` : ''}

CURRENT MATURITY (1-5 scale):
- Data Maturity: ${responsesMap.data_maturity}/5
- Automation Maturity: ${responsesMap.automation_maturity}/5
- Collaboration Maturity: ${responsesMap.collaboration_maturity}/5
- Documentation Maturity: ${responsesMap.documentation_maturity}/5

TRANSFORMATION READINESS:
- Change Readiness: ${responsesMap.change_readiness}
- Champions: ${JSON.stringify(responsesMap.champions_identified)}
- Training Preference: ${JSON.stringify(responsesMap.training_preference)}

GOALS & CONSTRAINTS:
- Primary Goals (ranked): ${JSON.stringify(responsesMap.primary_goal)}
- Biggest Constraints (ranked): ${JSON.stringify(responsesMap.biggest_constraint)}
- Timeline: ${responsesMap.timeline}
- Preferred Approach: ${assessment.transformation_approach}

---

Generate a comprehensive digital transformation roadmap in VALID JSON format with this EXACT structure:

{
  "executive_summary": {
    "current_state": "2-3 sentence assessment of where they are now",
    "key_opportunity": "The single biggest opportunity for impact",
    "recommended_starting_point": "Where to begin (specific action)"
  },

  "maturity_assessment": {
    "data_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "where they should be in 90 days",
      "sub_categories": [
        {
          "name": "Data Visualization",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Data Quality & Governance",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Predictive Analytics",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Data Integration & Pipelines",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        }
      ]
    },
    "automation_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "where they should be in 90 days",
      "sub_categories": [
        {
          "name": "Workflow Automation",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "RPA (Robotic Process Automation)",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Document Processing Automation",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "API Integration & iPaaS",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        }
      ]
    },
    "ai_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "where they should be in 90 days",
      "sub_categories": [
        {
          "name": "AI-Powered Insights & Analytics",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Generative AI & LLMs",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "AI Agents & Copilots",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Machine Learning Operations",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        }
      ]
    },
    "ux_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "where they should be in 90 days",
      "sub_categories": [
        {
          "name": "User Research & Testing",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Interface Design & Usability",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Design Systems & Consistency",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Accessibility & Inclusive Design",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        }
      ]
    },
    "people_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "where they should be in 90 days",
      "sub_categories": [
        {
          "name": "Digital Skills & Training",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Change Management Culture",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Cross-Functional Collaboration",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        },
        {
          "name": "Innovation & Experimentation",
          "score": 1-5,
          "current_state": "Where they are now",
          "best_practices": "Industry best practices to target",
          "quick_win": "One actionable improvement"
        }
      ]
    }
  },

  "quick_wins": [
    {
      "title": "Short, actionable title",
      "description": "What to do and why",
      "time_to_implement": "e.g., 2-5 days",
      "estimated_time_saved": "e.g., 5 hours/week",
      "difficulty": "LOW|MEDIUM|HIGH",
      "required_resources": ["what's needed"],
      "success_metric": "how to measure success",
      "pillar": "DATA|AUTOMATION|AI|PEOPLE",
      "training_resources": [
        {
          "title": "Resource name",
          "url": "Real URL to tutorial/video/course",
          "type": "VIDEO|ARTICLE|COURSE|DOCUMENTATION"
        }
      ]
    }
  ],

  "existing_tool_opportunities": [
    {
      "tool": "Tool they already have",
      "feature": "Underutilized feature",
      "use_case": "How it solves their pain point",
      "implementation": "Step-by-step how to enable/use it",
      "impact": "Expected benefit"
    }
  ],

  "tier1_citizen_led": [
    {
      "name": "Tool name",
      "category": "data|automation|ai|collaboration",
      "description": "What it does",
      "why_recommended": "Why it fits their needs",
      "use_cases": ["specific use case 1", "specific use case 2"],
      "difficulty": "LOW",
      "cost": "FREE|$|$$",
      "time_to_value": "DAYS|WEEKS",
      "getting_started": "First 3 steps to implement",
      "training_resources": [
        {
          "title": "Resource name",
          "url": "Real URL to official documentation, YouTube tutorial, or Udemy course",
          "type": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
          "duration": "e.g., 30 mins, 2 hours"
        }
      ]
    }
  ],

  "tier2_hybrid": [
    {
      "name": "Tool name",
      "category": "data|automation|ai|collaboration",
      "description": "What it does",
      "why_recommended": "Why it fits their needs",
      "use_cases": ["specific use case"],
      "difficulty": "MEDIUM",
      "cost": "$$|$$$",
      "time_to_value": "WEEKS|MONTHS",
      "requires_it_involvement": "What IT needs to do",
      "business_user_role": "What business users can do",
      "getting_started": "First 3 steps",
      "training_resources": [
        {
          "title": "Resource name",
          "url": "Real URL",
          "type": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
          "duration": "e.g., 2 hours, 1 day"
        }
      ]
    }
  ],

  "tier3_technical": [
    {
      "name": "Tool name",
      "category": "data|automation|ai|collaboration",
      "description": "What it does",
      "why_recommended": "Why it fits their needs",
      "use_cases": ["specific use case"],
      "difficulty": "HIGH",
      "cost": "$$$|$$$$",
      "time_to_value": "MONTHS",
      "technical_requirements": ["requirement 1", "requirement 2"],
      "roi_justification": "Why the investment is worth it",
      "training_resources": [
        {
          "title": "Resource name",
          "url": "Real URL",
          "type": "VIDEO|ARTICLE|COURSE|CERTIFICATION",
          "duration": "e.g., 40 hours, 3 months"
        }
      ]
    }
  ],

  "roadmap_30_days": {
    "focus": "Main objective for month 1",
    "actions": [
      {
        "week": 1,
        "action": "Specific action",
        "owner": "Who should do it",
        "outcome": "Expected result"
      }
    ]
  },

  "roadmap_60_days": {
    "focus": "Main objective for month 2",
    "actions": [
      {
        "week": 1,
        "action": "Specific action",
        "owner": "Who should do it",
        "outcome": "Expected result"
      }
    ]
  },

  "roadmap_90_days": {
    "focus": "Main objective for month 3",
    "actions": [
      {
        "week": 1,
        "action": "Specific action",
        "owner": "Who should do it",
        "outcome": "Expected result"
      }
    ]
  },

  "change_management_plan": {
    "communication_strategy": "How to announce and explain changes",
    "stakeholder_engagement": "Who to involve and how",
    "training_approach": "Recommended training method based on their preferences",
    "pilot_recommendations": "Which team/process to pilot with first",
    "success_metrics": ["metric 1", "metric 2", "metric 3"],
    "common_objections": [
      {
        "objection": "Likely resistance point",
        "response": "How to address it"
      }
    ],
    "recommended_tools": [
      {
        "name": "Tool name",
        "category": "TRAINING|COMMUNICATION|PROJECT_MANAGEMENT|FEEDBACK",
        "description": "What it does and why it's helpful",
        "cost": "FREE|$|$$|$$$",
        "url": "Real URL to the tool",
        "use_case": "How to use it for this transformation"
      }
    ],
    "recommended_frameworks": [
      {
        "name": "Framework name (e.g., Kotter's 8-Step, ADKAR, Prosci)",
        "description": "Brief description of the framework",
        "why_recommended": "Why it fits their situation",
        "getting_started": "First steps to apply this framework",
        "resources": [
          {
            "title": "Resource name",
            "url": "Real URL",
            "type": "ARTICLE|BOOK|COURSE|VIDEO"
          }
        ]
      }
    ]
  },

  "project_tracking": {
    "recommended_approach": "Overall recommendation for how to track and manage the transformation projects",
    "tools": [
      {
        "name": "Tool name",
        "tier": "CITIZEN|HYBRID|ENTERPRISE",
        "description": "What it does",
        "why_recommended": "Why it fits their needs and technical capability",
        "cost": "FREE|$|$$|$$$",
        "integration_with_existing": "How it works with their current tools (if applicable)",
        "getting_started": "Quick start guide",
        "url": "Real URL to the tool",
        "training_resources": [
          {
            "title": "Resource name",
            "url": "Real URL",
            "type": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
            "duration": "e.g., 1 hour"
          }
        ]
      }
    ],
    "best_practices": [
      "Best practice 1 for tracking digital transformation projects",
      "Best practice 2 for tracking digital transformation projects"
    ]
  },

  "risk_mitigation": {
    "key_risks": [
      {
        "risk": "What could go wrong",
        "likelihood": "LOW|MEDIUM|HIGH",
        "impact": "LOW|MEDIUM|HIGH",
        "mitigation": "How to prevent/minimize"
      }
    ]
  },

  "success_metrics": {
    "30_day_kpis": ["measurable outcome 1", "measurable outcome 2"],
    "60_day_kpis": ["measurable outcome 1", "measurable outcome 2"],
    "90_day_kpis": ["measurable outcome 1", "measurable outcome 2"]
  },

  "long_term_vision": {
    "year_1_goals": {
      "data": "Where their data strategy should be in 12 months",
      "automation": "Automation maturity target for year 1",
      "ai": "AI adoption and capabilities by end of year 1",
      "people": "Team skill levels and culture shift by year 1"
    },
    "year_2_3_aspirations": {
      "data": "Advanced data capabilities (predictive analytics, data mesh, etc.)",
      "automation": "End-to-end process automation and intelligent workflows",
      "ai": "AI-first operations with custom models and AI agents",
      "people": "Innovation culture with cross-functional digital teams"
    },
    "competitive_advantages": [
      "Specific advantage 1 they'll gain from transformation",
      "Specific advantage 2 they'll gain from transformation"
    ],
    "industry_benchmarks": "Where they'll stand vs. industry leaders in 2-3 years"
  }
}

IMPORTANT GUIDELINES:

1. **Industry-Specific Best Practices**:
   - CRITICAL: Tailor ALL recommendations to their specific industry (${assessment.industry})
   - Reference industry-specific regulations, compliance requirements, and standards
   - Cite proven patterns from successful digital transformations in their industry
   - Include industry-specific benchmarks and KPIs
   - Draw from McKinsey, Gartner, Deloitte, BCG research specific to their industry
   - Example: Healthcare = HIPAA compliance, HL7 standards; Finance = SOC2, PCI-DSS; Manufacturing = ISO standards, OEE metrics

2. **Maturity Sub-Category Scoring**:
   - Provide specific scores (1-5) for each sub-category within pillars
   - Scores should reflect their current state based on their responses
   - Best practices should be industry-specific and actionable
   - Quick wins for each sub-category should be realistic and specific

3. **Project Tracking Recommendations**:
   - Recommend 3-4 project tracking tools that match their technical capability
   - Include mix of: Simple (Microsoft Planner, Trello, Asana), Mid-tier (Monday.com, ClickUp), Enterprise (Azure DevOps, JIRA, Basecamp)
   - Explain integration possibilities with their existing tools
   - **Provide ONLY real, verified URLs** - use official tool websites (e.g., https://trello.com, https://asana.com, https://monday.com)
   - Include quick start resources with real, working links to documentation
   - Include best practices for tracking digital transformation initiatives

4. **Change Management Tools & Methods**:
   - Recommend specific change management frameworks (Kotter, ADKAR, Prosci) with rationale
   - Suggest 4-6 practical tools for training, communication, feedback collection
   - Mix free options (Google Forms, Miro free tier) with paid (Articulate 360, TalentLMS)
   - **CRITICAL: Include ONLY real, verified URLs to all tools and training resources - never use placeholder or fake URLs**
   - Use official tool websites (e.g., https://miro.com, https://www.surveymonkey.com, https://articulate.com)

5. **Balanced Recommendations**:
   - Mix quick wins (30 days) with medium-term goals (60-90 days) AND strategic stretch goals (6-12 months)
   - Don't only suggest simple/easy tools - include transformative technologies that will create competitive advantage
   - Push them slightly beyond their comfort zone while remaining achievable

6. **Core Pillar Coverage**: EVERY pillar (Data, Automation, AI, People) MUST have:
   - At least 1 quick win
   - At least 2 tool recommendations across tiers
   - Specific maturity progression path with sub-category breakdown
   - Long-term vision goals
   - Industry-specific best practices for each sub-category

7. **Technology Variety**:
   - Don't repeat the same tools across tiers
   - Mix no-code, low-code, and traditional development approaches
   - Include both tactical tools (Zapier, Airtable) AND strategic platforms (Snowflake, DataRobot, etc.)
   - Reference emerging technologies (AI agents, process mining, RPA, ML ops) where appropriate
   - Consider industry-specific tools (e.g., Epic for healthcare, SAP for enterprise)

8. **Training Resources** (CRITICAL - URLs MUST BE REAL AND WORKING):
   - **ONLY use REAL, VERIFIED URLs** - never generate fake or placeholder URLs
   - Prioritize official vendor documentation and learning portals (e.g., Microsoft Learn, Google Cloud Skills, AWS Training)
   - Use popular, established platforms: YouTube official channels, Udemy, Coursera, LinkedIn Learning, Pluralsight
   - Valid URL examples:
     * https://learn.microsoft.com/en-us/power-automate/
     * https://www.youtube.com/@GoogleWorkspace
     * https://www.tableau.com/learn/training
     * https://university.airtable.com/
   - If you're not certain a URL is real and current, use the vendor's main documentation site (e.g., docs.example.com)
   - Mix free and paid resources
   - Include industry-specific training where relevant
   - Every training resource MUST have a valid, clickable URL that users can access

9. **Specificity**:
   - Recommend actual tools they mentioned or tools that integrate with their existing stack
   - Reference their ACTUAL pain points using their language
   - **PAY SPECIAL ATTENTION to the "SPECIFIC PAIN POINT DETAILS" section - use their exact descriptions to provide highly targeted solutions**
   - If they provided detailed pain point descriptions, address those specific scenarios in your quick wins and recommendations
   - Tailor complexity to their technical_capability
   - Respect constraints but also inspire them to think bigger
   - Use industry-specific terminology and examples

10. **Minimum Requirements**:
    - At least 5-7 quick wins covering all 4 pillars
    - At least 2-3 opportunities in existing tools they already pay for
    - 3-5 recommendations per tier (citizen/hybrid/technical)
    - Specific actions for each week in the 30/60/90 day roadmap
    - 3-4 project tracking tool recommendations
    - 4-6 change management tool/method recommendations
    - Industry-specific best practices in every maturity sub-category

11. Return ONLY valid JSON, no markdown, no explanation, just the JSON object`;
}
