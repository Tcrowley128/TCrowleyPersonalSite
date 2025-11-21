const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDataState() {
  const targetId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Checking current database state...\n');

  // Check projects
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, status, actual_completion_date, description')
    .eq('assessment_id', targetId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total projects: ${projects.length}\n`);

  const completed = projects.filter(p => p.status === 'completed');
  const inProgress = projects.filter(p => p.status === 'in_progress');
  const notStarted = projects.filter(p => p.status === 'not_started');

  console.log('Status Breakdown:');
  console.log(`  Completed: ${completed.length}`);
  console.log(`  In Progress: ${inProgress.length}`);
  console.log(`  Not Started: ${notStarted.length}\n`);

  if (completed.length > 0) {
    console.log('Sample Completed Projects:');
    completed.slice(0, 3).forEach(p => {
      const savingsMatch = p.description?.match(/Actual Annual Savings: \$(\d+)K/);
      const savings = savingsMatch ? savingsMatch[1] + 'K' : 'N/A';
      console.log(`  - ${p.title}`);
      console.log(`    Date: ${p.actual_completion_date || 'N/A'}`);
      console.log(`    Savings: $${savings}/year`);
    });
  } else {
    console.log('⚠️  NO COMPLETED PROJECTS FOUND!');
    console.log('\nThis means the SQL script needs to be run or the data was reset.\n');
  }

  // Calculate totals
  let totalSavings = 0;
  completed.forEach(p => {
    const match = p.description?.match(/Actual Annual Savings: \$(\d+)K/);
    if (match) {
      totalSavings += parseInt(match[1]) * 1000;
    }
  });

  console.log(`\nTotal Realized Savings: $${Math.round(totalSavings/1000)}K/year`);
}

checkDataState().catch(console.error);
