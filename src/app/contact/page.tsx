'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Linkedin, Send, MapPin, MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        alert(data.message || 'Thank you for your message! I will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again later.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'tcrowley128@gmail.com',
      href: 'mailto:tcrowley128@gmail.com',
      description: 'Drop me a line anytime'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'linkedin.com/in/tyler-crowley-3548bb103',
      href: 'https://www.linkedin.com/in/tyler-crowley-3548bb103',
      description: 'Connect professionally'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Granger, IN',
      href: null,
      description: 'Available for local meetings'
    }
  ];

  const breadcrumbItems = [
    { label: 'Contact' }
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
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to bring your ideas to life? Let's connect and discuss how we can create something amazing together.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-700 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Let's Start a Conversation</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  I'm always excited to discuss new projects, innovative ideas, or opportunities to collaborate.
                  Whether you're looking to build a new application, need technical consultation, or just want
                  to connect, I'd love to hear from you.
                </p>

                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-300 font-medium">{item.value}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-blue-50 dark:bg-slate-600 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Response Time</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  I typically respond to messages within 24 hours during business days.
                  For urgent matters, feel free to call or text directly.
                </p>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Send Me a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                      placeholder="Tyler Crowley"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                      placeholder="tcrowley128@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                    placeholder="Tell me about your project goals, timeline, budget, or any specific requirements you have in mind..."
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-400 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-8 md:p-12 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">What types of projects do you work on?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I specialize in digital transformation initiatives, strategic product development, and enterprise
                  platform implementations. With 14+ years at Bosch, I focus on 0-to-1 product launches, ServiceNow
                  solutions, and building scalable systems that drive business impact.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">What's your approach to leadership?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I lead as a creator, coach, and strategic partner—fostering high-performing teams through agile
                  methodologies, growth hacking, and continuous improvement. My focus is on building sustainable
                  solutions while empowering teams to innovate and experiment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Do you work with remote teams?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Absolutely! I have extensive experience leading distributed teams and cross-functional collaboration
                  across multiple time zones. I'm skilled in leveraging digital tools to drive engagement and deliver
                  results in remote and hybrid environments.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">What value do you bring to organizations?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  As a digital change agent, I excel at agile project leadership and building high-performing teams.
                  I drive organizational transformation by combining technical expertise with people-focused leadership,
                  creating cultures of innovation and continuous improvement that deliver sustainable business results.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}