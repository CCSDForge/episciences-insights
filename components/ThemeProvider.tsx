'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore, useState, useTransition } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'episciences-theme';

const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(callback: () => void) {
  themeListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getThemeSnapshot(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // localStorage may be restricted
  }
  return 'system';
}

function getServerSnapshot(): Theme {
  return 'system';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [announcement, setAnnouncement] = useState<string>('');
  const [, startTransition] = useTransition();

  // Synchronize document element class and colorScheme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      const effectiveTheme = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;

      setResolvedTheme(effectiveTheme);

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    updateResolved();

    const handleMediaChange = () => {
      if (theme === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      notifyThemeListeners();
    } catch {
      // Ignore localStorage write failure
    }

    startTransition(() => {
      const effectiveTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
      const message = newTheme === 'system'
        ? `Theme set to system default (${effectiveTheme} mode)`
        : `Theme switched to ${newTheme} mode`;

      setAnnouncement(message);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
      {/* Screen reader live announcement region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
