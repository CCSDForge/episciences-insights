'use client';

import React, { useRef, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Locale } from '@/lib/i18n/translations';

interface LanguageOption {
  value: Locale;
  label: string;
  shortLabel: string;
  ariaLabel: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: 'en',
    label: 'English',
    shortLabel: 'EN',
    ariaLabel: 'English language',
  },
  {
    value: 'fr',
    label: 'Français',
    shortLabel: 'FR',
    ariaLabel: 'Langue française',
  },
  {
    value: 'es',
    label: 'Español',
    shortLabel: 'ES',
    ariaLabel: 'Idioma español',
  },
];

const emptySubscribe = () => () => {};

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    if (pathname) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0 && (parts[0] === 'en' || parts[0] === 'fr' || parts[0] === 'es')) {
        parts[0] = nextLocale;
        router.push(`/${parts.join('/')}/`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % LANGUAGE_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = LANGUAGE_OPTIONS.length - 1;
    }

    if (targetIndex >= 0) {
      const nextOption = LANGUAGE_OPTIONS[targetIndex];
      changeLocale(nextOption.value);
      buttonRefs.current[targetIndex]?.focus();
    }
  };

  // Render a placeholder before mount to avoid hydration layout shift
  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center rounded-full p-1 bg-zinc-200/60 dark:bg-zinc-800/80 ring-1 ring-zinc-300/60 dark:ring-zinc-700/60 ${className}`}
        aria-hidden="true"
      >
        <div className="flex h-8 items-center gap-1 px-1">
          <div className="h-6 w-16 rounded-full bg-zinc-300/50 dark:bg-zinc-700/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.common.selectLanguage}
      className={`inline-flex items-center rounded-full p-1 bg-white/80 dark:bg-zinc-900/80 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-md backdrop-blur-md transition-colors ${className}`}
    >
      <span className="pl-2 pr-1 text-zinc-400 dark:text-zinc-500" aria-hidden="true">
        <Languages size={14} />
      </span>
      {LANGUAGE_OPTIONS.map((option, index) => {
        const isSelected = locale === option.value;

        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.ariaLabel}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => changeLocale(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group relative flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900 ${
              isSelected
                ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50 ring-1 ring-zinc-300/50 dark:ring-zinc-700/50'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span className={isSelected ? 'text-teal-600 dark:text-teal-400 font-extrabold' : ''}>
              {option.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
