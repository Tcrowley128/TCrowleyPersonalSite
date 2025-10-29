'use client';

// Force rebuild to clear Vercel cache - 2025-10-29
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Shield, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from './ThemeToggle';
import BetaBadge from './BetaBadge';

const navItems = [
  { href: '/', label: 'Home', isSection: false },
  { href: '/about', label: 'About', isSection: false },
  { href: '/work', label: 'Work', isSection: false },
  { href: '/working-with-me', label: 'Working with Me', isSection: false },
  { href: '/blog', label: 'Blog', isSection: false },
  { href: '/assessment', label: 'Free Assessment', isSection: false },
  { href: '/contact', label: 'Contact', isSection: false },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    // Call server-side logout to properly clear cookies
    await fetch('/api/auth/logout', { method: 'POST' });
    // Also sign out on client side
    await supabase.auth.signOut();
    setIsOpen(false);
    // Redirect and force a full page reload to clear all state
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-bold text-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 whitespace-nowrap"
            >
              Tyler Crowley
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 mr-2">
              {navItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-base font-medium transition-colors duration-200 whitespace-nowrap relative inline-flex items-center"
                  >
                    {item.label}
                    {item.label === 'Free Assessment' && (
                      <span className="ml-1 relative z-10">
                        <BetaBadge size="sm" />
                      </span>
                    )}
                  </motion.div>
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/admin">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * navItems.length }}
                      className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 border border-blue-200 rounded-lg bg-blue-50"
                    >
                      <Shield size={16} />
                      Admin
                    </motion.div>
                  </Link>
                  <motion.button
                    onClick={handleLogout}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (navItems.length + 1) }}
                    className="text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Logout
                  </motion.button>
                </>
              )}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (navItems.length + (user ? 2 : 0)) }}
              >
                <ThemeToggle />
              </motion.div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item, index) => (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={handleNavigation}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-lg font-medium transition-colors duration-200 whitespace-nowrap relative inline-flex items-center"
                    >
                      {item.label}
                      {item.label === 'Free Assessment' && (
                        <span className="ml-1 relative z-10">
                          <BetaBadge size="sm" />
                        </span>
                      )}
                    </motion.div>
                  </Link>
                ))}
                {user && (
                  <>
                    <Link href="/admin">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * navItems.length }}
                        onClick={handleNavigation}
                        className="text-blue-600 hover:text-blue-700 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2 border border-blue-200 rounded-lg bg-blue-50"
                      >
                        <Shield size={18} />
                        Admin
                      </motion.div>
                    </Link>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (navItems.length + 1) }}
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </motion.button>
                  </>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * (navItems.length + (user ? 2 : 0)) }}
                  className="px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</span>
                  <ThemeToggle />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}