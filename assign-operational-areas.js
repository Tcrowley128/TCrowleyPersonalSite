const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function assignOperationalAreas() {
  const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

  // Get all projects
  const { data: projects, error } = await supabase
    .from('assessment_projects')
    .select('id, title, operational_area')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error || !projects) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`Found ${projects.length} total projects`);
  const unassigned = projects.filter(p => !p.operational_area || p.operational_area === 'Unassigned');
  console.log(`Projects without operational area: ${unassigned.length}\n`);

  if (unassigned.length === 0) {
    console.log('All projects already have operational areas assigned!');
    return;
  }

  // Operational areas for a bank
  const operationalAreas = [
    'commercial_banking',
    'loans_lending',
    'card_payments',
    'compliance_risk',
    'mortgage'
  ];

  // Distribute unassigned projects across operational areas
  console.log('Assigning operational areas to unassigned projects...\n');

  for (let i = 0; i < unassigned.length; i++) {
    const project = unassigned[i];
    // Cycle through operational areas
    const area = operationalAreas[i % operationalAreas.length];

    const { error: updateError } = await supabase
      .from('assessment_projects')
      .update({
        operational_area: area
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating ${project.title}:`, updateError);
    } else {
      console.log(`✓ ${project.title} → ${area}`);
    }
  }

  // Show final distribution
  console.log('\n=== Final Operational Area Distribution ===');
  for (const area of operationalAreas) {
    const count = projects.filter(p => p.operational_area === area).length +
                  unassigned.filter((_, idx) => operationalAreas[idx % operationalAreas.length] === area).length;
    console.log(`${area}: ${count} projects`);
  }

  console.log('\n✓ All projects now have operational areas assigned!');
}

assignOperationalAreas().catch(console.error);
