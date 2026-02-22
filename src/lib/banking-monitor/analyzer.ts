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
- Cybersecurity and data privacy (GLBA, state requirements)
- Credit quality trends in auto/equipment lending
- Climate risk disclosure requirements (if applicable to their size)
- CECL credit loss reserve methodology

Geographic Focus: Northern Indiana and southwestern Michigan communities
`.trim();

interface AnalysisResult {
  relevanceScore: number;
  priority: 'high' | 'medium' | 'low' | 'not_relevant';
  summary: string;
  impactAnalysis: string;
  actionRequired: boolean;
  actionDetails: string;
}

export async function analyzeRelease(item: ReleaseItem): Promise<AnalyzedRelease> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: `You are a banking regulatory intelligence analyst for 1st Source Corporation.
Analyze government press releases and regulatory notices to determine their relevance and impact.

${FIRST_SOURCE_PROFILE}

Respond ONLY with a valid JSON object (no markdown, no code fences) in this exact format:
{
  "relevanceScore": <integer 1-10, where 10 = highest relevance to 1st Source>,
  "priority": <"high" | "medium" | "low" | "not_relevant">,
  "summary": "<2-3 sentence plain English summary of the release>",
  "impactAnalysis": "<2-3 sentences on specific impact to 1st Source operations, or 'Not directly applicable' if not relevant>",
  "actionRequired": <true | false>,
  "actionDetails": "<specific action 1st Source compliance/legal team should consider, or empty string>"
}

Priority guidelines:
- high: Direct regulatory requirement, enforcement in 1st Source's business lines, major policy change affecting their products, interest rate decisions
- medium: Supervisory guidance to monitor, industry-wide guidance, trends affecting their sectors
- low: Informational, tangential relevance, general economic updates
- not_relevant: No meaningful connection to 1st Source (e.g., foreign bank actions, unrelated sectors)`,
    messages: [
      {
        role: 'user',
        content: `Analyze this regulatory release for 1st Source Corporation:

Source: ${item.sourceName}
Title: ${item.title}
Published: ${item.publishedDate ?? 'Unknown'}
URL: ${item.url}

Content:
${item.description || '(No description available — use title for analysis)'}

Provide your JSON analysis.`,
      },
    ],
  });

  const response = await stream.finalMessage();

  // Extract text only (skip thinking blocks)
  const textContent = (response.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  let analysis: AnalysisResult;
  try {
    const jsonStr = textContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    analysis = JSON.parse(jsonStr);
  } catch {
    // Graceful fallback if parsing fails
    analysis = {
      relevanceScore: 3,
      priority: 'low',
      summary: item.description?.slice(0, 300) || 'Analysis unavailable — manual review recommended.',
      impactAnalysis: 'Unable to parse AI analysis. Please review manually.',
      actionRequired: false,
      actionDetails: '',
    };
  }

  return {
    ...item,
    relevanceScore: analysis.relevanceScore ?? 3,
    priority: analysis.priority ?? 'low',
    summary: analysis.summary ?? '',
    impactAnalysis: analysis.impactAnalysis ?? '',
    actionRequired: analysis.actionRequired ?? false,
    actionDetails: analysis.actionDetails ?? '',
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
