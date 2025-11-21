const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreSampleData() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get all projects
  const { data: projects, error } = await supabase
    .from('transformation_projects')
    .select('id, title, status')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${projects.length} projects. Updating statuses...`);

  // Update first 15 projects to completed (was 13+)
  const completedProjects = projects.slice(0, 15);
  for (const project of completedProjects) {
    const { error: updateError } = await supabase
      .from('transformation_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ Completed: ${project.title}`);
    }
  }

  // Update next 10 projects to in_progress (was 9)
  const inProgressProjects = projects.slice(15, 25);
  for (const project of inProgressProjects) {
    const progress = Math.floor(Math.random() * 60) + 20; // 20-80%
    const { error: updateError } = await supabase
      .from('transformation_projects')
      .update({
        status: 'in_progress',
        progress_percentage: progress
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ In Progress (${progress}%): ${project.title}`);
    }
  }

  // Leave remaining projects as not_started
  const notStartedProjects = projects.slice(25);
  console.log(`\n✓ Keeping ${notStartedProjects.length} projects as 'not_started'`);

  console.log('\n=== Summary ===');
  console.log(`Completed: 15 projects`);
  console.log(`In Progress: 10 projects`);
  console.log(`Not Started: ${notStartedProjects.length} projects`);
  console.log(`Total: ${projects.length} projects`);
}

restoreSampleData().catch(console.error);
