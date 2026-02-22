import { Resend } from 'resend';
import { BANKING_MONITOR_SOURCES } from './sources';
import { fetchSourceItems } from './fetcher';
import { analyzeMultipleReleases } from './analyzer';
import {
  filterNewItems,
  saveAnalyzedItems,
  markEmailSent,
  getUnsentRelevantItems,
} from './stateTracker';
import { buildBankingMonitorEmail } from './emailTemplate';
import { generateIntelligenceBriefPDF, generateGovernanceReadinessPDF } from './pdfGenerator';
import type { AnalyzedRelease, MonitorRunResult } from './types';

export async function runBankingMonitor(): Promise<MonitorRunResult> {
  const errors: string[] = [];

  // 1. Fetch all sources in parallel
  console.log('[BankingMonitor] Fetching from all sources...');
  const fetchResults = await Promise.all(
    BANKING_MONITOR_SOURCES.map((source) => fetchSourceItems(source))
  );

  const allItems = fetchResults.flatMap((r) => r.items);
  errors.push(...fetchResults.filter((r) => r.error).map((r) => r.error!));
  console.log(
    `[BankingMonitor] Fetched ${allItems.length} total items (${errors.length} source errors)`
  );

  // 2. Filter to only unseen items
  const newItems = await filterNewItems(allItems);
  console.log(`[BankingMonitor] ${newItems.length} new items to analyze`);

  if (newItems.length > 0) {
    // 3. Analyze with Claude (generates both summary fields and full PDF content)
    console.log('[BankingMonitor] Analyzing with Claude...');
    const analyzed = await analyzeMultipleReleases(newItems);

    // 4. Persist results
    await saveAnalyzedItems(analyzed);
    console.log(`[BankingMonitor] Saved ${analyzed.length} analyzed items`);
  }

  // 5. Collect all unsent relevant items (new + any previously queued)
  const toSend = await getUnsentRelevantItems();
  console.log(`[BankingMonitor] ${toSend.length} relevant unsent items`);

  if (toSend.length === 0) {
    return { newItemsFound: newItems.length, relevantItems: [], emailSent: false, errors };
  }

  return sendEmailUpdate(toSend, errors, newItems.length);
}

async function buildAttachments(
  items: AnalyzedRelease[],
  runDate: Date
): Promise<{ filename: string; content: Buffer }[]> {
  const attachments: { filename: string; content: Buffer }[] = [];

  // Intelligence Brief PDF — one per high/medium item that has pdfContent (max 3)
  const pdfItems = items.filter((r) => r.pdfContent && r.priority !== 'low');
  const briefItems = pdfItems.slice(0, 3);

  for (const item of briefItems) {
    try {
      const buf = await generateIntelligenceBriefPDF(item, runDate);
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      attachments.push({ filename: `intelligence-brief-${slug}.pdf`, content: buf });
    } catch (err) {
      console.error('[BankingMonitor] Intelligence Brief PDF failed:', err);
    }
  }

  // Governance Readiness PDF — one combined document covering all relevant items
  const govItems = items.filter((r) => r.pdfContent);
  if (govItems.length > 0) {
    try {
      const buf = await generateGovernanceReadinessPDF(govItems, runDate);
      const dateStr = runDate.toISOString().slice(0, 10);
      attachments.push({ filename: `governance-readiness-summary-${dateStr}.pdf`, content: buf });
    } catch (err) {
      console.error('[BankingMonitor] Governance Readiness PDF failed:', err);
    }
  }

  return attachments;
}

async function sendEmailUpdate(
  items: AnalyzedRelease[],
  errors: string[],
  newItemsFound = 0
): Promise<MonitorRunResult> {
  const recipientEmail = process.env.BANKING_MONITOR_RECIPIENT_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    errors.push('RESEND_API_KEY not configured — email not sent');
    return { newItemsFound, relevantItems: items, emailSent: false, errors };
  }
  if (!recipientEmail) {
    errors.push('BANKING_MONITOR_RECIPIENT_EMAIL not configured — email not sent');
    return { newItemsFound, relevantItems: items, emailSent: false, errors };
  }

  const runDate = new Date();
  const { subject, html } = buildBankingMonitorEmail(items, runDate);
  const fromEmail =
    process.env.BANKING_MONITOR_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    '1st Source Monitor <noreply@tylercrowley.com>';

  // Generate PDF attachments
  console.log('[BankingMonitor] Generating PDF attachments...');
  const attachments = await buildAttachments(items, runDate);
  console.log(`[BankingMonitor] ${attachments.length} PDF(s) generated`);

  const resend = new Resend(resendKey);
  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject,
    html,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (emailError) {
    errors.push(`Email send failed: ${emailError.message}`);
    return { newItemsFound, relevantItems: items, emailSent: false, errors };
  }

  await markEmailSent(items.map((i) => i.url));
  console.log(
    `[BankingMonitor] Email sent to ${recipientEmail} with ${attachments.length} PDF attachment(s)`
  );

  return { newItemsFound, relevantItems: items, emailSent: true, errors };
}
