'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Target,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Lightbulb
} from 'lucide-react';
import BetaBadge from '@/components/BetaBadge';

const benefits = [
  {
    icon: Lightbulb,
    title: 'Discover Hidden Opportunities',
    description: 'Uncover untapped potential in tools you already own - many businesses use less than 30% of their software capabilities'
  },
  {
    icon: Zap,
    title: 'Quick Wins First',
    description: 'Get actionable recommendations you can implement within 30 days, with or without IT support'
  },
  {
    icon: Users,
    title: 'Empower Your Team',
    description: 'Learn about citizen development tools that get the power in the business users hands'
  },
  {
    icon: TrendingUp,
    title: 'Scale Strategically',
    description: 'Balance quick wins with long-term investments for sustainable transformation'
  },
  {
    icon: Shield,
    title: 'Risk-Aware Approach',
    description: 'Recommendations tailored to your risk tolerance and change readiness'
  },
  {
    icon: Target,
    title: 'Personalized Roadmap',
    description: 'Get a custom 30/60/90 day plan based on your specific challenges and goals'
  }
];

const whatYouGet = [
  'Maturity assessment across 4 strategic pillars',
  '3-tiered recommendations (Citizen-led, Hybrid, Technical)',
  'Specific technology solutions matched to your needs',
  'Quick wins list with estimated time savings',
  '30/60/90 day implementation roadmap',
  'Change management and training strategy',
  'Underutilized features in your current tools',
  'Budget-friendly options and free alternatives'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function AssessmentLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"
      >
        <div className="text-center">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles size={16} />
            Free Digital Transformation Assessment
            <BetaBadge size="sm" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Unlock Your Business&apos;s
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digital Potential
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Get a personalized roadmap that shows you how to start transforming your business today—without
            overwhelming your team or breaking the bank.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/assessment/start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Start Your Assessment
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <Clock size={16} />
              <span>10-12 minutes • No credit card required</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>No sales calls</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Actionable insights</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Why Take This Assessment?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* What You'll Get */}
      <section className="bg-white dark:bg-slate-800 py-16 border-y border-gray-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
            >
              What You&apos;ll Receive
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-4">
              {whatYouGet.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Answer Questions', desc: 'Tell us about your business, tools, and challenges (10 min)' },
              { num: '2', title: 'AI Analysis', desc: 'Claude analyzes your responses and matches solutions to your needs' },
              { num: '3', title: 'Get Your Roadmap', desc: 'Receive personalized recommendations and implementation plan' },
              { num: '4', title: 'Take Action', desc: 'Start with quick wins while building toward strategic goals' }
            ].map((step, index) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Journey Platform Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl my-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles size={16} />
            What Happens Next?
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Turn Insights Into Action with the
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transformation Journey Platform
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Your assessment is just the beginning. Register to unlock our comprehensive Journey Management Platform
            that helps you plan, track, and execute your entire digital transformation initiative.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Project Portfolio Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Organize and track multiple transformation initiatives with comprehensive project views, risk tracking, and progress monitoring
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Collaboration Tools</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Sprint planning, backlog management, task assignments, and team retrospectives - all in one platform
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get intelligent insights, recommendations, and guidance throughout your transformation journey with our AI assistant
              </p>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Register to Access Platform
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <CheckCircle size={16} className="text-green-600" />
              <span>Free assessment included with registration</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-blue-100 mb-8"
          >
            Join hundreds of businesses discovering their digital transformation roadmap
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link href="/assessment/start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                Get Started - It&apos;s Free
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          This assessment is designed to provide practical, actionable insights. While powered by AI,
          every recommendation is grounded in proven digital transformation methodologies and real-world experience.
        </p>
      </section>
    </div>
  );
}
