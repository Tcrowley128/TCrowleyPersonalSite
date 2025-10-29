'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'dark'
    const savedTheme = localStorage.getItem('theme') as Theme;

    console.log('Initial mount - savedTheme:', savedTheme);

    if (savedTheme) {
      console.log('Using saved theme:', savedTheme);
      setTheme(savedTheme);
    } else {
      console.log('Defaulting to dark');
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    console.log('Applying theme:', theme, 'HTML classes before:', root.classList.toString());

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    console.log('HTML classes after:', root.classList.toString());
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme);
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Setting theme to:', newTheme);
      return newTheme;
    });
  };

  // Always provide the context, even before mounted
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // During SSR or if used outside provider, return default values
    // This prevents build errors while maintaining functionality
    if (typeof window === 'undefined') {
      return { theme: 'dark' as Theme, toggleTheme: () => {} };
    }
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
