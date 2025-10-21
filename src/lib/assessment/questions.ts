// Digital Transformation Assessment - Question Definitions

export type QuestionType =
  | 'single-select'
  | 'multi-select'
  | 'ranking'
  | 'slider'
  | 'text'
  | 'email'
  | 'textarea';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface TooltipTerm {
  term: string;
  explanation: string;
}

export interface Question {
  key: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required?: boolean;
  placeholder?: string;
  maxSelection?: number; // For ranking questions
  tooltips?: TooltipTerm[]; // Terms that need explanation
}

export interface AssessmentStep {
  id: number;
  title: string;
  subtitle: string;
  questions: Question[];
}

export const assessmentSteps: AssessmentStep[] = [
  // ============================================================================
  // STEP 1: Current Setup & Capabilities
  // ============================================================================
  {
    id: 1,
    title: 'Your Current Setup',
    subtitle: 'Let\'s understand your business context and existing tools',
    questions: [
      {
        key: 'company_size',
        type: 'single-select',
        question: 'How many employees does your company have?',
        required: true,
        options: [
          { value: '<10', label: 'Less than 10' },
          { value: '10-50', label: '10-50 employees' },
          { value: '50-200', label: '50-200 employees' },
          { value: '200-500', label: '200-500 employees' },
          { value: '500+', label: '500+ employees' }
        ]
      },
      {
        key: 'industry',
        type: 'single-select',
        question: 'What industry are you in?',
        required: true,
        options: [
          { value: 'financial_services', label: 'Financial Services' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'retail', label: 'Retail / E-commerce' },
          { value: 'technology', label: 'Technology / Software' },
          { value: 'professional_services', label: 'Professional Services' },
          { value: 'education', label: 'Education' },
          { value: 'nonprofit', label: 'Non-profit' },
          { value: 'government', label: 'Government' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        key: 'user_role',
        type: 'single-select',
        question: 'What is your role?',
        required: true,
        options: [
          { value: 'business_leader', label: 'Business Leader / Executive' },
          { value: 'operations', label: 'Operations / Process Manager' },
          { value: 'it_technical', label: 'IT / Technical Lead' },
          { value: 'consultant', label: 'Consultant / Advisor' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        key: 'technical_capability',
        type: 'single-select',
        question: 'What technical resources do you have?',
        required: true,
        options: [
          { value: 'dedicated_team', label: 'Dedicated development team', description: 'We have in-house developers' },
          { value: '1-2_people', label: '1-2 technical people', description: 'Small IT or technical support' },
          { value: 'willing_to_hire', label: 'No team yet, but willing to hire/contract', description: 'Open to bringing in technical help' },
          { value: 'citizen_only', label: 'Need citizen-friendly solutions', description: 'Business users only, no developers' }
        ],
        tooltips: [
          {
            term: 'citizen-friendly',
            explanation: 'No-code or low-code tools that business users can use without programming skills'
          }
        ]
      },
      {
        key: 'team_comfort_level',
        type: 'multi-select',
        question: 'What describes your team\'s technical comfort level?',
        description: 'Select all that apply',
        options: [
          { value: 'excel_power_users', label: 'Excel power users (formulas, pivots, macros)' },
          { value: 'no_code_learners', label: 'Can learn no-code tools with training' },
          { value: 'some_coding', label: 'Some coding knowledge (SQL, Python, etc.)' },
          { value: 'technical_team', label: 'Technical team ready for advanced platforms' }
        ]
      },
      {
        key: 'existing_microsoft',
        type: 'multi-select',
        question: 'Which Microsoft 365 tools do you currently use?',
        description: 'Select all that apply (skip if you don\'t use Microsoft 365)',
        options: [
          { value: 'excel', label: 'Excel' },
          { value: 'power_bi', label: 'Power BI' },
          { value: 'power_automate', label: 'Power Automate' },
          { value: 'power_apps', label: 'Power Apps' },
          { value: 'sharepoint', label: 'SharePoint' },
          { value: 'teams', label: 'Teams' },
          { value: 'onedrive', label: 'OneDrive' }
        ]
      },
      {
        key: 'existing_google',
        type: 'multi-select',
        question: 'Which Google Workspace tools do you use?',
        description: 'Select all that apply (skip if you don\'t use Google Workspace)',
        options: [
          { value: 'sheets', label: 'Google Sheets' },
          { value: 'docs', label: 'Google Docs' },
          { value: 'drive', label: 'Google Drive' },
          { value: 'forms', label: 'Google Forms' },
          { value: 'apps_script', label: 'Apps Script' }
        ]
      },
      {
        key: 'existing_other_tools',
        type: 'multi-select',
        question: 'What other tools does your company use?',
        description: 'Select all that apply',
        options: [
          { value: 'salesforce', label: 'Salesforce / CRM' },
          { value: 'slack', label: 'Slack' },
          { value: 'quickbooks', label: 'QuickBooks / Accounting' },
          { value: 'project_mgmt', label: 'Project management (Asana, Monday, Jira, etc.)' },
          { value: 'data_viz', label: 'Data visualization (Tableau, Looker, etc.)' },
          { value: 'rpa', label: 'RPA (UiPath, Blue Prism, Automation Anywhere)' },
          { value: 'alteryx', label: 'Alteryx or similar data prep tools' },
          { value: 'cognigy', label: 'Cognigy (AI chatbot platform)' },
          { value: 'outsystems', label: 'OutSystems (low-code application platform)' },
          { value: 'none', label: 'None of these' }
        ]
      },
      {
        key: 'erp_system',
        type: 'single-select',
        question: 'What ERP system do you use (if any)?',
        description: 'Enterprise Resource Planning system',
        required: false,
        options: [
          { value: 'sap', label: 'SAP' },
          { value: 'oracle', label: 'Oracle ERP Cloud / NetSuite' },
          { value: 'microsoft_dynamics', label: 'Microsoft Dynamics 365' },
          { value: 'workday', label: 'Workday' },
          { value: 'infor', label: 'Infor' },
          { value: 'epicor', label: 'Epicor' },
          { value: 'ifs', label: 'IFS' },
          { value: 'sage', label: 'Sage' },
          { value: 'acumatica', label: 'Acumatica' },
          { value: 'custom_erp', label: 'Custom/Legacy ERP system' },
          { value: 'none', label: 'No ERP system' },
          { value: 'other', label: 'Other ERP system' }
        ]
      }
    ]
  },

  // ============================================================================
  // STEP 2: Pain Points & Opportunities
  // ============================================================================
  {
    id: 2,
    title: 'Pain Points & Opportunities',
    subtitle: 'Tell us what\'s slowing your team down',
    questions: [
      {
        key: 'pain_points',
        type: 'multi-select',
        question: 'What challenges is your business facing?',
        description: 'Select all that apply',
        options: [
          { value: 'data_scattered', label: 'Data lives in too many places', description: 'Spreadsheets, emails, people\'s heads' },
          { value: 'manual_tasks', label: 'Too many manual, repetitive tasks', description: 'Data entry, copy-paste, reporting' },
          { value: 'slow_decisions', label: 'Decisions take too long', description: 'Waiting for reports, can\'t find data' },
          { value: 'email_meetings', label: 'Too much time in email/meetings', description: 'Communication overhead' },
          { value: 'collaboration_messy', label: 'Team collaboration is messy', description: 'Version control, tracking changes' },
          { value: 'onboarding_slow', label: 'Onboarding new people takes forever', description: 'Tribal knowledge, no documentation' },
          { value: 'no_kpi_tracking', label: 'Can\'t easily track KPIs', description: 'No visibility into performance' },
          { value: 'cant_find_info', label: 'Hard to find documents/information', description: 'Search doesn\'t work' },
          { value: 'using_workarounds', label: 'Using workarounds constantly', description: 'Systems don\'t do what we need' }
        ]
      },
      {
        key: 'top_frustration',
        type: 'ranking',
        question: 'Rank your top 3 frustrations',
        description: 'Select up to 3 in order of priority - click to select, #1 is your biggest pain point',
        maxSelection: 3,
        options: [
          { value: 'data_scattered', label: 'Data lives in too many places' },
          { value: 'manual_tasks', label: 'Too many manual, repetitive tasks' },
          { value: 'slow_decisions', label: 'Decisions take too long' },
          { value: 'email_meetings', label: 'Too much time in email/meetings' },
          { value: 'collaboration_messy', label: 'Team collaboration is messy' },
          { value: 'onboarding_slow', label: 'Onboarding new people takes forever' },
          { value: 'no_kpi_tracking', label: 'Can\'t easily track KPIs' },
          { value: 'cant_find_info', label: 'Hard to find documents/information' },
          { value: 'using_workarounds', label: 'Using workarounds constantly' }
        ]
      },
      {
        key: 'specific_automation_needs',
        type: 'multi-select',
        question: 'Which processes could benefit from automation?',
        description: 'Select all that apply',
        options: [
          { value: 'invoice_processing', label: 'Invoice/document processing' },
          { value: 'data_entry', label: 'Data entry between systems' },
          { value: 'report_generation', label: 'Report generation' },
          { value: 'email_notifications', label: 'Email notifications and reminders' },
          { value: 'approval_workflows', label: 'Approval workflows' },
          { value: 'data_validation', label: 'Data validation and quality checks' },
          { value: 'customer_onboarding', label: 'Customer onboarding' },
          { value: 'inventory_tracking', label: 'Inventory or asset tracking' }
        ]
      },
      {
        key: 'ai_opportunities',
        type: 'multi-select',
        question: 'Where could AI help your business?',
        description: 'Select all that apply',
        options: [
          { value: 'customer_support', label: 'Customer service/support' },
          { value: 'content_creation', label: 'Content creation (writing, marketing)' },
          { value: 'document_analysis', label: 'Document analysis/extraction' },
          { value: 'predictive_analytics', label: 'Predictive analytics' },
          { value: 'natural_language_search', label: 'Natural language search' },
          { value: 'data_insights', label: 'Automated data insights' },
          { value: 'not_sure', label: 'Not sure yet / exploring' }
        ]
      },
      {
        key: 'data_pain_points_detail',
        type: 'textarea',
        question: 'Data & Reporting Pain Points (Optional)',
        description: 'Tell us more about specific data challenges you face - this helps us provide more targeted recommendations',
        placeholder: 'Example: We spend 10 hours each week manually combining data from 5 different spreadsheets to create our weekly sales report. Data accuracy is a constant concern and we often find discrepancies...',
        required: false
      },
      {
        key: 'automation_pain_points_detail',
        type: 'textarea',
        question: 'Automation & Process Pain Points (Optional)',
        description: 'Describe specific manual processes that are slowing you down',
        placeholder: 'Example: Our invoice approval process involves 6 different people and takes 3-5 days. Documents get lost in email threads and we have no visibility into where things are stuck...',
        required: false
      },
      {
        key: 'ai_pain_points_detail',
        type: 'textarea',
        question: 'AI & Technology Pain Points (Optional)',
        description: 'Share any specific areas where you think AI or advanced technology could help',
        placeholder: 'Example: We receive 100+ customer support emails daily and our team struggles to respond quickly. We also have years of unstructured data in documents that we can\'t easily search or analyze...',
        required: false
      },
      {
        key: 'collaboration_pain_points_detail',
        type: 'textarea',
        question: 'Team Collaboration & Communication Pain Points (Optional)',
        description: 'Tell us about collaboration challenges your team faces',
        placeholder: 'Example: Our remote team uses 4 different tools for communication and project tracking. Important information gets lost and new team members take weeks to get up to speed...',
        required: false
      }
    ]
  },

  // ============================================================================
  // STEP 3: Current Maturity & Readiness
  // ============================================================================
  {
    id: 3,
    title: 'Digital Maturity Assessment',
    subtitle: 'Quick self-assessment of your current state',
    questions: [
      {
        key: 'data_maturity',
        type: 'slider',
        question: 'Data Accessibility & Quality',
        min: 1,
        max: 5,
        minLabel: 'Excel hell, data everywhere',
        maxLabel: 'Real-time dashboards, single source of truth',
        required: true
      },
      {
        key: 'automation_maturity',
        type: 'slider',
        question: 'Process Automation',
        min: 1,
        max: 5,
        minLabel: 'Everything is manual',
        maxLabel: 'Most tasks are automated',
        required: true
      },
      {
        key: 'collaboration_maturity',
        type: 'slider',
        question: 'Team Collaboration',
        min: 1,
        max: 5,
        minLabel: 'Email attachments and confusion',
        maxLabel: 'Real-time shared systems',
        required: true
      },
      {
        key: 'documentation_maturity',
        type: 'slider',
        question: 'Process Documentation',
        min: 1,
        max: 5,
        minLabel: 'Tribal knowledge only',
        maxLabel: 'Clear, documented workflows',
        required: true
      },
      {
        key: 'ux_maturity',
        type: 'slider',
        question: 'User Experience & Design',
        min: 1,
        max: 5,
        minLabel: 'No UX focus, clunky interfaces',
        maxLabel: 'User-centered design, intuitive tools',
        required: true
      },
      {
        key: 'change_readiness',
        type: 'single-select',
        question: 'How receptive is your team to new tools/processes?',
        required: true,
        options: [
          { value: 'eager', label: 'Eager to try new things', description: 'Team is excited about innovation' },
          { value: 'open', label: 'Generally open with proper training', description: 'Willing to learn with support' },
          { value: 'hesitant', label: 'Hesitant, prefer status quo', description: 'Need strong business case' },
          { value: 'resistant', label: 'High resistance to change', description: 'Need careful change management' }
        ]
      },
      {
        key: 'champions_identified',
        type: 'multi-select',
        question: 'Who will champion digital transformation?',
        description: 'Select all that apply',
        options: [
          { value: 'executive', label: 'Executive sponsor identified' },
          { value: 'operations', label: 'Operations/business lead identified' },
          { value: 'it', label: 'IT/technical lead identified' },
          { value: 'none', label: 'No champion yet (need help identifying)' }
        ]
      },
      {
        key: 'training_preference',
        type: 'multi-select',
        question: 'What training approaches work best for your team?',
        description: 'Select all that apply',
        required: true,
        options: [
          { value: 'self_service', label: 'Self-service (documentation, videos)' },
          { value: 'formal_training', label: 'Formal training sessions' },
          { value: 'hands_on', label: 'Hands-on workshops' },
          { value: 'consultants', label: 'External consultants' }
        ]
      }
    ]
  },

  // ============================================================================
  // STEP 4: UX & Design Strategy
  // ============================================================================
  {
    id: 4,
    title: 'User Experience & Design',
    subtitle: 'Let\'s assess your UX maturity and design capabilities',
    questions: [
      {
        key: 'current_design_approach',
        type: 'single-select',
        question: 'How does your organization currently approach UX design?',
        required: true,
        options: [
          { value: 'no_ux_process', label: 'No formal UX process', description: 'Design happens ad-hoc or not at all' },
          { value: 'developer_driven', label: 'Developer-driven design', description: 'Developers make design decisions' },
          { value: 'stakeholder_feedback', label: 'Based on stakeholder feedback', description: 'Design by committee' },
          { value: 'basic_ux', label: 'Basic UX principles applied', description: 'Some consideration for user needs' },
          { value: 'dedicated_designer', label: 'Have dedicated UX/UI designer(s)', description: 'Professional design resources' },
          { value: 'ux_research_team', label: 'UX research & design team', description: 'Formal UX practice with research' }
        ]
      },
      {
        key: 'user_research_frequency',
        type: 'single-select',
        question: 'How often do you conduct user research?',
        description: 'User interviews, surveys, usability testing, etc.',
        required: true,
        options: [
          { value: 'never', label: 'Never / Rarely' },
          { value: 'once_year', label: 'Once or twice a year' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'ongoing', label: 'Ongoing / Continuous research' }
        ]
      },
      {
        key: 'design_tools',
        type: 'multi-select',
        question: 'What design tools does your team use?',
        description: 'Select all that apply',
        options: [
          { value: 'figma', label: 'Figma' },
          { value: 'sketch', label: 'Sketch' },
          { value: 'adobe_xd', label: 'Adobe XD' },
          { value: 'canva', label: 'Canva' },
          { value: 'powerpoint', label: 'PowerPoint / Google Slides' },
          { value: 'miro', label: 'Miro / FigJam / Whiteboarding tools' },
          { value: 'none', label: 'No design tools' }
        ]
      },
      {
        key: 'design_system',
        type: 'single-select',
        question: 'Do you have a design system or component library?',
        required: true,
        options: [
          { value: 'no_system', label: 'No, we don\'t have one' },
          { value: 'informal', label: 'Informal guidelines', description: 'Inconsistent patterns across products' },
          { value: 'basic_brand', label: 'Basic brand guidelines', description: 'Colors, logos, fonts' },
          { value: 'developing', label: 'Currently developing one' },
          { value: 'established', label: 'Established design system', description: 'Documented components and patterns' },
          { value: 'mature', label: 'Mature system with governance', description: 'Living system with regular updates' }
        ],
        tooltips: [
          {
            term: 'design system',
            explanation: 'A collection of reusable UI components, patterns, and guidelines that ensure consistency across all digital products'
          }
        ]
      },
      {
        key: 'mobile_strategy',
        type: 'single-select',
        question: 'What is your mobile strategy?',
        required: true,
        options: [
          { value: 'no_mobile', label: 'No mobile presence' },
          { value: 'mobile_web_only', label: 'Mobile-responsive website only' },
          { value: 'web_app', label: 'Progressive web app (PWA)' },
          { value: 'native_app', label: 'Native mobile apps (iOS/Android)' },
          { value: 'hybrid_app', label: 'Hybrid mobile app (React Native, Flutter)' },
          { value: 'not_needed', label: 'Not needed for our business' }
        ],
        tooltips: [
          {
            term: 'Progressive web app',
            explanation: 'A website that behaves like a native app, works offline, and can be installed on mobile devices'
          }
        ]
      },
      {
        key: 'accessibility_maturity',
        type: 'single-select',
        question: 'How do you handle digital accessibility (WCAG compliance)?',
        required: true,
        options: [
          { value: 'not_considered', label: 'Not currently considered' },
          { value: 'aware_not_implemented', label: 'Aware but not implemented' },
          { value: 'basic_compliance', label: 'Basic compliance efforts', description: 'Some WCAG A level compliance' },
          { value: 'wcag_aa', label: 'WCAG AA compliant', description: 'Meet standard accessibility requirements' },
          { value: 'wcag_aaa', label: 'WCAG AAA compliant', description: 'Enhanced accessibility' },
          { value: 'accessibility_first', label: 'Accessibility-first approach', description: 'Built into design process' }
        ],
        tooltips: [
          {
            term: 'WCAG',
            explanation: 'Web Content Accessibility Guidelines - international standards for making digital content accessible to people with disabilities'
          }
        ]
      },
      {
        key: 'ux_metrics',
        type: 'multi-select',
        question: 'What UX metrics do you track?',
        description: 'Select all that apply',
        options: [
          { value: 'none', label: 'We don\'t track UX metrics' },
          { value: 'google_analytics', label: 'Google Analytics / Web analytics' },
          { value: 'heatmaps', label: 'Heatmaps / Session recordings' },
          { value: 'nps', label: 'Net Promoter Score (NPS)' },
          { value: 'csat', label: 'Customer Satisfaction Score (CSAT)' },
          { value: 'task_completion', label: 'Task completion rates' },
          { value: 'time_on_task', label: 'Time on task' },
          { value: 'error_rates', label: 'Error rates / Failed interactions' },
          { value: 'sus', label: 'System Usability Scale (SUS)' }
        ]
      },
      {
        key: 'ux_challenges',
        type: 'multi-select',
        question: 'What UX challenges does your organization face?',
        description: 'Select all that apply',
        options: [
          { value: 'inconsistent_ui', label: 'Inconsistent UI across products' },
          { value: 'poor_feedback', label: 'User complaints about usability' },
          { value: 'low_adoption', label: 'Low adoption of new features' },
          { value: 'high_support', label: 'High support ticket volume for "how to" questions' },
          { value: 'slow_design', label: 'Slow design process / bottleneck' },
          { value: 'design_dev_disconnect', label: 'Disconnect between design and development' },
          { value: 'no_mobile_optimized', label: 'Not optimized for mobile' },
          { value: 'accessibility_issues', label: 'Accessibility issues' },
          { value: 'legacy_ui', label: 'Outdated/legacy UI that needs modernization' }
        ]
      },
      {
        key: 'ux_priorities',
        type: 'ranking',
        question: 'Rank your top 3 UX priorities',
        description: 'Select up to 3 in order of priority',
        maxSelection: 3,
        options: [
          { value: 'improve_existing', label: 'Improve existing product UX' },
          { value: 'design_system', label: 'Build design system' },
          { value: 'user_research', label: 'Establish user research practice' },
          { value: 'accessibility', label: 'Improve accessibility' },
          { value: 'mobile_experience', label: 'Better mobile experience' },
          { value: 'faster_design', label: 'Speed up design process' },
          { value: 'hire_designers', label: 'Hire/grow design team' },
          { value: 'design_ops', label: 'Improve design operations' }
        ]
      },
      {
        key: 'ux_detail',
        type: 'textarea',
        question: 'UX & Design Pain Points (Optional)',
        description: 'Share any specific UX challenges or opportunities',
        placeholder: 'Example: Our internal tools have inconsistent interfaces and our team struggles to learn new systems. We\'ve also received feedback that our customer portal is difficult to navigate on mobile devices...',
        required: false
      }
    ]
  },

  // ============================================================================
  // STEP 5: Goals & Constraints
  // ============================================================================
  {
    id: 5,
    title: 'Goals & Constraints',
    subtitle: 'Help us understand your transformation priorities and timeline',
    questions: [
      {
        key: 'primary_goal',
        type: 'ranking',
        question: 'Rank your top 3 transformation goals',
        description: 'Select up to 3 in order of priority',
        maxSelection: 3,
        options: [
          { value: 'save_time', label: 'Save time on manual tasks' },
          { value: 'improve_decisions', label: 'Make faster, better decisions' },
          { value: 'scale_operations', label: 'Scale operations without hiring more people' },
          { value: 'enhance_customer', label: 'Enhance customer experience' },
          { value: 'reduce_errors', label: 'Reduce errors and rework' },
          { value: 'unlock_insights', label: 'Unlock insights from data' },
          { value: 'modernize_tech', label: 'Modernize technology stack' },
          { value: 'competitive_advantage', label: 'Gain competitive advantage' }
        ]
      },
      {
        key: 'biggest_constraint',
        type: 'ranking',
        question: 'What are your biggest constraints?',
        description: 'Rank your top 3 constraints',
        maxSelection: 3,
        options: [
          { value: 'budget', label: 'Limited budget' },
          { value: 'time', label: 'Limited time / too busy' },
          { value: 'technical_skills', label: 'Lack of technical skills' },
          { value: 'resistance', label: 'Resistance to change' },
          { value: 'unclear_where_start', label: 'Unclear where to start' },
          { value: 'legacy_systems', label: 'Legacy systems / technical debt' },
          { value: 'data_quality', label: 'Poor data quality' },
          { value: 'leadership_buy_in', label: 'Lack of leadership buy-in' }
        ]
      },
      {
        key: 'timeline',
        type: 'single-select',
        question: 'What is your transformation timeline?',
        required: true,
        options: [
          { value: '30_days', label: 'ASAP (within 30 days)', description: 'Urgent need for improvement' },
          { value: '90_days', label: 'This quarter (90 days)', description: 'Reasonable timeline' },
          { value: '1_year', label: 'This year', description: 'Long-term planning' },
          { value: 'exploring', label: 'No rush, just exploring', description: 'Research phase' }
        ]
      },
      {
        key: 'transformation_approach',
        type: 'single-select',
        question: 'What approach do you prefer?',
        required: true,
        options: [
          { value: 'citizen_focus', label: 'Empower business users', description: 'Citizen development focus' },
          { value: 'hybrid', label: 'Balanced approach', description: 'Citizen development + IT collaboration' },
          { value: 'technical_excellence', label: 'Technical excellence', description: 'Proper development, scalable' },
          { value: 'show_options', label: 'Not sure, show me options', description: 'Open to recommendations' }
        ],
        tooltips: [
          {
            term: 'Citizen development',
            explanation: 'Empowering non-technical business users to create applications and automate processes using no-code/low-code platforms, without relying on IT developers'
          }
        ]
      }
    ]
  },

  // ============================================================================
  // STEP 6: Contact Information (Optional)
  // ============================================================================
  {
    id: 6,
    title: 'Get Your Results',
    subtitle: 'Optional: receive your personalized roadmap via email',
    questions: [
      {
        key: 'contact_name',
        type: 'text',
        question: 'Your name',
        placeholder: 'John Doe',
        required: false
      },
      {
        key: 'email',
        type: 'email',
        question: 'Email address',
        description: 'We\'ll send your personalized roadmap here',
        placeholder: 'john@company.com',
        required: false
      },
      {
        key: 'company_name',
        type: 'text',
        question: 'Company name',
        placeholder: 'Acme Corp',
        required: false
      },
      {
        key: 'wants_consultation',
        type: 'single-select',
        question: 'Would you like to discuss implementation support?',
        options: [
          { value: 'yes', label: 'Yes, I\'d like to discuss implementation' },
          { value: 'no', label: 'No, just the assessment please' },
          { value: 'maybe', label: 'Maybe later' }
        ]
      }
    ]
  }
];

// Helper function to get a specific question
export function getQuestion(stepId: number, questionKey: string): Question | undefined {
  const step = assessmentSteps.find(s => s.id === stepId);
  return step?.questions.find(q => q.key === questionKey);
}

// Helper function to calculate total questions
export function getTotalQuestions(): number {
  return assessmentSteps.reduce((total, step) => total + step.questions.length, 0);
}
