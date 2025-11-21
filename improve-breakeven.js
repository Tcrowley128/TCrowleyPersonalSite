const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function improveBreakEven() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get current state
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, status, implementation_cost, actual_annual_savings, estimated_annual_savings')
    .eq('assessment_id', assessmentId);

  if (error || !projects) {
    console.error('Error fetching projects:', error);
    return;
  }

  const completed = projects.filter(p => p.status === 'completed');
  const inProgress = projects.filter(p => p.status === 'in_progress');

  // Calculate current totals
  const totalCosts = projects.reduce((sum, p) => sum + (p.implementation_cost || 0), 0);
  const realizedSavings = completed.reduce((sum, p) => sum + (p.actual_annual_savings || 0), 0);

  console.log('Current State:');
  console.log(`Total Costs: $${totalCosts.toLocaleString()}`);
  console.log(`Realized Savings/year: $${realizedSavings.toLocaleString()}`);
  console.log('');

  console.log('Boosting savings to achieve break-even by end of 2026...\n');

  // Increase savings on first 4 high-value completed projects
  const topProjects = completed.slice(0, 4);
  const newTopSavings = [250000, 200000, 175000, 150000]; // Total: $775k

  console.log('--- Top 4 High-Value Projects ---');
  for (let i = 0; i < topProjects.length; i++) {
    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: newTopSavings[i],
        actual_annual_savings: Math.floor(newTopSavings[i] * 0.95),
        roi_percentage: Math.floor((newTopSavings[i] / (topProjects[i].implementation_cost || 40000)) * 100)
      })
      .eq('id', topProjects[i].id);

    console.log(`✓ ${topProjects[i].title}: $${newTopSavings[i].toLocaleString()}/year`);
  }

  // Add good savings to next 8 completed projects
  console.log('\n--- Mid-Tier Projects (8) ---');
  const midProjects = completed.slice(4, 12);
  for (const project of midProjects) {
    const savings = Math.floor(Math.random() * 40000) + 35000; // $35k-$75k
    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: savings,
        actual_annual_savings: Math.floor(savings * 0.92),
        roi_percentage: Math.floor((savings / (project.implementation_cost || 35000)) * 100)
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}: $${savings.toLocaleString()}/year`);
  }

  // Remaining completed projects get smaller savings
  console.log('\n--- Remaining Completed Projects ---');
  const remainingCompleted = completed.slice(12);
  for (const project of remainingCompleted) {
    const savings = Math.floor(Math.random() * 25000) + 15000; // $15k-$40k
    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: savings,
        actual_annual_savings: Math.floor(savings * 0.90),
        roi_percentage: Math.floor((savings / (project.implementation_cost || 30000)) * 100)
      })
      .eq('id', project.id);
  }
  console.log(`Updated ${remainingCompleted.length} projects with $15k-$40k savings`);

  // Boost in-progress project savings (will be realized soon)
  console.log('\n--- In-Progress Projects (Future Savings) ---');
  for (const project of inProgress) {
    const savings = Math.floor(Math.random() * 50000) + 45000; // $45k-$95k
    await supabase
      .from('assessment_projects')
      .update({
        estimated_annual_savings: savings,
        roi_percentage: Math.floor((savings / (project.implementation_cost || 40000)) * 100)
      })
      .eq('id', project.id);
  }
  console.log(`Updated ${inProgress.length} projects with estimated $45k-$95k savings`);

  // Recalculate final numbers
  const { data: updated } = await supabase
    .from('assessment_projects')
    .select('status, implementation_cost, actual_annual_savings, estimated_annual_savings')
    .eq('assessment_id', assessmentId);

  const completedUpdated = updated.filter(p => p.status === 'completed');
  const inProgressUpdated = updated.filter(p => p.status === 'in_progress');

  const finalTotalCosts = updated.reduce((sum, p) => sum + (p.implementation_cost || 0), 0);
  const finalRealizedSavings = completedUpdated.reduce((sum, p) => sum + (p.actual_annual_savings || 0), 0);
  const finalEstimatedSavings = inProgressUpdated.reduce((sum, p) => sum + (p.estimated_annual_savings || 0), 0);
  const finalTotalAnnual = finalRealizedSavings + finalEstimatedSavings;

  const monthsToBreakEven = Math.ceil((finalTotalCosts / finalTotalAnnual) * 12);

  console.log('\n=== Updated Financial Summary ===');
  console.log(`Total Investment: $${finalTotalCosts.toLocaleString()}`);
  console.log(`Realized Annual Savings: $${finalRealizedSavings.toLocaleString()}`);
  console.log(`Estimated Future Annual Savings: $${finalEstimatedSavings.toLocaleString()}`);
  console.log(`Total Projected Annual Savings: $${finalTotalAnnual.toLocaleString()}`);
  console.log('');
  console.log(`Months to Break-Even: ${monthsToBreakEven} months`);

  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven);
  console.log(`Break-Even Date: ${breakEvenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);

  // Show cumulative progression
  console.log('\n=== Cumulative Financial Position ===');

  // Assuming in-progress projects complete over next 3-6 months
  const month1Savings = Math.floor(finalRealizedSavings / 12);
  const month7Savings = Math.floor((finalRealizedSavings / 12) * 7 + (finalEstimatedSavings / 12) * 2);
  const month13Savings = Math.floor((finalRealizedSavings / 12) * 13 + (finalEstimatedSavings / 12) * 8);

  console.log(`End of Dec 2025 (1 month): $${month1Savings.toLocaleString()} saved`);
  console.log(`  Net Position: -$${(finalTotalCosts - month1Savings).toLocaleString()}`);
  console.log('');
  console.log(`Mid 2026 (7 months): $${month7Savings.toLocaleString()} saved`);
  console.log(`  Net Position: -$${(finalTotalCosts - month7Savings).toLocaleString()}`);
  console.log('');
  console.log(`End of Dec 2026 (13 months): $${month13Savings.toLocaleString()} saved`);
  const endOfYearNet = finalTotalCosts - month13Savings;
  console.log(`  Net Position: ${endOfYearNet > 0 ? '-' : '+'}$${Math.abs(endOfYearNet).toLocaleString()}`);

  if (endOfYearNet <= 0) {
    console.log('\n✅ Break-even achieved by end of 2026!');
  } else {
    console.log(`\n⚠️  Still $${endOfYearNet.toLocaleString()} away from break-even by end of 2026`);
    console.log(`   Break-even expected: ${breakEvenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  }
}

improveBreakEven().catch(console.error);
