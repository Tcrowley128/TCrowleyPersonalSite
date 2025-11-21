'use client';

// Force rebuild to clear Vercel cache - 2025-10-29
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Shield, LogOut, User, ChevronDown, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
    try {
      await signOut();
      setIsOpen(false);
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        <div className="flex items-center justify-between h-16">
          {/* Left: T Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                title="Tyler Crowley"
              >
                T
              </motion.div>
            </Link>
          </div>

          {/* Center: Main Navigation */}
          <div className="hidden md:flex flex-1 justify-center ml-8">
            <div className="flex items-center space-x-6">
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
            </div>
          </div>

          {/* Right: User Actions & Mobile Menu */}
          <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="relative hidden md:block">
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * navItems.length }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Signed in as
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link href="/my-assessments" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                              <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                              My Assessments
                            </div>
                          </Link>
                          <Link href="/admin" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                              <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                              Admin Dashboard
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-left"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * navItems.length }}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <User size={16} />
                  Login
                </motion.button>
              </Link>
            )}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (navItems.length + 1) }}
              className="hidden md:block"
            >
              <ThemeToggle />
            </motion.div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none p-2"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * navItems.length }}
                      className="text-gray-700 dark:text-gray-300 px-3 py-2 text-base font-medium flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <User size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="truncate">{user.email}</span>
                    </motion.div>
                    <Link href="/my-assessments">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * (navItems.length + 1) }}
                        onClick={handleNavigation}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2"
                      >
                        <FileText size={18} />
                        My Assessments
                      </motion.div>
                    </Link>
                    <Link href="/admin">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * (navItems.length + 2) }}
                        onClick={handleNavigation}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                      >
                        <Shield size={18} />
                        Admin
                      </motion.div>
                    </Link>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (navItems.length + 3) }}
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <Link href="/login">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * navItems.length }}
                      onClick={handleNavigation}
                      className="text-white bg-blue-600 hover:bg-blue-700 block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 flex items-center gap-2 rounded-lg shadow-sm"
                    >
                      <User size={18} />
                      Login
                    </motion.div>
                  </Link>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * (navItems.length + (user ? 4 : 1)) }}
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