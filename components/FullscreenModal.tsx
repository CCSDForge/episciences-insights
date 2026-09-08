'use client';

import React, { useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400" aria-hidden="true">
            <Maximize2 size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white font-heading">
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
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t.common.exitFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div role="region" aria-label={title} className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="h-full w-full max-w-[1700px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
