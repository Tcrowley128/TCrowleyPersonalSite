// Optimized prompt for Claude AI to generate digital transformation recommendations
// Reduced token count while maintaining quality and comprehensiveness
// Now supports prompt caching for cost optimization

interface PromptParts {
  systemInstructions: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }>;
  userMessage: string;
}

// Static JSON schema and guidelines that can be cached across all assessments
const CACHED_SCHEMA_AND_GUIDELINES = `
Generate VALID JSON with this EXACT structure:

{
  "executive_summary": {
    "current_state": "2-3 sentence assessment",
    "key_opportunity": "Single biggest impact opportunity",
    "recommended_starting_point": "Specific first action"
  },
  "maturity_assessment": {
    "data_strategy": {
      "score": 1-5,
      "gap_analysis": "what's missing",
      "target": "90-day goal",
      "sub_categories": [
        {"name": "Data Visualization", "score": 1-5, "current_state": "now", "best_practices": "industry-specific practices", "quick_win": "actionable improvement"},
        {"name": "Data Quality & Governance", "score": 1-5, "current_state": "now", "best_practices": "practices", "quick_win": "improvement"},
        {"name": "Predictive Analytics", "score": 1-5, "current_state": "now", "best_practices": "practices", "quick_win": "improvement"},
        {"name": "Data Integration", "score": 1-5, "current_state": "now", "best_practices": "practices", "quick_win": "improvement"}
      ]
    },
    "automation_strategy": {
      "score": 1-5, "gap_analysis": "", "target": "",
      "sub_categories": [
        {"name": "Workflow Automation", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "RPA", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Document Processing", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "API Integration", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""}
      ]
    },
    "ai_strategy": {
      "score": 1-5, "gap_analysis": "", "target": "",
      "sub_categories": [
        {"name": "AI-Powered Analytics", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Generative AI & LLMs", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "AI Agents & Copilots", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "ML Operations", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""}
      ]
    },
    "ux_strategy": {
      "score": 1-5, "gap_analysis": "", "target": "",
      "sub_categories": [
        {"name": "User Research & Testing", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Interface Design & Usability", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Design Systems", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Accessibility & Mobile UX", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""}
      ]
    },
    "people_strategy": {
      "score": 1-5, "gap_analysis": "", "target": "",
      "sub_categories": [
        {"name": "Skills & Training", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Change Management", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Collaboration & Culture", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""},
        {"name": "Leadership & Governance", "score": 1-5, "current_state": "", "best_practices": "", "quick_win": ""}
      ]
    }
  },
  "quick_wins": [
    {"title": "", "pillar": "DATA|AUTOMATION|AI|UX|PEOPLE", "description": "", "impact": "HIGH|MEDIUM", "effort": "LOW|MEDIUM", "timeline": "1-3 weeks", "steps": [""], "tools": [""], "expected_outcome": ""}
  ],
  "roadmap_30_days": {"focus": "", "actions": [{"week": 1, "action": "", "owner": "", "outcome": ""}]},
  "roadmap_60_days": {"focus": "", "actions": [{"week": 5, "action": "", "owner": "", "outcome": ""}]},
  "roadmap_90_days": {"focus": "", "actions": [{"week": 9, "action": "", "owner": "", "outcome": ""}]},
  "tier1_citizen_led": [
    {"name": "", "pillar": "DATA|AUTOMATION|AI|UX", "description": "", "why_recommended": "", "cost": "FREE|$", "complexity": "LOW", "url": "real URL", "quick_start": "", "training_resources": [{"title": "", "url": "real URL", "type": "VIDEO|DOC", "duration": ""}]}
  ],
  "tier2_hybrid": [{"name": "", "pillar": "", "description": "", "why_recommended": "", "cost": "$|$$", "complexity": "MEDIUM", "url": "", "integration_notes": "", "training_resources": []}],
  "tier3_technical": [{"name": "", "pillar": "", "description": "", "why_recommended": "", "cost": "$$|$$$", "complexity": "HIGH", "url": "", "prerequisites": "", "training_resources": []}],
  "existing_tool_opportunities": [
    {"tool": "", "current_usage": "", "untapped_capabilities": [""], "quick_win": "", "learning_resources": [{"title": "", "url": "real URL", "type": ""}]},
    {"tool": "", "current_usage": "", "untapped_capabilities": [""], "quick_win": "", "learning_resources": [{"title": "", "url": "real URL", "type": ""}]},
    {"tool": "", "current_usage": "", "untapped_capabilities": [""], "quick_win": "", "learning_resources": [{"title": "", "url": "real URL", "type": ""}]},
    {"tool": "", "current_usage": "", "untapped_capabilities": [""], "quick_win": "", "learning_resources": [{"title": "", "url": "real URL", "type": ""}]}
  ],
  "change_management_plan": {
    "overall_strategy": "",
    "stakeholder_engagement": {
      "approach": "Overall strategy for engaging stakeholders throughout the transformation",
      "executive_buy_in": [""],
      "champion_network": [""],
      "team_communication": [""]
    },
    "training_approach": {
      "overview": "Overall training philosophy and approach",
      "delivery_methods": ["In-person workshops", "Self-paced e-learning", "Peer mentoring"],
      "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
      "best_practices": ["Practice 1", "Practice 2", "Practice 3"],
      "resources": [{"name": "", "type": "VIDEO|DOC|COURSE", "url": "real URL", "description": ""}]
    },
    "pilot_approach": "Overall philosophy and strategy for piloting transformation initiatives",
    "pilot_recommendations": [{"focus_area": "", "scope": "", "duration": "", "success_criteria": [""]}],
    "tools": [{"name": "", "description": "", "cost": "", "url": "real URL", "use_case": ""}],
    "recommended_frameworks": [{"name": "Kotter|ADKAR|Prosci", "description": "", "why_recommended": "", "getting_started": "", "resources": [{"title": "", "url": "real URL", "type": ""}]}]
  },
  "project_tracking": {
    "recommended_approach": "",
    "tools": [{"name": "", "tier": "CITIZEN|HYBRID|ENTERPRISE", "description": "", "why_recommended": "", "cost": "", "url": "real URL", "training_resources": []}],
    "best_practices": [""]
  },
  "risk_mitigation": {
    "key_risks": [{"risk": "", "likelihood": "LOW|MEDIUM|HIGH", "impact": "LOW|MEDIUM|HIGH", "mitigation": ""}]
  },
  "success_metrics": {
    "30_day_kpis": [""], "60_day_kpis": [""], "90_day_kpis": [""]
  },
  "long_term_vision": {
    "year_1_goals": {
      "data": "Specific goal with measurable target - include percentages, time savings, quality scores",
      "automation": "Specific goal with measurable target - include number of workflows, hours saved per month",
      "ai": "Specific goal with measurable target - include number of deployments, productivity gains",
      "ux": "Specific goal with measurable target - include NPS improvement, support ticket reduction",
      "people": "Specific goal with measurable target - include training completion rates, citizen developer count"
    },
    "year_1_recommendations": "2-3 sentence strategic guidance on how to successfully achieve Year 1 goals across all pillars. Focus on sequencing, dependencies, and critical success factors.",
    "year_2_3_aspirations": {
      "data": "Ambitious long-term vision with industry leadership targets and specific capabilities",
      "automation": "Ambitious long-term vision with industry leadership targets and specific capabilities",
      "ai": "Ambitious long-term vision with industry leadership targets and specific capabilities",
      "ux": "Ambitious long-term vision with industry leadership targets and specific capabilities",
      "people": "Ambitious long-term vision with industry leadership targets and specific capabilities"
    },
    "year_2_3_recommendations": "2-3 sentence strategic guidance on building sustainable competitive advantage for Years 2-3. Focus on innovation, differentiation, and scaling success.",
    "competitive_advantages": [
      "Specific advantage with business impact metrics",
      "Market position improvement with concrete differentiators",
      "Cost or efficiency gain with percentage improvements",
      "Innovation capability with speed-to-market metrics",
      "Talent advantage with retention or attraction benefits"
    ],
    "industry_benchmarks": "Detailed comparison showing percentile ranking in their industry. Include specific metrics and peer comparisons with numbers."
  }
}

CRITICAL GUIDELINES:
1. **Industry-Specific**: Tailor ALL recommendations with industry benchmarks, regulations (HIPAA/PCI/ISO), and proven patterns
2. **Accurate Scoring**: Base sub-category scores on their actual responses and maturity levels
3. **Real URLs Only**: Use verified URLs (https://trello.com, https://learn.microsoft.com, https://youtube.com/@GoogleWorkspace). Never fake URLs
4. **Balanced Mix**: Include quick wins (30d), medium goals (60-90d), AND stretch goals (6-12mo)
5. **All Pillars**: Every pillar (Data, Automation, AI, UX, People) needs ≥1 quick win and ≥2 tools
6. **Tool Variety**: Don't repeat tools. Mix no-code (Zapier), low-code (Power Apps), and enterprise (Snowflake)
7. **Training Resources**: Only official docs (vendor sites, Microsoft Learn, Coursera, Udemy, YouTube official channels)
8. **Specificity**: Address their EXACT pain points from detail sections. Use their language and scenarios
9. **Minimums**: 5-7 quick wins | 4+ existing tool opportunities (hidden gems) | 3-5 tools per tier | 3-4 project tracking tools | 4-6 change mgmt tools
10. **UX Focus**: Include UX-specific recommendations if design questions were answered
11. **Tangible Long-term Vision**: Year 1 goals MUST include specific, measurable targets (%, hours saved, # of tools/workflows). Competitive advantages MUST show concrete business impact. Industry benchmarks MUST include percentile rankings and peer comparisons

Return ONLY valid JSON, no markdown or explanation.`;

export function buildAssessmentPrompt(assessment: any, responses: any[]): PromptParts {
  const responsesMap = responses.reduce((acc, r) => {
    acc[r.question_key] = r.answer_value;
    return acc;
  }, {} as Record<string, any>);

  // Build UX context from new questions
  const uxContext = responsesMap.current_design_approach ? `
UX & DESIGN MATURITY:
- Design Approach: ${responsesMap.current_design_approach}
- User Research: ${responsesMap.user_research_frequency}
- Design System: ${responsesMap.design_system}
- Mobile Strategy: ${responsesMap.mobile_strategy}
- Accessibility: ${responsesMap.accessibility_maturity}
- UX Metrics: ${JSON.stringify(responsesMap.ux_metrics)}
- UX Challenges: ${JSON.stringify(responsesMap.ux_challenges)}
- UX Priorities: ${JSON.stringify(responsesMap.ux_priorities)}
${responsesMap.ux_detail ? `- UX Details: "${responsesMap.ux_detail}"` : ''}
` : '';

  // Dynamic user assessment data (changes per assessment)
  const userMessage = `COMPANY PROFILE:
Size: ${assessment.company_size} | Industry: ${assessment.industry} | Role: ${assessment.user_role}
Technical Capability: ${assessment.technical_capability}
Team Skills: ${JSON.stringify(assessment.team_comfort_level)}

EXISTING TOOLS: ${JSON.stringify(assessment.existing_tools)}

KEY INSIGHTS:
- Pain Points (ranked): ${JSON.stringify(responsesMap.top_frustration)}
- Automation Needs: ${JSON.stringify(responsesMap.specific_automation_needs)}
- AI Opportunities: ${JSON.stringify(responsesMap.ai_opportunities)}
${responsesMap.data_pain_points_detail ? `- Data: "${responsesMap.data_pain_points_detail}"` : ''}
${responsesMap.automation_pain_points_detail ? `- Automation: "${responsesMap.automation_pain_points_detail}"` : ''}
${responsesMap.ai_pain_points_detail ? `- AI: "${responsesMap.ai_pain_points_detail}"` : ''}
${responsesMap.collaboration_pain_points_detail ? `- Collaboration: "${responsesMap.collaboration_pain_points_detail}"` : ''}

CURRENT MATURITY (1-5): Data ${responsesMap.data_maturity}/5 | Automation ${responsesMap.automation_maturity}/5 | Collaboration ${responsesMap.collaboration_maturity}/5 | Docs ${responsesMap.documentation_maturity}/5

${uxContext}

READINESS:
Change: ${responsesMap.change_readiness} | Champions: ${JSON.stringify(responsesMap.champions_identified)}
Goals (ranked): ${JSON.stringify(responsesMap.primary_goal)}
Timeline: ${responsesMap.timeline} | Approach: ${assessment.transformation_approach}

Industry Context: ${assessment.industry}`;

  // Return structured parts for prompt caching
  return {
    systemInstructions: [
      {
        type: "text",
        text: "You are a digital transformation consultant with McKinsey, Gartner, and BCG expertise. Analyze this assessment and provide a comprehensive, actionable roadmap."
      },
      {
        type: "text",
        text: CACHED_SCHEMA_AND_GUIDELINES,
        cache_control: { type: "ephemeral" }
      }
    ],
    userMessage
  };
}
