'use client';

import React, { createContext, useContext } from 'react';
import { Maximize2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface PanelFullscreenContextValue {
  onFullscreen: () => void;
  label?: string;
}

const PanelFullscreenContext = createContext<PanelFullscreenContextValue | null>(null);

export function PanelFullscreenProvider({
  onFullscreen,
  label,
  children,
}: {
  onFullscreen: () => void;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <PanelFullscreenContext.Provider value={{ onFullscreen, label }}>
      {children}
    </PanelFullscreenContext.Provider>
  );
}

export function PanelFullscreenButton({ className = '' }: { className?: string }) {
  const ctx = useContext(PanelFullscreenContext);
  const { t } = useTranslation();

  if (!ctx) return null;

  const ariaLabel = ctx.label || t.common.fullscreen;

  return (
    <button
      type="button"
      onClick={ctx.onFullscreen}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer ${className}`}
      title={ariaLabel}
      aria-label={ariaLabel}
    >
      <Maximize2 size={14} aria-hidden="true" />
    </button>
  );
}
