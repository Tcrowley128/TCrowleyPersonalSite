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
    // 3. Analyze with Claude
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
    return {
      newItemsFound: newItems.length,
      relevantItems: [],
      emailSent: false,
      errors,
    };
  }

  return sendEmailUpdate(toSend, errors, newItems.length);
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

  const { subject, html } = buildBankingMonitorEmail(items);
  const fromEmail =
    process.env.BANKING_MONITOR_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    '1st Source Monitor <noreply@tylercrowley.com>';

  const resend = new Resend(resendKey);
  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject,
    html,
  });

  if (emailError) {
    errors.push(`Email send failed: ${emailError.message}`);
    return { newItemsFound, relevantItems: items, emailSent: false, errors };
  }

  await markEmailSent(items.map((i) => i.url));
  console.log(`[BankingMonitor] Email sent to ${recipientEmail} — subject: ${subject}`);

  return { newItemsFound, relevantItems: items, emailSent: true, errors };
}
