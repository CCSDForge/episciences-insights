'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, RotateCcw, Filter, Search, Check, X } from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  selectClassName?: string;
  children: React.ReactNode;
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  className = '',
  selectClassName = '',
  children,
}: FilterSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
        {label}
      </label>
      <div className="relative flex-1">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-xs font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none transition-colors cursor-pointer ${selectClassName}`}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}

function InstitutionCombobox() {
  const { state, actions, data } = useDashboard();
  const { institutionFilter } = state;
  const { setInstitutionFilter } = actions;
  const { institutionsList } = data;
  const { locale } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedInst = useMemo(() => {
    if (institutionFilter === 'all') return null;
    return institutionsList.find((i) => i.id === institutionFilter || i.ror === institutionFilter || i.name === institutionFilter) || null;
  }, [institutionFilter, institutionsList]);

  const filteredInstitutions = useMemo(() => {
    if (!searchTerm.trim()) return institutionsList.slice(0, 50);
    const lower = searchTerm.toLowerCase();
    return institutionsList
      .filter((i) => i.name.toLowerCase().includes(lower) || (i.country && i.country.toLowerCase().includes(lower)))
      .slice(0, 50);
  }, [institutionsList, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (id: string) => {
    setInstitutionFilter(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const allLabel = locale === 'fr' ? 'Toutes les institutions' : locale === 'es' ? 'Todas las instituciones' : 'All institutions';
  const labelText = locale === 'fr' ? 'Institution' : locale === 'es' ? 'Institución' : 'Institution';
  const searchPlaceholder = locale === 'fr' ? 'Rechercher (ex: CNRS, Inria, Oxford)...' : locale === 'es' ? 'Buscar institución...' : 'Search institution...';

  return (
    <div ref={containerRef} className="relative flex items-center gap-2 min-w-[260px] max-w-[420px] flex-1">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
        {labelText}
      </label>
      <div className="relative flex-1">
        <button
          type="button"
          onClick={handleOpen}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-xs font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none transition-colors text-left truncate cursor-pointer"
        >
          <span className="truncate">
            {selectedInst ? selectedInst.name : allLabel}
          </span>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-[380px] sm:w-[440px] max-w-[90vw] z-50 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-8 py-1.5 text-xs font-medium text-zinc-900 outline-none focus:border-[var(--primary-focus)] focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-800"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              <button
                type="button"
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                  institutionFilter === 'all'
                    ? 'bg-[var(--primary-focus)]/10 text-[var(--primary-text)] font-black'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span>{allLabel}</span>
                {institutionFilter === 'all' && <Check size={14} />}
              </button>

              {filteredInstitutions.map((inst) => {
                const isSelected = institutionFilter === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelect(inst.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary-focus)]/10 text-[var(--primary-text)] font-black'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                        {inst.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        {inst.country && <span>{inst.country}</span>}
                        {inst.ror && <span className="font-mono text-[9px] opacity-75">ROR</span>}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                        {inst.count}
                      </span>
                      {isSelected && <Check size={14} className="text-[var(--primary-text)]" />}
                    </div>
                  </button>
                );
              })}

              {filteredInstitutions.length === 0 && (
                <div className="py-4 text-center text-xs text-zinc-500">
                  {locale === 'fr' ? 'Aucune institution trouvée' : 'No institution found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GlobalFilterBar() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isHelp = pathname?.includes(`/${locale}/help`);

  const { state, actions, data } = useDashboard();
  const { yearFilter, journalFilter, institutionFilter } = state;
  const { setYearFilter, setJournalFilter, resetFilters } = actions;
  const { filteredData, years, journals } = data;

  if (isHome || isHelp) return null;

  const isJournalPage = pathname?.includes('/journals') || pathname?.includes('/revues');
  const isInstitutionPage = pathname?.includes('/institutions');
  const isPlatformPage = pathname?.includes('/platform') || pathname?.includes('/plateforme');

  const hasActiveFilters =
    yearFilter !== 'all' ||
    (isJournalPage && journalFilter !== 'all') ||
    (isInstitutionPage && institutionFilter !== 'all') ||
    (!isJournalPage && !isInstitutionPage && !isPlatformPage && (journalFilter !== 'all' || institutionFilter !== 'all'));

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

        {/* Publication Year (always shown on filtered views) */}
        <FilterSelect
          id="filter-year-global"
          label={t.common.year}
          value={yearFilter}
          onChange={setYearFilter}
        >
          <option value="all">{t.common.allYears}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </FilterSelect>

        {/* Journal Filter (shown on journal page or legacy views) */}
        {(isJournalPage || (!isInstitutionPage && !isPlatformPage)) && (
          <FilterSelect
            id="filter-journal-global"
            label={t.common.journal}
            value={journalFilter}
            onChange={setJournalFilter}
            className="min-w-[200px] max-w-[360px] flex-1"
            selectClassName="truncate"
          >
            <option value="all">{t.common.allJournals}</option>
            {journals.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </FilterSelect>
        )}

        {/* Institution Filter (shown on institution page) */}
        {isInstitutionPage && <InstitutionCombobox />}

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
