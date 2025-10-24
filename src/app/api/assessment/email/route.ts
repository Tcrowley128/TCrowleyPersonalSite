import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { assessment_id, recipient_email, mock_data } = await request.json();

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

    let results, assessment;

    // Use mock data if provided (for testing)
    if (mock_data) {
      assessment = {
        company_name: mock_data.company_name,
        company_size: mock_data.company_size,
        industry: mock_data.industry
      };
      results = {
        quick_wins: mock_data.quick_wins,
        priority_matrix: mock_data.priority_matrix,
        tier1_citizen_led: Array(mock_data.tier1_count || 0).fill({}),
        tier2_hybrid: Array(mock_data.tier2_count || 0).fill({}),
        tier3_technical: Array(mock_data.tier3_count || 0).fill({})
      };
    } else {
      const supabase = createAdminClient();

      // Fetch assessment results
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('assessment_id', assessment_id)
        .single();

      if (resultsError || !resultsData) {
        return NextResponse.json(
          { error: 'Results not found' },
          { status: 404 }
        );
      }

      // Fetch assessment data for context
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('company_name, company_size, industry')
        .eq('id', assessment_id)
        .single();

      results = resultsData;
      assessment = assessmentData;
    }

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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #0A1628; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fb; }
    .header { background: linear-gradient(135deg, #7B9CFF 0%, #A78BFF 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(123, 156, 255, 0.3); }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
    .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.95; }
    .section { background: #ffffff; padding: 24px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #7B9CFF; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .section h2 { color: #7B9CFF; margin-top: 0; font-size: 20px; font-weight: 600; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #7B9CFF; }
    .stat-card .number { font-size: 36px; font-weight: bold; color: #7B9CFF; margin: 8px 0; }
    .stat-card .label { font-size: 13px; color: #6B7280; font-weight: 500; }
    .quick-win { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); padding: 18px; margin: 12px 0; border-radius: 10px; border-left: 4px solid #10B981; }
    .quick-win h3 { margin: 0 0 10px 0; color: #059669; font-size: 16px; font-weight: 600; }
    .quick-win p { margin: 8px 0; font-size: 14px; color: #374151; }
    .quick-win .meta { font-size: 13px; color: #6B7280; font-weight: 500; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #7B9CFF 0%, #A78BFF 100%); color: white; padding: 16px 36px; text-decoration: none; border-radius: 10px; margin: 24px 0; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(123, 156, 255, 0.4); }
    .footer { text-align: center; color: #6B7280; font-size: 13px; margin-top: 40px; padding-top: 24px; border-top: 2px solid #E5E7EB; }
    .highlight { background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #FFB800; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="header" style="background: linear-gradient(135deg, #7B9CFF 0%, #A78BFF 100%); color: #ffffff; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🚀 Your Digital Transformation Roadmap is Ready!</h1>
    <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 16px;">Personalized AI-Powered Recommendations</p>
  </div>

  ${assessment?.company_name ? `<div style="background: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 24px; text-align: center; border: 2px solid #7B9CFF;"><p style="font-size: 20px; color: #7B9CFF; font-weight: 600; margin: 0;">Assessment for: ${assessment.company_name}</p></div>` : ''}

  <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #7B9CFF; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #7B9CFF; margin-top: 0; font-size: 20px; font-weight: 600;">📊 Your Digital Transformation Snapshot</h2>
    <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">We've analyzed your organization and created a comprehensive roadmap tailored to your specific needs.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 10px; width: 50%;">
          <div style="background: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #7B9CFF;">
            <div style="font-size: 36px; font-weight: bold; color: #7B9CFF; margin: 8px 0;">${quickWinsCount}</div>
            <div style="font-size: 13px; color: #6B7280; font-weight: 500;">Quick Wins (30 Days)</div>
          </div>
        </td>
        <td style="padding: 10px; width: 50%;">
          <div style="background: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #7B9CFF;">
            <div style="font-size: 36px; font-weight: bold; color: #7B9CFF; margin: 8px 0;">${tier1Count}</div>
            <div style="font-size: 13px; color: #6B7280; font-weight: 500;">Low-Code Solutions</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; width: 50%;">
          <div style="background: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #7B9CFF;">
            <div style="font-size: 36px; font-weight: bold; color: #7B9CFF; margin: 8px 0;">${tier2Count}</div>
            <div style="font-size: 13px; color: #6B7280; font-weight: 500;">Hybrid Initiatives</div>
          </div>
        </td>
        <td style="padding: 10px; width: 50%;">
          <div style="background: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #7B9CFF;">
            <div style="font-size: 36px; font-weight: bold; color: #7B9CFF; margin: 8px 0;">${tier3Count}</div>
            <div style="font-size: 13px; color: #6B7280; font-weight: 500;">Advanced Solutions</div>
          </div>
        </td>
      </tr>
    </table>
  </div>

  ${results.priority_matrix ? `
  <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #7B9CFF; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #7B9CFF; margin-top: 0; font-size: 20px; font-weight: 600;">🎯 Executive Summary</h2>
    <p style="color: #374151; margin: 12px 0;"><strong style="color: #0A1628;">Current State:</strong> ${results.priority_matrix.current_state || 'Assessment complete'}</p>
    <p style="color: #374151; margin: 12px 0;"><strong style="color: #0A1628;">Key Opportunity:</strong> ${results.priority_matrix.key_opportunity || 'Multiple opportunities identified'}</p>
    <p style="color: #374151; margin: 12px 0;"><strong style="color: #0A1628;">Recommended Starting Point:</strong> ${results.priority_matrix.recommended_starting_point || 'Review quick wins tab'}</p>
  </div>
  ` : ''}

  ${results.quick_wins && results.quick_wins.length > 0 ? `
  <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #7B9CFF; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #7B9CFF; margin-top: 0; font-size: 20px; font-weight: 600;">⚡ Your Top Quick Wins</h2>
    <p style="color: #374151; font-size: 15px; margin-bottom: 16px;">Start seeing results in the next 30 days with these high-impact, low-effort initiatives:</p>
    ${results.quick_wins.slice(0, 3).map((win: any, idx: number) => `
      <div style="background: #f0fdf4; padding: 18px; margin: 12px 0; border-radius: 10px; border-left: 4px solid #10B981;">
        <h3 style="margin: 0 0 10px 0; color: #059669; font-size: 16px; font-weight: 600;">${idx + 1}. ${win.title}</h3>
        <p style="margin: 8px 0; font-size: 14px; color: #374151;">${win.description}</p>
        <p style="font-size: 13px; color: #6B7280; font-weight: 500; margin: 8px 0;"><strong style="color: #374151;">⏱️ Time to Implement:</strong> ${win.time_to_implement} | <strong style="color: #374151;">💡 Time Saved:</strong> ${win.estimated_time_saved}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #FFB800; margin: 16px 0;">
    <h3 style="color: #92400E; margin-top: 0; font-size: 18px; font-weight: 600;">💼 What's Inside Your Full Roadmap</h3>
    <ul style="color: #78350F; margin: 12px 0; padding-left: 24px;">
      <li style="margin: 8px 0; color: #78350F;"><strong style="color: #92400E;">90-Day Action Plan:</strong> Month-by-month breakdown with specific milestones</li>
      <li style="margin: 8px 0; color: #78350F;"><strong style="color: #92400E;">Tiered Technology Stack:</strong> Low-code, hybrid, and advanced solutions</li>
      <li style="margin: 8px 0; color: #78350F;"><strong style="color: #92400E;">Maturity Assessment:</strong> Data Strategy, Automation, AI Integration & People & Culture</li>
      <li style="margin: 8px 0; color: #78350F;"><strong style="color: #92400E;">Change Management:</strong> Training plans and adoption strategies</li>
      <li style="margin: 8px 0; color: #78350F;"><strong style="color: #92400E;">Success Metrics:</strong> KPIs to measure your transformation progress</li>
    </ul>
  </div>

  <div style="background: #ffffff; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tylercrowley.com'}/assessment/results/${assessment_id}" class="cta-button" style="background: linear-gradient(135deg, #7B9CFF 0%, #A78BFF 100%); color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(123, 156, 255, 0.4);">
      🚀 View Your Complete Roadmap
    </a>
    <p style="color: #6B7280; font-size: 13px; margin-top: 16px; margin-bottom: 0;">Access anytime at the link above</p>
  </div>

  <div class="footer" style="text-align: center; color: #6B7280; font-size: 13px; margin-top: 40px; padding-top: 24px; border-top: 2px solid #E5E7EB;">
    <p style="font-weight: 600; color: #374151; margin-bottom: 8px;">📧 Save This Email</p>
    <p style="color: #6B7280;">Bookmark the link above to access your personalized roadmap anytime. Your assessment is securely saved and ready whenever you need it.</p>
    <p style="margin-top: 20px; color: #6B7280;">This assessment was generated using AI based on your specific business context, industry, and organizational size.</p>
    <p style="margin-top: 16px; font-size: 14px; color: #374151;">
      <strong>Questions? Ready to discuss implementation?</strong><br/>
      I'd love to help you bring this roadmap to life.
      <a href="mailto:tcrowley128@gmail.com" style="color: #7B9CFF; text-decoration: none; font-weight: 600;">Let's connect!</a>
    </p>
  </div>
</body>
</html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Tyler Crowley <noreply@tylercrowley.com>',
      to: recipient_email,
      subject: `🚀 ${assessment?.company_name ? `${assessment.company_name}'s` : 'Your'} Digital Transformation Roadmap is Ready!`,
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
