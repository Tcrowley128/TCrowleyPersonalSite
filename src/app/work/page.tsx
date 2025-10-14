'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Briefcase, Award, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { accomplishments } from '@/data/accomplishments';

const workExperience = [
  {
    id: 1,
    title: "Global Product Owner, Digital Ecosystem",
    company: "Bosch",
    period: "2022 - Present",
    description: "Leading 0-to-1 launch and growth of Digital Ecosystem, GS's smart information hub, from concept to 20,000+ users in two years. Driving product-led growth with focus on user experience and platform analytics.",
    achievements: [
      "Launched Digital Ecosystem from concept to 20,000+ users in 2 years",
      "Secured first non-GS contract (RBHU, 5,000 licenses) within 60 days",
      "Built high-performance agile team across multiple countries",
      "Established OKRs & KPIs for sustainable growth"
    ],
    technologies: ["Product Management", "OKRs", "Analytics", "Agile", "User Experience"]
  },
  {
    id: 2,
    title: "Regional Transition Project Manager & Global PMO",
    company: "Bosch",
    period: "2020 - 2022",
    description: "Enabled delivery of Global TRUST project by leading setup of project framework. Orchestrated digital and shared services transformations across supply chain, logistics, risk management, and accounting operations.",
    achievements: [
      "Launched Bosch's first ServiceNow process in North America",
      "Implemented transparent Power BI reporting and quality gate workflow",
      "Led global project tracking with agile methods using Azure DevOps & M365",
      "Awarded for exceeding TRUST-NA project goals by leading transitions of logistics, risk management, and accounting processes"
    ],
    technologies: ["Power BI", "Azure DevOps", "M365", "ServiceNow", "Agile Methods"]
  },
  {
    id: 3,
    title: "Senior Business Analyst / Digital Change Agent",
    company: "Bosch",
    period: "2017 - 2020",
    description: "Led cross-functional digital transformation in North America as 'digital change agent.' Created scalable solutions using automation, data analytics, and data visualization while coaching teams on digital adoption.",
    achievements: [
      "Created scalable in-person digital labs for transformation",
      "Implemented automation and data analytics solutions",
      "Coached teams on digital adoption and change management",
      "Drove process improvements across multiple business functions"
    ],
    technologies: ["Data Analytics", "Automation", "Data Visualization", "Change Management", "Digital Transformation"]
  },
  {
    id: 4,
    title: "Process Area Lead & PMO Member",
    company: "Bosch",
    period: "2014 - 2017",
    description: "Led accounts payable and receivable process areas, served as PMO member for 1A@B_NA Accounting Project driving enterprise-wide transformation.",
    achievements: [
      "Set up Bosch Costa Rica facility from 0-1",
      "Led AP, AR process areas for accounting transformation",
      "Contributed to major accounting system implementations",
      "Supported global shared services transition"
    ],
    technologies: ["SAP", "Process Optimization", "Accounting Systems", "Project Management", "Change Management"]
  },
  {
    id: 5,
    title: "Logistics Planner and Packaging Specialist",
    company: "Bosch",
    period: "2011 - 2014",
    description: "Managed logistics planning and packaging operations in Charleston, SC manufacturing facility. Led customer portfolio management and SAP system implementations.",
    achievements: [
      "Managed portfolio of automotive customers",
      "Led packaging implementation of SAP system change",
      "Supported warehouse with packaging processes"
    ],
    technologies: ["SAP", "Logistics", "Supply Chain Management", "Packaging Operations", "Customer Management"]
  }
];

export default function WorkPage() {
  const breadcrumbItems = [
    { label: 'Work' }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              My Work
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional experience, projects, and achievements that showcase my journey
            </p>
          </motion.div>

          {/* Work Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Professional Experience</h2>
            </div>

            <div className="space-y-8">
              {workExperience.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white dark:bg-slate-700 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{job.title}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">{job.company}</p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{job.period}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Achievements:</h4>
                    <ul className="space-y-1">
                      {job.achievements.map((achievement, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300 text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 rounded-full mt-2 flex-shrink-0"></span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Projects & Accomplishments Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Projects</h2>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {accomplishments.map((accomplishment, index) => {
                const isLarge = index === 0 || index === 3; // Make first and fourth cards larger
                return (
                  <motion.div
                    key={accomplishment.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className={`
                      ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
                      bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                      border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 overflow-hidden group
                    `}
                  >
                    {/* Refined header with subtle styling */}
                    <div className="bg-gray-50 dark:bg-slate-600 border-b border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {accomplishment.title}
                          </h3>
                        </div>
                        {accomplishment.link && (
                          <a
                            href={accomplishment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>

                      {/* Subtle project indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                          Project #{accomplishment.id}
                        </span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {accomplishment.description}
                      </p>

                      {/* Unified tag styling */}
                      <div className="flex flex-wrap gap-2">
                        {accomplishment.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent hover:border-blue-300 dark:hover:border-blue-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Subtle bottom accent */}
                    <div className="h-0.5 bg-blue-600 dark:bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-16"
          >
            <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-8 md:p-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Let's Work Together</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                I'm always interested in discussing new opportunities and challenging projects.
                Let's connect and explore how we can create something amazing together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Get In Touch
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}