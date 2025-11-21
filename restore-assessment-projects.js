const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreAssessmentProjects() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get all projects
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, status, priority')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${projects.length} projects in assessment_projects table`);
  console.log('Current status breakdown:', projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {}));
  console.log('\nUpdating to sample data...\n');

  // Update first 18 projects to completed
  const completedProjects = projects.slice(0, 18);
  for (const project of completedProjects) {
    const daysAgo = Math.floor(Math.random() * 60) + 15; // 15-75 days ago
    const completionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        status: 'completed',
        progress_percentage: 100,
        actual_completion_date: completionDate
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ Completed (${completionDate}): ${project.title}`);
    }
  }

  // Update next 12 projects to in_progress
  const inProgressProjects = projects.slice(18, 30);
  for (const project of inProgressProjects) {
    const progress = Math.floor(Math.random() * 65) + 15; // 15-80%
    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        status: 'in_progress',
        progress_percentage: progress,
        actual_completion_date: null
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ In Progress (${progress}%): ${project.title}`);
    }
  }

  // Leave remaining projects as not_started but ensure they're set correctly
  const notStartedProjects = projects.slice(30);
  for (const project of notStartedProjects) {
    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        status: 'not_started',
        progress_percentage: 0,
        actual_completion_date: null
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    }
  }
  console.log(`\n✓ Set ${notStartedProjects.length} projects to 'not_started'`);

  console.log('\n=== Summary ===');
  console.log(`Completed: 18 projects (100% with completion dates)`);
  console.log(`In Progress: 12 projects (15-80% progress)`);
  console.log(`Not Started: ${notStartedProjects.length} projects`);
  console.log(`Total: ${projects.length} projects`);
}

restoreAssessmentProjects().catch(console.error);
