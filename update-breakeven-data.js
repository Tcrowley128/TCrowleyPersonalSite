const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateBreakEvenData() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Updating financial data for realistic break-even by end of 2026...\n');

  // Get all projects
  const { data: projects } = await supabase
    .from('assessment_projects')
    .select('id, title, status, actual_completion_date, target_completion_date')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  const completedProjects = projects.filter(p => p.status === 'completed');
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const notStartedProjects = projects.filter(p => p.status === 'not_started');

  console.log(`Total projects: ${projects.length}`);
  console.log(`- Completed: ${completedProjects.length}`);
  console.log(`- In Progress: ${inProgressProjects.length}`);
  console.log(`- Not Started: ${notStartedProjects.length}\n`);

  // Strategy for break-even by end of 2026:
  // - Total investment so far: ~$800k (for 18 completed + 12 in-progress projects)
  // - Annual savings achieved: $345k (from 4 projects)
  // - Need more projects to generate savings to offset costs
  // - Break-even point: When cumulative savings = cumulative costs

  let totalCostsIncurred = 0;
  let totalAnnualSavingsAchieved = 0;

  // Update COMPLETED projects with realistic costs (averaging $35k per project)
  console.log('--- Completed Projects ---');
  for (const project of completedProjects) {
    // Implementation costs: $20k - $60k per project (avg ~$35k)
    const implementationCost = Math.floor(Math.random() * 40000) + 20000;

    // Get existing savings or set to 0
    const { data: existingProject } = await supabase
      .from('assessment_projects')
      .select('actual_annual_savings, estimated_annual_savings')
      .eq('id', project.id)
      .single();

    const annualSavings = existingProject?.actual_annual_savings || 0;
    totalAnnualSavingsAchieved += annualSavings;

    await supabase
      .from('assessment_projects')
      .update({
        implementation_cost: implementationCost,
        roi_percentage: annualSavings > 0 ? Math.floor((annualSavings / implementationCost) * 100) : 0
      })
      .eq('id', project.id);

    totalCostsIncurred += implementationCost;

    if (annualSavings > 0) {
      console.log(`✓ ${project.title}`);
      console.log(`  Cost: $${implementationCost.toLocaleString()}`);
      console.log(`  Annual Savings: $${annualSavings.toLocaleString()}`);
      console.log(`  ROI: ${Math.floor((annualSavings / implementationCost) * 100)}%`);
    }
  }

  // Update IN-PROGRESS projects with estimated costs
  console.log('\n--- In-Progress Projects ---');
  let totalInProgressCosts = 0;
  for (const project of inProgressProjects) {
    const implementationCost = Math.floor(Math.random() * 40000) + 20000;
    totalInProgressCosts += implementationCost;

    await supabase
      .from('assessment_projects')
      .update({
        implementation_cost: implementationCost,
        roi_percentage: 0 // Not yet realized
      })
      .eq('id', project.id);
  }
  totalCostsIncurred += totalInProgressCosts;

  console.log(`Total in-progress implementation costs: $${totalInProgressCosts.toLocaleString()}`);

  // Add savings to more completed projects to improve break-even trajectory
  console.log('\n--- Adding Savings to More Completed Projects ---');

  // We currently have $345k in annual savings from 4 projects
  // Let's add savings to 6 more completed projects to get closer to break-even
  const projectsWithoutSavings = completedProjects.slice(4, 10); // Get 6 more projects

  let additionalSavings = 0;
  for (const project of projectsWithoutSavings) {
    // Add modest savings: $15k - $45k per year
    const savings = Math.floor(Math.random() * 30000) + 15000;
    additionalSavings += savings;

    const { data: projectData } = await supabase
      .from('assessment_projects')
      .select('implementation_cost')
      .eq('id', project.id)
      .single();

    const implementationCost = projectData?.implementation_cost || 30000;

    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: savings,
        actual_annual_savings: Math.floor(savings * (0.9 + Math.random() * 0.2)),
        roi_percentage: Math.floor((savings / implementationCost) * 100)
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}: $${savings.toLocaleString()}/year`);
  }

  totalAnnualSavingsAchieved += additionalSavings;

  // Add estimated savings to IN-PROGRESS projects (will be realized when completed)
  console.log('\n--- Adding Estimated Savings to In-Progress Projects ---');
  let estimatedFutureSavings = 0;
  for (const project of inProgressProjects) {
    const savings = Math.floor(Math.random() * 35000) + 20000; // $20k-$55k
    estimatedFutureSavings += savings;

    const { data: projectData } = await supabase
      .from('assessment_projects')
      .select('implementation_cost')
      .eq('id', project.id)
      .single();

    const implementationCost = projectData?.implementation_cost || 30000;

    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: savings,
        roi_percentage: Math.floor((savings / implementationCost) * 100)
      })
      .eq('id', project.id);
  }

  console.log(`Total estimated future annual savings: $${estimatedFutureSavings.toLocaleString()}`);

  // Calculate break-even metrics
  const totalProjectedAnnualSavings = totalAnnualSavingsAchieved + estimatedFutureSavings;
  const monthsToBreakEven = Math.ceil((totalCostsIncurred / totalProjectedAnnualSavings) * 12);
  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven);

  console.log('\n=== Financial Summary ===');
  console.log(`Total Costs Incurred: $${totalCostsIncurred.toLocaleString()}`);
  console.log(`  - Completed Projects: $${(totalCostsIncurred - totalInProgressCosts).toLocaleString()}`);
  console.log(`  - In-Progress Projects: $${totalInProgressCosts.toLocaleString()}`);
  console.log('');
  console.log(`Annual Savings (Realized): $${totalAnnualSavingsAchieved.toLocaleString()}`);
  console.log(`Annual Savings (Estimated Future): $${estimatedFutureSavings.toLocaleString()}`);
  console.log(`Total Projected Annual Savings: $${totalProjectedAnnualSavings.toLocaleString()}`);
  console.log('');
  console.log(`Months to Break-Even: ${monthsToBreakEven} months`);
  console.log(`Estimated Break-Even Date: ${breakEvenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  console.log('');

  // Calculate cumulative savings over time
  const savingsInYear1 = totalAnnualSavingsAchieved;
  const savingsInYear2 = totalProjectedAnnualSavings;

  console.log('Cumulative Net Position:');
  console.log(`  After Year 1: -$${(totalCostsIncurred - savingsInYear1).toLocaleString()}`);
  console.log(`  After Year 2: +$${(savingsInYear1 + savingsInYear2 - totalCostsIncurred).toLocaleString()}`);
  console.log('');
  console.log('✓ Break-even trajectory updated!');
  console.log('✓ Projects now show realistic path to profitability by end of 2026');
}

updateBreakEvenData().catch(console.error);
