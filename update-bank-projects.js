require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

// Map project titles to their operational areas and update their progress/status
const projectUpdates = {
  // Card Payments projects
  'Card Payments: Fraud Alert Processing': {
    operational_area: 'Card Payments',
    status: 'completed',
    progress_percentage: 100,
    priority: 'critical',
    complexity: 'high'
  },
  'Card Payments: Real-time Transaction Analytics': {
    operational_area: 'Card Payments',
    status: 'in_progress',
    progress_percentage: 75,
    priority: 'high',
    complexity: 'medium'
  },

  // Commercial Banking projects
  'Commercial Banking: Automated Loan Pipeline Dashboard': {
    operational_area: 'Commercial Banking',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },
  'Commercial Banking: Customer Relationship Intelligence': {
    operational_area: 'Commercial Banking',
    status: 'in_progress',
    progress_percentage: 60,
    priority: 'high',
    complexity: 'high'
  },

  // Compliance & Risk projects
  'Compliance & Risk: Automated Regulatory Reporting': {
    operational_area: 'Compliance & Risk',
    status: 'completed',
    progress_percentage: 100,
    priority: 'critical',
    complexity: 'high'
  },
  'Compliance & Risk: Intelligent Document Review': {
    operational_area: 'Compliance & Risk',
    status: 'in_progress',
    progress_percentage: 45,
    priority: 'high',
    complexity: 'high'
  },

  // Digital Payments projects
  'Digital Payments: Transaction Monitoring Dashboard': {
    operational_area: 'Digital Payments',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },

  // Loans & Lending projects
  'Loans & Lending: Credit Decision Automation': {
    operational_area: 'Loans & Lending',
    status: 'in_progress',
    progress_percentage: 55,
    priority: 'critical',
    complexity: 'high'
  },
  'Loans & Lending: Document Collection Automation': {
    operational_area: 'Loans & Lending',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },

  // Mortgage projects
  'Mortgage: Application Status Tracking': {
    operational_area: 'Mortgage',
    status: 'completed',
    progress_percentage: 100,
    priority: 'medium',
    complexity: 'low'
  },

  // Technology Platform projects
  'Implement Azure AI Document Intelligence': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'high'
  },
  'Implement Azure Machine Learning': {
    operational_area: 'Technology Platform',
    status: 'in_progress',
    progress_percentage: 70,
    priority: 'high',
    complexity: 'high'
  },
  'Implement Azure OpenAI Service': {
    operational_area: 'Technology Platform',
    status: 'in_progress',
    progress_percentage: 40,
    priority: 'critical',
    complexity: 'high'
  },
  'Implement Azure Synapse Analytics': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'high'
  },
  'Implement Microsoft Dynamics 365 Customer Service': {
    operational_area: 'Technology Platform',
    status: 'in_progress',
    progress_percentage: 65,
    priority: 'medium',
    complexity: 'medium'
  },
  'Implement Microsoft Dynamics 365 Finance': {
    operational_area: 'Technology Platform',
    status: 'not_started',
    progress_percentage: 0,
    priority: 'high',
    complexity: 'high'
  },
  'Implement Microsoft Forms': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'low',
    complexity: 'low'
  },
  'Implement Microsoft Lists': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'low',
    complexity: 'low'
  },
  'Implement Microsoft Power Apps': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },
  'Implement Microsoft Power Automate': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },
  'Implement Microsoft Power BI': {
    operational_area: 'Technology Platform',
    status: 'completed',
    progress_percentage: 100,
    priority: 'high',
    complexity: 'medium'
  },
  'Implement Microsoft Sentinel': {
    operational_area: 'Technology Platform',
    status: 'in_progress',
    progress_percentage: 50,
    priority: 'critical',
    complexity: 'high'
  },
  'Implement Power Virtual Agents': {
    operational_area: 'Technology Platform',
    status: 'not_started',
    progress_percentage: 0,
    priority: 'medium',
    complexity: 'medium'
  }
};

async function updateProjects() {
  console.log('\n=== Updating 4th Source Bank Projects ===\n');

  try {
    // Get all projects
    const { data: projects } = await supabase
      .from('assessment_projects')
      .select('id, title')
      .eq('assessment_id', assessmentId);

    if (!projects) {
      console.error('No projects found');
      return;
    }

    console.log(`Found ${projects.length} projects to update\n`);

    let updatedCount = 0;

    for (const project of projects) {
      const updates = projectUpdates[project.title];

      if (updates) {
        const { error } = await supabase
          .from('assessment_projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);

        if (error) {
          console.error(`Error updating ${project.title}:`, error);
        } else {
          console.log(`✓ Updated: ${project.title}`);
          console.log(`  → ${updates.operational_area} | ${updates.status} (${updates.progress_percentage}%)`);
          updatedCount++;
        }
      } else {
        console.log(`⚠ No update config for: ${project.title}`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated ${updatedCount} of ${projects.length} projects`);

    // Show breakdown by operational area
    const { data: updated } = await supabase
      .from('assessment_projects')
      .select('operational_area, status')
      .eq('assessment_id', assessmentId);

    if (updated) {
      const areaBreakdown = {};
      const statusBreakdown = { completed: 0, in_progress: 0, not_started: 0 };

      updated.forEach(p => {
        if (p.operational_area) {
          areaBreakdown[p.operational_area] = (areaBreakdown[p.operational_area] || 0) + 1;
        }
        statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1;
      });

      console.log('\n=== Projects by Operational Area ===');
      Object.entries(areaBreakdown).sort().forEach(([area, count]) => {
        console.log(`  ${area}: ${count} projects`);
      });

      console.log('\n=== Projects by Status ===');
      console.log(`  Completed: ${statusBreakdown.completed}`);
      console.log(`  In Progress: ${statusBreakdown.in_progress}`);
      console.log(`  Not Started: ${statusBreakdown.not_started}`);

      const avgProgress = Math.round(updated.reduce((sum, p) => sum + p.progress_percentage, 0) / updated.length);
      console.log(`\n=== Overall Progress ===`);
      console.log(`  Average: ${avgProgress}%`);
    }

    console.log(`\n✓ All projects updated for 4th Source Bank!`);
    console.log(`\nView at: http://localhost:3005/assessment/journey/${assessmentId}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

updateProjects().then(() => process.exit(0));
