require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addContextTypeColumn() {
  console.log('\n=== Adding context_type column to assessment_conversations ===\n');

  try {
    // Use Supabase SQL query
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add context_type column if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'assessment_conversations'
            AND column_name = 'context_type'
          ) THEN
            ALTER TABLE assessment_conversations
            ADD COLUMN context_type TEXT DEFAULT 'assessment';

            -- Add index for better query performance
            CREATE INDEX IF NOT EXISTS idx_conversations_context_type
            ON assessment_conversations(context_type);

            RAISE NOTICE 'Column context_type added successfully';
          ELSE
            RAISE NOTICE 'Column context_type already exists';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('Error adding column via RPC:', error);

      // Fallback: Try direct column addition
      console.log('Trying alternative method...');

      // First check if column exists by trying to select it
      const { data: test, error: testError } = await supabase
        .from('assessment_conversations')
        .select('context_type')
        .limit(1);

      if (testError && testError.message.includes('column')) {
        console.log('Column does not exist, needs manual SQL execution.');
        console.log('\nPlease run this SQL in Supabase SQL Editor:');
        console.log('\nALTER TABLE assessment_conversations ADD COLUMN context_type TEXT DEFAULT \'assessment\';');
        console.log('CREATE INDEX IF NOT EXISTS idx_conversations_context_type ON assessment_conversations(context_type);\n');
      } else {
        console.log('✓ Column context_type exists or was added successfully');
      }
    } else {
      console.log('✓ Column context_type added successfully!');
    }

    // Update existing conversations to have 'assessment' context type
    const { error: updateError } = await supabase
      .from('assessment_conversations')
      .update({ context_type: 'assessment' })
      .is('context_type', null);

    if (updateError) {
      console.log('Note: Could not update existing rows, they may already have values');
    } else {
      console.log('✓ Updated existing conversations with default context_type');
    }

    console.log('\n=== Migration Complete ===\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

addContextTypeColumn().then(() => process.exit(0));
