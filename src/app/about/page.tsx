'use client';

import { motion } from 'framer-motion';
import { Code, Palette, Users, Lightbulb } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';

const interests = [
  {
    icon: Code,
    title: 'Technology & Innovation',
    description: 'Passionate about cutting-edge technologies and their practical applications.'
  },
  {
    icon: Palette,
    title: 'Product Design',
    description: 'Creating intuitive and beautiful user experiences that solve real problems.'
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'Bringing people together to collaborate and create meaningful impact.'
  },
  {
    icon: Lightbulb,
    title: 'Sustainable Solutions',
    description: 'Developing environmentally conscious and socially responsible technology.'
  }
];

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'About' }
  ];

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              About Tyler Crowley
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              As a father of 3, husband, friend, and co-worker, I strive to stay curious, hold true to my integrity, act with kindness, and show gratitude
            </p>
          </motion.div>

          <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Journey</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  With 14+ years of experience at Bosch, I've evolved from logistics and process optimization
                  to leading strategic digital transformation initiatives. My passion lies in enabling innovation
                  as a creator, coach, and leader—driving 0-to-1 product launches and building high-performing teams.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  As a passionate digitalization advocate, I champion growth hacking, agile methodologies, and
                  user experience design. Whether launching Digital Ecosystem to 20,000+ users or pioneering ServiceNow
                  implementations, I focus on creating sustainable business solutions that drive real impact.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  My approach combines strategic thinking with hands-on execution, fostering a culture of
                  continuous improvement and experimentation. I believe in the power of cross-functional
                  collaboration and data-driven decision making to solve complex business challenges.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-80 h-80 rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center p-4 mx-auto"
              >
                <img
                  src="/images/tyler-photo.jpg"
                  alt="Tyler Crowley"
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">What Drives Me</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="text-center p-6 rounded-xl bg-gray-50 dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 transition-colors duration-300"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <interest.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{interest.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{interest.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8 md:p-12 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Skills & Expertise</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Product & Project Management</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Leading 0-to-1 product launches, establishing OKRs & KPIs, and driving product-led growth strategies.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Product Management', 'OKRs & KPIs', 'Agile Methods', 'Project Management', 'PMP Certified', 'Growth Hacking'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Digital Transformation</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Leading digital transformation initiatives, process automation, and change management across organizations.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Digital Transformation', 'Process Automation', 'Change Management', 'Data Analytics', 'User Experience'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tools & Platforms</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Expert in enterprise tools and platforms for data visualization, project management, and digital operations.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Power BI', 'Azure DevOps', 'ServiceNow', 'M365', 'SAP'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Education & Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Education</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bachelor of Business Administration</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">College of Charleston</p>
                  <p className="text-gray-500 dark:text-gray-400">2012</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Certifications & Professional Development</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Project Management Professional (PMP)</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Project Management Institute | 2025</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Bosch Talent Pool 2</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Active Member | 2024</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Product Management</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Maven | 2025</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Certified Scrum Product Owner (CSPO)</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Scrum Alliance | 2015, 2023</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change Practitioner Certified</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Prosci | 2022</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technical Skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8 md:p-12 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Technical Proficiencies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analytics & Visualization</h3>
                <div className="flex flex-wrap gap-2">
                  {['Google Analytics', 'Power BI', 'Data Visualization', 'KPIs & OKRs'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Agile & Project Management</h3>
                <div className="flex flex-wrap gap-2">
                  {['Agile & Scrum', 'JIRA', 'Azure DevOps', 'Product Owner', 'Change Management'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Automation & Design</h3>
                <div className="flex flex-wrap gap-2">
                  {['RPA', 'Alteryx', 'Microsoft Power Platform', 'UX Design Thinking', 'Figma'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Working with Me CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="bg-blue-500 text-white rounded-xl p-8 md:p-12 mb-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Want to collaborate effectively?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Learn about my leadership style, commitments, and working preferences
            </p>
            <a
              href="/working-with-me"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View My Working Style Guide
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}