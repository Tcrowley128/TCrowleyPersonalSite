const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addProjectDates() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get all completed projects
  const { data: completedProjects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, actual_completion_date')
    .eq('assessment_id', assessmentId)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${completedProjects.length} completed projects. Adding dates...\n`);

  // We'll work backwards from today to spread projects over the past 4-5 months
  const today = new Date();
  let currentEndDate = new Date(today);
  currentEndDate.setDate(currentEndDate.getDate() - 15); // Start 15 days ago

  for (const project of completedProjects) {
    // Random project duration between 2-8 weeks (14-56 days)
    const durationDays = Math.floor(Math.random() * 42) + 14; // 14-56 days

    // Calculate start date
    const endDate = new Date(currentEndDate);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - durationDays);

    // Format dates as YYYY-MM-DD
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Update the project
    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        target_completion_date: endDateStr,
        actual_completion_date: endDateStr,
        estimated_timeline_days: durationDays,
        // Add a created_at override if needed (optional)
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ ${project.title}`);
      console.log(`  Duration: ${durationDays} days (${Math.floor(durationDays/7)} weeks)`);
      console.log(`  Dates: ${startDateStr} → ${endDateStr}`);
    }

    // Move the end date further back for the next project
    // Add 1-7 days gap between projects
    const gapDays = Math.floor(Math.random() * 7) + 1;
    currentEndDate.setDate(currentEndDate.getDate() - durationDays - gapDays);
  }

  // Now add dates to in-progress projects (started in the past, ending in the future)
  const { data: inProgressProjects } = await supabase
    .from('assessment_projects')
    .select('id, title, progress_percentage')
    .eq('assessment_id', assessmentId)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: true });

  console.log(`\n--- In-Progress Projects (${inProgressProjects.length}) ---\n`);

  for (const project of inProgressProjects) {
    // Total estimated duration: 4-10 weeks (28-70 days)
    const totalDurationDays = Math.floor(Math.random() * 42) + 28;

    // Calculate how many days should be completed based on progress
    const completedDays = Math.floor(totalDurationDays * (project.progress_percentage / 100));

    // Start date is in the past
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - completedDays);

    // End date is in the future
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDurationDays);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        target_completion_date: endDateStr,
        actual_completion_date: null, // Not completed yet
        estimated_timeline_days: totalDurationDays,
      })
      .eq('id', project.id);

    if (!updateError) {
      console.log(`✓ ${project.title} (${project.progress_percentage}% complete)`);
      console.log(`  Duration: ${totalDurationDays} days (${Math.floor(totalDurationDays/7)} weeks)`);
      console.log(`  Dates: ${startDateStr} → ${endDateStr} (${completedDays} days elapsed)`);
    }
  }

  // Not started projects - just give them estimated dates in the future
  const { data: notStartedProjects } = await supabase
    .from('assessment_projects')
    .select('id, title')
    .eq('assessment_id', assessmentId)
    .eq('status', 'not_started')
    .limit(10); // Just update first 10 for now

  console.log(`\n--- Not Started Projects (updating first 10) ---\n`);

  let futureStartDate = new Date();
  futureStartDate.setDate(futureStartDate.getDate() + 7); // Start 1 week from now

  for (const project of notStartedProjects) {
    const durationDays = Math.floor(Math.random() * 42) + 21; // 3-9 weeks

    const startDate = new Date(futureStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await supabase
      .from('assessment_projects')
      .update({
        target_completion_date: endDateStr,
        estimated_timeline_days: durationDays,
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}: ${durationDays} days (starts ${startDateStr})`);

    // Next project starts 1-3 days after this one starts
    futureStartDate.setDate(futureStartDate.getDate() + Math.floor(Math.random() * 3) + 1);
  }

  console.log('\n=== Summary ===');
  console.log(`✓ Added realistic dates to ${completedProjects.length} completed projects`);
  console.log(`✓ Added dates to ${inProgressProjects.length} in-progress projects`);
  console.log(`✓ Added estimated dates to 10 not-started projects`);
  console.log('\nCompleted projects now span the past 4-5 months with realistic timelines.');
  console.log('In-progress projects show partial completion with future end dates.');
}

addProjectDates().catch(console.error);
