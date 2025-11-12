require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

async function addMoreProjects() {
  console.log('\n=== Adding More Completed Projects ===\n');

  try {
    // Additional completed projects
    const completedProjects = [
      {
        title: 'Expense Report Automation',
        description: 'OCR and AI-powered expense report processing with policy compliance checks and automated approvals.\n\nBusiness Value: Reduced expense processing time by 80%, improved policy compliance, and eliminated manual data entry.\n\nActual Annual Savings: $175K\nActual ROI: 240%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 75,
        target_completion_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'IT Service Desk Portal',
        description: 'Self-service portal with knowledge base, ticket tracking, and automated routing to reduce IT support burden.\n\nBusiness Value: Decreased ticket resolution time by 40%, improved employee satisfaction, enabled 24/7 self-service.\n\nActual Annual Savings: $220K\nActual ROI: 195%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 100,
        target_completion_date: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ux'
      },
      {
        title: 'Sales Pipeline Analytics',
        description: 'Real-time dashboard for sales metrics, pipeline visibility, and forecasting with CRM integration.\n\nBusiness Value: Improved forecast accuracy by 35%, increased sales team productivity, better pipeline management.\n\nActual Annual Savings: $385K\nActual ROI: 275%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 90,
        target_completion_date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Document Management System',
        description: 'Centralized document repository with version control, search, and collaboration features.\n\nBusiness Value: Reduced time spent searching for documents by 70%, improved collaboration, eliminated lost files.\n\nActual Annual Savings: $290K\nActual ROI: 220%',
        status: 'completed',
        priority: 'medium',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 105,
        target_completion_date: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Email Marketing Platform',
        description: 'Automated email campaigns with segmentation, A/B testing, and performance analytics.\n\nBusiness Value: Increased email engagement by 55%, improved conversion rates, reduced campaign setup time.\n\nActual Annual Savings: $195K\nActual ROI: 210%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 70,
        target_completion_date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 148 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'Time & Attendance System',
        description: 'Digital time tracking with mobile app, geofencing, and payroll integration.\n\nBusiness Value: Eliminated time card fraud, improved payroll accuracy, reduced processing time by 60%.\n\nActual Annual Savings: $165K\nActual ROI: 185%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 80,
        target_completion_date: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 155 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'people'
      },
      {
        title: 'Quality Management System',
        description: 'Digital quality control workflows, non-conformance tracking, and corrective action management.\n\nBusiness Value: Reduced quality incidents by 45%, improved compliance, faster issue resolution.\n\nActual Annual Savings: $340K\nActual ROI: 255%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 115,
        target_completion_date: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 128 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Asset Management System',
        description: 'Track and manage physical assets with QR codes, maintenance schedules, and depreciation tracking.\n\nBusiness Value: Reduced asset loss by 90%, improved maintenance compliance, better capital planning.\n\nActual Annual Savings: $275K\nActual ROI: 230%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 85,
        target_completion_date: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'data'
      },
      {
        title: 'Training Management Portal',
        description: 'Learning management system with course tracking, certifications, and skills matrix.\n\nBusiness Value: Improved training completion rates by 65%, better compliance tracking, identified skill gaps.\n\nActual Annual Savings: $145K\nActual ROI: 170%',
        status: 'completed',
        priority: 'low',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 75,
        target_completion_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 175 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'people'
      },
      {
        title: 'Procurement Portal',
        description: 'Supplier catalog integration, automated PO creation, and spend analytics.\n\nBusiness Value: Reduced maverick spending by 75%, improved contract compliance, better spend visibility.\n\nActual Annual Savings: $425K\nActual ROI: 290%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 120,
        target_completion_date: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 142 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      },
      {
        title: 'Customer Feedback System',
        description: 'Multi-channel feedback collection with sentiment analysis and automated routing.\n\nBusiness Value: Increased response rate by 80%, improved customer satisfaction, actionable insights.\n\nActual Annual Savings: $125K\nActual ROI: 155%',
        status: 'completed',
        priority: 'medium',
        complexity: 'low',
        progress_percentage: 100,
        estimated_timeline_days: 65,
        target_completion_date: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'ux'
      },
      {
        title: 'Maintenance Work Order System',
        description: 'Digital work order management with mobile access, parts tracking, and preventive maintenance scheduling.\n\nBusiness Value: Reduced equipment downtime by 35%, improved maintenance efficiency, better parts inventory.\n\nActual Annual Savings: $310K\nActual ROI: 245%',
        status: 'completed',
        priority: 'high',
        complexity: 'medium',
        progress_percentage: 100,
        estimated_timeline_days: 95,
        target_completion_date: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_completion_date: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'automation'
      }
    ];

    console.log(`Creating ${completedProjects.length} additional completed projects...\n`);

    for (const project of completedProjects) {
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

      console.log(`✓ Created: ${project.title}`);

      // Add PBIs for completed projects
      const pbiCount = 6 + Math.floor(Math.random() * 3); // 6-8 PBIs
      const pbis = generatePBIs(project.title, pbiCount, true);

      for (const pbi of pbis) {
        await supabase.from('product_backlog_items').insert({
          project_id: newProject.id,
          ...pbi,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      console.log(`  ↳ Added ${pbis.length} completed PBIs`);

      // Add 1 closed risk
      const risk = {
        title: `${project.title.split(' ').slice(0, 2).join(' ')}: Integration complexity`,
        description: 'Legacy system integration posed challenges but was successfully resolved',
        category: 'technical',
        likelihood: 'medium',
        impact: 'medium',
        response_strategy: 'mitigate',
        status: 'closed',
        probability: 50,
        response_plan: 'Addressed through additional technical resources and vendor support',
        mitigation_plan: 'Regular architecture reviews and integration testing',
        identified_date: new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000).toISOString()
      };

      await supabase.from('project_risks').insert({
        project_id: newProject.id,
        ...risk,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`  ↳ Added 1 closed risk\n`);
    }

    console.log('\n=== Summary ===');
    console.log(`Added ${completedProjects.length} completed projects`);
    console.log('\n✓ Projects added successfully!');
    console.log(`\nView at: http://localhost:3005/assessment/journey/${assessmentId}`);

  } catch (error) {
    console.error('Error adding projects:', error);
  }

  process.exit(0);
}

function generatePBIs(projectTitle, count, completed) {
  const pbiTemplates = [
    { title: 'Requirements gathering and analysis', type: 'user_story', story_points: 5 },
    { title: 'System architecture design', type: 'user_story', story_points: 8 },
    { title: 'User interface mockups', type: 'user_story', story_points: 3 },
    { title: 'Core functionality implementation', type: 'user_story', story_points: 13 },
    { title: 'Database schema design', type: 'user_story', story_points: 5 },
    { title: 'API endpoints development', type: 'user_story', story_points: 8 },
    { title: 'User acceptance testing', type: 'user_story', story_points: 5 },
    { title: 'Production deployment', type: 'user_story', story_points: 3 },
    { title: 'User training sessions', type: 'user_story', story_points: 3 },
    { title: 'Performance optimization', type: 'user_story', story_points: 5 }
  ];

  return pbiTemplates.slice(0, count).map(template => ({
    title: `${projectTitle.split(' ').slice(0, 2).join(' ')}: ${template.title}`,
    description: `${template.title} for ${projectTitle}`,
    item_type: template.type,
    priority: Math.floor(Math.random() * 3) + 1,
    story_points: template.story_points,
    status: 'done'
  }));
}

addMoreProjects();
