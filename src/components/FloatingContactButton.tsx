'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mail, Linkedin } from 'lucide-react';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const contactOptions = [
    {
      icon: Mail,
      label: 'Email',
      action: () => {
        window.location.href = 'mailto:tcrowley128@gmail.com';
        setIsOpen(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      action: () => {
        window.open('https://www.linkedin.com/in/tyler-crowley-3548bb103', '_blank');
        setIsOpen(false);
      },
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      icon: MessageCircle,
      label: 'Contact Form',
      action: scrollToContact,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Contact Options Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
              >
                {contactOptions.map((option, index) => (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={option.action}
                    className={`${option.color} text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3 group min-w-[60px]`}
                  >
                    <option.icon size={24} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB Button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`${
              isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            } text-white p-5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center`}
            aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse Animation Ring */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 bg-blue-600 rounded-full -z-10"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
