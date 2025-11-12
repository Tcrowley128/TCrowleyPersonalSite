const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateProjectSavings() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Fetching all projects...\n');

  // Get all projects
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error || !projects) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${projects.length} projects`);
  console.log('Setting up: 4 completed in 2024, 8 completed in 2025, 12 in-progress\n');

  // Reset all projects first
  console.log('Resetting all projects to not_started...');
  for (const project of projects) {
    await supabase
      .from('assessment_projects')
      .update({
        status: 'not_started',
        progress_percentage: 0,
        actual_completion_date: null,
        target_completion_date: null
      })
      .eq('id', project.id);
  }

  // 4 projects completed in 2024
  const projects2024 = projects.slice(0, 4);
  const months2024 = [3, 6, 9, 11]; // Apr, Jul, Oct, Dec 2024
  const savings2024 = [100000, 85000, 75000, 85000]; // Total: $345k

  console.log('\n=== 2024 Completions (4 projects - $345K total savings) ===');
  for (let i = 0; i < projects2024.length; i++) {
    const project = projects2024[i];
    const month = months2024[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 42) + 28; // 4-10 weeks
    const savings = savings2024[i];
    const actualSavings = Math.floor(savings * (0.95 + Math.random() * 0.10)); // 95-105% of estimate

    const completionDate = new Date(2024, month, day);
    const completionDateStr = completionDate.toISOString().split('T')[0];

    const description = `${project.description || 'Digital transformation project'}\n\nExpected Annual Savings: $${(savings / 1000).toFixed(0)}K\nActual Annual Savings: $${(actualSavings / 1000).toFixed(0)}K\nImplementation Cost: $${Math.floor(savings * 0.15 / 1000)}K\nROI: ${Math.round((actualSavings / (savings * 0.15)) * 100)}%`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: durationDays,
        description
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}`);
    console.log(`  Completed: ${completionDateStr}`);
    console.log(`  Savings: $${(actualSavings / 1000).toFixed(0)}K/year`);
  }

  // 8 projects completed in 2025
  const projects2025 = projects.slice(4, 12);
  const months2025 = [1, 2, 4, 5, 6, 8, 9, 10]; // Various months 2025

  console.log('\n=== 2025 Completions (8 projects) ===');
  for (let i = 0; i < projects2025.length; i++) {
    const project = projects2025[i];
    const month = months2025[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 42) + 21; // 3-9 weeks
    const savings = Math.floor(Math.random() * 30000) + 20000; // $20K-$50K
    const actualSavings = Math.floor(savings * (0.90 + Math.random() * 0.20)); // 90-110%

    const completionDate = new Date(2025, month, day);
    const completionDateStr = completionDate.toISOString().split('T')[0];

    const description = `${project.description || 'Digital transformation project'}\n\nExpected Annual Savings: $${(savings / 1000).toFixed(0)}K\nActual Annual Savings: $${(actualSavings / 1000).toFixed(0)}K\nImplementation Cost: $${Math.floor(savings * 0.15 / 1000)}K\nROI: ${Math.round((actualSavings / (savings * 0.15)) * 100)}%`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: durationDays,
        description
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}`);
    console.log(`  Completed: ${completionDateStr}`);
    console.log(`  Savings: $${(actualSavings / 1000).toFixed(0)}K/year`);
  }

  // 12 projects in-progress
  const projectsInProgress = projects.slice(12, 24);

  console.log('\n=== In-Progress Projects (12 projects) ===');
  for (const project of projectsInProgress) {
    const progress = Math.floor(Math.random() * 50) + 30; // 30-80%
    const durationDays = Math.floor(Math.random() * 42) + 28; // 4-10 weeks
    const targetMonth = Math.floor(Math.random() * 6); // Jan-Jun 2026
    const targetDay = Math.floor(Math.random() * 20) + 5;
    const targetDate = new Date(2026, targetMonth, targetDay);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const savings = Math.floor(Math.random() * 40000) + 25000; // $25K-$65K

    const description = `${project.description || 'Digital transformation project'}\n\nTarget Annual Savings: $${(savings / 1000).toFixed(0)}K\nImplementation Cost: $${Math.floor(savings * 0.15 / 1000)}K\nExpected ROI: ${Math.round((savings / (savings * 0.15)) * 100)}%\nProgress: ${progress}%`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'in_progress',
        progress_percentage: progress,
        target_completion_date: targetDateStr,
        estimated_timeline_days: durationDays,
        description
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title} (${progress}% complete, target: ${targetDateStr})`);
  }

  // Calculate totals
  const { data: completedProjects } = await supabase
    .from('assessment_projects')
    .select('description')
    .eq('assessment_id', assessmentId)
    .eq('status', 'completed');

  let totalActualSavings = 0;
  for (const project of completedProjects) {
    const match = project.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
    if (match) {
      const value = parseFloat(match[1]);
      const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
      totalActualSavings += value * multiplier;
    }
  }

  const { data: inProgressProjects } = await supabase
    .from('assessment_projects')
    .select('description')
    .eq('assessment_id', assessmentId)
    .eq('status', 'in_progress');

  let totalTargetSavings = 0;
  for (const project of inProgressProjects) {
    const match = project.description?.match(/Target Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
    if (match) {
      const value = parseFloat(match[1]);
      const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
      totalTargetSavings += value * multiplier;
    }
  }

  console.log('\n=== Financial Summary ===');
  console.log(`Completed Projects: 12 (4 in 2024, 8 in 2025)`);
  console.log(`In-Progress Projects: 12`);
  console.log(`Realized Annual Savings: $${(totalActualSavings / 1000).toFixed(0)}K`);
  console.log(`Target Annual Savings (In-Progress): $${(totalTargetSavings / 1000).toFixed(0)}K`);
  console.log(`Total Projected Annual Savings: $${((totalActualSavings + totalTargetSavings) / 1000).toFixed(0)}K`);
  console.log('\n✓ All project savings data populated!');
}

populateProjectSavings().catch(console.error);
