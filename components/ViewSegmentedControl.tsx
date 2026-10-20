'use client';

import React from 'react';

export interface ViewOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface ViewSegmentedControlProps<T extends string = string> {
  views: ViewOption<T>[];
  activeView: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  className?: string;
}

export default function ViewSegmentedControl<T extends string = string>({
  views,
  activeView,
  onChange,
  ariaLabel,
  className = '',
}: ViewSegmentedControlProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % views.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + views.length) % views.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = views.length - 1;
    } else {
      return;
    }

    onChange(views[nextIndex].id);
    const tabs = (e.currentTarget.parentElement as HTMLElement)?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel || 'Select view'}
        className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 shadow-inner max-w-full overflow-x-auto scrollbar-hide"
      >
        {views.map((v, idx) => {
          const isSelected = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(v.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[var(--episciences-cyan-03)] text-white shadow-sm dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)] dark:font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              {v.icon && <span className="shrink-0" aria-hidden="true">{v.icon}</span>}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
