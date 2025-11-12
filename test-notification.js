require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotification() {
  console.log('\n=== Testing Notification Creation ===\n');

  try {
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: 'tcrowley128@gmail.com',
      p_type: 'risk',
      p_title: 'Test notification',
      p_message: 'This is a test notification from script',
      p_entity_type: 'risk',
      p_entity_id: '00000000-0000-0000-0000-000000000000',
      p_link_url: '/test',
      p_from_user_id: null,
      p_from_user_name: 'Test System'
    });

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      console.log('Notification created successfully!');
      console.log('Result:', data);
    }

    // Now fetch notifications to verify
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', 'tcrowley128@gmail.com')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
    } else {
      console.log('\nRecent notifications:');
      console.log(JSON.stringify(notifications, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  process.exit(0);
}

testNotification();
