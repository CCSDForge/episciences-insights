'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';

interface ThemeOption {
  value: Theme;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Clair',
    ariaLabel: 'Light theme',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Sombre',
    ariaLabel: 'Dark theme',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'Système',
    ariaLabel: 'System theme',
    icon: Monitor,
  },
];

const emptySubscribe = () => () => {};

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = THEME_OPTIONS.find((opt) => opt.value === theme) || THEME_OPTIONS[2];
  const CurrentIcon = currentOption.icon;

  const selectTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setIsOpen(false);
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
      <div className={`h-9 w-12 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse ${className}`} />
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Changer le thème d'affichage"
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-focus)] ${
          isOpen
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 ring-1 ring-zinc-300 dark:ring-zinc-700'
            : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xs'
        }`}
      >
        <CurrentIcon size={15} className="text-[var(--primary-text)] shrink-0" aria-hidden="true" />
        <ChevronDown
          size={12}
          className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-600 dark:text-zinc-200' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Thème d'affichage"
          className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150"
        >
          {THEME_OPTIONS.map((option) => {
            const isSelected = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectTheme(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] font-extrabold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={14} className="shrink-0" aria-hidden="true" />
                  <span>{option.label}</span>
                </span>
                {isSelected && <Check size={13} className="text-[var(--primary-text)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
