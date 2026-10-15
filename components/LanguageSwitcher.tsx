'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Languages, ChevronDown, Check } from 'lucide-react';
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

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.value === locale) || LANGUAGE_OPTIONS[0];

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setIsOpen(false);
    if (pathname) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0 && (parts[0] === 'en' || parts[0] === 'fr' || parts[0] === 'es')) {
        parts[0] = nextLocale;
        router.push(`/${parts.join('/')}/`);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={`h-9 w-16 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse ${className}`} />
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t.common.selectLanguage}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-focus)] ${
          isOpen
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 ring-1 ring-zinc-300 dark:ring-zinc-700'
            : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xs'
        }`}
      >
        <Languages size={14} className="text-[var(--primary-text)] shrink-0" aria-hidden="true" />
        <span className="font-extrabold uppercase">{currentOption.shortLabel}</span>
        <ChevronDown
          size={12}
          className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-600 dark:text-zinc-200' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t.common.selectLanguage}
          className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = locale === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => changeLocale(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] font-extrabold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{option.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">{option.shortLabel}</span>
                  {isSelected && <Check size={13} className="text-[var(--primary-text)] shrink-0" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
