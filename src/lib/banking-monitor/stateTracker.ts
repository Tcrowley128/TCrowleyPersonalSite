import { createAdminClient } from '@/lib/supabase/admin';
import type { ReleaseItem, AnalyzedRelease } from './types';

// Returns only items whose URLs haven't been seen before
export async function filterNewItems(items: ReleaseItem[]): Promise<ReleaseItem[]> {
  if (items.length === 0) return [];
  const supabase = createAdminClient();
  const urls = items.map((item) => item.url);

  const { data: existing } = await supabase
    .from('banking_monitor_items')
    .select('url')
    .in('url', urls);

  const seen = new Set((existing ?? []).map((row: { url: string }) => row.url));
  return items.filter((item) => !seen.has(item.url));
}

// Persists analyzed items to the database
export async function saveAnalyzedItems(items: AnalyzedRelease[]): Promise<void> {
  if (items.length === 0) return;
  const supabase = createAdminClient();

  const rows = items.map((item) => ({
    source_id: item.sourceId,
    source_name: item.sourceName,
    title: item.title,
    url: item.url,
    published_date: item.publishedDate,
    description: item.description,
    relevance_score: item.relevanceScore,
    priority: item.priority,
    summary: item.summary,
    impact_analysis: item.impactAnalysis,
    action_required: item.actionRequired,
    action_details: item.actionDetails,
    pdf_content: item.pdfContent ?? null,
    analyzed_at: new Date().toISOString(),
    email_sent: false,
  }));

  await supabase.from('banking_monitor_items').upsert(rows, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
}

// Returns all relevant items that haven't been emailed yet
export async function getUnsentRelevantItems(): Promise<AnalyzedRelease[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('banking_monitor_items')
    .select('*')
    .neq('priority', 'not_relevant')
    .eq('email_sent', false)
    .order('relevance_score', { ascending: false });

  return (data ?? []).map(
    (row: {
      title: string;
      url: string;
      published_date: string | null;
      description: string;
      source_id: string;
      source_name: string;
      relevance_score: number;
      priority: 'high' | 'medium' | 'low' | 'not_relevant';
      summary: string;
      impact_analysis: string;
      action_required: boolean;
      action_details: string;
      pdf_content: AnalyzedRelease['pdfContent'] | null;
    }) => ({
      title: row.title,
      url: row.url,
      publishedDate: row.published_date,
      description: row.description,
      sourceId: row.source_id,
      sourceName: row.source_name,
      relevanceScore: row.relevance_score,
      priority: row.priority,
      summary: row.summary,
      impactAnalysis: row.impact_analysis,
      actionRequired: row.action_required,
      actionDetails: row.action_details,
      pdfContent: row.pdf_content ?? undefined,
    })
  );
}

// Marks items as emailed so they aren't re-sent
export async function markEmailSent(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const supabase = createAdminClient();
  await supabase.from('banking_monitor_items').update({ email_sent: true }).in('url', urls);
}
