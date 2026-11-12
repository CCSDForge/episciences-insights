'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  Library,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import ChartExportMenu from '@/components/ChartExportMenu';
import CountryCollaborationNetwork from '@/components/CountryCollaborationNetwork';
import CountryCollaborationMatrix from '@/components/CountryCollaborationMatrix';
import CountryGeographicFlowMap from '@/components/CountryGeographicFlowMap';
import TopicTreeMap from '@/components/TopicTreeMap';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import FunderStoryline from '@/components/FunderStoryline';
import GlobalFilterBar from '@/components/GlobalFilterBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getCountryName } from '@/lib/countryNames';

export default function InstitutionSection() {
  const { t } = useTranslation();
  const { state, data } = useDashboard();
  const { institutionFilter } = state;
  const { filteredData, funderData, institutionsList, globalReachStats } = data;

  const [collabView, setCollabView] = useState<'network' | 'matrix' | 'flow'>('network');
  const [topicView, setTopicView] = useState<'treemap' | 'network' | 'msc'>('treemap');
  const [journalLimit, setJournalLimit] = useState<'all' | '10'>('all');

  const collabRef = useRef<HTMLDivElement>(null);
  const journalsChartRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const fundersRef = useRef<HTMLDivElement>(null);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Currently selected institution object
  const currentInstitution = useMemo(() => {
    if (institutionFilter === 'all') return null;
    return (
      institutionsList.find(
        (i) => i.id === institutionFilter || i.ror === institutionFilter || i.name === institutionFilter
      ) || null
    );
  }, [institutionFilter, institutionsList]);

  // Distribution of the institution's publications across Episciences journals (all with >= 1 publication)
  const allJournalDistribution = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    filteredData.forEach((p) => {
      const name = p.journal.name || 'Unknown Journal';
      if (!counts[name]) counts[name] = { name, count: 0 };
      counts[name].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const displayedJournals = useMemo(() => {
    if (journalLimit === '10') {
      return allJournalDistribution.slice(0, 10);
    }
    return allJournalDistribution;
  }, [allJournalDistribution, journalLimit]);

  const journalChartHeight = useMemo(() => {
    return Math.max(380, displayedJournals.length * 32);
  }, [displayedJournals]);

  // Partner countries with which this institution collaborates
  const partnerCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((p) => {
      p.authors.forEach((a) => {
        a.institutions.forEach((inst) => {
          if (inst.country) {
            counts[inst.country] = (counts[inst.country] || 0) + 1;
          }
        });
      });
    });
    return Object.entries(counts)
      .map(([code, count]) => ({
        code,
        name: getCountryName(code),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredData]);

  // Data for exporting the list of institutions (CSV and JSON)
  const institutionsExportData = useMemo(() => {
    const isYearFiltered = state.yearFilter !== 'all';
    let list: Array<{ id: string; name: string; ror: string | null; country: string | null; count: number; affiliationsCount: number }>;

    if (!isYearFiltered) {
      list = institutionsList;
    } else {
      const map = new Map<string, { id: string; name: string; ror: string | null; country: string | null; count: number; affiliationsCount: number }>();
      const relevantPubs = data.initialData.filter((p) => String(p.year) === state.yearFilter);
      relevantPubs.forEach((p) => {
        const seenInPub = new Set<string>();
        p.authors.forEach((a) => {
          a.institutions.forEach((inst) => {
            const id = inst.ror || inst.name;
            if (!id) return;
            let entry = map.get(id);
            if (!entry) {
              entry = {
                id,
                name: inst.name,
                ror: inst.ror,
                country: inst.country,
                count: 0,
                affiliationsCount: 0,
              };
              map.set(id, entry);
            }
            entry.affiliationsCount += 1;
            if (!seenInPub.has(id)) {
              seenInPub.add(id);
              entry.count += 1;
            }
          });
        });
      });
      list = Array.from(map.values()).sort(
        (a, b) => b.count - a.count || b.affiliationsCount - a.affiliationsCount || a.name.localeCompare(b.name)
      );
    }

    if (currentInstitution) {
      list = list.filter(
        (i) =>
          i.id === currentInstitution.id ||
          (i.ror && i.ror === currentInstitution.ror) ||
          i.name === currentInstitution.name
      );
    }

    return list.map((inst) => ({
      institution: inst.name,
      countryCode: inst.country || '',
      countryName: inst.country ? getCountryName(inst.country) : '',
      rorId: inst.ror || '',
      publicationsCount: inst.count,
      affiliationsCount: inst.affiliationsCount,
    }));
  }, [institutionsList, state.yearFilter, data.initialData, currentInstitution]);

  const exportFilename = useMemo(() => {
    const parts = ['episciences'];
    if (currentInstitution) {
      const safeName = currentInstitution.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      parts.push(`institution-${safeName || 'selected'}`);
    } else {
      parts.push('institutions');
    }
    if (state.yearFilter !== 'all') {
      parts.push(state.yearFilter);
    }
    return parts.join('-');
  }, [currentInstitution, state.yearFilter]);

  const institutionCsvColumns = useMemo(
    () => [
      { key: 'institution', header: 'Institution_Name' },
      { key: 'countryCode', header: 'Country_Code' },
      { key: 'countryName', header: 'Country_Name' },
      { key: 'rorId', header: 'ROR_ID' },
      { key: 'publicationsCount', header: 'Publications_Count' },
      { key: 'affiliationsCount', header: 'Affiliations_Count' },
    ],
    []
  );

  return (
    <section aria-labelledby="institution-section-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Purpose Banner: Décrire l'utilisation + sources */}
      <div className="rounded-3xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-white dark:via-zinc-900 to-transparent p-6 sm:p-8 ring-1 ring-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Building2 size={20} />
              </span>
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {currentInstitution ? currentInstitution.name : t.institutionSection.allInstitutions}
              </span>
            </div>
            <h1 id="institution-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.institutionSection.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {t.institutionSection.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
            <ChartExportMenu
              data={institutionsExportData}
              filename={exportFilename}
              csvColumns={institutionCsvColumns}
              buttonLabel={
                currentInstitution
                  ? t.institutionSection.exportInstitution
                  : t.institutionSection.exportInstitutions
              }
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <GlobalFilterBar />

      {/* Institution Details Quick Bar (if filtered) */}
      {currentInstitution && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-bold">
              {t.institutionSection.selectedInstitution}
            </span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-black">{currentInstitution.name}</strong>
            {currentInstitution.country && (
              <span className="rounded-md bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                {currentInstitution.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">{t.institutionSection.volume}</span>
              <span className="font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {t.institutionSection.publicationsCount.replace('{count}', formatNum(filteredData.length))}
              </span>
            </div>

            {currentInstitution.ror && (
              <a
                href={currentInstitution.ror}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] hover:underline"
              >
                <span>{t.institutionSection.rorRecord}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 2. Four Quadrants (Single column layout) */}
      <div className="flex flex-col gap-8">
        {/* =========================================================================
            QUADRANT 1: AUTORAT & RÉSEAUX CO-AUTORAT
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.institutionSection.authorshipNetworks}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.institutionSection.authorshipSubtitle}
                </p>
              </div>
            </div>

            {/* Toggle views */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={t.institutionSection.collabViewModeAria} className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setCollabView('network')}
                  aria-pressed={collabView === 'network'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'network'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {t.institutionSection.network}
                </button>
                <button
                  type="button"
                  onClick={() => setCollabView('matrix')}
                  aria-pressed={collabView === 'matrix'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'matrix'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {t.institutionSection.matrix}
                </button>
                <button
                  type="button"
                  onClick={() => setCollabView('flow')}
                  aria-pressed={collabView === 'flow'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'flow'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {t.institutionSection.flows}
                </button>
              </div>

              <ChartExportMenu
                targetRef={collabRef}
                filename={`episciences-institution-collab-${collabView}-${institutionFilter}`}
              />
            </div>
          </div>

          {/* Network display */}
          <div ref={collabRef} className="min-h-[300px]">
            {collabView === 'network' && <CountryCollaborationNetwork data={filteredData} />}
            {collabView === 'matrix' && <CountryCollaborationMatrix data={filteredData} />}
            {collabView === 'flow' && <CountryGeographicFlowMap data={filteredData} />}
          </div>

          {/* Partner countries stats */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {t.institutionSection.intlCollabScope}
              </span>
              <span className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {t.institutionSection.intlCollabRate.replace('{rate}', String(globalReachStats.intlCollabRate))}
              </span>
            </div>
            {partnerCountries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partnerCountries.map((c) => (
                  <span
                    key={c.code}
                    className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {c.name} ({formatNum(c.count)})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 2: REVUES
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {t.institutionSection.journals}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.institutionSection.journalsSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Journal breakdown chart */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.institutionSection.publishingJournals.replace('{count}', String(displayedJournals.length))}
              </h3>
              <div className="flex items-center gap-2">
                {allJournalDistribution.length > 10 && (
                  <div
                    role="group"
                    aria-label={t.institutionSection.journalsToShowAria}
                    className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg shadow-inner"
                  >
                    <button
                      type="button"
                      onClick={() => setJournalLimit('all')}
                      aria-pressed={journalLimit === 'all'}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        journalLimit === 'all'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      {t.institutionSection.allCount.replace('{count}', String(allJournalDistribution.length))}
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalLimit('10')}
                      aria-pressed={journalLimit === '10'}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        journalLimit === '10'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      Top 10
                    </button>
                  </div>
                )}
                <ChartExportMenu
                  targetRef={journalsChartRef}
                  data={allJournalDistribution}
                  filename={`episciences-institution-journals-${institutionFilter}`}
                  csvColumns={[
                    { key: 'name', header: 'Journal_Name' },
                    { key: 'count', header: 'Publications_Count' },
                  ]}
                />
              </div>
            </div>
            <div ref={journalsChartRef} className="w-full max-h-[540px] overflow-y-auto pr-1">
              <div style={{ height: `${journalChartHeight}px` }} className="w-full">
                <ChartContainer minHeight={380}>
                  <BarChart
                    data={displayedJournals}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={260}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val: string) => (val.length > 36 ? `${val.slice(0, 34)}…` : val)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                      formatter={(val: unknown) => [formatNum(Number(val) || 0), t.institutionSection.publications]}
                      labelFormatter={(label: unknown) => String(label ?? '')}
                    />
                    <Bar dataKey="count" fill="#0aa0be" maxBarSize={22} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* Table summary */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.institutionSection.journalSummary}
              </h3>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {t.institutionSection.journalsRepresented.replace('{count}', String(allJournalDistribution.length))}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {allJournalDistribution.map((j) => (
                <div key={j.name} className="py-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-3">{j.name}</span>
                  <span className="font-bold text-zinc-600 dark:text-zinc-400">{formatNum(j.count)}</span>
                </div>
              ))}
            </div>
          </div>
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
                  {t.institutionSection.researchTopics}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.institutionSection.topicsSubtitle}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={t.institutionSection.topicViewModeAria} className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
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
                  {t.institutionSection.treemap}
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
                  {t.institutionSection.network}
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
                >
                  MSC 2020
                </button>
              </div>

              <ChartExportMenu
                targetRef={topicsRef}
                filename={`episciences-institution-topics-${topicView}-${institutionFilter}`}
              />
            </div>
          </div>

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
                  {t.institutionSection.researchFunders}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.institutionSection.fundersSubtitle}
                </p>
              </div>
            </div>

            <ChartExportMenu
              targetRef={fundersRef}
              data={funderData}
              filename={`episciences-institution-funders-${institutionFilter}`}
              csvColumns={[
                { key: 'name', header: 'Funder_Name' },
                { key: 'value', header: 'Publications_Count' },
              ]}
            />
          </div>

          {/* Funder Storyline */}
          <div ref={fundersRef} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.institutionSection.grantsTimeline}
            </h3>
            <FunderStoryline data={filteredData} />
          </div>

          {/* Funder List */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.institutionSection.fundingBodies}
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
