const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateSQLScript() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Fetching project IDs in order...\n');

  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error || !projects) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${projects.length} projects\n`);
  console.log('='.repeat(80));
  console.log('SQL SCRIPT - Copy everything below this line:');
  console.log('='.repeat(80));
  console.log();
  console.log('-- Reset all projects to not_started');
  console.log(`UPDATE assessment_projects SET status = 'not_started', progress_percentage = 0, actual_completion_date = NULL, target_completion_date = NULL WHERE assessment_id = '${assessmentId}';`);
  console.log();

  // 4 HIGH-IMPACT 2024 projects
  const config2024 = [
    { month: '2024-04-10', cost: 65000, savings: 195000, duration: 56 },
    { month: '2024-07-24', cost: 58000, savings: 175000, duration: 49 },
    { month: '2024-10-21', cost: 62000, savings: 185000, duration: 63 },
    { month: '2024-12-19', cost: 55000, savings: 165000, duration: 42 }
  ];

  console.log('-- 4 HIGH-IMPACT projects completed in 2024');
  for (let i = 0; i < 4; i++) {
    const project = projects[i];
    const cfg = config2024[i];
    const actualSavings = Math.floor(cfg.savings * (0.95 + Math.random() * 0.10));
    const roi = Math.round((actualSavings / cfg.cost) * 100);

    const completionDate = new Date(cfg.month);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - cfg.duration);
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `High-impact digital transformation initiative

Expected Annual Savings: $${Math.round(cfg.savings/1000)}K
Actual Annual Savings: $${Math.round(actualSavings/1000)}K
Implementation Cost: $${Math.round(cfg.cost/1000)}K
ROI: ${roi}%
Project Duration: ${cfg.duration} days
Start Date: ${startDateStr}`;

    console.log(`\n-- Project ${i+1}: ${project.title}`);
    console.log(`UPDATE assessment_projects SET`);
    console.log(`  status = 'completed',`);
    console.log(`  progress_percentage = 100,`);
    console.log(`  actual_completion_date = '${cfg.month}',`);
    console.log(`  target_completion_date = '${cfg.month}',`);
    console.log(`  estimated_timeline_days = ${cfg.duration},`);
    console.log(`  description = '${description.replace(/'/g, "''")}'`);
    console.log(`WHERE id = '${project.id}';`);
  }

  // 8 MODERATE 2025 projects
  const months2025 = [
    '2025-02-20', '2025-03-15', '2025-05-10', '2025-06-18',
    '2025-07-22', '2025-09-14', '2025-10-08', '2025-11-25'
  ];

  console.log('\n-- 8 MODERATE projects completed in 2025');
  for (let i = 4; i < 12; i++) {
    const project = projects[i];
    const month = months2025[i - 4];
    const duration = Math.floor(Math.random() * 35) + 28;
    const cost = Math.floor(Math.random() * 15000) + 38000;
    const expectedSavings = Math.floor(Math.random() * 40000) + 65000;
    const actualSavings = Math.floor(expectedSavings * (0.90 + Math.random() * 0.20));
    const roi = Math.round((actualSavings / cost) * 100);

    const completionDate = new Date(month);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - duration);
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `Digital transformation project

Expected Annual Savings: $${Math.round(expectedSavings/1000)}K
Actual Annual Savings: $${Math.round(actualSavings/1000)}K
Implementation Cost: $${Math.round(cost/1000)}K
ROI: ${roi}%
Project Duration: ${duration} days
Start Date: ${startDateStr}`;

    console.log(`\n-- Project ${i+1}: ${project.title}`);
    console.log(`UPDATE assessment_projects SET`);
    console.log(`  status = 'completed',`);
    console.log(`  progress_percentage = 100,`);
    console.log(`  actual_completion_date = '${month}',`);
    console.log(`  target_completion_date = '${month}',`);
    console.log(`  estimated_timeline_days = ${duration},`);
    console.log(`  description = '${description.replace(/'/g, "''")}'`);
    console.log(`WHERE id = '${project.id}';`);
  }

  // 12 IN-PROGRESS projects
  console.log('\n-- 12 IN-PROGRESS projects targeting 2026');
  for (let i = 12; i < 24; i++) {
    const project = projects[i];
    const progress = Math.floor(Math.random() * 50) + 30;
    const duration = Math.floor(Math.random() * 42) + 28;
    const targetMonth = Math.floor(Math.random() * 6);
    const targetDay = Math.floor(Math.random() * 20) + 5;
    const targetDate = new Date(2026, targetMonth, targetDay);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const cost = Math.floor(Math.random() * 20000) + 40000;
    const targetSavings = Math.floor(Math.random() * 40000) + 55000;
    const expectedROI = Math.round((targetSavings / cost) * 100);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(duration * (progress/100)));
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `Digital transformation project

Target Annual Savings: $${Math.round(targetSavings/1000)}K
Implementation Cost: $${Math.round(cost/1000)}K
Expected ROI: ${expectedROI}%
Progress: ${progress}%
Start Date: ${startDateStr}
Target Completion: ${targetDateStr}`;

    console.log(`\n-- Project ${i+1}: ${project.title}`);
    console.log(`UPDATE assessment_projects SET`);
    console.log(`  status = 'in_progress',`);
    console.log(`  progress_percentage = ${progress},`);
    console.log(`  target_completion_date = '${targetDateStr}',`);
    console.log(`  estimated_timeline_days = ${duration},`);
    console.log(`  actual_completion_date = NULL,`);
    console.log(`  description = '${description.replace(/'/g, "''")}'`);
    console.log(`WHERE id = '${project.id}';`);
  }

  console.log('\n-- Verify the updates');
  console.log(`SELECT status, COUNT(*) as count FROM assessment_projects WHERE assessment_id = '${assessmentId}' GROUP BY status ORDER BY status;`);

  console.log();
  console.log('='.repeat(80));
  console.log('END OF SQL SCRIPT');
  console.log('='.repeat(80));
}

generateSQLScript().catch(console.error);
