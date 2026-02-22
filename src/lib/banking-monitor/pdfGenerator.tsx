// Server-side PDF generation using @react-pdf/renderer
// Produces two document styles matching the 1st Source Intelligence Brief templates

import React from 'react';
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { AnalyzedRelease, GovernanceStatus, PDFContent } from './types';

// ─────────────────────────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────────────────────────

const C = {
  navy: '#1E3A5F',
  navyMid: '#2D5A8E',
  navyLight: '#EFF6FF',
  blue: '#DBEAFE',
  blueText: '#1D4ED8',
  white: '#FFFFFF',
  darkText: '#111827',
  midText: '#374151',
  gray: '#6B7280',
  borderGray: '#E5E7EB',
  lightGray: '#F9FAFB',
  accentBlue: '#93C5FD',
  accentBlueMid: '#BFDBFE',
  yellowBg: '#FFFBEB',
  yellowBorder: '#F59E0B',
  yellowText: '#92400E',
  // Status badge colors
  statusStrong: '#7C3AED',
  statusInProgress: '#2563EB',
  statusEarlyStage: '#059669',
  statusPlanned: '#D97706',
  statusFoundational: '#DC2626',
};

const STATUS_COLORS: Record<GovernanceStatus, string> = {
  STRONG: C.statusStrong,
  'IN PROGRESS': C.statusInProgress,
  'EARLY STAGE': C.statusEarlyStage,
  PLANNED: C.statusPlanned,
  FOUNDATIONAL: C.statusFoundational,
};

function fmtDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function shortSource(name: string): string {
  return name
    .replace('OCC - Office of the Comptroller of the Currency', 'OCC')
    .replace('FDIC - Federal Deposit Insurance Corporation', 'FDIC')
    .replace('CFPB - Consumer Financial Protection Bureau', 'CFPB')
    .replace('U.S. Department of the Treasury', 'U.S. Treasury')
    .replace('Indiana Department of Financial Institutions', 'Indiana DFI');
}

// ─────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Intelligence Brief PDF
// ─────────────────────────────────────────────────────────────────

const ib = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.darkText,
    backgroundColor: C.white,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: 'column',
  },
  // Header
  header: {
    backgroundColor: C.navy,
    padding: 20,
    marginBottom: 14,
  },
  headerLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.accentBlue,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 8.5,
    color: C.accentBlueMid,
  },
  // Two-column what happened / why it matters
  twoCol: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.borderGray,
    marginBottom: 14,
  },
  colLeft: {
    width: '50%',
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: C.borderGray,
    borderRightStyle: 'solid',
  },
  colRight: {
    width: '50%',
    padding: 12,
    backgroundColor: C.navyLight,
  },
  colLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  bodyText: {
    fontSize: 8.5,
    color: C.midText,
    lineHeight: 1.65,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletDot: {
    fontSize: 9,
    color: C.navy,
    width: 10,
    fontFamily: 'Helvetica-Bold',
  },
  bulletText: {
    fontSize: 8.5,
    color: C.navy,
    flex: 1,
    lineHeight: 1.55,
  },
  // Section header bar
  sectionBar: {
    backgroundColor: C.lightGray,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.navy,
    borderLeftStyle: 'solid',
    marginBottom: 8,
  },
  sectionBarText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    letterSpacing: 0.8,
  },
  // Four component cards
  fourCards: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  card: {
    flex: 1,
    backgroundColor: C.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 3,
    borderTopColor: C.navy,
    borderTopStyle: 'solid',
    marginRight: 4,
  },
  cardLast: {
    marginRight: 0,
  },
  cardNum: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    opacity: 0.25,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 8,
    color: C.midText,
    lineHeight: 1.55,
  },
  // Next steps
  nextHeader: {
    backgroundColor: C.navy,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  nextHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 0.9,
  },
  threeBoxes: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepBox: {
    flex: 1,
    backgroundColor: C.navyMid,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 2,
  },
  stepBoxLast: {
    marginRight: 0,
  },
  stepNum: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.accentBlue,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 8.5,
    color: C.white,
    lineHeight: 1.55,
  },
  // Notice box
  notice: {
    borderWidth: 2,
    borderColor: C.yellowBorder,
    backgroundColor: C.yellowBg,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  noticeText: {
    fontSize: 8.5,
    color: C.yellowText,
    lineHeight: 1.6,
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.borderGray,
    borderTopStyle: 'solid',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7.5,
    color: C.gray,
  },
});

const riskKeys = ['govern', 'map', 'measure', 'manage'] as const;

const IntelligenceBriefDocument = ({
  release,
  date,
}: {
  release: AnalyzedRelease;
  date: Date;
}) => {
  const pdf = release.pdfContent as PDFContent;
  const dateLabel = fmtDate(date);
  const src = shortSource(release.sourceName).toUpperCase();

  return (
    <Document>
      <Page size="LETTER" style={ib.page}>
        {/* ── Header ── */}
        <View style={ib.header}>
          <Text style={ib.headerLabel}>INTELLIGENCE BRIEF  ·  {src}</Text>
          <Text style={ib.headerTitle}>{release.title}</Text>
          <Text style={ib.headerSub}>
            Prepared for 1st Source Bank Leadership  |  {dateLabel}
          </Text>
        </View>

        {/* ── What Happened / Why It Matters ── */}
        <View style={ib.twoCol}>
          <View style={ib.colLeft}>
            <Text style={ib.colLabel}>WHAT HAPPENED</Text>
            <Text style={ib.bodyText}>{pdf.whatHappened}</Text>
          </View>
          <View style={ib.colRight}>
            <Text style={ib.colLabel}>WHY IT MATTERS TO 1ST SOURCE</Text>
            {pdf.whyItMattersPoints.map((pt, i) => (
              <View key={i} style={ib.bulletRow}>
                <Text style={ib.bulletDot}>›</Text>
                <Text style={ib.bulletText}>{pt}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FS AI RMF Four Components ── */}
        <View style={ib.sectionBar}>
          <Text style={ib.sectionBarText}>THE FS AI RMF: FOUR COMPONENTS</Text>
        </View>
        <View style={ib.fourCards}>
          {riskKeys.map((key, i) => (
            <View key={key} style={[ib.card, i === riskKeys.length - 1 ? ib.cardLast : {}]}>
              <Text style={ib.cardNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={ib.cardTitle}>{key.toUpperCase()}</Text>
              <Text style={ib.cardBody}>{pdf.riskComponents[key]}</Text>
            </View>
          ))}
        </View>

        {/* ── Recommended Next Steps ── */}
        <View style={ib.nextHeader}>
          <Text style={ib.nextHeaderText}>RECOMMENDED NEXT STEPS FOR 1ST SOURCE</Text>
        </View>
        <View style={ib.threeBoxes}>
          {pdf.nextSteps.slice(0, 3).map((step, i) => (
            <View
              key={i}
              style={[ib.stepBox, i === Math.min(pdf.nextSteps.length, 3) - 1 ? ib.stepBoxLast : {}]}
            >
              <Text style={ib.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={ib.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* ── Notice ── */}
        <View style={ib.notice}>
          <Text style={ib.noticeText}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>NOTE: </Text>
            This brief is AI-generated based on the latest regulatory release. The 1st Source
            banking monitoring agent checks all federal and Indiana state sources each weekday
            morning and will issue follow-up briefs as additional relevant updates are published.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={ib.footer}>
          <Text style={ib.footerText}>
            1st Source Bank  |  Intelligent Automation  |  {dateLabel}  |  For Internal Use
          </Text>
          <Text style={ib.footerText}>{shortSource(release.sourceName)}</Text>
        </View>
      </Page>
    </Document>
  );
};

// ─────────────────────────────────────────────────────────────────
// TEMPLATE 1 — AI Governance Readiness Summary PDF
// ─────────────────────────────────────────────────────────────────

const gr = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.darkText,
    backgroundColor: C.white,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: 'column',
  },
  // Title block
  titleBlock: {
    marginBottom: 14,
  },
  docTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 10.5,
    color: C.midText,
    marginBottom: 3,
  },
  tagline: {
    fontSize: 8.5,
    color: C.gray,
  },
  // Context box
  contextBox: {
    borderLeftWidth: 3,
    borderLeftColor: C.navy,
    borderLeftStyle: 'solid',
    paddingLeft: 12,
    paddingTop: 9,
    paddingBottom: 9,
    paddingRight: 12,
    backgroundColor: C.navyLight,
    marginBottom: 16,
  },
  contextText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Oblique',
    color: C.navy,
    lineHeight: 1.65,
  },
  // Table
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  thCol1: { width: '22%' },
  thCol2: { width: '58%' },
  thCol3: { width: '20%' },
  thText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.borderGray,
    borderBottomStyle: 'solid',
    paddingVertical: 9,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  tableRowAlt: {
    backgroundColor: C.lightGray,
  },
  funcName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    letterSpacing: 0.3,
  },
  activityText: {
    fontSize: 8.5,
    color: C.midText,
    lineHeight: 1.55,
    paddingRight: 8,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 0.5,
  },
  // Key messages
  kmHeader: {
    backgroundColor: C.navy,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  kmHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 0.8,
  },
  twoColMessages: {
    flexDirection: 'row',
  },
  msgCol: {
    flex: 1,
    paddingRight: 10,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  msgBullet: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    width: 10,
  },
  msgText: {
    fontSize: 8.5,
    color: C.midText,
    flex: 1,
    lineHeight: 1.55,
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.borderGray,
    borderTopStyle: 'solid',
    paddingTop: 8,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 7.5,
    color: C.gray,
    textAlign: 'center',
  },
});

const GOV_KEYS = ['govern', 'map', 'measure', 'manage'] as const;

const GovernanceReadinessDocument = ({
  releases,
  date,
}: {
  releases: AnalyzedRelease[];
  date: Date;
}) => {
  // Use highest-relevance release as the primary source for governance content
  const primary = [...releases].sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
  const pdf = primary?.pdfContent as PDFContent | undefined;
  const dateLabel = fmtDate(date);

  // Aggregate source names for context
  const sourceList = [...new Set(releases.map((r) => shortSource(r.sourceName)))].join(', ');

  return (
    <Document>
      <Page size="LETTER" style={gr.page}>
        {/* ── Title Block ── */}
        <View style={gr.titleBlock}>
          <Text style={gr.docTitle}>AI Governance Readiness Summary</Text>
          <Text style={gr.docSubtitle}>
            Mapping Current Activities to the FS AI Risk Management Framework
          </Text>
          <Text style={gr.tagline}>
            1st Source Bank  |  Intelligent Automation  |  {dateLabel}
          </Text>
        </View>

        {/* ── Context Box ── */}
        {pdf?.contextStatement ? (
          <View style={gr.contextBox}>
            <Text style={gr.contextText}>{pdf.contextStatement}</Text>
          </View>
        ) : (
          <View style={gr.contextBox}>
            <Text style={gr.contextText}>
              This document maps 1st Source Bank's current AI governance activities to the U.S.
              Treasury Financial Services AI Risk Management Framework (FS AI RMF). It provides
              examiners and leadership with a clear picture of our readiness posture across the four
              framework pillars, informed by recent regulatory developments from: {sourceList}.
            </Text>
          </View>
        )}

        {/* ── Table ── */}
        <View style={gr.tableHeaderRow}>
          <View style={gr.thCol1}>
            <Text style={gr.thText}>FS AI RMF FUNCTION</Text>
          </View>
          <View style={gr.thCol2}>
            <Text style={gr.thText}>1ST SOURCE CURRENT ACTIVITIES</Text>
          </View>
          <View style={gr.thCol3}>
            <Text style={gr.thText}>STATUS</Text>
          </View>
        </View>

        {GOV_KEYS.map((key, i) => {
          const entry = pdf?.governanceMapping?.[key];
          const status: GovernanceStatus = entry?.status ?? 'PLANNED';
          const badgeColor = STATUS_COLORS[status];
          return (
            <View key={key} style={[gr.tableRow, i % 2 === 1 ? gr.tableRowAlt : {}]}>
              <View style={gr.thCol1}>
                <Text style={gr.funcName}>{key.toUpperCase()}</Text>
              </View>
              <View style={gr.thCol2}>
                <Text style={gr.activityText}>
                  {entry?.activities ?? 'Under assessment — activities to be documented.'}
                </Text>
              </View>
              <View style={gr.thCol3}>
                <View style={[gr.badge, { backgroundColor: badgeColor }]}>
                  <Text style={gr.badgeText}>{status}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* ── Key Messages for Examiners ── */}
        <View style={gr.kmHeader}>
          <Text style={gr.kmHeaderText}>KEY MESSAGES FOR EXAMINERS</Text>
        </View>

        {pdf?.keyMessagesForExaminers && pdf.keyMessagesForExaminers.length > 0 ? (
          <View style={gr.twoColMessages}>
            <View style={gr.msgCol}>
              {pdf.keyMessagesForExaminers
                .slice(0, Math.ceil(pdf.keyMessagesForExaminers.length / 2))
                .map((msg, i) => (
                  <View key={i} style={gr.msgRow}>
                    <Text style={gr.msgBullet}>›</Text>
                    <Text style={gr.msgText}>{msg}</Text>
                  </View>
                ))}
            </View>
            <View style={gr.msgCol}>
              {pdf.keyMessagesForExaminers
                .slice(Math.ceil(pdf.keyMessagesForExaminers.length / 2))
                .map((msg, i) => (
                  <View key={i} style={gr.msgRow}>
                    <Text style={gr.msgBullet}>›</Text>
                    <Text style={gr.msgText}>{msg}</Text>
                  </View>
                ))}
            </View>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={gr.footer}>
          <Text style={gr.footerText}>
            1st Source Bank  |  Intelligent Automation  |  Based on U.S. Treasury FS AI RMF  ({dateLabel})  |  For Internal Use
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

/** Generates an Intelligence Brief PDF for a single high/medium priority release */
export async function generateIntelligenceBriefPDF(
  release: AnalyzedRelease,
  date: Date = new Date()
): Promise<Buffer> {
  return renderToBuffer(<IntelligenceBriefDocument release={release} date={date} />);
}

/** Generates a Governance Readiness Summary PDF spanning all relevant releases */
export async function generateGovernanceReadinessPDF(
  releases: AnalyzedRelease[],
  date: Date = new Date()
): Promise<Buffer> {
  return renderToBuffer(<GovernanceReadinessDocument releases={releases} date={date} />);
}
