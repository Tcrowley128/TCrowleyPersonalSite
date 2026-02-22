import Anthropic from '@anthropic-ai/sdk';
import type { ReleaseItem, AnalyzedRelease } from './types';

const FIRST_SOURCE_PROFILE = `
1st Source Corporation (SRCE) — Regional Bank in South Bend, Indiana

Regulators: FDIC (primary federal), Indiana Department of Financial Institutions (state),
Federal Reserve (holding company), CFPB (consumer products)

Core Business Lines:
1. Commercial Banking — C&I loans, commercial real estate, treasury management, agricultural lending
2. Consumer/Retail Banking — deposits, personal loans, home equity lines
3. Mortgage — origination and servicing (HMDA, CRA, fair lending implications)
4. Specialty Finance — vehicle leasing/finance (auto, boat, aircraft, RV), equipment leasing
5. Trust & Wealth Advisory — fiduciary services, investments, retirement accounts
6. Insurance

Key Risk & Regulatory Sensitivities:
- Capital adequacy (Basel III/IV, stress testing)
- Community Reinvestment Act (CRA) — community development, fair lending
- Interest rate risk — significant given specialty finance portfolio
- Consumer protection — UDAAP, TILA, RESPA, fair lending
- BSA/AML compliance
- Cybersecurity, data privacy (GLBA, state requirements)
- AI governance and model risk management
- Credit quality trends in auto/equipment lending
- CECL credit loss reserve methodology

Geographic Focus: Northern Indiana and southwestern Michigan communities

AI & Technology Context:
1st Source is developing its Intelligent Automation program and AI governance framework.
It is actively mapping its activities to the U.S. Treasury FS AI Risk Management Framework (FS AI RMF),
which has four pillars: GOVERN (policies, culture, accountability), MAP (risk identification),
MEASURE (risk evaluation, testing, metrics), and MANAGE (response plans, monitoring, controls).
`.trim();

export async function analyzeRelease(item: ReleaseItem): Promise<AnalyzedRelease> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const needsPDFContent = true; // Always generate for relevant items — filtered later

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: `You are a banking regulatory intelligence analyst for 1st Source Corporation.
Analyze government press releases and regulatory notices to determine their relevance and impact.

${FIRST_SOURCE_PROFILE}

Respond ONLY with a valid JSON object (no markdown, no code fences) in this exact format:
{
  "relevanceScore": <integer 1-10>,
  "priority": <"high" | "medium" | "low" | "not_relevant">,
  "summary": "<2-3 sentence plain English summary>",
  "impactAnalysis": "<2-3 sentences on specific impact to 1st Source, or 'Not directly applicable'>",
  "actionRequired": <true | false>,
  "actionDetails": "<specific action for 1st Source compliance/legal team, or empty string>",
  "pdfContent": {
    "whatHappened": "<3-4 sentence detailed narrative of what was released and why it matters in the broader regulatory landscape>",
    "whyItMattersPoints": [
      "<specific bullet 1 about 1st Source impact>",
      "<specific bullet 2>",
      "<specific bullet 3>",
      "<specific bullet 4>"
    ],
    "nextSteps": [
      "<concrete step 1 for 1st Source — e.g. 'Review and update AI model risk policy to align with new OCC guidance by Q2'>",
      "<concrete step 2>",
      "<concrete step 3>"
    ],
    "riskComponents": {
      "govern": "<1-2 sentences on how this release affects 1st Source governance policies, board oversight, or AI accountability structures>",
      "map": "<1-2 sentences on risk identification, inventory, or categorization implications>",
      "measure": "<1-2 sentences on testing, metrics, model validation, or monitoring implications>",
      "manage": "<1-2 sentences on response plans, controls, remediation, or ongoing management>"
    },
    "contextStatement": "<2-3 sentence context statement explaining why this document was produced and its relevance to 1st Source's regulatory posture — written for a governance readiness summary document>",
    "governanceMapping": {
      "govern": {
        "activities": "<Describe 1st Source's current GOVERN activities relevant to this release — e.g. existing policies, board-level oversight, accountability structures>",
        "status": <"STRONG" | "IN PROGRESS" | "EARLY STAGE" | "PLANNED" | "FOUNDATIONAL">
      },
      "map": {
        "activities": "<Describe 1st Source's current MAP activities — e.g. risk inventory, use case categorization, risk identification processes>",
        "status": <"STRONG" | "IN PROGRESS" | "EARLY STAGE" | "PLANNED" | "FOUNDATIONAL">
      },
      "measure": {
        "activities": "<Describe 1st Source's current MEASURE activities — e.g. model validation, testing protocols, performance metrics>",
        "status": <"STRONG" | "IN PROGRESS" | "EARLY STAGE" | "PLANNED" | "FOUNDATIONAL">
      },
      "manage": {
        "activities": "<Describe 1st Source's current MANAGE activities — e.g. incident response, ongoing monitoring, control frameworks>",
        "status": <"STRONG" | "IN PROGRESS" | "EARLY STAGE" | "PLANNED" | "FOUNDATIONAL">
      }
    },
    "keyMessagesForExaminers": [
      "<examiner message 1 — what 1st Source wants examiners to know about its readiness>",
      "<examiner message 2>",
      "<examiner message 3>",
      "<examiner message 4>"
    ]
  }
}

Priority guidelines:
- high: Direct regulatory requirement, enforcement action, major policy change affecting 1st Source's products, interest rate decisions
- medium: Supervisory guidance to monitor, industry-wide guidance, trends affecting their sectors
- low: Informational, tangential relevance
- not_relevant: No meaningful connection to 1st Source's business

Status guidelines for governanceMapping:
- STRONG: Robust, documented program already in place
- IN PROGRESS: Active work underway with clear ownership
- EARLY STAGE: Initial steps taken, framework being built
- PLANNED: Acknowledged need, timeline defined but not yet started
- FOUNDATIONAL: Basic controls exist but significant development needed`,
    messages: [
      {
        role: 'user',
        content: `Analyze this regulatory release for 1st Source Corporation:

Source: ${item.sourceName}
Title: ${item.title}
Published: ${item.publishedDate ?? 'Unknown'}
URL: ${item.url}

Content:
${item.description || '(No description available — base analysis on the title and source)'}

Provide your complete JSON analysis including all pdfContent fields.`,
      },
    ],
  });

  const response = await stream.finalMessage();

  // Extract text only (skip thinking blocks)
  const textContent = (response.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  let parsed: {
    relevanceScore: number;
    priority: 'high' | 'medium' | 'low' | 'not_relevant';
    summary: string;
    impactAnalysis: string;
    actionRequired: boolean;
    actionDetails: string;
    pdfContent?: AnalyzedRelease['pdfContent'];
  };

  try {
    const jsonStr = textContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    parsed = JSON.parse(jsonStr);
  } catch {
    parsed = {
      relevanceScore: 3,
      priority: 'low',
      summary: item.description?.slice(0, 300) || 'Analysis unavailable — manual review recommended.',
      impactAnalysis: 'Unable to parse AI analysis. Please review manually.',
      actionRequired: false,
      actionDetails: '',
    };
  }

  // Only attach pdfContent for relevant items (saves storage for irrelevant ones)
  const pdfContent =
    parsed.priority !== 'not_relevant' && parsed.priority !== 'low'
      ? parsed.pdfContent
      : undefined;

  return {
    ...item,
    relevanceScore: parsed.relevanceScore ?? 3,
    priority: parsed.priority ?? 'low',
    summary: parsed.summary ?? '',
    impactAnalysis: parsed.impactAnalysis ?? '',
    actionRequired: parsed.actionRequired ?? false,
    actionDetails: parsed.actionDetails ?? '',
    pdfContent,
  };
}

// Process items in parallel batches to respect rate limits
export async function analyzeMultipleReleases(items: ReleaseItem[]): Promise<AnalyzedRelease[]> {
  const CONCURRENCY = 3;
  const results: AnalyzedRelease[] = [];

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map((item) => analyzeRelease(item)));
    results.push(...batchResults);
  }

  return results;
}
