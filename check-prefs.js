const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPreferences() {
  console.log('\n=== Checking Notification Preferences ===\n');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', 'tcrowley128@gmail.com')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('User:', data.user_id);
  console.log('notify_risk_created:', data.notify_risk_created);
  console.log('notify_risk_updated:', data.notify_risk_updated);
  console.log('notify_comment_added:', data.notify_comment_added);
  console.log('notify_mention:', data.notify_mention);
  console.log('notify_assignment:', data.notify_assignment);
  console.log('notify_deadline:', data.notify_deadline);
  console.log('\nAll preferences:', JSON.stringify(data, null, 2));

  // Check all users with notify_risk_created enabled
  const { data: allPrefs, error: err2 } = await supabase
    .from('notification_preferences')
    .select('user_id, notify_risk_created')
    .eq('notify_risk_created', true);

  console.log('\n=== Users with notify_risk_created enabled ===');
  console.log(allPrefs);

  process.exit(0);
}

checkPreferences();
