'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import FloatingContactButton from './FloatingContactButton';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <FloatingContactButton />
    </div>
  );
}