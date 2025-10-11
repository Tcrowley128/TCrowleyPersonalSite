'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Linkedin, Mail } from 'lucide-react';

export default function Hero() {
  const scrollToNext = () => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWork = () => {
    const workSection = document.querySelector('#accomplishments');
    if (workSection) {
      workSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center relative overflow-hidden">
      {/* Animated Background Elements - Following Figma Best Practices */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary blob shapes - organic, modern feel */}
        <motion.div
          className="absolute -top-32 -left-32 w-80 h-96 bg-gradient-to-br from-blue-100/40 to-blue-200/20 rounded-full blur-sm"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for smooth easing
          }}
        />

        <motion.div
          className="absolute top-1/4 -right-40 w-96 h-80 bg-gradient-to-tl from-blue-200/30 to-blue-300/15 rounded-full blur-sm"
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        <motion.div
          className="absolute bottom-10 left-1/6 w-72 h-72 bg-gradient-to-tr from-blue-300/25 to-blue-400/10 rounded-full blur-sm"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        {/* Subtle accent shapes - minimal distraction */}
        <motion.div
          className="absolute top-1/3 left-2/3 w-24 h-24 bg-blue-400/15 rounded-3xl blur-[2px]"
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/5 w-16 h-32 bg-blue-500/12 rounded-full blur-[1px]"
          animate={{
            x: [0, -12, 0],
            y: [0, 18, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        {/* Ultra-subtle floating dots for depth */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-600/20 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        <motion.div
          className="absolute top-2/3 right-2/3 w-2 h-2 bg-blue-700/25 rounded-full"
          animate={{
            y: [0, 12, 0],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        {/* Enhanced gradient overlay with better color theory */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-blue-100/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hello, I&apos;m{' '}
              <span className="text-blue-600">Tyler</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Product & Project Leader driving digital transformation and building high-performing teams
            </motion.p>

            <motion.p
              className="text-lg text-gray-500 max-w-2xl mx-auto italic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              It's not about what you're doing—it's about what you get done.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={scrollToWork}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View My Work
              </button>
              <button
                onClick={scrollToContact}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Get In Touch
              </button>
            </motion.div>

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <a
                href="/working-with-me"
                className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-4 transition-colors duration-200"
              >
                Learn how I work and collaborate →
              </a>
            </motion.div>

            <motion.div
              className="flex justify-center space-x-6 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <a
                href="https://www.linkedin.com/in/tyler-crowley-3548bb103"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="mailto:tcrowley128@gmail.com"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <Mail size={24} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <button
              onClick={scrollToNext}
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200 animate-bounce"
            >
              <ArrowDown size={32} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}