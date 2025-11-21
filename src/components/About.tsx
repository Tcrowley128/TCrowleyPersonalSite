'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code, Palette, Users, Lightbulb } from 'lucide-react';

const interests = [
  {
    icon: Code,
    title: 'Technology & Innovation',
    description: 'Passionate about exploring AI and emerging technologies—always experimenting with new tools like the AI-powered coding assistants used to build this site.'
  },
  {
    icon: Palette,
    title: 'Product Design',
    description: 'Creating intuitive and beautiful user experiences that solve real problems.'
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'Democratizing digitalization by empowering others with the knowledge and tools to create independently and continue growing on their own.'
  },
  {
    icon: Lightbulb,
    title: 'Sustainable Solutions',
    description: 'Building long-term solutions and coaching teams to solve complex business problems.'
  }
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            About Me
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Leveraging digitalization to improve business, and people's lives
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Journey</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              With 14+ years of experience at Bosch, I've evolved from logistics and process optimization
              to leading strategic digital transformation initiatives. My passion lies in enabling innovation
              as a creator, coach, and leader—driving 0-to-1 product launches and building high-performing teams.
              As a passionate digitalization advocate, I champion growth hacking, agile methodologies, and
              user experience design.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Whether launching Digital Ecosystem to 20,000+ users or pioneering ServiceNow
              implementations, I focus on creating sustainable business solutions that drive real impact.
              My approach combines strategic thinking with hands-on execution, fostering a culture of
              continuous improvement and experimentation. I believe in the power of cross-functional
              collaboration and data-driven decision making to solve complex business challenges.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Central to my philosophy is the democratization of digitalization—leaving those I work with
              not just with solutions, but inspired and equipped with the independence to create on their own.
              True transformation happens when people are empowered to keep growing long after the project ends.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-80 h-80 rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center p-4 mx-auto"
          >
            <img
              src="/images/tyler-photo.jpg"
              alt="Tyler Crowley"
              className="w-full h-full object-cover rounded-lg"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">What Drives Me</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <interest.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{interest.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{interest.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}