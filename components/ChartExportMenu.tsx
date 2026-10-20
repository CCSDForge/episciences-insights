'use client';

import React, { useState, useRef, useEffect, useId, useTransition } from 'react';
import { Download, Image as ImageIcon, FileSpreadsheet, FileJson, Code, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { 
  exportPng, 
  exportSvg, 
  exportCsv, 
  exportJson, 
  CsvColumn
} from '@/lib/exportUtils';

export interface ChartExportMenuProps {
  /**
   * Ref to the container DOM element holding the chart SVG or the SVG element itself.
   */
  targetRef?: React.RefObject<HTMLElement | SVGSVGElement | null>;
  /**
   * Static dataset to export as CSV or JSON.
   */
  data?: unknown[] | Record<string, unknown> | null;
  /**
   * Dynamic getter for dataset if data is computed or transformed at export time.
   */
  getExportData?: () => unknown[] | Record<string, unknown> | null;
  /**
   * Base filename without extension (e.g. "episciences-usage-trends").
   */
  filename: string;
  /**
   * Optional custom column configuration for CSV export.
   */
  csvColumns?: CsvColumn[];
  /**
   * Dropdown alignment relative to trigger button: 'left' or 'right' (default).
   */
  align?: 'left' | 'right';
  /**
   * Custom CSS classes for container wrapper.
   */
  className?: string;
  /**
   * Whether the export button is disabled.
   */
  disabled?: boolean;
}

export default function ChartExportMenu({
  targetRef,
  data,
  getExportData,
  filename,
  csvColumns,
  align = 'right',
  className = '',
  disabled = false,
}: ChartExportMenuProps) {
  const { t } = useTranslation();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Determine available options without accessing ref during render
  const hasVisual = targetRef != null;
  const hasData = Boolean(data || getExportData);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation within the menu
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []
      );
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        items[items.length - 1]?.focus();
      } else if (event.key === 'Tab') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleMenu = () => {
    if (disabled || isPending) return;
    setIsOpen((prev) => !prev);
  };

  const notifyStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportPng = () => {
    if (!targetRef?.current) return;
    setIsOpen(false);
    triggerRef.current?.focus();

    startTransition(async () => {
      try {
        const success = await exportPng(targetRef.current, filename);
        if (success) {
          notifyStatus(t.export.success);
        } else {
          notifyStatus(t.export.noSvgFound);
        }
      } catch (err) {
        console.error(err);
        notifyStatus(t.export.error);
      }
    });
  };

  const handleExportSvg = () => {
    if (!targetRef?.current) return;
    setIsOpen(false);
    triggerRef.current?.focus();

    startTransition(() => {
      try {
        const success = exportSvg(targetRef.current, filename);
        if (success) {
          notifyStatus(t.export.success);
        } else {
          notifyStatus(t.export.noSvgFound);
        }
      } catch (err) {
        console.error(err);
        notifyStatus(t.export.error);
      }
    });
  };

  const resolveData = (): unknown[] | Record<string, unknown> | null => {
    if (getExportData) {
      try {
        return getExportData();
      } catch (err) {
        console.error('Error in getExportData callback:', err);
        return null;
      }
    }
    return data ?? null;
  };

  const handleExportCsv = () => {
    setIsOpen(false);
    triggerRef.current?.focus();

    startTransition(() => {
      try {
        const raw = resolveData();
        if (!raw) {
          notifyStatus(t.export.error);
          return;
        }

        const dataArray = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [raw as Record<string, unknown>];
        const success = exportCsv(dataArray, filename, csvColumns);
        if (success) {
          notifyStatus(t.export.success);
        } else {
          notifyStatus(t.export.error);
        }
      } catch (err) {
        console.error(err);
        notifyStatus(t.export.error);
      }
    });
  };

  const handleExportJson = () => {
    setIsOpen(false);
    triggerRef.current?.focus();

    startTransition(() => {
      try {
        const raw = resolveData();
        if (raw === null || raw === undefined) {
          notifyStatus(t.export.error);
          return;
        }

        const success = exportJson(raw, filename);
        if (success) {
          notifyStatus(t.export.success);
        } else {
          notifyStatus(t.export.error);
        }
      } catch (err) {
        console.error(err);
        notifyStatus(t.export.error);
      }
    });
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        onClick={toggleMenu}
        disabled={disabled || isPending}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={t.export.exportMenu}
        title={t.export.exportMenu}
        className={`inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-focus)] ${
          isOpen
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 ring-1 ring-zinc-300 dark:ring-zinc-600 shadow-xs'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 ring-1 ring-zinc-200/80 dark:ring-zinc-700/80 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin text-[var(--episciences-cyan-02)] shrink-0" aria-hidden="true" />
        ) : (
          <Download size={14} className="shrink-0" aria-hidden="true" />
        )}
        <span className="hidden sm:inline font-semibold">{t.export.exportButton}</span>
      </button>

      {/* Screen Reader Announcement Live Region */}
      <span className="sr-only" role="status" aria-live="polite">
        {statusMessage || (isPending ? t.export.downloading : '')}
      </span>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          aria-orientation="vertical"
          className={`absolute ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} z-40 mt-1.5 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Section: Visualization */}
          {hasVisual && (
            <div className="mb-2">
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.export.exportVisualization}
              </div>
              <div className="space-y-0.5" role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={handleExportPng}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-[var(--episciences-cyan-00)]/15 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-200 dark:hover:bg-[var(--episciences-cyan-00)]/20 dark:hover:text-[var(--episciences-cyan-00)] transition-colors cursor-pointer outline-none focus-visible:bg-[var(--episciences-cyan-00)]/15 focus-visible:text-[var(--episciences-cyan-04)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                    <ImageIcon size={14} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold">{t.export.png}</span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">{t.export.pngDesc}</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={handleExportSvg}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-[var(--episciences-cyan-00)]/15 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-200 dark:hover:bg-[var(--episciences-cyan-00)]/20 dark:hover:text-[var(--episciences-cyan-00)] transition-colors cursor-pointer outline-none focus-visible:bg-[var(--episciences-cyan-00)]/15 focus-visible:text-[var(--episciences-cyan-04)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                    <Code size={14} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold">{t.export.svg}</span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">{t.export.svgDesc}</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {hasVisual && hasData && (
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />
          )}

          {/* Section: Data */}
          {hasData && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.export.exportData}
              </div>
              <div className="space-y-0.5" role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={handleExportCsv}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-[var(--episciences-cyan-00)]/15 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-200 dark:hover:bg-[var(--episciences-cyan-00)]/20 dark:hover:text-[var(--episciences-cyan-00)] transition-colors cursor-pointer outline-none focus-visible:bg-[var(--episciences-cyan-00)]/15 focus-visible:text-[var(--episciences-cyan-04)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                    <FileSpreadsheet size={14} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold">{t.export.csv}</span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">{t.export.csvDesc}</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={handleExportJson}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-[var(--episciences-cyan-00)]/15 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-200 dark:hover:bg-[var(--episciences-cyan-00)]/20 dark:hover:text-[var(--episciences-cyan-00)] transition-colors cursor-pointer outline-none focus-visible:bg-[var(--episciences-cyan-00)]/15 focus-visible:text-[var(--episciences-cyan-04)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0">
                    <FileJson size={14} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold">{t.export.json}</span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">{t.export.jsonDesc}</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
