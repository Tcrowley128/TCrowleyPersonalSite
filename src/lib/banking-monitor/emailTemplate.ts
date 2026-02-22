import type { AnalyzedRelease } from './types';

const PRIORITY_STYLES = {
  high: {
    bg: '#FEF2F2',
    border: '#DC2626',
    badge: '#DC2626',
    textColor: '#991B1B',
    label: 'HIGH PRIORITY',
  },
  medium: {
    bg: '#FFFBEB',
    border: '#D97706',
    badge: '#D97706',
    textColor: '#92400E',
    label: 'MEDIUM PRIORITY',
  },
  low: {
    bg: '#F0F9FF',
    border: '#0284C7',
    badge: '#0284C7',
    textColor: '#075985',
    label: 'FOR AWARENESS',
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date unknown';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function renderReleaseCard(release: AnalyzedRelease): string {
  if (release.priority === 'not_relevant') return '';
  const s = PRIORITY_STYLES[release.priority];

  return `
  <div style="background-color:${s.bg};border:1px solid ${s.border};border-left:4px solid ${s.border};border-radius:8px;padding:20px;margin-bottom:16px;">
    <div style="margin-bottom:10px;">
      <span style="background-color:${s.badge};color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.07em;">${s.label}</span>
      <span style="background-color:#E5E7EB;color:#374151;font-size:10px;font-weight:500;padding:3px 8px;border-radius:4px;margin-left:6px;">${release.sourceName}</span>
    </div>
    <h3 style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#111827;line-height:1.4;">
      <a href="${release.url}" style="color:#111827;text-decoration:none;">${release.title}</a>
    </h3>
    <p style="margin:0 0 12px 0;font-size:12px;color:#6B7280;">Published: ${formatDate(release.publishedDate)}</p>
    <p style="margin:0 0 10px 0;font-size:14px;color:#374151;line-height:1.6;"><strong>Summary:</strong> ${release.summary}</p>
    <p style="margin:0 0 10px 0;font-size:14px;color:${s.textColor};line-height:1.6;"><strong>Impact on 1st Source:</strong> ${release.impactAnalysis}</p>
    ${
      release.actionRequired
        ? `<div style="background-color:#FEF9C3;border:1px solid #FDE047;border-radius:6px;padding:12px;margin-top:12px;">
        <p style="margin:0;font-size:13px;color:#713F12;"><strong>⚠ Action Required:</strong> ${release.actionDetails}</p>
      </div>`
        : ''
    }
    <a href="${release.url}" style="display:inline-block;margin-top:12px;font-size:13px;color:#1D4ED8;text-decoration:none;font-weight:500;">View Full Release →</a>
  </div>`;
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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const shortDate = runDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const subject =
    high.length > 0
      ? `[ACTION REQUIRED] 1st Source Regulatory Brief — ${shortDate} (${high.length} High Priority)`
      : relevant.length > 0
        ? `1st Source Regulatory Brief — ${shortDate} (${relevant.length} Update${relevant.length !== 1 ? 's' : ''})`
        : `1st Source Regulatory Brief — ${shortDate} — No New Updates`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>1st Source Regulatory Intelligence Brief</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:20px;background-color:#F9FAFB;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#1E3A5F 0%,#2D5A8E 100%);padding:32px 40px;border-radius:12px 12px 0 0;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93C5FD;margin-bottom:6px;">1st Source Corporation</div>
    <h1 style="margin:0 0 6px 0;font-size:24px;font-weight:700;color:#ffffff;">Regulatory Intelligence Brief</h1>
    <p style="margin:0;font-size:14px;color:#BFDBFE;">${dateLabel}</p>
  </div>

  <!-- STATS STRIP -->
  <div style="background-color:#1E3A5F;padding:16px 40px;border-radius:0 0 10px 10px;margin-bottom:24px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="text-align:center;padding:0 8px;">
          <div style="font-size:26px;font-weight:700;color:${high.length > 0 ? '#F87171' : '#6B7280'};">${high.length}</div>
          <div style="font-size:10px;color:#BFDBFE;text-transform:uppercase;letter-spacing:0.05em;">High Priority</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #2D5A8E;">
          <div style="font-size:26px;font-weight:700;color:${medium.length > 0 ? '#FCD34D' : '#6B7280'};">${medium.length}</div>
          <div style="font-size:10px;color:#BFDBFE;text-transform:uppercase;letter-spacing:0.05em;">Medium Priority</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #2D5A8E;">
          <div style="font-size:26px;font-weight:700;color:${low.length > 0 ? '#60A5FA' : '#6B7280'};">${low.length}</div>
          <div style="font-size:10px;color:#BFDBFE;text-transform:uppercase;letter-spacing:0.05em;">For Awareness</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #2D5A8E;">
          <div style="font-size:26px;font-weight:700;color:${actions.length > 0 ? '#34D399' : '#6B7280'};">${actions.length}</div>
          <div style="font-size:10px;color:#BFDBFE;text-transform:uppercase;letter-spacing:0.05em;">Actions Required</div>
        </td>
      </tr>
    </table>
  </div>

  ${
    relevant.length === 0
      ? `<div style="background-color:#ffffff;border-radius:12px;padding:40px;text-align:center;margin-bottom:24px;border:1px solid #E5E7EB;">
      <div style="font-size:36px;margin-bottom:12px;">✓</div>
      <h2 style="color:#059669;margin:0 0 8px 0;font-size:18px;">No New Regulatory Updates</h2>
      <p style="color:#6B7280;margin:0;font-size:14px;">All monitored sources checked — nothing requiring your attention at this time.</p>
    </div>`
      : ''
  }

  ${
    actions.length > 0
      ? `<!-- ACTION ITEMS SUMMARY -->
  <div style="background-color:#ffffff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #FDE047;border-left:4px solid #F59E0B;">
    <h2 style="color:#92400E;margin:0 0 16px 0;font-size:17px;font-weight:700;">⚠ Action Items Summary</h2>
    ${actions
      .map(
        (item, i) => `
    <div style="padding:10px 0;${i < actions.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">
      <p style="margin:0 0 3px 0;font-size:13px;font-weight:600;color:#111827;">${item.title}</p>
      <p style="margin:0;font-size:13px;color:#374151;">${item.actionDetails}</p>
    </div>`
      )
      .join('')}
  </div>`
      : ''
  }

  ${
    high.length > 0
      ? `<!-- HIGH PRIORITY -->
  <div style="background-color:#ffffff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E5E7EB;">
    <h2 style="color:#DC2626;margin:0 0 20px 0;font-size:17px;font-weight:700;padding-bottom:12px;border-bottom:2px solid #FEE2E2;">High Priority Items</h2>
    ${high.map(renderReleaseCard).join('')}
  </div>`
      : ''
  }

  ${
    medium.length > 0
      ? `<!-- MEDIUM PRIORITY -->
  <div style="background-color:#ffffff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E5E7EB;">
    <h2 style="color:#D97706;margin:0 0 20px 0;font-size:17px;font-weight:700;padding-bottom:12px;border-bottom:2px solid #FEF3C7;">Medium Priority Items</h2>
    ${medium.map(renderReleaseCard).join('')}
  </div>`
      : ''
  }

  ${
    low.length > 0
      ? `<!-- FOR AWARENESS -->
  <div style="background-color:#ffffff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E5E7EB;">
    <h2 style="color:#0284C7;margin:0 0 20px 0;font-size:17px;font-weight:700;padding-bottom:12px;border-bottom:2px solid #E0F2FE;">For Awareness</h2>
    ${low.map(renderReleaseCard).join('')}
  </div>`
      : ''
  }

  <!-- SOURCES FOOTER -->
  <div style="background-color:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #E5E7EB;">
    <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.06em;">Sources Monitored</p>
    <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.9;">
      U.S. Treasury Department &bull; Office of the Comptroller of the Currency (OCC) &bull;
      Federal Deposit Insurance Corporation (FDIC) &bull; Federal Reserve &bull;
      Consumer Financial Protection Bureau (CFPB) &bull;
      Indiana Department of Financial Institutions (DFI)
    </p>
  </div>

  <!-- DISCLAIMER -->
  <div style="text-align:center;padding:20px 0;border-top:1px solid #E5E7EB;">
    <p style="margin:0 0 6px 0;font-size:13px;color:#374151;font-weight:600;">1st Source Corporation — Regulatory Intelligence</p>
    <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">
      AI-generated briefing for informational purposes only.<br>
      Consult legal and compliance counsel before taking regulatory action.<br>
      Generated ${runDate.toISOString()}
    </p>
  </div>

</body>
</html>`;

  return { subject, html };
}
