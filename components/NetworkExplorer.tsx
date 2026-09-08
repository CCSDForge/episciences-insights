'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, Grid3x3, Share2, Orbit } from 'lucide-react';
import { Publication, FundersFile } from '@/lib/types';
import { getCountryName } from '@/lib/countryNames';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import FunderCofundingMatrix from './FunderCofundingMatrix';
import FunderCofundingNetwork from './FunderCofundingNetwork';
import FunderCofundingClusterNetwork from './FunderCofundingClusterNetwork';
import FunderSankey from './FunderSankey';
import CollaborationWeb from './CollaborationWeb';
import InstitutionCofundingMatrix from './InstitutionCofundingMatrix';
import CountryCollaborationNetwork from './CountryCollaborationNetwork';
import CountryCollaborationMatrix from './CountryCollaborationMatrix';
import CountryGeographicFlowMap from './CountryGeographicFlowMap';
import MscCoOccurrenceNetwork from './MscCoOccurrenceNetwork';
import MscCoOccurrenceMatrix from './MscCoOccurrenceMatrix';
import TopicCoOccurrenceMatrix from './TopicCoOccurrenceMatrix';
import TopicCoOccurrenceNetwork from './TopicCoOccurrenceNetwork';

// react-simple-maps projects each Marker's [lng, lat] through d3-geo's
// trigonometric math, which the JS spec allows to differ in its lowest bits
// between engine builds — server (Node) vs client (browser) then disagree by
// a few ULPs on the resulting `transform`/`r`, tripping React's hydration
// mismatch check. Client-only rendering sidesteps it entirely.
const FunderGeographicFlowMap = dynamic(() => import('./FunderGeographicFlowMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 animate-pulse" />,
});

interface NetworkExplorerProps {
  data: Publication[];
  funders: FundersFile;
}

type FunderView = 'matrix' | 'network' | 'cluster';
type ReachView = 'network' | 'matrix';
type CountryView = 'network' | 'matrix';
type MscView = 'network' | 'matrix';
type TopicView = 'matrix' | 'network';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

function ViewToggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: ToggleOption<T>[] }) {
  return (
    <div role="group" aria-label="View mode toggle" className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 border-zinc-200 dark:border-zinc-600 ${
            value === opt.value ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function NetworkExplorer({ data, funders }: NetworkExplorerProps) {
  const { t, locale } = useTranslation();
  const [yearFilter, setYearFilter] = useState('all');
  const [journalFilter, setJournalFilter] = useState('all');
  const [funderView, setFunderView] = useState<FunderView>('matrix');
  const [reachView, setReachView] = useState<ReachView>('network');
  const [reachCountryFilter, setReachCountryFilter] = useState('all');
  const [countryView, setCountryView] = useState<CountryView>('network');
  const [countryFilter, setCountryFilter] = useState('all');
  const [mscView, setMscView] = useState<MscView>('matrix');
  const [topicView, setTopicView] = useState<TopicView>('matrix');

  const numLocale = locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US';

  const years = useMemo(
    () => Array.from(new Set(data.map((p) => p.year.toString()))).sort().reverse(),
    [data]
  );

  const journals = useMemo(() => {
    const unique = new Map<string, string>();
    data.forEach((p) => {
      const name = p.journal.name?.replace(/\s+/g, ' ').trim();
      if (name) unique.set(p.journal.code || p.journal.issn || name, name);
    });
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const filteredData = useMemo(() => data.filter((p) => {
    const yearMatch = yearFilter === 'all' || p.year.toString() === yearFilter;
    const journalMatch = journalFilter === 'all' || p.journal.code === journalFilter || p.journal.issn === journalFilter || p.journal.name === journalFilter;
    return yearMatch && journalMatch;
  }), [data, yearFilter, journalFilter]);

  const countryOptions = useMemo(() => {
    const codes = new Set<string>();
    filteredData.forEach((p) => p.authors.forEach((a) => a.institutions.forEach((inst) => {
      if (inst.country) codes.add(inst.country.toUpperCase());
    })));
    return Array.from(codes)
      .map((code) => [code, getCountryName(code)] as const)
      .sort((a, b) => a[1].localeCompare(b[1]));
  }, [filteredData]);

  // Scoped to the Global Reach section only — same "any author affiliated
  // there" rule as the Country Collaboration filter below, so the
  // institution network/matrix narrows to institutions that have at least
  // one publication with a co-author in the selected country.
  const reachScopedData = useMemo(() => {
    if (reachCountryFilter === 'all') return filteredData;
    return filteredData.filter((p) => p.authors.some((a) => a.institutions.some((inst) => inst.country?.toUpperCase() === reachCountryFilter)));
  }, [filteredData, reachCountryFilter]);

  // Scoped to the Country Collaboration section only — keeps a publication
  // whenever ANY author is affiliated in the selected country, so the
  // network/matrix/flow-map all narrow to that country's collaboration ties
  // (including its ties to every co-authoring country) rather than to that
  // country alone.
  const countryScopedData = useMemo(() => {
    if (countryFilter === 'all') return filteredData;
    return filteredData.filter((p) => p.authors.some((a) => a.institutions.some((inst) => inst.country?.toUpperCase() === countryFilter)));
  }, [filteredData, countryFilter]);

  return (
    <div className="space-y-16">
      <section aria-label="Filters" className="flex flex-wrap items-end gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex flex-col gap-3">
          <label htmlFor="network-filter-year" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {t.common.year}
          </label>
          <div className="relative">
            <select
              id="network-filter-year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="min-w-[140px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
            >
              <option value="all">{t.common.allYears}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="network-filter-journal" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {t.common.journal}
          </label>
          <div className="relative">
            <select
              id="network-filter-journal"
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="min-w-[240px] max-w-[300px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
            >
              <option value="all">{t.common.allJournals}</option>
              {journals.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 pb-2.5">
          {filteredData.length.toLocaleString(numLocale)} {t.common.of} {data.length.toLocaleString(numLocale)} {t.common.publications.toLowerCase()}
        </p>
      </section>

      <section aria-labelledby="funders-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="funders-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.funderHeading}</h2>
          <ViewToggle
            value={funderView}
            onChange={setFunderView}
            options={[
              { value: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={14} /> },
              { value: 'network', label: t.common.network, icon: <Share2 size={14} /> },
              { value: 'cluster', label: t.common.cluster, icon: <Orbit size={14} /> },
            ]}
          />
        </div>
        {funderView === 'matrix' && <FunderCofundingMatrix data={filteredData} />}
        {funderView === 'network' && <FunderCofundingNetwork data={filteredData} />}
        {funderView === 'cluster' && <FunderCofundingClusterNetwork data={filteredData} />}
      </section>

      <section aria-labelledby="funder-geography-heading" className="space-y-6">
        <h2 id="funder-geography-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.funderGeoHeading}</h2>
        <FunderSankey data={filteredData} funders={funders} />
        <FunderGeographicFlowMap data={filteredData} funders={funders} />
      </section>

      <section aria-labelledby="institutions-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="institutions-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.reachHeading}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                id="network-filter-reach-country"
                value={reachCountryFilter}
                onChange={(e) => setReachCountryFilter(e.target.value)}
                aria-label={t.common.country}
                className="min-w-[180px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
              >
                <option value="all">{t.common.allCountries}</option>
                {countryOptions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" aria-hidden="true" />
            </div>
            <ViewToggle
              value={reachView}
              onChange={setReachView}
              options={[
                { value: 'network', label: t.common.network, icon: <Share2 size={14} /> },
                { value: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={14} /> },
              ]}
            />
          </div>
        </div>
        {reachCountryFilter !== 'all' && (
          <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t.networkExplorer.reachScopedNotice
              .replace('{country}', getCountryName(reachCountryFilter))
              .replace('{shown}', reachScopedData.length.toLocaleString(numLocale))
              .replace('{total}', filteredData.length.toLocaleString(numLocale))}
          </p>
        )}
        {reachView === 'network'
          ? <CollaborationWeb data={reachScopedData} />
          : <InstitutionCofundingMatrix data={reachScopedData} />}
      </section>

      <section aria-labelledby="countries-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="countries-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.countryCollabHeading}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                id="network-filter-country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                aria-label={t.common.country}
                className="min-w-[180px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
              >
                <option value="all">{t.common.allCountries}</option>
                {countryOptions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" aria-hidden="true" />
            </div>
            <ViewToggle
              value={countryView}
              onChange={setCountryView}
              options={[
                { value: 'network', label: t.common.network, icon: <Share2 size={14} /> },
                { value: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={14} /> },
              ]}
            />
          </div>
        </div>
        {countryFilter !== 'all' && (
          <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t.networkExplorer.countryScopedNotice
              .replace('{country}', getCountryName(countryFilter))
              .replace('{shown}', countryScopedData.length.toLocaleString(numLocale))
              .replace('{total}', filteredData.length.toLocaleString(numLocale))}
          </p>
        )}
        {countryView === 'network'
          ? <CountryCollaborationNetwork data={countryScopedData} />
          : <CountryCollaborationMatrix data={countryScopedData} />}
        <CountryGeographicFlowMap data={countryScopedData} />
      </section>

      <section aria-labelledby="msc-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="msc-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.mscHeading}</h2>
          <ViewToggle
            value={mscView}
            onChange={setMscView}
            options={[
              { value: 'network', label: t.common.network, icon: <Share2 size={14} /> },
              { value: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={14} /> },
            ]}
          />
        </div>
        {mscView === 'network'
          ? <MscCoOccurrenceNetwork data={filteredData} />
          : <MscCoOccurrenceMatrix data={filteredData} />}
      </section>

      <section aria-labelledby="topics-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="topics-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">{t.networkExplorer.topicsHeading}</h2>
          <ViewToggle
            value={topicView}
            onChange={setTopicView}
            options={[
              { value: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={14} /> },
              { value: 'network', label: t.common.network, icon: <Share2 size={14} /> },
            ]}
          />
        </div>
        {topicView === 'matrix'
          ? <TopicCoOccurrenceMatrix data={filteredData} />
          : <TopicCoOccurrenceNetwork data={filteredData} />}
      </section>
    </div>
  );
}
