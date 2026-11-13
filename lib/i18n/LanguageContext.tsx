'use client';

import React, { createContext, use, useEffect, useSyncExternalStore, useState, useTransition } from 'react';
import type { Locale, Translations } from './types';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'episciences-locale';

const localeListeners = new Set<() => void>();

function notifyLocaleListeners() {
  localeListeners.forEach((listener) => listener());
}

function subscribeToLocale(callback: () => void) {
  localeListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    localeListeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getLocaleSnapshot(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr' || saved === 'es') {
      return saved;
    }
    if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || '').toLowerCase();
      if (browserLang.startsWith('fr')) return 'fr';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('en')) return 'en';
    }
  } catch {
    // localStorage may be restricted
  }
  return 'en';
}

function getServerSnapshot(): Locale {
  return 'en';
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  dictionary: Translations;
}

export function LanguageProvider({ children, initialLocale, dictionary }: LanguageProviderProps) {
  const storeLocale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    () => initialLocale || getServerSnapshot()
  );
  const locale = initialLocale || storeLocale;
  const [announcement, setAnnouncement] = useState<string>('');
  const [, startTransition] = useTransition();

  // Keep <html lang="..."> synced on client-side route transitions
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${STORAGE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      notifyLocaleListeners();
    } catch {
      // Ignore localStorage write failure
    }

    startTransition(() => {
      setAnnouncement(dictionary.common.languageAnnouncement);
    });
  };

  return (
    <LanguageContext value={{ locale, setLocale, t: dictionary }}>
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
    </LanguageContext>
  );
}

export function useTranslation() {
  const context = use(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
