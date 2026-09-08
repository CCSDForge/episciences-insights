'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore, useState, useTransition } from 'react';
import { Locale, Translations, translations } from './translations';

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
    // Check browser preference
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

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const storeLocale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, () => initialLocale || getServerSnapshot());
  const locale = initialLocale || storeLocale;
  const [announcement, setAnnouncement] = useState<string>('');
  const [, startTransition] = useTransition();

  // Sync <html lang="..."> attribute
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
      setAnnouncement(translations[newLocale].common.languageAnnouncement);
    });
  };

  const t = translations[locale] || translations.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
