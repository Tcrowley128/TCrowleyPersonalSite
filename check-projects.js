const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProjects() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, status, actual_completion_date, description')
    .eq('assessment_id', assessmentId)
    .order('actual_completion_date', { ascending: true, nullsLast: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\nTotal projects: ${projects.length}\n`);

  const completed = projects.filter(p => p.status === 'completed');
  const inProgress = projects.filter(p => p.status === 'in_progress');
  const notStarted = projects.filter(p => p.status === 'not_started');

  console.log('=== Status Breakdown ===');
  console.log(`Completed: ${completed.length}`);
  console.log(`In Progress: ${inProgress.length}`);
  console.log(`Not Started: ${notStarted.length}\n`);

  console.log('=== Completed Projects with Dates ===');
  let total2024Savings = 0;
  let total2025Savings = 0;

  completed.forEach(p => {
    const year = p.actual_completion_date ? new Date(p.actual_completion_date).getFullYear() : 'N/A';
    const savingsMatch = p.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
    let savings = 0;
    if (savingsMatch) {
      const value = parseFloat(savingsMatch[1]);
      const multiplier = savingsMatch[0].toUpperCase().includes('M') ? 1000000 : 1000;
      savings = value * multiplier;

      if (year === 2024) total2024Savings += savings;
      if (year === 2025) total2025Savings += savings;
    }

    console.log(`${p.title}`);
    console.log(`  Date: ${p.actual_completion_date || 'N/A'} (${year})`);
    console.log(`  Savings: $${(savings/1000).toFixed(0)}K/year`);
  });

  console.log('\n=== Savings Summary ===');
  console.log(`2024 Total: $${(total2024Savings/1000).toFixed(0)}K`);
  console.log(`2025 Total: $${(total2025Savings/1000).toFixed(0)}K`);
  console.log(`Combined Total: $${((total2024Savings + total2025Savings)/1000).toFixed(0)}K`);
}

checkProjects().catch(console.error);
