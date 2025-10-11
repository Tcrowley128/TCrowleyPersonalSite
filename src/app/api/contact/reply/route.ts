import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { submissionId, to, subject, message } = body;

    // Validation
    if (!submissionId || !to || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify submission exists
    const { data: submission, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Send email using Resend
    const emailFrom = process.env.EMAIL_FROM || 'noreply@tylercrowley.com';

    try {
      await resend.emails.send({
        from: `Tyler Crowley <${emailFrom}>`,
        to: [to],
        subject: subject,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you submitted a contact form on tylercrowley.com
            </p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({
        status: 'RESPONDED',
        responded: true,
        notes: `Replied on ${new Date().toISOString()}\nSubject: ${subject}`,
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
