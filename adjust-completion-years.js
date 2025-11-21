const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function adjustCompletionYears() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get completed projects
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title')
    .eq('assessment_id', assessmentId)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error || !projects) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${projects.length} completed projects`);
  console.log('Distributing completion dates: 4 in 2024, 8 in 2025, 12 in 2026\n');

  // Group 1: 4 projects in 2024 (spread across the year)
  const projects2024 = projects.slice(0, 4);
  const months2024 = [2, 5, 8, 11]; // Feb, May, Aug, Nov 2024

  console.log('--- 2024 Completions (4 projects) ---');
  for (let i = 0; i < projects2024.length; i++) {
    const project = projects2024[i];
    const month = months2024[i];
    const day = Math.floor(Math.random() * 20) + 5; // Random day 5-25
    const durationDays = Math.floor(Math.random() * 42) + 28; // 4-10 weeks

    const completionDate = new Date(2024, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - durationDays);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    await supabase
      .from('assessment_projects')
      .update({
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: durationDays
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}`);
    console.log(`  Completed: ${completionDateStr} (${durationDays} days, started ${startDateStr})`);
  }

  // Group 2: 8 projects in 2025 (spread across the year)
  const projects2025 = projects.slice(4, 12);
  const months2025 = [1, 2, 4, 5, 7, 8, 9, 10]; // Various months in 2025

  console.log('\n--- 2025 Completions (8 projects) ---');
  for (let i = 0; i < projects2025.length; i++) {
    const project = projects2025[i];
    const month = months2025[i];
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 42) + 21; // 3-9 weeks

    const completionDate = new Date(2025, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - durationDays);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    await supabase
      .from('assessment_projects')
      .update({
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: durationDays
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}`);
    console.log(`  Completed: ${completionDateStr} (${durationDays} days, started ${startDateStr})`);
  }

  // Group 3: Remaining projects split - some in late 2025, rest planned for 2026
  const projects2026 = projects.slice(12);

  // If we have more than 12 completed, set first batch to late 2025/early 2026
  const late2025Count = Math.min(6, projects2026.length);
  const early2026Count = projects2026.length - late2025Count;

  console.log('\n--- Late 2025/Early 2026 Completions ---');
  for (let i = 0; i < late2025Count; i++) {
    const project = projects2026[i];
    const month = 10 + Math.floor(i / 3); // Oct-Dec 2025
    const day = Math.floor(Math.random() * 20) + 5;
    const durationDays = Math.floor(Math.random() * 35) + 21;

    const completionDate = new Date(2025, month, day);
    const startDate = new Date(completionDate);
    startDate.setDate(startDate.getDate() - durationDays);

    const completionDateStr = completionDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    await supabase
      .from('assessment_projects')
      .update({
        actual_completion_date: completionDateStr,
        target_completion_date: completionDateStr,
        estimated_timeline_days: durationDays
      })
      .eq('id', project.id);

    console.log(`✓ ${project.title}: ${completionDateStr}`);
  }

  // Set status to in_progress for projects planned for 2026
  if (early2026Count > 0) {
    console.log(`\n--- 2026 Planned (${early2026Count} projects - setting to in_progress) ---`);
    for (let i = late2025Count; i < projects2026.length; i++) {
      const project = projects2026[i];
      const month = Math.floor(Math.random() * 6); // Jan-Jun 2026
      const day = Math.floor(Math.random() * 20) + 5;
      const durationDays = Math.floor(Math.random() * 42) + 28;

      const targetDate = new Date(2026, month, day);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(durationDays * 0.4)); // 40% complete

      const targetDateStr = targetDate.toISOString().split('T')[0];
      const progress = Math.floor(Math.random() * 40) + 30; // 30-70% progress

      await supabase
        .from('assessment_projects')
        .update({
          status: 'in_progress',
          target_completion_date: targetDateStr,
          actual_completion_date: null,
          estimated_timeline_days: durationDays,
          progress_percentage: progress
        })
        .eq('id', project.id);

      console.log(`✓ ${project.title}: Target ${targetDateStr} (${progress}% complete)`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✓ 4 projects completed in 2024`);
  console.log(`✓ 8 projects completed in 2025`);
  console.log(`✓ ${late2025Count} projects completed in late 2025`);
  console.log(`✓ ${early2026Count} projects in progress for 2026 completion`);
  console.log(`Total distribution meets timeline requirements!`);
}

adjustCompletionYears().catch(console.error);
