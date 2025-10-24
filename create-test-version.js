// Script to create a test version for an existing assessment
// This allows testing the version restore feature without regenerating

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestVersion(assessmentId) {
  console.log(`Creating initial version for assessment: ${assessmentId}`);

  // Call the database function to create a version
  const { data, error } = await supabase.rpc('create_assessment_version', {
    p_assessment_id: assessmentId,
    p_created_by: 'manual_snapshot',
    p_change_summary: 'Manual version snapshot for testing restore functionality',
    p_changed_responses: null
  });

  if (error) {
    console.error('Error creating version:', error);
    return;
  }

  console.log('✅ Version created successfully!');
  console.log('Version ID:', data);

  // Fetch all versions to verify
  const { data: versions, error: versionsError } = await supabase
    .from('assessment_versions')
    .select('id, version_number, is_current, created_by, change_summary, created_at')
    .eq('assessment_id', assessmentId)
    .order('version_number', { ascending: false });

  if (versionsError) {
    console.error('Error fetching versions:', versionsError);
    return;
  }

  console.log('\n📋 All versions for this assessment:');
  versions.forEach(v => {
    console.log(`  Version ${v.version_number} ${v.is_current ? '(current)' : ''}`);
    console.log(`    Created by: ${v.created_by}`);
    console.log(`    Summary: ${v.change_summary}`);
    console.log(`    Date: ${new Date(v.created_at).toLocaleString()}`);
    console.log('');
  });

  console.log('\n✨ You can now test the restore feature without regenerating!');
  console.log('   1. Go to the assessment results page');
  console.log('   2. Click the three-dot menu');
  console.log('   3. Click "Restore Old Version"');
  console.log('   4. You should see the version(s) listed');
}

// Get assessment ID from command line or use default
const assessmentId = process.argv[2] || '2a163822-650f-4942-adea-dde3fe22d13c';

createTestVersion(assessmentId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
