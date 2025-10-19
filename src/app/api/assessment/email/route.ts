import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { assessment_id, recipient_email } = await request.json();

    if (!assessment_id || !recipient_email) {
      return NextResponse.json(
        { error: 'Assessment ID and email are required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    // Fetch assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessment_id)
      .single();

    if (resultsError || !results) {
      return NextResponse.json(
        { error: 'Results not found' },
        { status: 404 }
      );
    }

    // Fetch assessment data for context
    const { data: assessment } = await supabase
      .from('assessments')
      .select('company_name, company_size, industry')
      .eq('id', assessment_id)
      .single();

    // Build email content
    const quickWinsCount = results.quick_wins?.length || 0;
    const tier1Count = results.tier1_citizen_led?.length || 0;
    const tier2Count = results.tier2_hybrid?.length || 0;
    const tier3Count = results.tier3_technical?.length || 0;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .section h2 { color: #667eea; margin-top: 0; font-size: 20px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #e9ecef; }
    .stat-card .number { font-size: 32px; font-weight: bold; color: #667eea; margin: 5px 0; }
    .stat-card .label { font-size: 14px; color: #6c757d; }
    .quick-win { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #28a745; }
    .quick-win h3 { margin: 0 0 10px 0; color: #28a745; font-size: 16px; }
    .quick-win p { margin: 5px 0; font-size: 14px; color: #666; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Your Digital Transformation Roadmap</h1>
    <p>Your Personalized Recommendations</p>
  </div>

  ${assessment?.company_name ? `<p style="font-size: 18px; color: #667eea; font-weight: bold;">Assessment for: ${assessment.company_name}</p>` : ''}

  <div class="section">
    <h2>📊 Your Results at a Glance</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="number">${quickWinsCount}</div>
        <div class="label">Quick Wins Ready</div>
      </div>
      <div class="stat-card">
        <div class="number">${tier1Count}</div>
        <div class="label">Citizen-Led Solutions</div>
      </div>
      <div class="stat-card">
        <div class="number">${tier2Count}</div>
        <div class="label">Hybrid Solutions</div>
      </div>
      <div class="stat-card">
        <div class="number">${tier3Count}</div>
        <div class="label">Technical Solutions</div>
      </div>
    </div>
  </div>

  ${results.priority_matrix ? `
  <div class="section">
    <h2>🎯 Executive Summary</h2>
    <p><strong>Current State:</strong> ${results.priority_matrix.current_state || 'Assessment complete'}</p>
    <p><strong>Key Opportunity:</strong> ${results.priority_matrix.key_opportunity || 'Multiple opportunities identified'}</p>
    <p><strong>Recommended Starting Point:</strong> ${results.priority_matrix.recommended_starting_point || 'Review quick wins tab'}</p>
  </div>
  ` : ''}

  ${results.quick_wins && results.quick_wins.length > 0 ? `
  <div class="section">
    <h2>⚡ Top 3 Quick Wins (30-Day Actions)</h2>
    ${results.quick_wins.slice(0, 3).map((win: any) => `
      <div class="quick-win">
        <h3>${win.title}</h3>
        <p>${win.description}</p>
        <p><strong>Time to Implement:</strong> ${win.time_to_implement} | <strong>Time Saved:</strong> ${win.estimated_time_saved}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>🔗 Next Steps</h2>
    <p>Your complete roadmap includes:</p>
    <ul>
      <li>Detailed 90-day implementation plan</li>
      <li>Technology recommendations across 3 tiers</li>
      <li>Maturity assessment for Data, Automation, AI & People</li>
      <li>Change management & training strategy</li>
      <li>Success metrics to track your progress</li>
    </ul>
    <p style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/assessment/results/${assessment_id}" class="cta-button">
        View Full Roadmap
      </a>
    </p>
  </div>

  <div class="footer">
    <p>This assessment was generated using Tyler's AI based on your specific business context.</p>
    <p>Questions? Ready to discuss implementation? Let's connect!</p>
  </div>
</body>
</html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: recipient_email,
      subject: '🚀 Your Digital Transformation Roadmap is Ready',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email_id: data?.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
