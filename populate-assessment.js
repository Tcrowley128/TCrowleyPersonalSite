require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

async function populateAssessment() {
  console.log('\n=== Populating Assessment Journey ===\n');

  try {
    // First, check if assessment exists
    const { data: assessment, error: assessError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessError || !assessment) {
      console.error('Assessment not found:', assessError);
      return;
    }

    console.log('Found assessment:', assessment.name || 'Unnamed Assessment');

    // Define realistic projects for a transformation journey
    const projects = [
      {
        title: 'Accounts Payable Automation',
        description: 'Implement RPA and ML for invoice processing, reducing manual data entry and accelerating payment cycles.\n\nBusiness Value: Reduced AP processing time by 75%, improved vendor relationships, and freed up 3 FTEs for strategic work.\n\nEstimated Annual Savings: $450K\nActual ROI: 285%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 120,
        target_completion_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'Employee Onboarding Portal',
        description: 'Digital platform for new hire documentation, training, and IT provisioning with automated workflows.\n\nBusiness Value: Reduced onboarding time from 5 days to 1 day, improved new hire experience, and eliminated paper processes.\n\nEstimated Annual Savings: $180K\nActual ROI: 180%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 90,
        target_completion_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'people'
      },
      {
        title: 'Supply Chain Visibility Platform',
        description: 'Real-time tracking and analytics for inventory, shipments, and supplier performance across global operations.\n\nBusiness Value: Projected 30% reduction in stockouts, 20% improvement in delivery times, and enhanced supplier collaboration.\n\nEstimated Annual Savings: $1.2M\nProjected ROI: 340%',
        status: 'in_progress',
        priority: 'critical',
        complexity: 'high',
        progress_percentage: 65,
        estimated_timeline_days: 180,
        target_completion_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Customer Self-Service Portal',
        description: 'Web and mobile app for customers to manage orders, track shipments, access invoices, and submit support tickets.\n\nBusiness Value: Expected to reduce support calls by 60%, improve customer satisfaction, and enable 24/7 service access.\n\nEstimated Annual Savings: $650K\nProjected ROI: 245%',
        status: 'in_progress',
        priority: 'high',
        complexity: 'high',
        progress_percentage: 40,
        estimated_timeline_days: 150,
        target_completion_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ux'
      },
      {
        title: 'HR Analytics Dashboard',
        description: 'Unified analytics platform for workforce metrics including turnover, performance, compensation, and DEI initiatives.\n\nBusiness Value: Data-driven insights for retention strategies, compensation planning, and talent acquisition.\n\nEstimated Annual Savings: $280K\nProjected ROI: 165%',
        status: 'in_progress',
        priority: 'medium',
        complexity: 'medium',
        progress_percentage: 55,
        estimated_timeline_days: 120,
        target_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Contract Management System',
        description: 'Centralized repository with automated workflows for contract creation, approval, renewal tracking, and compliance.\n\nBusiness Value: Reduce contract cycle time by 50%, eliminate revenue leakage from missed renewals, ensure compliance.\n\nEstimated Annual Savings: $380K\nProjected ROI: 210%',
        status: 'not_started',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 0,
        estimated_timeline_days: 135,
        target_completion_date: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'Manufacturing IoT Integration',
        description: 'Connect shop floor equipment with real-time monitoring, predictive maintenance, and production optimization.\n\nBusiness Value: Reduce unplanned downtime by 40%, increase OEE by 15%, and extend equipment lifespan.\n\nEstimated Annual Savings: $1.8M\nProjected ROI: 420%',
        status: 'not_started',
        priority: 'critical',
        complexity: 'high',
        progress_percentage: 0,
        estimated_timeline_days: 210,
        target_completion_date: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ai'
      },
      {
        title: 'Marketing Automation Platform',
        description: 'Integrated system for email campaigns, lead nurturing, customer segmentation, and multi-channel marketing.\n\nBusiness Value: Increase marketing qualified leads by 45%, improve conversion rates, and reduce campaign execution time.\n\nEstimated Annual Savings: $420K\nProjected ROI: 230%',
        status: 'not_started',
        priority: 'medium',
        complexity: 'medium',
        progress_percentage: 0,
        estimated_timeline_days: 105,
        target_completion_date: new Date(Date.now() + 195 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      }
    ];

    console.log(`Creating ${projects.length} projects...\n`);

    for (const project of projects) {
      const { data: newProject, error: projectError} = await supabase
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

      console.log(`✓ Created project: ${project.title} (${project.status}, ${project.progress_percentage}% complete)`);

      // Add PBIs for in-progress and completed projects
      if (project.status === 'in_progress' || project.status === 'completed') {
        const pbiCount = project.status === 'completed' ? 8 : 5;
        const pbis = generatePBIs(project.title, pbiCount, project.status === 'completed');

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

      // Add 1-2 risks for each project
      const risks = generateRisks(project.title, project.status);
      for (const risk of risks) {
        await supabase.from('project_risks').insert({
          project_id: newProject.id,
          ...risk,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      console.log(`  ↳ Added ${risks.length} risk(s)\n`);
    }

    // Calculate and display summary
    const completedCount = projects.filter(p => p.status === 'completed').length;
    const inProgressCount = projects.filter(p => p.status === 'in_progress').length;
    const notStartedCount = projects.filter(p => p.status === 'not_started').length;
    const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length);

    console.log('\n=== Summary ===');
    console.log(`Total Projects: ${projects.length}`);
    console.log(`  • Completed: ${completedCount}`);
    console.log(`  • In Progress: ${inProgressCount}`);
    console.log(`  • Not Started: ${notStartedCount}`);
    console.log(`\nOverall Progress: ${avgProgress}%`);
    console.log('\n✓ Assessment journey populated successfully!');
    console.log(`\nView at: http://localhost:3005/assessment/journey/${assessmentId}`);

  } catch (error) {
    console.error('Error populating assessment:', error);
  }

  process.exit(0);
}

function generatePBIs(projectTitle, count, completed) {
  const pbiTemplates = [
    { title: 'User authentication and authorization', type: 'user_story', story_points: 5 },
    { title: 'Dashboard with key metrics', type: 'user_story', story_points: 8 },
    { title: 'Data import/export functionality', type: 'user_story', story_points: 5 },
    { title: 'Mobile responsive design', type: 'user_story', story_points: 5 },
    { title: 'Email notifications', type: 'user_story', story_points: 3 },
    { title: 'Reporting and analytics', type: 'user_story', story_points: 8 },
    { title: 'API integration with existing systems', type: 'user_story', story_points: 13 },
    { title: 'User documentation and training materials', type: 'user_story', story_points: 3 }
  ];

  return pbiTemplates.slice(0, count).map(template => ({
    title: `${projectTitle.split(' ').slice(0, 2).join(' ')}: ${template.title}`,
    description: `Implementation of ${template.title.toLowerCase()} for ${projectTitle}`,
    item_type: template.type,
    priority: Math.floor(Math.random() * 3) + 1,
    story_points: template.story_points,
    status: completed ? 'done' : (Math.random() > 0.5 ? 'in_progress' : 'new')
  }));
}

function generateRisks(projectTitle, projectStatus) {
  const riskTemplates = [
    {
      title: 'Third-party API dependency',
      description: 'Reliance on external vendor API may impact timeline if documentation is incomplete',
      category: 'technical',
      likelihood: 'medium',
      impact: 'medium',
      response_strategy: 'mitigate'
    },
    {
      title: 'Resource availability',
      description: 'Key technical resources may be pulled to support production issues',
      category: 'resource',
      likelihood: 'high',
      impact: 'high',
      response_strategy: 'mitigate'
    },
    {
      title: 'Change management resistance',
      description: 'End users may resist new processes without adequate training',
      category: 'organizational',
      likelihood: 'medium',
      impact: 'medium',
      response_strategy: 'mitigate'
    }
  ];

  const numRisks = projectStatus === 'completed' ? 1 : (projectStatus === 'in_progress' ? 2 : 1);
  const selectedRisks = [];

  for (let i = 0; i < numRisks; i++) {
    const template = riskTemplates[i];
    selectedRisks.push({
      title: `${projectTitle.split(' ').slice(0, 2).join(' ')}: ${template.title}`,
      ...template,
      status: projectStatus === 'completed' ? 'closed' : (projectStatus === 'in_progress' ? 'planned' : 'identified'),
      probability: template.likelihood === 'high' ? 75 : (template.likelihood === 'medium' ? 50 : 25),
      response_plan: `Monitor ${template.title.toLowerCase()} and implement mitigation strategies as needed`,
      mitigation_plan: `Regular checkpoints and contingency planning for ${template.title.toLowerCase()}`,
      identified_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return selectedRisks;
}

populateAssessment();
