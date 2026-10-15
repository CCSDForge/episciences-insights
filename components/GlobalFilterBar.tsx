'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, RotateCcw, Filter } from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function GlobalFilterBar() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const { state, actions, data } = useDashboard();
  const { yearFilter, journalFilter } = state;
  const { setYearFilter, setJournalFilter, resetFilters } = actions;
  const { filteredData, years, journals } = data;

  if (isHome) return null;

  const hasActiveFilters = yearFilter !== 'all' || journalFilter !== 'all';
  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  return (
    <section
      aria-label="Filtres globaux du corpus"
      className="mb-8 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter icon label */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Filter size={14} className="text-[var(--primary-text)]" aria-hidden="true" />
          <span>{locale === 'fr' ? 'Filtres' : locale === 'es' ? 'Filtros' : 'Filters'}</span>
        </div>

        {/* Publication Year */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-year-global" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
            {t.common.year}
          </label>
          <div className="relative">
            <select
              id="filter-year-global"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none rounded-xl border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-xs font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none transition-colors cursor-pointer"
            >
              <option value="all">{t.common.allYears}</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Journal / Source */}
        <div className="flex items-center gap-2 min-w-[200px] max-w-[360px] flex-1">
          <label htmlFor="filter-journal-global" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
            {t.common.journal}
          </label>
          <div className="relative flex-1">
            <select
              id="filter-journal-global"
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-xs font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none truncate transition-colors cursor-pointer"
            >
              <option value="all">{t.common.allJournals}</option>
              {journals.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Publication Count & Reset */}
        <div className="flex items-center gap-3 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              title={t.common.resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.common.reset}</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
            <strong className="font-black text-zinc-900 dark:text-zinc-100">{formatNum(filteredData.length)}</strong>
            <span>{t.common.publications.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
