import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id') || 'tcrowley128@gmail.com';

  try {
    const supabase = createAdminClient();

    // Get specific user preferences
    const { data: userPrefs, error: userError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get all users with notify_risk_created enabled
    const { data: allPrefs, error: allError } = await supabase
      .from('notification_preferences')
      .select('user_id, notify_risk_created')
      .eq('notify_risk_created', true);

    return NextResponse.json({
      user_preferences: userPrefs,
      user_error: userError,
      users_with_risk_notifications: allPrefs,
      all_error: allError
    });
  } catch (error) {
    console.error('Error checking preferences:', error);
    return NextResponse.json({ error: 'Failed to check preferences' }, { status: 500 });
  }
}
