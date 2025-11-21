const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateRealisticBreakEven() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  console.log('Setting up realistic break-even by mid-2026...\n');
  console.log('Target: Total investment ~$1.2M, break-even in 18 months\n');

  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error || !projects) {
    console.error('Error:', error);
    return;
  }

  // 4 HIGH-IMPACT projects completed in 2024
  // Average $60K cost, $180K annual savings each = Total $720K savings, $240K cost
  const projects2024 = projects.slice(0, 4);
  const config2024 = [
    { month: 3, day: 10, cost: 65000, savings: 195000, duration: 56 },
    { month: 6, day: 24, cost: 58000, savings: 175000, duration: 49 },
    { month: 9, day: 21, cost: 62000, savings: 185000, duration: 63 },
    { month: 11, day: 19, cost: 55000, savings: 165000, duration: 42 }
  ];

  console.log('=== 2024 Completions (4 HIGH-IMPACT projects) ===');
  for (let i = 0; i < projects2024.length; i++) {
    const project = projects2024[i];
    const cfg = config2024[i];
    const actualSavings = Math.floor(cfg.savings * (0.95 + Math.random() * 0.10));
    const roi = Math.round((actualSavings / cfg.cost) * 100);

    const completionDate = new Date(2024, cfg.month, cfg.day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - cfg.duration);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description?.split('\n')[0] || 'High-impact digital transformation initiative'}

Expected Annual Savings: $${Math.round(cfg.savings/1000)}K
Actual Annual Savings: $${Math.round(actualSavings/1000)}K
Implementation Cost: $${Math.round(cfg.cost/1000)}K
ROI: ${roi}%
Project Duration: ${cfg.duration} days
Start Date: ${startDateStr}`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: cfg.duration,
        description
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}`);
    console.log(`  Date: ${completionDateStr}`);
    console.log(`  Savings: $${Math.round(actualSavings/1000)}K/year | Cost: $${Math.round(cfg.cost/1000)}K | ROI: ${roi}%`);
  }

  // 8 MODERATE projects completed in 2025
  // Average $45K cost, $80K annual savings each = Total $640K savings, $360K cost
  const projects2025 = projects.slice(4, 12);
  const months2025 = [1, 2, 4, 5, 6, 8, 9, 10];

  console.log('\n=== 2025 Completions (8 MODERATE projects) ===');
  let total2025Cost = 0;
  let total2025Savings = 0;

  for (let i = 0; i < projects2025.length; i++) {
    const project = projects2025[i];
    const month = months2025[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const duration = Math.floor(Math.random() * 35) + 28; // 4-9 weeks
    const cost = Math.floor(Math.random() * 15000) + 38000; // $38K-$53K
    const expectedSavings = Math.floor(Math.random() * 40000) + 65000; // $65K-$105K
    const actualSavings = Math.floor(expectedSavings * (0.90 + Math.random() * 0.20));
    const roi = Math.round((actualSavings / cost) * 100);

    const completionDate = new Date(2025, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - duration);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description?.split('\n')[0] || 'Digital transformation project'}

Expected Annual Savings: $${Math.round(expectedSavings/1000)}K
Actual Annual Savings: $${Math.round(actualSavings/1000)}K
Implementation Cost: $${Math.round(cost/1000)}K
ROI: ${roi}%
Project Duration: ${duration} days
Start Date: ${startDateStr}`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: duration,
        description
      })
      .eq('id', project.id);

    total2025Cost += cost;
    total2025Savings += actualSavings;

    console.log(`✓ ${project.title}`);
    console.log(`  Date: ${completionDateStr}`);
    console.log(`  Savings: $${Math.round(actualSavings/1000)}K/year | Cost: $${Math.round(cost/1000)}K | ROI: ${roi}%`);
  }

  // 12 IN-PROGRESS projects
  // Average $50K cost, $70K target savings = Total $840K savings, $600K cost
  const projectsInProgress = projects.slice(12, 24);

  console.log('\n=== In-Progress Projects (12 projects - Target 2026) ===');
  let totalInProgressCost = 0;
  let totalInProgressSavings = 0;

  for (const project of projectsInProgress) {
    const progress = Math.floor(Math.random() * 50) + 30; // 30-80%
    const duration = Math.floor(Math.random() * 42) + 28; // 4-10 weeks
    const targetMonth = Math.floor(Math.random() * 6); // Jan-Jun 2026
    const targetDay = Math.floor(Math.random() * 20) + 5;
    const targetDate = new Date(2026, targetMonth, targetDay);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const cost = Math.floor(Math.random() * 20000) + 40000; // $40K-$60K
    const targetSavings = Math.floor(Math.random() * 40000) + 55000; // $55K-$95K
    const expectedROI = Math.round((targetSavings / cost) * 100);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(duration * (progress/100)));
    const startDateStr = startDate.toISOString().split('T')[0];

    const description = `${project.description?.split('\n')[0] || 'Digital transformation project'}

Target Annual Savings: $${Math.round(targetSavings/1000)}K
Implementation Cost: $${Math.round(cost/1000)}K
Expected ROI: ${expectedROI}%
Progress: ${progress}%
Start Date: ${startDateStr}
Target Completion: ${targetDateStr}`;

    await supabase
      .from('assessment_projects')
      .update({
        status: 'in_progress',
        progress_percentage: progress,
        target_completion_date: targetDateStr,
        estimated_timeline_days: duration,
        actual_completion_date: null,
        description
      })
      .eq('id', project.id);

    totalInProgressCost += cost;
    totalInProgressSavings += targetSavings;

    console.log(`✓ ${project.title}`);
    console.log(`  Target: ${targetDateStr} | Progress: ${progress}% | Savings: $${Math.round(targetSavings/1000)}K | Cost: $${Math.round(cost/1000)}K`);
  }

  // Calculate final totals
  const { data: completed } = await supabase
    .from('assessment_projects')
    .select('description')
    .eq('assessment_id', assessmentId)
    .eq('status', 'completed');

  let totalActualSavings = 0;
  let totalCompletedCost = 0;

  for (const p of completed) {
    const savingsMatch = p.description?.match(/Actual Annual Savings: \$(\d+)K/i);
    const costMatch = p.description?.match(/Implementation Cost: \$(\d+)K/i);
    if (savingsMatch) totalActualSavings += parseInt(savingsMatch[1]) * 1000;
    if (costMatch) totalCompletedCost += parseInt(costMatch[1]) * 1000;
  }

  const totalInvestment = totalCompletedCost + totalInProgressCost;
  const totalProjectedSavings = totalActualSavings + totalInProgressSavings;
  const monthsToBreakEven = Math.ceil((totalInvestment / totalProjectedSavings) * 12);

  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven);

  console.log('\n' + '='.repeat(60));
  console.log('FINANCIAL SUMMARY');
  console.log('='.repeat(60));
  console.log('\nINVESTMENT:');
  console.log(`  Completed Projects (12): $${Math.round(totalCompletedCost/1000)}K`);
  console.log(`  In-Progress Projects (12): $${Math.round(totalInProgressCost/1000)}K`);
  console.log(`  TOTAL INVESTMENT: $${Math.round(totalInvestment/1000)}K`);

  console.log('\nANNUAL SAVINGS:');
  console.log(`  Realized (Completed): $${Math.round(totalActualSavings/1000)}K/year`);
  console.log(`  Target (In-Progress): $${Math.round(totalInProgressSavings/1000)}K/year`);
  console.log(`  TOTAL PROJECTED: $${Math.round(totalProjectedSavings/1000)}K/year`);

  console.log('\nBREAK-EVEN ANALYSIS:');
  console.log(`  Months to Break-Even: ${monthsToBreakEven} months`);
  console.log(`  Break-Even Date: ${breakEvenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  console.log(`  Average ROI: ${Math.round((totalProjectedSavings / totalInvestment) * 100)}%`);

  if (monthsToBreakEven <= 18) {
    console.log('\n✅ SUCCESS: Break-even achieved by mid-2026!');
  } else {
    console.log(`\n⚠️  WARNING: Break-even occurs ${monthsToBreakEven - 18} months after mid-2026 target`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✓ All data updated with realistic financials!');
}

updateRealisticBreakEven().catch(console.error);
