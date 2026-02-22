import type { ReleaseItem } from './types';
import type { MonitorSource } from './sources';

// Max items to process per source per run (avoids overwhelming Claude on first run)
const MAX_ITEMS_PER_SOURCE = 20;

function extractCDATA(text: string): string {
  const match = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1].trim() : text.replace(/<[^>]+>/g, '').trim();
}

function extractXmlTag(xml: string, tag: string): string {
  // Try CDATA variant first, then plain text
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseRSSItems(xml: string, source: MonitorSource): ReleaseItem[] {
  const items: ReleaseItem[] = [];
  // Handle both RSS <item> and Atom <entry>
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = decodeHtmlEntities(extractCDATA(extractXmlTag(itemXml, 'title')));

    // URL: try <link>, then <guid isPermaLink="true">, then Atom <link href="..."/>
    let url = extractXmlTag(itemXml, 'link').trim();
    if (!url || url.startsWith('<')) {
      const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      if (guidMatch) url = guidMatch[1].trim();
    }
    if (!url) {
      const atomLinkMatch = itemXml.match(/<link[^>]+href="([^"]+)"/i);
      if (atomLinkMatch) url = atomLinkMatch[1];
    }

    const description = decodeHtmlEntities(
      extractCDATA(extractXmlTag(itemXml, 'description') || extractXmlTag(itemXml, 'summary'))
    ).slice(0, 1000); // Limit description length

    const pubDate =
      extractXmlTag(itemXml, 'pubDate') ||
      extractXmlTag(itemXml, 'dc:date') ||
      extractXmlTag(itemXml, 'published') ||
      extractXmlTag(itemXml, 'updated');

    if (title && url && url.startsWith('http')) {
      items.push({
        title,
        url,
        publishedDate: pubDate || null,
        description,
        sourceId: source.id,
        sourceName: source.name,
      });
    }

    if (items.length >= MAX_ITEMS_PER_SOURCE) break;
  }

  return items;
}

export async function fetchSourceItems(
  source: MonitorSource
): Promise<{ items: ReleaseItem[]; error?: string }> {
  try {
    const response = await fetch(source.rssUrl, {
      headers: {
        'User-Agent': 'BankingMonitor/1.0 (1st Source Regulatory Intelligence)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return { items: [], error: `HTTP ${response.status} from ${source.name}` };
    }

    const xml = await response.text();
    const items = parseRSSItems(xml, source);
    return { items };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { items: [], error: `Failed to fetch ${source.name}: ${msg}` };
  }
}
