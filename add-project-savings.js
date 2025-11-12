require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const assessmentId = '9470a83f-4b84-48f7-9b4a-e60fbb676947';

// Add savings data to project descriptions
const projectDescriptions = {
  'Card Payments: Fraud Alert Processing': {
    description: 'Automated fraud detection and alert system using Azure AI to identify suspicious card transactions in real-time.\n\nBusiness Value: Reduced fraud losses by 68%, improved customer trust, faster response times.\n\nExpected Annual Savings: $850K\nActual Annual Savings: $920K\nROI: 340%'
  },
  'Card Payments: Real-time Transaction Analytics': {
    description: 'Real-time analytics dashboard for card transaction monitoring, trend analysis, and performance metrics using Power BI.\n\nBusiness Value: Enhanced decision-making, improved processing efficiency, better fraud detection.\n\nExpected Annual Savings: $420K\nTarget Annual Savings: $420K'
  },
  'Commercial Banking: Automated Loan Pipeline Dashboard': {
    description: 'Automated dashboard providing real-time visibility into commercial loan pipeline, status tracking, and bottleneck identification.\n\nBusiness Value: Improved loan processing speed by 45%, better resource allocation, enhanced client communication.\n\nExpected Annual Savings: $680K\nActual Annual Savings: $715K\nROI: 285%'
  },
  'Commercial Banking: Customer Relationship Intelligence': {
    description: 'AI-powered CRM analytics providing insights into customer behavior, relationship health, and cross-sell opportunities.\n\nBusiness Value: Increased customer retention, improved relationship management, data-driven engagement.\n\nExpected Annual Savings: $540K\nTarget Annual Savings: $540K'
  },
  'Compliance & Risk: Automated Regulatory Reporting': {
    description: 'Automated collection, validation, and submission of regulatory reports using Power Automate and Azure Synapse Analytics.\n\nBusiness Value: Reduced reporting time by 75%, improved accuracy, eliminated manual errors.\n\nExpected Annual Savings: $1.2M\nActual Annual Savings: $1.35M\nROI: 410%'
  },
  'Compliance & Risk: Intelligent Document Review': {
    description: 'AI-powered document review system using Azure AI Document Intelligence for compliance verification and risk assessment.\n\nBusiness Value: Faster review cycles, improved compliance accuracy, reduced legal risk.\n\nExpected Annual Savings: $780K\nTarget Annual Savings: $780K'
  },
  'Digital Payments: Transaction Monitoring Dashboard': {
    description: 'Real-time monitoring and analytics for digital payment transactions with fraud detection and performance tracking.\n\nBusiness Value: Enhanced fraud prevention, improved transaction success rates, better customer experience.\n\nExpected Annual Savings: $560K\nActual Annual Savings: $625K\nROI: 295%'
  },
  'Loans & Lending: Credit Decision Automation': {
    description: 'AI-powered automated credit decision engine using Azure Machine Learning for faster, more accurate lending decisions.\n\nBusiness Value: Reduced decision time by 65%, improved approval accuracy, lower default rates.\n\nExpected Annual Savings: $950K\nTarget Annual Savings: $950K'
  },
  'Loans & Lending: Document Collection Automation': {
    description: 'Automated document collection and verification system using Power Automate and AI Document Intelligence.\n\nBusiness Value: Eliminated manual document handling, faster loan processing, improved customer satisfaction.\n\nExpected Annual Savings: $490K\nActual Annual Savings: $535K\nROI: 265%'
  },
  'Mortgage: Application Status Tracking': {
    description: 'Self-service portal for mortgage applicants to track application status, submit documents, and communicate with loan officers.\n\nBusiness Value: Reduced customer service calls by 60%, improved applicant experience, faster processing.\n\nExpected Annual Savings: $320K\nActual Annual Savings: $345K\nROI: 215%'
  },
  'Implement Azure AI Document Intelligence': {
    description: 'Enterprise deployment of Azure AI Document Intelligence for automated document processing across all banking operations.\n\nBusiness Value: Foundation for automation initiatives, improved data extraction accuracy, reduced manual processing.\n\nExpected Annual Savings: $1.8M\nActual Annual Savings: $1.95M\nROI: 380%'
  },
  'Implement Azure Machine Learning': {
    description: 'Deployment of Azure Machine Learning platform for credit risk modeling, fraud detection, and predictive analytics.\n\nBusiness Value: Advanced analytics capabilities, improved risk management, data-driven decision making.\n\nExpected Annual Savings: $1.5M\nTarget Annual Savings: $1.5M'
  },
  'Implement Azure OpenAI Service': {
    description: 'Integration of Azure OpenAI for intelligent customer service, document summarization, and insights generation.\n\nBusiness Value: Enhanced customer service, automated content generation, improved operational efficiency.\n\nExpected Annual Savings: $890K\nTarget Annual Savings: $890K'
  },
  'Implement Azure Synapse Analytics': {
    description: 'Enterprise data warehouse and analytics platform for unified data access and business intelligence.\n\nBusiness Value: Single source of truth, improved reporting speed, better data governance.\n\nExpected Annual Savings: $720K\nActual Annual Savings: $785K\nROI: 305%'
  },
  'Implement Microsoft Dynamics 365 Customer Service': {
    description: 'Modern customer service platform with omnichannel support, case management, and knowledge base integration.\n\nBusiness Value: Improved customer satisfaction, reduced response times, better case resolution.\n\nExpected Annual Savings: $640K\nTarget Annual Savings: $640K'
  },
  'Implement Microsoft Dynamics 365 Finance': {
    description: 'Comprehensive financial management system for accounting, financial reporting, and budgeting.\n\nBusiness Value: Streamlined financial operations, improved reporting, better financial controls.\n\nExpected Annual Savings: $850K\nTarget Annual Savings: $850K'
  },
  'Implement Microsoft Forms': {
    description: 'Digital forms platform for customer surveys, internal processes, and data collection.\n\nBusiness Value: Eliminated paper forms, improved data quality, faster processing.\n\nExpected Annual Savings: $85K\nActual Annual Savings: $92K\nROI: 180%'
  },
  'Implement Microsoft Lists': {
    description: 'Collaborative list management for tracking initiatives, tasks, and operational data.\n\nBusiness Value: Improved collaboration, better tracking, reduced email overhead.\n\nExpected Annual Savings: $65K\nActual Annual Savings: $71K\nROI: 165%'
  },
  'Implement Microsoft Power Apps': {
    description: 'Low-code platform for building custom business applications across all departments.\n\nBusiness Value: Rapid application development, reduced IT backlog, empowered business users.\n\nExpected Annual Savings: $980K\nActual Annual Savings: $1.1M\nROI: 425%'
  },
  'Implement Microsoft Power Automate': {
    description: 'Workflow automation platform for business process automation across all operations.\n\nBusiness Value: Automated repetitive tasks, improved efficiency, reduced errors.\n\nExpected Annual Savings: $1.4M\nActual Annual Savings: $1.6M\nROI: 485%'
  },
  'Implement Microsoft Power BI': {
    description: 'Enterprise business intelligence and data visualization platform for all departments.\n\nBusiness Value: Self-service analytics, improved decision making, reduced reporting time.\n\nExpected Annual Savings: $520K\nActual Annual Savings: $580K\nROI: 275%'
  },
  'Implement Microsoft Sentinel': {
    description: 'Cloud-native SIEM and security operations platform for threat detection and response.\n\nBusiness Value: Enhanced security posture, faster threat detection, reduced security incidents.\n\nExpected Annual Savings: $750K\nTarget Annual Savings: $750K'
  },
  'Implement Power Virtual Agents': {
    description: 'AI-powered chatbot platform for customer service and internal support automation.\n\nBusiness Value: 24/7 customer support, reduced call volume, improved response times.\n\nExpected Annual Savings: $420K\nTarget Annual Savings: $420K'
  }
};

async function addProjectSavings() {
  console.log('\n=== Adding Savings Data to Projects ===\n');

  try {
    const { data: projects } = await supabase
      .from('assessment_projects')
      .select('id, title')
      .eq('assessment_id', assessmentId);

    if (!projects) {
      console.error('No projects found');
      return;
    }

    let updatedCount = 0;

    for (const project of projects) {
      const descData = projectDescriptions[project.title];

      if (descData) {
        const { error } = await supabase
          .from('assessment_projects')
          .update({
            description: descData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);

        if (error) {
          console.error(`Error updating ${project.title}:`, error);
        } else {
          console.log(`✓ Updated: ${project.title}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated ${updatedCount} of ${projects.length} projects with savings data`);

    // Calculate totals
    const { data: allProjects } = await supabase
      .from('assessment_projects')
      .select('description, status')
      .eq('assessment_id', assessmentId);

    let totalExpected = 0;
    let totalActual = 0;
    let totalTarget = 0;

    allProjects?.forEach(p => {
      const expMatch = p.description?.match(/Expected Annual Savings: \$(\d+(?:\.\d+)?)[KM]/);
      if (expMatch) {
        const value = parseFloat(expMatch[1]);
        const mult = expMatch[0].includes('M') ? 1000000 : 1000;
        totalExpected += value * mult;
      }

      const actMatch = p.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/);
      if (actMatch) {
        const value = parseFloat(actMatch[1]);
        const mult = actMatch[0].includes('M') ? 1000000 : 1000;
        totalActual += value * mult;
      }

      const targMatch = p.description?.match(/Target Annual Savings: \$(\d+(?:\.\d+)?)[KM]/);
      if (targMatch) {
        const value = parseFloat(targMatch[1]);
        const mult = targMatch[0].includes('M') ? 1000000 : 1000;
        totalTarget += value * mult;
      }
    });

    console.log('\n=== Financial Summary ===');
    console.log(`Total Expected Savings: $${(totalExpected / 1000000).toFixed(2)}M`);
    console.log(`Total Realized Savings: $${(totalActual / 1000000).toFixed(2)}M`);
    console.log(`Total Target Savings: $${(totalTarget / 1000000).toFixed(2)}M`);
    console.log(`Overall Target: $${((totalExpected) / 1000000).toFixed(2)}M`);

    console.log(`\n✓ Savings data added successfully!`);

  } catch (error) {
    console.error('Error:', error);
  }
}

addProjectSavings().then(() => process.exit(0));
