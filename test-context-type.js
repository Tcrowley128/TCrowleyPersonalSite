require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testContextType() {
  try {
    const { data: conversations } = await supabase
      .from('assessment_conversations')
      .select('id')
      .limit(1);

    if (conversations && conversations.length > 0) {
      const testUpdate = await supabase
        .from('assessment_conversations')
        .update({ context_type: 'assessment' })
        .eq('id', conversations[0].id);

      if (testUpdate.error) {
        console.log('Column does not exist. Please run this SQL in Supabase:');
        console.log('');
        console.log("ALTER TABLE assessment_conversations ADD COLUMN context_type TEXT DEFAULT 'assessment';");
        console.log('CREATE INDEX idx_conversations_context_type ON assessment_conversations(context_type);');
        console.log('');
      } else {
        console.log('✓ Column context_type exists and is working!');
      }
    } else {
      console.log('No conversations found to test with');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testContextType().then(() => process.exit(0));
