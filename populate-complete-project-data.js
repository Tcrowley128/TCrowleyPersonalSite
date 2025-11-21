const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateCompleteProjectData() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Fetching all projects...\n');

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
  console.log('Setting up comprehensive data for break-even by mid-2026...\n');

  // Target: Break-even by mid-2026 (18 months from now)
  // Estimated total costs: ~$1.2M (12 completed + 12 in-progress at ~$50K each)
  // Need: ~$1.2M in realized savings by mid-2026
  // Strategy: 4 projects in 2024 with high savings, 8 in 2025 with moderate savings

  // 4 projects completed in 2024 - HIGH IMPACT
  const projects2024 = projects.slice(0, 4);
  const months2024 = [3, 6, 9, 11]; // Apr, Jul, Oct, Dec 2024
  const savings2024 = [280000, 245000, 225000, 250000]; // Total: $1M/year

  console.log('=== 2024 Completions (4 projects - HIGH IMPACT) ===');
  for (let i = 0; i < projects2024.length; i++) {
    const project = projects2024[i];
    const month = months2024[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 42) + 28;
    const expectedSavings = savings2024[i];
    const actualSavings = Math.floor(expectedSavings * (0.95 + Math.random() * 0.10));
    const implementationCost = Math.floor(expectedSavings * 0.20); // 20% of savings
    const roi = Math.round((actualSavings / implementationCost) * 100);

    const completionDate = new Date(2024, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - durationDays);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description || 'High-impact digital transformation initiative'}\n\nExpected Annual Savings: $${Math.round(expectedSavings/1000)}K\nActual Annual Savings: $${Math.round(actualSavings/1000)}K\nImplementation Cost: $${Math.round(implementationCost/1000)}K\nROI: ${roi}%\nProject Duration: ${durationDays} days\nStart Date: ${startDateStr}`;

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
    console.log(`  Actual Savings: $${Math.round(actualSavings/1000)}K/year`);
    console.log(`  Cost: $${Math.round(implementationCost/1000)}K`);
    console.log(`  ROI: ${roi}%`);
  }

  // 8 projects completed in 2025
  const projects2025 = projects.slice(4, 12);
  const months2025 = [1, 2, 4, 5, 6, 8, 9, 10];

  console.log('\n=== 2025 Completions (8 projects) ===');
  for (let i = 0; i < projects2025.length; i++) {
    const project = projects2025[i];
    const month = months2025[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 42) + 21;
    const expectedSavings = Math.floor(Math.random() * 60000) + 40000; // $40K-$100K
    const actualSavings = Math.floor(expectedSavings * (0.90 + Math.random() * 0.20));
    const implementationCost = Math.floor(expectedSavings * 0.18);
    const roi = Math.round((actualSavings / implementationCost) * 100);

    const completionDate = new Date(2025, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - durationDays);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description || 'Digital transformation project'}\n\nExpected Annual Savings: $${Math.round(expectedSavings/1000)}K\nActual Annual Savings: $${Math.round(actualSavings/1000)}K\nImplementation Cost: $${Math.round(implementationCost/1000)}K\nROI: ${roi}%\nProject Duration: ${durationDays} days\nStart Date: ${startDateStr}`;

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
    console.log(`  Actual Savings: $${Math.round(actualSavings/1000)}K/year`);
  }

  // 12 projects in-progress - will contribute to 2026 break-even
  const projectsInProgress = projects.slice(12, 24);

  console.log('\n=== In-Progress Projects (12 projects) ===');
  for (const project of projectsInProgress) {
    const progress = Math.floor(Math.random() * 50) + 30;
    const durationDays = Math.floor(Math.random() * 42) + 28;
    const targetMonth = Math.floor(Math.random() * 6); // Jan-Jun 2026
    const targetDay = Math.floor(Math.random() * 20) + 5;
    const targetDate = new Date(2026, targetMonth, targetDay);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const expectedSavings = Math.floor(Math.random() * 50000) + 30000; // $30K-$80K
    const implementationCost = Math.floor(expectedSavings * 0.18);
    const expectedROI = Math.round((expectedSavings / implementationCost) * 100);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(durationDays * (progress/100)));
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description || 'Digital transformation project'}\n\nTarget Annual Savings: $${Math.round(expectedSavings/1000)}K\nImplementation Cost: $${Math.round(implementationCost/1000)}K\nExpected ROI: ${expectedROI}%\nProgress: ${progress}%\nStart Date: ${startDateStr}\nTarget Completion: ${targetDateStr}`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'in_progress',
        progress_percentage: progress,
        target_completion_date: targetDateStr,
        estimated_timeline_days: durationDays,
        actual_completion_date: null,
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
  let totalCosts = 0;
  for (const project of completedProjects) {
    const savingsMatch = project.description?.match(/Actual Annual Savings: \$(\d+)K/i);
    const costMatch = project.description?.match(/Implementation Cost: \$(\d+)K/i);
    if (savingsMatch) totalActualSavings += parseInt(savingsMatch[1]) * 1000;
    if (costMatch) totalCosts += parseInt(costMatch[1]) * 1000;
  }

  const { data: inProgressProjects } = await supabase
    .from('assessment_projects')
    .select('description')
    .eq('assessment_id', assessmentId)
    .eq('status', 'in_progress');

  let totalTargetSavings = 0;
  let totalInProgressCosts = 0;
  for (const project of inProgressProjects) {
    const savingsMatch = project.description?.match(/Target Annual Savings: \$(\d+)K/i);
    const costMatch = project.description?.match(/Implementation Cost: \$(\d+)K/i);
    if (savingsMatch) totalTargetSavings += parseInt(savingsMatch[1]) * 1000;
    if (costMatch) totalInProgressCosts += parseInt(costMatch[1]) * 1000;
  }

  const totalInvestment = totalCosts + totalInProgressCosts;
  const totalProjectedAnnualSavings = totalActualSavings + totalTargetSavings;
  const monthsToBreakEven = Math.ceil((totalInvestment / totalProjectedAnnualSavings) * 12);

  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven);

  console.log('\n=== Financial Summary ===');
  console.log(`Completed Projects: 12 (4 in 2024, 8 in 2025)`);
  console.log(`In-Progress Projects: 12`);
  console.log(`\nCompleted Projects Investment: $${Math.round(totalCosts/1000)}K`);
  console.log(`In-Progress Projects Investment: $${Math.round(totalInProgressCosts/1000)}K`);
  console.log(`Total Investment: $${Math.round(totalInvestment/1000)}K`);
  console.log(`\nRealized Annual Savings: $${Math.round(totalActualSavings/1000)}K/year`);
  console.log(`Target Annual Savings (In-Progress): $${Math.round(totalTargetSavings/1000)}K/year`);
  console.log(`Total Projected Annual Savings: $${Math.round(totalProjectedAnnualSavings/1000)}K/year`);
  console.log(`\nMonths to Break-Even: ${monthsToBreakEven} months`);
  console.log(`Break-Even Date: ${breakEvenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);

  if (monthsToBreakEven <= 18) {
    console.log('\n✅ Break-even achieved by mid-2026!');
  } else {
    console.log(`\n⚠️  Break-even will occur ${monthsToBreakEven - 18} months after mid-2026`);
  }

  console.log('\n✓ All project data populated with comprehensive metadata!');
}

populateCompleteProjectData().catch(console.error);
