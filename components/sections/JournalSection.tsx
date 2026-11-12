'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  BookOpen,
  Eye,
  Users,
  Library,
  Wallet,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import ChartExportMenu from '@/components/ChartExportMenu';
import WorldMap from '@/components/WorldMap';
import CountryInstitutionsExplorer from '@/components/CountryInstitutionsExplorer';
import TopicTreeMap from '@/components/TopicTreeMap';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import FunderStoryline from '@/components/FunderStoryline';
import OverlayRepositorySpectrum from '@/components/OverlayRepositorySpectrum';
import GlobalFilterBar from '@/components/GlobalFilterBar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getCountryName } from '@/lib/countryNames';

export default function JournalSection() {
  const { t } = useTranslation();
  const { state, data } = useDashboard();
  const { journalFilter } = state;
  const { filteredData, usageSummary, funderData, countryData } = data;

  // View state for topics quadrant
  const [topicView, setTopicView] = useState<'treemap' | 'network' | 'msc'>('treemap');

  const usageTimelineRef = useRef<HTMLDivElement>(null);
  const readershipMapRef = useRef<HTMLDivElement>(null);
  const authorshipMapRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const fundersRef = useRef<HTMLDivElement>(null);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Resolve current journal name
  const currentJournalName = useMemo(() => {
    if (journalFilter === 'all') {
      return t.journalSection.allJournals;
    }
    const sample = filteredData.find(
      (p) => p.journal.code === journalFilter || p.journal.issn === journalFilter || p.journal.name === journalFilter
    );
    return sample?.journal.name || journalFilter;
  }, [journalFilter, filteredData, t]);

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
        downloadsProjected: null as number | null,
        viewsProjected: null as number | null,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const currentIndex = entries.findIndex((e) => e.year === currentYearStr);
    if (currentIndex === -1) return entries;

    const refDate = usageSummary.generatedAt ? new Date(usageSummary.generatedAt) : new Date();
    const currentYearNum = Number(currentYearStr) || refDate.getFullYear();
    const startOfYear = new Date(currentYearNum, 0, 1);
    const startOfNextYear = new Date(currentYearNum + 1, 0, 1);
    const elapsedFraction = Math.min(
      1,
      Math.max(0.01, (refDate.getTime() - startOfYear.getTime()) / (startOfNextYear.getTime() - startOfYear.getTime()))
    );

    const project = (val: number | null) =>
      val != null && elapsedFraction > 0 ? Math.round(val / elapsedFraction) : val;

    const current = entries[currentIndex];

    return entries.map((entry, idx) => {
      if (idx === currentIndex - 1) {
        // Bridge connecting prior full year to current projected year
        return {
          ...entry,
          downloadsProjected: entry.downloads,
          viewsProjected: entry.views,
        };
      }
      if (idx === currentIndex) {
        // Current year in progress: switch to dashed projected series
        return {
          ...entry,
          downloadsProjected: project(current.downloads),
          viewsProjected: project(current.views),
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
    return entries.sort((a, b) => b.total - a.total).slice(0, 20);
  }, [usageSummary, rvcode]);

  // Complete readership world map data (ISO2 -> total consultations)
  const readershipMapData = useMemo(() => {
    if (!usageSummary) return [];
    const countryMap = rvcode ? usageSummary.journalCountrySummary[rvcode] || {} : usageSummary.countryYearlySummary;
    return Object.entries(countryMap)
      .map(([code, stats]) => {
        const s = stats as { downloads?: number; views?: number; all?: { downloads: number; views: number } };
        const downloads = typeof s.downloads === 'number' ? s.downloads : s.all?.downloads || 0;
        const views = typeof s.views === 'number' ? s.views : s.all?.views || 0;
        return {
          name: code,
          value: downloads + views,
        };
      })
      .filter((d) => d.value > 0);
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

  // Total count of articles with identified overlay repository
  const totalOverlayRepos = useMemo(() => {
    return hostingRepositories.reduce((acc, r) => acc + r.count, 0);
  }, [hostingRepositories]);

  return (
    <section aria-labelledby="journal-section-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Purpose Banner: Décrire l'utilisation + sources */}
      <div className="rounded-3xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-white dark:via-zinc-900 to-transparent p-6 sm:p-8 ring-1 ring-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <BookOpen size={20} />
              </span>
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {currentJournalName}
              </span>
            </div>
            <h1 id="journal-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.journalSection.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {t.journalSection.description}
            </p>
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <GlobalFilterBar />

      {/* 2. Four Quadrants (Single column layout) */}
      <div className="flex flex-col gap-8">
        {/* =========================================================================
            QUADRANT 1: LECTORAT
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Eye size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.journalSection.readership}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.journalSection.readershipSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline usage chart */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.journalSection.consultationTrends}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                  {t.journalSection.yearEndEstimate.replace('{year}', currentYearStr)}
                </span>
                <ChartExportMenu
                  targetRef={usageTimelineRef}
                  data={usageTimelineData}
                  filename={`episciences-journal-usage-${journalFilter}`}
                  csvColumns={[
                    { key: 'year', header: 'Year' },
                    { key: 'downloads', header: 'Downloads' },
                    { key: 'views', header: 'Views' },
                  ]}
                />
              </div>
            </div>
            <div ref={usageTimelineRef} className="h-64 w-full">
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
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const yr = String(label ?? '');
                      const isCurrent = yr === currentYearStr;
                      const seen = new Set<string>();
                      const uniqueItems = payload.filter((item) => {
                        const key = String(item.dataKey || '');
                        const metric = key.toLowerCase().includes('download') ? 'dl' : 'pv';
                        if (seen.has(metric) || item.value == null) return false;
                        seen.add(metric);
                        return true;
                      });

                      return (
                        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 shadow-lg text-xs space-y-1.5">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {isCurrent
                              ? `${yr} (${t.journalSection.yearEndEstimateParenthesis})`
                              : yr}
                          </p>
                          {uniqueItems.map((item) => {
                            const isDl = String(item.dataKey).toLowerCase().includes('download');
                            const color = isDl ? '#0aa0be' : '#57bec3';
                            const title = isDl
                              ? t.journalSection.downloads
                              : t.journalSection.abstractViews;
                            return (
                              <div key={String(item.dataKey)} className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-300">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                  {title}
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {formatNum(Number(item.value) || 0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
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
                  {/* Dashed line for projected current year */}
                  <Area
                    type="monotone"
                    dataKey="downloadsProjected"
                    stroke="#0aa0be"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="downloadsProjected"
                    legendType="none"
                    dot={{ r: 4, fill: '#0aa0be', strokeWidth: 1.5, stroke: '#ffffff' }}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="viewsProjected"
                    stroke="#57bec3"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="viewsProjected"
                    legendType="none"
                    dot={{ r: 4, fill: '#57bec3', strokeWidth: 1.5, stroke: '#ffffff' }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* Readership geographic footprint map */}
          {readershipMapData.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {t.journalSection.geographicReachReadership}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {t.journalSection.activeCountries.replace('{count}', formatNum(readershipMapData.length))}
                  </span>
                  <ChartExportMenu
                    targetRef={readershipMapRef}
                    data={readershipMapData}
                    filename={`episciences-journal-readership-map-${journalFilter}`}
                    csvColumns={[
                      { key: 'name', header: 'Country_Code' },
                      { key: 'name', header: 'Country_Name', formatter: (v) => (v ? getCountryName(String(v)) : '') },
                      { key: 'value', header: 'Consultations' },
                    ]}
                  />
                </div>
              </div>
              <div ref={readershipMapRef} className="w-full aspect-[16/9] min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <WorldMap
                  data={readershipMapData}
                  legendLabel={t.journalSection.readershipByCountry}
                  valueUnit={t.journalSection.consultationsUnit}
                  colorRange={['#e0f7f8', '#0aa0be']}
                  tooltipId="readership-world-map-tooltip"
                />
              </div>
            </div>
          )}

          {/* Readership top countries and territories */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.journalSection.top10Countries}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {readershipCountries.slice(0, 10).map((c) => (
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
                {t.journalSection.mostConsultedArticles}
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
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.journalSection.authorship}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.journalSection.authorshipSubtitle}
                </p>
              </div>
            </div>
            <ChartExportMenu
              targetRef={authorshipMapRef}
              data={countryData.map((c) => ({
                countryCode: c.name,
                countryName: getCountryName(c.name),
                publications: c.value,
              }))}
              filename={`episciences-journal-authorship-countries-${journalFilter}`}
              csvColumns={[
                { key: 'countryCode', header: 'Country_Code' },
                { key: 'countryName', header: 'Country_Name' },
                { key: 'publications', header: 'Publications_Count' },
              ]}
            />
          </div>

          {/* Geographic author footprint map */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.journalSection.geographicReachAuthors}
            </h3>
            <div ref={authorshipMapRef} className="w-full aspect-[16/9] min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <WorldMap data={countryData} tooltipId="authorship-world-map-tooltip" />
            </div>
          </div>

          {/* Contributing Institutions */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.journalSection.topAuthorInstitutions}
            </h3>
            <CountryInstitutionsExplorer data={filteredData} />
          </div>

          {/* Open Science footprint: Hosting Repositories */}
          {hostingRepositories.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    {t.journalSection.sourceRepositories}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t.journalSection.sourceRepositoriesDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-medium shrink-0">
                    {t.journalSection.indexedArticles.replace('{count}', formatNum(totalOverlayRepos))}
                  </span>
                  <ChartExportMenu
                    data={hostingRepositories.map((r) => ({
                      repository: r.name,
                      count: r.count,
                      percentage: `${((r.count / (totalOverlayRepos || 1)) * 100).toFixed(1)}%`,
                    }))}
                    filename={`episciences-journal-overlay-repositories-${journalFilter}`}
                    csvColumns={[
                      { key: 'repository', header: 'Repository' },
                      { key: 'count', header: 'Count' },
                      { key: 'percentage', header: 'Percentage' },
                    ]}
                  />
                </div>
              </div>
              <OverlayRepositorySpectrum repositories={hostingRepositories} total={totalOverlayRepos} />
            </div>
          )}
        </div>

        {/* =========================================================================
            QUADRANT 3: THÉMATIQUES
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Library size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.journalSection.researchTopics}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.journalSection.topicsSubtitle}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={t.journalSection.topicViewModeAria} className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setTopicView('treemap')}
                  aria-pressed={topicView === 'treemap'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    topicView === 'treemap'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {t.journalSection.treemap}
                </button>
                <button
                  type="button"
                  onClick={() => setTopicView('network')}
                  aria-pressed={topicView === 'network'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    topicView === 'network'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {t.journalSection.network}
                </button>
                <button
                  type="button"
                  onClick={() => setTopicView('msc')}
                  aria-pressed={topicView === 'msc'}
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

              <ChartExportMenu
                targetRef={topicsRef}
                filename={`episciences-journal-topics-${topicView}-${journalFilter}`}
              />
            </div>
          </div>

          {/* Dynamic Topics Display */}
          <div ref={topicsRef} className="min-h-[480px] w-full">
            {topicView === 'treemap' && <TopicTreeMap data={filteredData} />}
            {topicView === 'network' && <TopicCoOccurrenceNetwork data={filteredData} />}
            {topicView === 'msc' && <MscCoOccurrenceNetwork data={filteredData} />}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 4: FINANCEURS
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.journalSection.researchFunders}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.journalSection.fundersSubtitle}
                </p>
              </div>
            </div>

            <ChartExportMenu
              targetRef={fundersRef}
              data={funderData}
              filename={`episciences-journal-funders-${journalFilter}`}
              csvColumns={[
                { key: 'name', header: 'Funder_Name' },
                { key: 'value', header: 'Publications_Count' },
              ]}
            />
          </div>

          {/* Funder Storyline */}
          <div ref={fundersRef} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.journalSection.fundingTimeline}
            </h3>
            <FunderStoryline data={filteredData} />
          </div>

          {/* Funder Top Breakdown */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.journalSection.topFundingAgencies}
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
