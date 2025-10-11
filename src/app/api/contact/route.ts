import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Submit a contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get IP address for spam prevention
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] :
                     request.headers.get('x-real-ip') || undefined;

    const supabase = createAdminClient();

    // Check for spam (same IP submitting multiple times in short period)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { count: recentSubmissions } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', fiveMinutesAgo.toISOString());

    if ((recentSubmissions || 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // Create the submission
    const now = new Date().toISOString();
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        ip_address: ipAddress,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send email notification to admin
    // You can integrate with services like SendGrid, Resend, or Nodemailer here

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      id: submission.id,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

// Get contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createAdminClient();

    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) throw error;

    // Get stats
    const { count: total } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    const { count: newCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'NEW');

    const { count: readCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'READ');

    const { count: respondedCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'RESPONDED');

    const { count: spamCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SPAM');

    const stats = {
      total: total || 0,
      new: newCount || 0,
      read: readCount || 0,
      responded: respondedCount || 0,
      spam: spamCount || 0,
    };

    return NextResponse.json({
      submissions,
      stats,
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// Update submission status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { id, status, notes, responded } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (responded !== undefined) updateData.responded = responded;

    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
