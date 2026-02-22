import type { AnalyzedRelease } from './types';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date unknown';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function sourceShortName(sourceName: string): string {
  const map: Record<string, string> = {
    'U.S. Department of the Treasury': 'Treasury',
    'OCC - Office of the Comptroller of the Currency': 'OCC',
    'FDIC - Federal Deposit Insurance Corporation': 'FDIC',
    'Federal Reserve': 'Federal Reserve',
    'CFPB - Consumer Financial Protection Bureau': 'CFPB',
    'Indiana Department of Financial Institutions': 'Indiana DFI',
  };
  return map[sourceName] ?? sourceName;
}

// Renders a full two-column "What Happened / Why It Matters" card for high-priority items
function renderDetailCard(release: AnalyzedRelease, index: number): string {
  const priorityBadge =
    release.priority === 'high'
      ? `<span style="background-color:#DC2626;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:3px;text-transform:uppercase;letter-spacing:0.07em;margin-right:8px;">HIGH PRIORITY</span>`
      : `<span style="background-color:#D97706;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:3px;text-transform:uppercase;letter-spacing:0.07em;margin-right:8px;">MEDIUM PRIORITY</span>`;

  const actionBox = release.actionRequired
    ? `<div style="background-color:#FEF3C7;border:1px solid #F59E0B;border-left:3px solid #D97706;border-radius:4px;padding:10px 14px;margin-top:12px;">
        <p style="margin:0;font-size:12px;color:#92400E;"><strong>Action Required:</strong> ${release.actionDetails}</p>
      </div>`
    : '';

  return `
  <!-- Release #${index + 1} -->
  <div style="margin-bottom:28px;border:1px solid #D1D5DB;border-radius:8px;overflow:hidden;">
    <!-- Card Header -->
    <div style="background-color:#F8FAFC;padding:14px 20px;border-bottom:1px solid #D1D5DB;">
      ${priorityBadge}
      <span style="font-size:11px;color:#6B7280;font-weight:500;">${sourceShortName(release.sourceName)} &bull; ${formatDate(release.publishedDate)}</span>
    </div>
    <!-- Card Title -->
    <div style="padding:16px 20px 0 20px;">
      <h3 style="margin:0;font-size:16px;font-weight:700;color:#111827;line-height:1.4;">
        <a href="${release.url}" style="color:#111827;text-decoration:none;">${release.title}</a>
      </h3>
    </div>
    <!-- Two-column body -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:0;">
      <tr>
        <!-- Left: What Happened -->
        <td width="50%" style="padding:16px 20px;vertical-align:top;border-right:1px solid #E5E7EB;">
          <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.08em;">What Happened</p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${release.summary}</p>
          <p style="margin:12px 0 0 0;">
            <a href="${release.url}" style="font-size:12px;color:#2563EB;text-decoration:none;font-weight:600;">View Full Release →</a>
          </p>
        </td>
        <!-- Right: Why It Matters -->
        <td width="50%" style="padding:16px 20px;vertical-align:top;background-color:#F0F4FF;">
          <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.08em;">Why It Matters to 1st Source</p>
          <p style="margin:0;font-size:13px;color:#1E3A5F;line-height:1.7;">${release.impactAnalysis}</p>
          ${actionBox}
        </td>
      </tr>
    </table>
  </div>`;
}

// Renders a compact row for low-priority / awareness items
function renderAwarenessRow(release: AnalyzedRelease): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;vertical-align:top;">
      <p style="margin:0 0 2px 0;font-size:13px;font-weight:600;color:#111827;">
        <a href="${release.url}" style="color:#111827;text-decoration:none;">${release.title}</a>
      </p>
      <p style="margin:0;font-size:12px;color:#6B7280;">${sourceShortName(release.sourceName)} &bull; ${formatDate(release.publishedDate)}</p>
      <p style="margin:4px 0 0 0;font-size:12px;color:#374151;">${release.summary}</p>
    </td>
  </tr>`;
}

// Source tracker strip — shows which agencies had new releases
function renderSourceTracker(releases: AnalyzedRelease[]): string {
  const ALL_SOURCES = [
    { id: 'treasury', label: 'Treasury' },
    { id: 'occ', label: 'OCC' },
    { id: 'fdic', label: 'FDIC' },
    { id: 'fed', label: 'Federal Reserve' },
    { id: 'cfpb', label: 'CFPB' },
    { id: 'indiana-dfi', label: 'Indiana DFI' },
  ];

  const activeSources = new Set(releases.map((r) => r.sourceId));

  return ALL_SOURCES.map((s) => {
    const active = activeSources.has(s.id);
    return `<td style="text-align:center;padding:0 4px;">
      <div style="background-color:${active ? '#1E3A5F' : '#E5E7EB'};color:${active ? '#ffffff' : '#9CA3AF'};font-size:11px;font-weight:${active ? '700' : '400'};padding:8px 4px;border-radius:4px;min-width:60px;">
        ${s.label}${active ? '' : ''}
      </div>
      ${active ? `<div style="font-size:9px;color:#059669;font-weight:700;text-align:center;margin-top:3px;text-transform:uppercase;letter-spacing:0.05em;">NEW</div>` : `<div style="font-size:9px;color:#9CA3AF;text-align:center;margin-top:3px;">No new</div>`}
    </td>`;
  }).join('');
}

export function buildBankingMonitorEmail(
  releases: AnalyzedRelease[],
  runDate: Date = new Date()
): { subject: string; html: string } {
  const relevant = releases.filter((r) => r.priority !== 'not_relevant');
  const high = relevant.filter((r) => r.priority === 'high');
  const medium = relevant.filter((r) => r.priority === 'medium');
  const low = relevant.filter((r) => r.priority === 'low');
  const actions = relevant.filter((r) => r.actionRequired);

  const dateLabel = runDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalCount = relevant.length;
  const briefLabel =
    totalCount === 0
      ? 'NO NEW REGULATORY RELEASES'
      : `${totalCount} NEW RELEASE${totalCount !== 1 ? 'S' : ''} DETECTED`;

  const subject =
    high.length > 0
      ? `[ACTION REQUIRED] 1st Source Intelligence Brief — ${runDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${high.length} High Priority`
      : relevant.length > 0
        ? `1st Source Intelligence Brief — ${runDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${totalCount} Update${totalCount !== 1 ? 's' : ''}`
        : `1st Source Intelligence Brief — ${runDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — No New Updates`;

  // Build numbered action steps from items requiring action
  const actionSteps = actions.map((item, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: sourceShortName(item.sourceName),
    detail: item.actionDetails,
  }));

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>1st Source Intelligence Brief</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#111827;max-width:700px;margin:0 auto;padding:20px;background-color:#F9FAFB;">

  <!-- ══════════════ HEADER ══════════════ -->
  <div style="background:linear-gradient(135deg,#1E3A5F 0%,#2D5A8E 100%);padding:28px 36px;border-radius:10px 10px 0 0;">
    <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#93C5FD;text-transform:uppercase;letter-spacing:0.12em;">Intelligence Brief &nbsp;·&nbsp; ${briefLabel}</p>
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
      ${high.length > 0 ? `${high[0].sourceName}: ${high[0].title}` : relevant.length > 0 ? 'Banking Regulatory Updates' : 'Regulatory Monitoring Summary'}
    </h1>
    <p style="margin:0;font-size:13px;color:#BFDBFE;">Prepared for 1st Source Bank Leadership &nbsp;|&nbsp; ${dateLabel}</p>
  </div>

  <!-- ══════════════ SOURCE TRACKER ══════════════ -->
  <div style="background-color:#F0F4FF;padding:16px 20px;border-left:1px solid #D1D5DB;border-right:1px solid #D1D5DB;border-bottom:1px solid #D1D5DB;">
    <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.08em;">Sources Checked This Run</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>${renderSourceTracker(relevant)}</tr>
    </table>
  </div>

  <div style="height:20px;"></div>

  ${
    relevant.length === 0
      ? `<!-- NO UPDATES -->
  <div style="background-color:#ffffff;border-radius:8px;padding:40px;text-align:center;border:1px solid #E5E7EB;margin-bottom:20px;">
    <div style="font-size:36px;margin-bottom:12px;">✓</div>
    <h2 style="color:#059669;margin:0 0 8px 0;font-size:17px;font-weight:700;">No New Regulatory Updates</h2>
    <p style="color:#6B7280;margin:0;font-size:14px;">All sources checked — nothing requiring your attention at this time.</p>
  </div>`
      : ''
  }

  ${
    (high.length > 0 || medium.length > 0) &&
    relevant.length > 0
      ? `<!-- ══════════════ HIGH + MEDIUM PRIORITY CARDS ══════════════ -->
  <div style="margin-bottom:24px;">
    ${[...high, ...medium].map((r, i) => renderDetailCard(r, i)).join('')}
  </div>`
      : ''
  }

  ${
    low.length > 0
      ? `<!-- ══════════════ FOR AWARENESS ══════════════ -->
  <div style="background-color:#ffffff;border-radius:8px;padding:20px 24px;margin-bottom:24px;border:1px solid #E5E7EB;">
    <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:10px;border-bottom:2px solid #E0F2FE;">For Awareness</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${low.map(renderAwarenessRow).join('')}
    </table>
  </div>`
      : ''
  }

  ${
    actionSteps.length > 0
      ? `<!-- ══════════════ RECOMMENDED NEXT STEPS ══════════════ -->
  <div style="margin-bottom:24px;">
    <div style="background-color:#1E3A5F;padding:14px 20px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;">Recommended Next Steps for 1st Source</p>
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        ${actionSteps
          .map(
            (step) => `
        <td width="${Math.floor(100 / actionSteps.length)}%" style="vertical-align:top;padding:2px;">
          <div style="background-color:#2D5A8E;padding:18px 16px;height:100%;">
            <div style="font-size:22px;font-weight:700;color:#93C5FD;margin-bottom:6px;">${step.num}</div>
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#ffffff;">${step.title}</p>
            <p style="margin:0;font-size:12px;color:#BFDBFE;line-height:1.5;">${step.detail}</p>
          </div>
        </td>`
          )
          .join('')}
      </tr>
    </table>
  </div>`
      : ''
  }

  ${
    high.length > 0
      ? `<!-- MORE RESOURCES NOTICE -->
  <div style="border:2px solid #F59E0B;border-radius:8px;padding:14px 18px;margin-bottom:20px;background-color:#FFFBEB;">
    <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
      <strong style="color:#D97706;">NOTE:</strong> This brief covers the most recent releases. The monitoring agent checks all sources each weekday morning and will send a follow-up brief when additional relevant updates are published.
    </p>
  </div>`
      : ''
  }

  <!-- ══════════════ FOOTER ══════════════ -->
  <div style="text-align:center;padding-top:20px;border-top:1px solid #E5E7EB;">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;color:#374151;">1st Source Bank &nbsp;|&nbsp; Intelligent Automation &nbsp;|&nbsp; ${dateLabel}</p>
    <p style="margin:0;font-size:11px;color:#9CA3AF;">AI-generated regulatory intelligence brief — for internal use only.<br>Consult legal and compliance counsel before acting on regulatory guidance.</p>
    ${relevant.length > 0 ? `<p style="margin:10px 0 0 0;font-size:11px;">${relevant.map((r) => `<a href="${r.url}" style="color:#2563EB;text-decoration:none;">${sourceShortName(r.sourceName)}</a>`).join(' &nbsp;|&nbsp; ')}</p>` : ''}
  </div>

</body>
</html>`;

  return { subject, html };
}
