'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function FullscreenModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: FullscreenModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-0 h-dvh w-screen max-h-none max-w-none bg-zinc-950/90 backdrop-blur-md text-white p-0 border-0 open:flex open:flex-col backdrop:bg-zinc-950/75"
    >
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400" aria-hidden="true">
            <Maximize2 size={18} />
          </div>
          <div>
            <h2 id={titleId} className="text-lg font-black tracking-tight text-white font-heading">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-medium text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <kbd className="hidden sm:inline-block rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-mono font-bold text-zinc-300">
            {t.common.escToClose}
          </kbd>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label={t.common.exitFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div role="region" aria-labelledby={titleId} className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="h-full w-full max-w-[1700px] mx-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
}
