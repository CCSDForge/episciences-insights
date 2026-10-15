'use client';

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export interface ViewOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface ViewSegmentedControlProps<T extends string = string> {
  views: ViewOption<T>[];
  activeView: T;
  onChange: (id: T) => void;
  onFullscreen?: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function ViewSegmentedControl<T extends string = string>({
  views,
  activeView,
  onChange,
  onFullscreen,
  ariaLabel,
  className = '',
}: ViewSegmentedControlProps<T>) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel || 'Select view'}
        className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 shadow-inner max-w-full overflow-x-auto scrollbar-hide"
      >
        {views.map((v) => {
          const isSelected = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(v.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[var(--episciences-cyan-03)] text-white shadow-sm dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)] dark:font-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              {v.icon && <span className="shrink-0">{v.icon}</span>}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {onFullscreen && (
        <button
          type="button"
          onClick={onFullscreen}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
        >
          <Maximize2 size={14} aria-hidden="true" />
          <span>{t.common.fullscreen}</span>
        </button>
      )}
    </div>
  );
}
