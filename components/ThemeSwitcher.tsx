'use client';

import React, { useRef, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
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
    label: 'Light',
    ariaLabel: 'Light theme',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    ariaLabel: 'Dark theme',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    ariaLabel: 'System theme',
    icon: Monitor,
  },
];

const emptySubscribe = () => () => {};

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = THEME_OPTIONS.length - 1;
    }

    if (targetIndex >= 0) {
      const nextOption = THEME_OPTIONS[targetIndex];
      setTheme(nextOption.value);
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
      aria-label="Color theme"
      className={`inline-flex items-center rounded-full p-1 bg-white/80 dark:bg-zinc-900/80 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-md backdrop-blur-md transition-colors ${className}`}
    >
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = theme === option.value;
        const Icon = option.icon;

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
            onClick={() => setTheme(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900 ${
              isSelected
                ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50 ring-1 ring-zinc-300/50 dark:ring-zinc-700/50'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Icon
              size={14}
              aria-hidden="true"
              className={`transition-transform duration-200 ${
                isSelected ? 'scale-110 text-teal-600 dark:text-teal-400' : 'opacity-70 group-hover:opacity-100'
              }`}
            />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
