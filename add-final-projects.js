require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

async function addFinalProjects() {
  console.log('\n=== Adding Final Projects to Round Out Portfolio ===\n');

  try {
    const projects = [
      {
        title: 'Warehouse Management System',
        description: 'Digital warehouse operations with barcode scanning, picking optimization, and inventory accuracy tracking.\n\nBusiness Value: Expected 25% improvement in picking efficiency, 95%+ inventory accuracy, reduced labor costs.\n\nEstimated Annual Savings: $680K\nProjected ROI: 320%',
        status: 'in_progress',
        priority: 'critical',
        complexity: 'high',
        progress_percentage: 70,
        estimated_timeline_days: 150,
        target_completion_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'Predictive Analytics Platform',
        description: 'Machine learning models for demand forecasting, churn prediction, and resource optimization.\n\nBusiness Value: Improved forecast accuracy by 40%, proactive customer retention, optimized resource allocation.\n\nEstimated Annual Savings: $890K\nProjected ROI: 380%',
        status: 'in_progress',
        priority: 'high',
        complexity: 'high',
        progress_percentage: 35,
        estimated_timeline_days: 180,
        target_completion_date: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ai'
      },
      {
        title: 'Mobile Field Service App',
        description: 'Mobile app for field technicians with offline capability, GPS tracking, and digital signatures.\n\nBusiness Value: Reduce service completion time by 30%, improve first-time fix rate, eliminate paperwork.\n\nEstimated Annual Savings: $475K\nProjected ROI: 265%',
        status: 'in_progress',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 50,
        estimated_timeline_days: 120,
        target_completion_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ux'
      },
      {
        title: 'Energy Management System',
        description: 'Real-time energy monitoring, usage analytics, and automated controls to reduce consumption.\n\nBusiness Value: Expected 20% reduction in energy costs, improved sustainability metrics, demand response capabilities.\n\nEstimated Annual Savings: $540K\nProjected ROI: 310%',
        status: 'not_started',
        priority: 'medium',
        complexity: 'high',
        progress_percentage: 0,
        estimated_timeline_days: 140,
        target_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ai'
      },
      {
        title: 'Compliance & Audit Management',
        description: 'Centralized compliance tracking, audit workflows, and regulatory reporting automation.\n\nBusiness Value: Reduce audit preparation time by 60%, improve compliance tracking, automated reporting.\n\nEstimated Annual Savings: $320K\nProjected ROI: 225%',
        status: 'not_started',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 0,
        estimated_timeline_days: 110,
        target_completion_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Vendor Performance Portal',
        description: 'Supplier scorecards, performance tracking, and automated reporting for vendor management.\n\nBusiness Value: Improve supplier quality by 35%, better contract compliance, data-driven sourcing decisions.\n\nEstimated Annual Savings: $395K\nProjected ROI: 240%',
        status: 'not_started',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 0,
        estimated_timeline_days: 90,
        target_completion_date: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      }
    ];

    console.log(`Creating ${projects.length} additional projects...\n`);

    for (const project of projects) {
      const { data: newProject, error: projectError } = await supabase
        .from('assessment_projects')
        .insert({
          assessment_id: assessmentId,
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (projectError) {
        console.error(`Error creating project "${project.title}":`, projectError);
        continue;
      }

      console.log(`✓ Created: ${project.title} (${project.status}, ${project.progress_percentage}%)`);

      // Add PBIs for in-progress projects
      if (project.status === 'in_progress') {
        const pbiCount = 5;
        const pbis = generatePBIs(project.title, pbiCount, false);

        for (const pbi of pbis) {
          await supabase.from('product_backlog_items').insert({
            project_id: newProject.id,
            ...pbi,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        console.log(`  ↳ Added ${pbis.length} PBIs`);
      }

      // Add risks
      const numRisks = project.status === 'in_progress' ? 2 : 1;
      for (let i = 0; i < numRisks; i++) {
        const risk = {
          title: `${project.title.split(' ').slice(0, 2).join(' ')}: ${i === 0 ? 'Technical complexity' : 'Resource constraints'}`,
          description: i === 0
            ? 'Complex technical requirements may require additional expertise'
            : 'Limited availability of specialized resources could impact timeline',
          category: i === 0 ? 'technical' : 'resource',
          likelihood: 'medium',
          impact: 'medium',
          response_strategy: 'mitigate',
          status: project.status === 'in_progress' ? 'planned' : 'identified',
          probability: 50,
          response_plan: `Monitor and adjust as needed with contingency planning`,
          mitigation_plan: `Regular status reviews and resource allocation adjustments`,
          identified_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        await supabase.from('project_risks').insert({
          project_id: newProject.id,
          ...risk,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      console.log(`  ↳ Added ${numRisks} risk(s)\n`);
    }

    // Get total count
    const { data: allProjects, error } = await supabase
      .from('assessment_projects')
      .select('status, progress_percentage')
      .eq('assessment_id', assessmentId);

    if (allProjects) {
      const completed = allProjects.filter(p => p.status === 'completed').length;
      const inProgress = allProjects.filter(p => p.status === 'in_progress').length;
      const notStarted = allProjects.filter(p => p.status === 'not_started').length;
      const avgProgress = Math.round(allProjects.reduce((sum, p) => sum + p.progress_percentage, 0) / allProjects.length);

      console.log('\n=== Final Portfolio Summary ===');
      console.log(`Total Projects: ${allProjects.length}`);
      console.log(`  • Completed: ${completed} (${Math.round(completed/allProjects.length*100)}%)`);
      console.log(`  • In Progress: ${inProgress} (${Math.round(inProgress/allProjects.length*100)}%)`);
      console.log(`  • Not Started: ${notStarted} (${Math.round(notStarted/allProjects.length*100)}%)`);
      console.log(`\nOverall Progress: ${avgProgress}%`);
    }

    console.log('\n✓ Portfolio complete!');
    console.log(`\nView at: http://localhost:3005/assessment/journey/${assessmentId}`);

  } catch (error) {
    console.error('Error adding projects:', error);
  }

  process.exit(0);
}

function generatePBIs(projectTitle, count, completed) {
  const pbiTemplates = [
    { title: 'Requirements analysis', type: 'user_story', story_points: 5 },
    { title: 'Technical design', type: 'user_story', story_points: 8 },
    { title: 'Core development', type: 'user_story', story_points: 13 },
    { title: 'Integration testing', type: 'user_story', story_points: 5 },
    { title: 'User documentation', type: 'user_story', story_points: 3 }
  ];

  return pbiTemplates.slice(0, count).map(template => ({
    title: `${projectTitle.split(' ').slice(0, 2).join(' ')}: ${template.title}`,
    description: `${template.title} for ${projectTitle}`,
    item_type: template.type,
    priority: Math.floor(Math.random() * 3) + 1,
    story_points: template.story_points,
    status: Math.random() > 0.6 ? 'in_progress' : 'new'
  }));
}

addFinalProjects();
