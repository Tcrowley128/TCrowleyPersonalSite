'use client';

import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';

export default function PrivacyPage() {
  const breadcrumbItems = [
    { label: 'Privacy Policy' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-800 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: January 8, 2025
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-8 md:p-12 mb-16 prose prose-lg dark:prose-invert max-w-none"
          >
            <h2>Introduction</h2>
            <p>
              Welcome to Tyler Crowley's personal website ("Site"). This Privacy Policy explains how we collect,
              use, and protect your information when you visit our Site or use our services.
            </p>

            <h2>Information We Collect</h2>

            <h3>Contact Form Data</h3>
            <p>
              When you submit our contact form, we collect:
            </p>
            <ul>
              <li>Your name</li>
              <li>Email address</li>
              <li>Subject/message content</li>
              <li>IP address (for security and spam prevention)</li>
              <li>Submission timestamp</li>
            </ul>

            <h3>Analytics Data</h3>
            <p>
              We use Vercel Analytics to understand how visitors interact with our Site. Vercel Analytics is a
              privacy-friendly analytics solution that:
            </p>
            <ul>
              <li>Does not use cookies</li>
              <li>Does not track users across websites</li>
              <li>Does not collect personal identifiable information</li>
              <li>Collects only anonymized, aggregated data about page views and site performance</li>
            </ul>

            <h3>Blog Post Views</h3>
            <p>
              We track anonymous view counts for blog posts to understand content popularity. This data is
              aggregated and does not identify individual users.
            </p>

            <h2>How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul>
              <li><strong>Contact Form Submissions:</strong> To respond to your inquiries and communicate with you</li>
              <li><strong>Analytics:</strong> To improve our Site's performance, content, and user experience</li>
              <li><strong>Security:</strong> To prevent spam, abuse, and unauthorized access</li>
            </ul>

            <h2>Data Storage and Security</h2>
            <p>
              Your contact form submissions are securely stored in Supabase, a cloud database provider with
              enterprise-grade security. We implement appropriate technical and organizational measures to protect
              your data against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>Data Retention</h2>
            <p>
              We retain contact form submissions for as long as necessary to respond to your inquiry and maintain
              business records. You may request deletion of your data at any time by contacting us.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              Our Site uses the following third-party services:
            </p>
            <ul>
              <li><strong>Vercel:</strong> Hosting and analytics (Privacy Policy: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>)</li>
              <li><strong>Supabase:</strong> Database and storage (Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>)</li>
            </ul>

            <h2>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us at <a href="mailto:tcrowley128@gmail.com">tcrowley128@gmail.com</a>.
            </p>

            <h2>Cookies</h2>
            <p>
              Our Site does not use cookies for tracking purposes. Vercel Analytics operates without cookies and
              respects user privacy by default.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our Site is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>

            <h2>International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence.
              We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
              new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:tcrowley128@gmail.com">tcrowley128@gmail.com</a></li>
              <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/tyler-crowley-3548bb103" target="_blank" rel="noopener noreferrer">linkedin.com/in/tyler-crowley-3548bb103</a></li>
            </ul>

            <h2>Compliance</h2>
            <p>
              This Privacy Policy is designed to comply with:
            </p>
            <ul>
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Other applicable data protection laws</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
