'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Eye,
  Users,
  Library,
  Wallet,
  Info,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import WorldMap from '@/components/WorldMap';
import CountryInstitutionsExplorer from '@/components/CountryInstitutionsExplorer';
import TopicTreeMap from '@/components/TopicTreeMap';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import FunderStoryline from '@/components/FunderStoryline';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getCountryName } from '@/lib/countryNames';

export default function JournalSection() {
  const { locale } = useTranslation();
  const { state, data } = useDashboard();
  const { journalFilter } = state;
  const { filteredData, usageSummary, funderData, countryData } = data;

  // View state for topics quadrant
  const [topicView, setTopicView] = useState<'treemap' | 'network' | 'msc'>('treemap');

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Resolve current journal name
  const currentJournalName = useMemo(() => {
    if (journalFilter === 'all') {
      return locale === 'fr' ? 'Toutes les revues' : locale === 'es' ? 'Todas las revistas' : 'All journals';
    }
    const sample = filteredData.find(
      (p) => p.journal.code === journalFilter || p.journal.issn === journalFilter || p.journal.name === journalFilter
    );
    return sample?.journal.name || journalFilter;
  }, [journalFilter, filteredData, locale]);

  // Resolve rvcode for KPI downloads
  const rvcode = useMemo(() => {
    if (!usageSummary || journalFilter === 'all') return null;
    return usageSummary.journalIssnToRvcode?.[journalFilter] ?? journalFilter;
  }, [usageSummary, journalFilter]);

  // Usage temporal timeline for the selected journal
  const currentYearStr = String(usageSummary?.currentYear || new Date().getFullYear());

  const usageTimelineData = useMemo(() => {
    if (!usageSummary) return [];
    const source = rvcode ? usageSummary.journalYearlySummary[rvcode] || {} : usageSummary.yearlySummary;
    const entries = Object.entries(source)
      .map(([year, val]) => ({
        year,
        downloads: val.downloads as number | null,
        views: val.views as number | null,
        downloadsIncomplete: null as number | null,
        viewsIncomplete: null as number | null,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const currentIndex = entries.findIndex((e) => e.year === currentYearStr);
    if (currentIndex === -1) return entries;

    return entries.map((entry, idx) => {
      if (idx === currentIndex - 1) {
        // Bridge connecting prior full year to current partial year
        return {
          ...entry,
          downloadsIncomplete: entry.downloads,
          viewsIncomplete: entry.views,
        };
      }
      if (idx === currentIndex) {
        // Current year in progress: switch to dashed series
        return {
          ...entry,
          downloadsIncomplete: entry.downloads,
          viewsIncomplete: entry.views,
          downloads: null,
          views: null,
        };
      }
      return entry;
    });
  }, [usageSummary, rvcode, currentYearStr]);

  // Readership countries for the selected journal
  const readershipCountries = useMemo(() => {
    if (!usageSummary) return [];
    const countryMap = rvcode ? usageSummary.journalCountrySummary[rvcode] || {} : usageSummary.countryYearlySummary;
    const entries = Object.entries(countryMap).map(([code, stats]) => {
      const s = stats as { downloads?: number; views?: number; all?: { downloads: number; views: number } };
      const downloads = typeof s.downloads === 'number' ? s.downloads : s.all?.downloads || 0;
      const views = typeof s.views === 'number' ? s.views : s.all?.views || 0;
      return {
        code,
        name: getCountryName(code),
        downloads,
        views,
        total: downloads + views,
      };
    });
    return entries.sort((a, b) => b.total - a.total).slice(0, 10);
  }, [usageSummary, rvcode]);

  // Top articles of the journal
  const topArticles = useMemo(() => {
    if (!usageSummary) return [];
    if (rvcode && usageSummary.journalTopPapers[rvcode]) {
      return usageSummary.journalTopPapers[rvcode].slice(0, 5);
    }
    return [];
  }, [usageSummary, rvcode]);

  // Authentic overlay repositories from Episciences (HAL, arXiv, Zenodo...)
  const hostingRepositories = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((p) => {
      const repo = p.episciences?.overlay_repository;
      if (repo) {
        counts[repo] = (counts[repo] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  return (
    <section aria-labelledby="journal-section-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Purpose Banner: Décrire l'utilisation + sources */}
      <div className="rounded-3xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-white dark:via-zinc-900 to-transparent p-6 sm:p-8 ring-1 ring-[var(--episciences-cyan-01)]/30 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <BookOpen size={20} />
              </span>
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {locale === 'fr' ? 'Statistiques à l’usage des revues' : 'Journal Dashboard'}
              </span>
            </div>
            <h1 id="journal-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentJournalName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {locale === 'fr'
                ? 'Cet espace est conçu pour les comités éditoriaux et les équipes de revues hébergées sur Episciences. Il permet de suivre l’audience de vos articles (lectorat), la diversité géographique de vos auteurs (autorat), le paysage thématique et les financeurs des projets soutenant vos publications.'
                : 'This section is designed for editorial boards and journal teams hosted on Episciences. It provides readership insights (downloads and views), geographical authorship reach, topic landscapes, and associated research funders.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] shrink-0" />
            <span>
              {locale === 'fr'
                ? 'Sources : API Episciences, métriques de téléchargement internes, OpenAlex, OpenAIRE & zbMATH Open.'
                : 'Sources: Episciences API, platform usage analytics, OpenAlex, OpenAIRE & zbMATH Open.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Four Quadrants (Single column layout) */}
      <div className="flex flex-col gap-8">
        {/* =========================================================================
            QUADRANT 1: LECTORAT
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Eye size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Lectorat' : 'Readership'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Dynamique d’usage & Pays du lectorat' : 'Usage trends & Readership geography'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline usage chart */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {locale === 'fr' ? 'Dynamique des consultations' : 'Consultation Trends'}
              </h3>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                {locale === 'fr'
                  ? `* ${currentYearStr} en cours (données partielles)`
                  : locale === 'es'
                  ? `* ${currentYearStr} en curso (datos parciales)`
                  : `* ${currentYearStr} in progress (partial data)`}
              </span>
            </div>
            <div className="h-64 w-full">
              <ChartContainer>
                <AreaChart data={usageTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0aa0be" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0aa0be" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#57bec3" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#57bec3" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: string) => (val === currentYearStr ? `${val}*` : val)}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                    labelFormatter={(label: unknown) => {
                      const yr = String(label ?? '');
                      return yr === currentYearStr
                        ? `${yr} (${locale === 'fr' ? 'année en cours - partiel' : locale === 'es' ? 'año en curso - parcial' : 'year in progress - partial'})`
                        : yr;
                    }}
                    formatter={(val: unknown, name: unknown) => {
                      const isDl = String(name).toLowerCase().includes('download');
                      const title = isDl
                        ? locale === 'fr' ? 'Téléchargements' : 'Downloads'
                        : locale === 'fr' ? 'Vues des résumés' : 'Abstract Views';
                      return [formatNum(Number(val) || 0), title];
                    }}
                  />
                  {/* Solid area for complete years */}
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke="#0aa0be"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dlGrad)"
                    name="downloads"
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#57bec3"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pvGrad)"
                    name="views"
                    connectNulls={false}
                  />
                  {/* Dashed line for in-progress current year */}
                  <Area
                    type="monotone"
                    dataKey="downloadsIncomplete"
                    stroke="#0aa0be"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="downloadsIncomplete"
                    legendType="none"
                    dot={{ r: 4, fill: '#0aa0be', strokeWidth: 1.5, stroke: '#ffffff' }}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="viewsIncomplete"
                    stroke="#57bec3"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="viewsIncomplete"
                    legendType="none"
                    dot={{ r: 4, fill: '#57bec3', strokeWidth: 1.5, stroke: '#ffffff' }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* Readership top countries */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Top pays du lectorat' : 'Top Readership Countries'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {readershipCountries.slice(0, 5).map((c) => (
                <div key={c.code} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-center">
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate" title={c.name}>
                    {c.name}
                  </div>
                  <div className="text-xs font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] mt-0.5">
                    {formatNum(c.total)}
                  </div>
                  <div className="text-[9px] text-zinc-400">
                    {formatNum(c.downloads)} dl
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top consulted articles if available */}
          {topArticles.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {locale === 'fr' ? 'Articles les plus consultés' : 'Most Consulted Articles'}
              </h3>
              <ul className="space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
                {topArticles.slice(0, 3).map((art) => (
                  <li key={art.doi} className="pt-2 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1" title={art.title}>
                        {art.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{art.doi}</p>
                    </div>
                    <span className="shrink-0 font-bold text-zinc-700 dark:text-zinc-300">
                      {formatNum(art.downloads)} dl
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* =========================================================================
            QUADRANT 2: AUTORAT
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Autorat' : 'Authorship'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Affiliations auteurs & Pays contributeurs' : 'Author affiliations & Contributing countries'}
                </p>
              </div>
            </div>
          </div>

          {/* Geographic author footprint map */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Origine géographique des auteurs' : 'Geographic Reach of Authors'}
            </h3>
            <div className="w-full aspect-[16/9] min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <WorldMap data={countryData} />
            </div>
          </div>

          {/* Contributing Institutions */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Top établissements d’affiliation' : 'Top Author Institutions'}
            </h3>
            <CountryInstitutionsExplorer data={filteredData} />
          </div>

          {/* Open Science footprint: Hosting Repositories */}
          {hostingRepositories.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {locale === 'fr' ? 'Entrepôts d’origine (Overlay)' : 'Source Preprint Repositories'}
                </h3>
                <span className="text-[11px] text-zinc-500 font-medium">HAL, arXiv, Zenodo...</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hostingRepositories.map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <span>{repo.name}</span>
                    <span className="rounded-md bg-white dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      {formatNum(repo.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            QUADRANT 3: THÉMATIQUES
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Library size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Thématiques' : 'Research Topics'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Vue d’ensemble & Co-thématiques' : 'Topic Overview & Co-occurrences'}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setTopicView('treemap')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'treemap'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Treemap' : 'Treemap'}
              </button>
              <button
                type="button"
                onClick={() => setTopicView('network')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'network'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Réseau' : 'Network'}
              </button>
              <button
                type="button"
                onClick={() => setTopicView('msc')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'msc'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
                title="Mathematics Subject Classification 2020 (zbMATH Open)"
              >
                MSC 2020
              </button>
            </div>
          </div>

          {/* Dynamic Topics Display */}
          <div className="min-h-[480px] w-full">
            {topicView === 'treemap' && <TopicTreeMap data={filteredData} />}
            {topicView === 'network' && <TopicCoOccurrenceNetwork data={filteredData} />}
            {topicView === 'msc' && <MscCoOccurrenceNetwork data={filteredData} />}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 4: FINANCEURS
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Financeurs' : 'Research Funders'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Évolution temporelle & Volume par bailleur' : 'Grants Timeline & Funder Breakdown'}
                </p>
              </div>
            </div>
          </div>

          {/* Funder Storyline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Évolution chronologique des financements' : 'Funding Timeline'}
            </h3>
            <FunderStoryline data={filteredData} />
          </div>

          {/* Funder Top Breakdown */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Principaux organismes financeurs' : 'Top Funding Agencies'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {funderData.slice(0, 6).map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-xs"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={f.name}>
                    {f.name}
                  </span>
                  <span className="rounded-md bg-white dark:bg-zinc-700 px-2 py-0.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
