'use client';

import React, { useState, useRef, useEffect, useId, useSyncExternalStore, useMemo } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ThemeOption {
  value: Theme;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const emptySubscribe = () => () => {};

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const themeOptions = useMemo<ThemeOption[]>(() => [
    {
      value: 'light',
      label: t.theme.light,
      ariaLabel: t.theme.lightAria,
      icon: Sun,
    },
    {
      value: 'dark',
      label: t.theme.dark,
      ariaLabel: t.theme.darkAria,
      icon: Moon,
    },
    {
      value: 'system',
      label: t.theme.system,
      ariaLabel: t.theme.systemAria,
      icon: Monitor,
    },
  ], [t]);

  const currentOption = themeOptions.find((opt) => opt.value === theme) || themeOptions[2];
  const CurrentIcon = currentOption.icon;

  const selectTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const rafId = requestAnimationFrame(() => {
      const options = Array.from(
        listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []
      );
      const selected = options.find((el) => el.getAttribute('aria-selected') === 'true');
      (selected || options[0])?.focus();
    });

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const options = Array.from(
        listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []
      );
      if (options.length === 0) return;

      const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        options[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        options[options.length - 1]?.focus();
      } else if (event.key === 'Tab') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={t.theme.changeTheme}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-focus)] ${
          isOpen
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 ring-1 ring-zinc-300 dark:ring-zinc-700'
            : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xs'
        }`}
      >
        <CurrentIcon size={15} className="text-[var(--primary-text)] shrink-0" aria-hidden="true" />
        <ChevronDown
          size={12}
          className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-600 dark:text-zinc-200' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={t.theme.themeMenuAria}
          className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150"
        >
          {themeOptions.map((option) => {
            const isSelected = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={option.ariaLabel}
                onClick={() => selectTheme(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-focus)] ${
                  isSelected
                    ? 'bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] font-extrabold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={14} className="shrink-0" aria-hidden="true" />
                  <span>{option.label}</span>
                </span>
                {isSelected && <Check size={13} className="text-[var(--primary-text)] shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
