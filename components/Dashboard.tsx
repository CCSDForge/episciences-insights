'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Publication, UsageSummary, FundersFile } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { FlaskConical, Map as MapIcon, Search, ChevronDown, Library, Globe, BarChart3, Scale, Sigma, Waypoints, Route, Building2, Maximize2, Grid3x3, Share2, Orbit, RotateCcw, Info } from 'lucide-react';

import WorldMap from './WorldMap';
import SdgRadar from './SdgRadar';
import TopicTreeMap from './TopicTreeMap';
import ResearchLineage from './ResearchLineage';
import UsageAnalytics from './UsageAnalytics';
import LicenseSpectrum from './LicenseSpectrum';
import FunderStoryline from './FunderStoryline';
import CountryInstitutionsExplorer from './CountryInstitutionsExplorer';
import CountryGeographicFlowMap from './CountryGeographicFlowMap';
import CountryCollaborationNetwork from './CountryCollaborationNetwork';
import CountryCollaborationMatrix from './CountryCollaborationMatrix';
import CollaborationWeb from './CollaborationWeb';
import FullscreenModal from './FullscreenModal';
import FunderCofundingMatrix from './FunderCofundingMatrix';
import FunderCofundingNetwork from './FunderCofundingNetwork';
import FunderCofundingClusterNetwork from './FunderCofundingClusterNetwork';
import FunderSankey from './FunderSankey';
import MscCoOccurrenceNetwork from './MscCoOccurrenceNetwork';
import MscCoOccurrenceMatrix from './MscCoOccurrenceMatrix';
import TopicCoOccurrenceMatrix from './TopicCoOccurrenceMatrix';
import TopicCoOccurrenceNetwork from './TopicCoOccurrenceNetwork';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { getDomainColor } from '@/lib/domainColors';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const FunderGeographicFlowMap = dynamic(() => import('./FunderGeographicFlowMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 animate-pulse" />,
});

interface DashboardProps {
  initialData: Publication[];
  usageSummary: UsageSummary | null;
  funders?: FundersFile;
}

export default function Dashboard({ initialData, usageSummary, funders = {} }: DashboardProps) {
  return (
    <DashboardProvider initialData={initialData} usageSummary={usageSummary}>
      <DashboardContent funders={funders} />
    </DashboardProvider>
  );
}

function DashboardContent({ funders = {} }: { funders?: FundersFile }) {
  const { t } = useTranslation();
  const { state, actions, data, meta } = useDashboard();
  const { activeTab, yearFilter, funderFilter, journalFilter, funderLimit, institutionLimit, countryLimit, topicDomainFilter, isFunderOpen, funderSearch } = state;
  const { setActiveTab, setYearFilter, setFunderFilter, setJournalFilter, resetFilters, setFunderLimit, setInstitutionLimit, setCountryLimit, setTopicDomainFilter, setIsFunderOpen, setFunderSearch } = actions;
  const { filteredData, funderData, institutionData, countryData, topCountriesData, globalReachStats, topicData, topicDomains, years, groupedFunders, journals, openScienceStats } = data;
  const { dropdownRef } = meta;
  const [selectedCountry, setSelectedCountry] = React.useState<string>('FR');
  const [reachSubTab, setReachSubTab] = React.useState<'overview' | 'networks'>('overview');
  const [networkViewMode, setNetworkViewMode] = React.useState<'flow' | 'country-network' | 'institution-network' | 'country-matrix'>('flow');
  const [isReachFullscreen, setIsReachFullscreen] = React.useState(false);

  // Topics sub-navigation
  const [topicsSubTab, setTopicsSubTab] = React.useState<'overview' | 'networks'>('overview');
  const [topicsNetworkView, setTopicsNetworkView] = React.useState<'topics-network' | 'topics-matrix' | 'msc-network' | 'msc-matrix'>('topics-network');
  const [isTopicsFullscreen, setIsTopicsFullscreen] = React.useState(false);

  // Funder sub-navigation
  const [funderSubTab, setFunderSubTab] = React.useState<'overview' | 'networks'>('overview');
  const [funderNetworkView, setFunderNetworkView] = React.useState<'network' | 'matrix' | 'cluster' | 'sankey' | 'flows'>('network');
  const [isFunderFullscreen, setIsFunderFullscreen] = React.useState(false);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const hasActiveFilters = yearFilter !== 'all' || journalFilter !== 'all';

  const funderFilteredData = React.useMemo(() => {
    if (funderFilter === 'all') return filteredData;
    return filteredData.filter(p => p.awards.some(a => a.funder === funderFilter));
  }, [filteredData, funderFilter]);

  const funderSdgData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    funderFilteredData.forEach(p => p.sdgs.forEach(s => { counts[s.label] = (counts[s.label] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [funderFilteredData]);

  const DASHBOARD_TABS: { id: 'usage' | 'journal' | 'topics' | 'funder' | 'lineage'; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { id: 'usage', label: t.tabs.usage, icon: <BarChart3 size={16} aria-hidden="true" />, colorClass: 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' },
    { id: 'journal', label: t.tabs.reach, icon: <MapIcon size={16} aria-hidden="true" />, colorClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' },
    { id: 'topics', label: t.tabs.topics, icon: <Library size={16} aria-hidden="true" />, colorClass: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' },
    { id: 'funder', label: t.tabs.funders, icon: <FlaskConical size={16} aria-hidden="true" />, colorClass: 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' },
    { id: 'lineage', label: t.lineage.title, icon: <Search size={16} aria-hidden="true" />, colorClass: 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' },
  ];

  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const funderButtonRef = React.useRef<HTMLButtonElement>(null);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % DASHBOARD_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + DASHBOARD_TABS.length) % DASHBOARD_TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = DASHBOARD_TABS.length - 1;
    }

    if (targetIndex >= 0) {
      setActiveTab(DASHBOARD_TABS[targetIndex].id);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="space-y-8">
      {/* Unified Sticky Header: Navigation Tabs + Global Filter Bar */}
      <div className="sticky top-0 z-30 -mx-6 mb-8 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 shadow-sm transition-all">
        {/* Modern Tabs with WAI-ARIA and Fading Scroll */}
        <div className="fade-scroll-x overflow-x-auto scrollbar-hide flex justify-center border-b border-zinc-100 dark:border-zinc-800/60">
          <nav role="tablist" aria-label="Dashboard Views" className="flex py-3 px-6 gap-2">
            {DASHBOARD_TABS.map((tab, index) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[index] = el; }}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-full whitespace-nowrap ${
                    isSelected
                      ? tab.colorClass
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Filter Bar */}
        <section aria-label="Filters" className="px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Publication Year */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-year" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                {t.common.year}
              </label>
              <div className="relative">
                <select
                  id="filter-year"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none transition-colors"
                >
                  <option value="all">{t.common.allYears}</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Journal / Source */}
            <div className="flex items-center gap-2 min-w-[200px] max-w-[320px] flex-1">
              <label htmlFor="filter-journal" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                {t.common.journal}
              </label>
              <div className="relative flex-1">
                <select
                  id="filter-journal"
                  value={journalFilter}
                  onChange={(e) => setJournalFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none truncate transition-colors"
                >
                  <option value="all">{t.common.allJournals}</option>
                  {journals.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Reset Action & Counts */}
            <div className="flex items-center gap-3 ml-auto">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-lg transition-colors whitespace-nowrap"
                  title={t.common.resetFilters}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.common.reset}</span>
                </button>
              )}
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                <strong className="font-bold text-zinc-900 dark:text-zinc-100">{formatNum(filteredData.length)}</strong> {t.common.publications.toLowerCase()}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[600px] focus:outline-none">
        {activeTab === 'usage' && (
          <section id="panel-usage" role="tabpanel" aria-labelledby="tab-usage" tabIndex={0} className="space-y-8 animate-in fade-in duration-500 focus:outline-none">
            {/* Tab Purpose & Analytical Intent */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 border border-amber-500/20 dark:from-amber-500/15 dark:border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      <BarChart3 size={16} />
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      {t.dashboard.usageTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                    {t.dashboard.usageDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 shrink-0 bg-amber-100/60 dark:bg-amber-950/50 px-3 py-1.5 rounded-xl border border-amber-300/40 dark:border-amber-700/50">
                  <span>{t.dashboard.usageSource}</span>
                </div>
              </div>
            </div>

            <UsageAnalytics />
          </section>
        )}
        {activeTab === 'topics' && (
          <section id="panel-topics" role="tabpanel" aria-labelledby="tab-topics" tabIndex={0} className="space-y-8 animate-in fade-in duration-500 focus:outline-none">
            {/* Tab Purpose & Analytical Intent */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent p-6 border border-indigo-500/20 dark:from-indigo-500/15 dark:border-indigo-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" aria-hidden="true">
                      <Library size={16} />
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                      {t.dashboard.topicsTitle}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                    {t.dashboard.topicsDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300 shrink-0 bg-indigo-100/60 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-300/40 dark:border-indigo-700/50">
                  <span>{t.dashboard.topicsSource}</span>
                </div>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div role="group" aria-label="Topics sub-views" className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl shadow-inner">
                <button
                  onClick={() => setTopicsSubTab('overview')}
                  aria-pressed={topicsSubTab === 'overview'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    topicsSubTab === 'overview'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <BarChart3 size={15} aria-hidden="true" /> {t.dashboard.topicsOverview}
                </button>
                <button
                  onClick={() => setTopicsSubTab('networks')}
                  aria-pressed={topicsSubTab === 'networks'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    topicsSubTab === 'networks'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Share2 size={15} aria-hidden="true" /> {t.dashboard.networksAndCoOccurrences}
                </button>
              </div>

              {topicsSubTab === 'networks' && (
                <button
                  onClick={() => setIsTopicsFullscreen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors shadow-sm cursor-pointer"
                >
                  <Maximize2 size={14} aria-hidden="true" /> {t.common.fullscreen}
                </button>
              )}
            </div>

            {topicsSubTab === 'overview' ? (
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-zinc-100 pb-8 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.researchLandscape}</h3>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mt-2">{t.dashboard.interactiveTreemap}</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 max-w-2xl leading-relaxed">
                      {t.dashboard.treemapExplanation}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="flex flex-col gap-3">
                      <label htmlFor="topic-domain-select" className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        {t.dashboard.filterByDomain}
                      </label>
                      <select
                        id="topic-domain-select"
                        value={topicDomainFilter}
                        onChange={(e) => setTopicDomainFilter(e.target.value)}
                        className="min-w-[220px] rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none"
                      >
                        <option value="all">{t.dashboard.allDomains}</option>
                        {topicDomains.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-12 h-[500px] min-h-[500px] w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                  <TopicTreeMap
                    data={filteredData.filter(p => topicDomainFilter === 'all' || p.primary_topic?.domain === topicDomainFilter)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {topicData.map((topic, idx) => {
                    const domainColor = getDomainColor(topic.domain);
                    return (
                      <div
                        key={topic.id}
                        style={{ '--domain-color': domainColor } as React.CSSProperties}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-50/50 p-5 ring-1 ring-zinc-200 transition-all hover:bg-white hover:shadow-xl hover:ring-[var(--domain-color)]/40 dark:bg-zinc-800/30 dark:ring-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:ring-[var(--domain-color)]/50"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-[var(--domain-color)] transition-colors">#{idx + 1}</span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700">
                            {formatNum(topic.count)} <span className="text-zinc-400 font-bold ml-0.5">{t.common.pubs}</span>
                          </span>
                        </div>
                        <h4 className="mb-3 text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-[var(--domain-color)] transition-colors line-clamp-2 min-h-[2.5rem]">
                          {topic.name}
                        </h4>
                        <div className="space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
                          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: domainColor }}></span>
                            {topic.field}
                          </p>
                          <p className="text-[9px] font-medium text-zinc-400 italic truncate">{topic.domain}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {t.dashboard.relationalViews}
                  </span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                    <button
                      onClick={() => setTopicsNetworkView('topics-network')}
                      aria-pressed={topicsNetworkView === 'topics-network'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        topicsNetworkView === 'topics-network'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Share2 size={13} /> {t.dashboard.topicsNetwork}
                    </button>
                    <button
                      onClick={() => setTopicsNetworkView('topics-matrix')}
                      aria-pressed={topicsNetworkView === 'topics-matrix'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        topicsNetworkView === 'topics-matrix'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Grid3x3 size={13} /> {t.dashboard.topicsMatrix}
                    </button>
                    <button
                      onClick={() => setTopicsNetworkView('msc-network')}
                      aria-pressed={topicsNetworkView === 'msc-network'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        topicsNetworkView === 'msc-network'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Sigma size={13} /> {t.dashboard.mscNetwork}
                    </button>
                    <button
                      onClick={() => setTopicsNetworkView('msc-matrix')}
                      aria-pressed={topicsNetworkView === 'msc-matrix'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        topicsNetworkView === 'msc-matrix'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Grid3x3 size={13} /> {t.dashboard.mscMatrix}
                    </button>
                  </div>
                </div>

                {/* Methodological Guide for Topics Views */}
                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 border border-indigo-100 dark:border-indigo-900/40 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5">
                  <Info size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    {topicsNetworkView === 'topics-network' && (
                      <p><strong>{t.dashboard.topicsNetworkTitle}:</strong> {t.dashboard.topicsNetworkDesc}</p>
                    )}
                    {topicsNetworkView === 'topics-matrix' && (
                      <p><strong>{t.dashboard.topicsMatrixTitle}:</strong> {t.dashboard.topicsMatrixDesc}</p>
                    )}
                    {topicsNetworkView === 'msc-network' && (
                      <p><strong>{t.dashboard.mscNetworkTitle}:</strong> {t.dashboard.mscNetworkDesc}</p>
                    )}
                    {topicsNetworkView === 'msc-matrix' && (
                      <p><strong>{t.dashboard.mscMatrixTitle}:</strong> {t.dashboard.mscMatrixDesc}</p>
                    )}
                  </div>
                </div>

                {topicsNetworkView === 'topics-network' && <TopicCoOccurrenceNetwork data={filteredData} />}
                {topicsNetworkView === 'topics-matrix' && <TopicCoOccurrenceMatrix data={filteredData} />}
                {topicsNetworkView === 'msc-network' && <MscCoOccurrenceNetwork data={filteredData} />}
                {topicsNetworkView === 'msc-matrix' && <MscCoOccurrenceMatrix data={filteredData} />}
              </div>
            )}

            {isTopicsFullscreen && (
              <FullscreenModal
                isOpen={isTopicsFullscreen}
                onClose={() => setIsTopicsFullscreen(false)}
                title={
                  topicsNetworkView === 'topics-network' ? 'OpenAlex Topics Co-Occurrence Network' :
                  topicsNetworkView === 'topics-matrix' ? 'OpenAlex Topics Co-Occurrence Matrix' :
                  topicsNetworkView === 'msc-network' ? 'MSC 2020 Classification Network' :
                  'MSC 2020 Classification Matrix'
                }
                subtitle={`${filteredData.length.toLocaleString('en-US')} analyzed publications`}
              >
                {topicsNetworkView === 'topics-network' && <TopicCoOccurrenceNetwork data={filteredData} />}
                {topicsNetworkView === 'topics-matrix' && <TopicCoOccurrenceMatrix data={filteredData} />}
                {topicsNetworkView === 'msc-network' && <MscCoOccurrenceNetwork data={filteredData} />}
                {topicsNetworkView === 'msc-matrix' && <MscCoOccurrenceMatrix data={filteredData} />}
              </FullscreenModal>
            )}
          </section>
        )}

        {activeTab === 'funder' && (
          <section id="panel-funder" role="tabpanel" aria-labelledby="tab-funder" tabIndex={0} className="space-y-8 animate-in fade-in duration-500 focus:outline-none">
            {/* Tab Purpose & Analytical Intent */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent p-6 border border-teal-500/20 dark:from-teal-500/15 dark:border-teal-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300" aria-hidden="true">
                      <FlaskConical size={16} />
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-teal-900 dark:text-teal-200">
                      {t.dashboard.funderTitle}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                    {t.dashboard.funderDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300 shrink-0 bg-teal-100/60 dark:bg-teal-950/50 px-3 py-1.5 rounded-xl border border-teal-300/40 dark:border-teal-700/50">
                  <span>{t.dashboard.funderSource}</span>
                </div>
              </div>
            </div>

            {/* Sub-navigation Tabs and Funder Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div role="group" aria-label="Funder impact sub-views" className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl shadow-inner">
                <button
                  onClick={() => setFunderSubTab('overview')}
                  aria-pressed={funderSubTab === 'overview'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    funderSubTab === 'overview'
                      ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <BarChart3 size={15} aria-hidden="true" /> {t.dashboard.funderOverview}
                </button>
                <button
                  onClick={() => setFunderSubTab('networks')}
                  aria-pressed={funderSubTab === 'networks'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    funderSubTab === 'networks'
                      ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Share2 size={15} aria-hidden="true" /> {t.dashboard.funderNetworks}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Research Funder */}
                <div className="relative min-w-[240px] max-w-[320px]" ref={dropdownRef}>
                  <button
                    ref={funderButtonRef}
                    id="funder-filter-button"
                    type="button"
                    aria-label={t.dashboard.filterByFunder}
                    aria-haspopup="listbox"
                    aria-expanded={isFunderOpen}
                    onClick={() => setIsFunderOpen(!isFunderOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && isFunderOpen) {
                        e.preventDefault();
                        setIsFunderOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all text-left"
                  >
                    <span className="truncate">{funderFilter === 'all' ? t.dashboard.allFunders : funderFilter}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5 transition-transform ${isFunderOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {isFunderOpen && (
                    <div
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsFunderOpen(false);
                          funderButtonRef.current?.focus();
                        }
                      }}
                      className="absolute right-0 z-50 mt-1 w-[320px] rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                          <input
                            autoFocus
                            id="funder-search-input"
                            aria-label={t.dashboard.filterByFunder}
                            type="text"
                            placeholder={t.dashboard.funderSearchPlaceholder}
                            value={funderSearch}
                            onChange={(e) => setFunderSearch(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                      <ul role="listbox" aria-label="Funding agencies list" className="max-h-[300px] overflow-y-auto py-1 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                        <li
                          role="option"
                          aria-selected={funderFilter === 'all'}
                          onClick={() => { setFunderFilter('all'); setIsFunderOpen(false); setFunderSearch(''); }}
                          className={`px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer font-bold border-b border-zinc-50 dark:border-zinc-800 transition-colors uppercase text-xs tracking-wider ${funderFilter === 'all' ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/10' : 'text-zinc-900 dark:text-zinc-100'}`}
                        >
                          {t.dashboard.allFunders}
                        </li>
                        {Object.entries(groupedFunders).map(([letter, list]) => (
                          <React.Fragment key={letter}>
                            <li className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sticky top-0 z-10 backdrop-blur-sm border-y border-zinc-100 dark:border-zinc-800">
                              {letter}
                            </li>
                            {list.map(f => (
                              <li
                                key={f}
                                role="option"
                                aria-selected={funderFilter === f}
                                onClick={() => { setFunderFilter(f); setIsFunderOpen(false); setFunderSearch(''); }}
                                className={`px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors border-l-4 ${funderFilter === f ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-bold' : 'border-transparent text-zinc-700 dark:text-zinc-300'}`}
                              >
                                {f}
                              </li>
                            ))}
                          </React.Fragment>
                        ))}
                        {Object.keys(groupedFunders).length === 0 && (
                          <li className="px-3 py-6 text-center text-zinc-500 italic">{t.dashboard.noFundersFound}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {funderFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFunderFilter('all')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl transition-colors whitespace-nowrap"
                    title="Reset funder filter"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t.common.reset}</span>
                  </button>
                )}

                {funderSubTab === 'networks' && (
                  <button
                    onClick={() => setIsFunderFullscreen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Maximize2 size={14} /> {t.common.fullscreen}
                  </button>
                )}
              </div>
            </div>

            {funderSubTab === 'overview' ? (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                        {t.dashboard.sdgTitle}
                      </h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                        {t.dashboard.sdgSubtitle}
                      </p>
                    </div>

                    {/* What are SDGs callout */}
                    <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                      <div className="flex items-center gap-2 font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider text-[11px]">
                        <Info size={14} /> {t.dashboard.whatAreSdgs}
                      </div>
                      <p className="leading-relaxed">
                        {t.dashboard.sdgExplanation1}
                      </p>
                      <p className="leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t.dashboard.sdgExplanation2}
                      </p>
                    </div>

                    <div className="w-full border border-zinc-100 rounded-3xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                      <SdgRadar data={funderFilteredData.flatMap(p => p.sdgs)} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.sdgDistTitle}</h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{t.dashboard.sdgDistSubtitle}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        {t.dashboard.sdgDistDesc}
                      </p>
                    </div>
                    <div className="h-[500px] w-full border border-zinc-100 rounded-3xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                      <ChartContainer width="100%" height="100%">
                        <BarChart data={funderSdgData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={220}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
                            labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
                            itemStyle={{ color: '#0D9488', fontWeight: '700' }}
                            cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                          />
                          <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={16} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 text-white rounded-xl shadow-lg bg-teal-600 shadow-teal-600/20">
                        <Scale size={24} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.licensingTitle}</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{t.dashboard.licensingSubtitle}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                          {t.dashboard.licensingDesc}
                        </p>
                      </div>
                    </div>
                    {openScienceStats.totalLicenseMentions > 0 && (
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 max-w-sm text-right">
                        {formatNum(openScienceStats.totalLicenseMentions)} {t.dashboard.licenseDeclarations}
                      </p>
                    )}
                  </div>

                  {openScienceStats.totalLicenseMentions === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                      <Scale size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
                      <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t.dashboard.noLicenseData}</p>
                    </div>
                  ) : (
                    <LicenseSpectrum licenses={openScienceStats.topLicenses} total={openScienceStats.totalLicenseMentions} />
                  )}
                </div>

                <FunderStoryline data={funderFilteredData} />

                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-heading">{t.dashboard.funderVolumeTitle}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {t.dashboard.funderVolumeDesc}
                      </p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                      <button onClick={() => setFunderLimit(50)} aria-label="Show top 50 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-l-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${funderLimit === 50 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 50</button>
                      <button onClick={() => setFunderLimit(100)} aria-label="Show top 100 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-600 transition-all ${funderLimit === 100 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 100</button>
                      <button onClick={() => setFunderLimit(500)} aria-label="Show top 500 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-r-lg transition-all ${funderLimit === 500 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 500</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto overflow-x-hidden pr-2 border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30" style={{ height: '600px' }}>
                    <div style={{ height: `${Math.max(400, funderData.length * 40)}px`, width: '100%' }}>
                      <ChartContainer width="100%" height="100%">
                        <BarChart data={funderData} layout="vertical" margin={{ left: 20, right: 40, top: 20, bottom: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={260}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
                            labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
                            itemStyle={{ color: '#0D9488', fontWeight: '700' }}
                            cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                          />
                          <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={24} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {t.dashboard.relationalViews}
                  </span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                    <button
                      onClick={() => setFunderNetworkView('network')}
                      aria-pressed={funderNetworkView === 'network'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        funderNetworkView === 'network'
                          ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Share2 size={13} /> {t.common.network}
                    </button>
                    <button
                      onClick={() => setFunderNetworkView('matrix')}
                      aria-pressed={funderNetworkView === 'matrix'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        funderNetworkView === 'matrix'
                          ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Grid3x3 size={13} /> {t.common.matrix}
                    </button>
                    <button
                      onClick={() => setFunderNetworkView('cluster')}
                      aria-pressed={funderNetworkView === 'cluster'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        funderNetworkView === 'cluster'
                          ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Orbit size={13} /> {t.common.cluster}
                    </button>
                    <button
                      onClick={() => setFunderNetworkView('sankey')}
                      aria-pressed={funderNetworkView === 'sankey'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                        funderNetworkView === 'sankey'
                          ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Waypoints size={13} /> Sankey
                    </button>
                    <button
                      onClick={() => setFunderNetworkView('flows')}
                      aria-pressed={funderNetworkView === 'flows'}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        funderNetworkView === 'flows'
                          ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <Route size={13} /> {t.common.flowMap}
                    </button>
                  </div>
                </div>

                {/* Methodological Guide for Co-funding Views */}
                <div className="rounded-xl bg-teal-50/50 dark:bg-teal-950/20 p-3.5 border border-teal-100 dark:border-teal-900/40 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5">
                  <Info size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    {funderNetworkView === 'network' && (
                      <p><strong>{t.dashboard.funderNetworkTitle}:</strong> {t.dashboard.funderNetworkDesc}</p>
                    )}
                    {funderNetworkView === 'matrix' && (
                      <p><strong>{t.dashboard.funderMatrixTitle}:</strong> {t.dashboard.funderMatrixDesc}</p>
                    )}
                    {funderNetworkView === 'cluster' && (
                      <p><strong>{t.dashboard.funderClusterTitle}:</strong> {t.dashboard.funderClusterDesc}</p>
                    )}
                    {funderNetworkView === 'sankey' && (
                      <p><strong>{t.dashboard.funderSankeyTitle}:</strong> {t.dashboard.funderSankeyDesc}</p>
                    )}
                    {funderNetworkView === 'flows' && (
                      <p><strong>{t.dashboard.funderFlowsTitle}:</strong> {t.dashboard.funderFlowsDesc}</p>
                    )}
                  </div>
                </div>

                {funderNetworkView === 'network' && <FunderCofundingNetwork data={funderFilteredData} />}
                {funderNetworkView === 'matrix' && <FunderCofundingMatrix data={funderFilteredData} />}
                {funderNetworkView === 'cluster' && <FunderCofundingClusterNetwork data={funderFilteredData} />}
                {funderNetworkView === 'sankey' && <FunderSankey data={funderFilteredData} funders={funders} />}
                {funderNetworkView === 'flows' && <FunderGeographicFlowMap data={funderFilteredData} funders={funders} />}
              </div>
            )}

            {isFunderFullscreen && (
              <FullscreenModal
                isOpen={isFunderFullscreen}
                onClose={() => setIsFunderFullscreen(false)}
                title={
                  funderNetworkView === 'network' ? 'Funder Co-funding Network' :
                  funderNetworkView === 'matrix' ? 'Funder Co-funding Matrix' :
                  funderNetworkView === 'cluster' ? 'Funder Co-funding Clusters' :
                  funderNetworkView === 'sankey' ? 'Funder Flow Sankey Diagram' :
                  'Funder Geographic Flow Map'
                }
                subtitle={`${funderFilteredData.length.toLocaleString('en-US')} selected publications`}
              >
                {funderNetworkView === 'network' && <FunderCofundingNetwork data={funderFilteredData} />}
                {funderNetworkView === 'matrix' && <FunderCofundingMatrix data={funderFilteredData} />}
                {funderNetworkView === 'cluster' && <FunderCofundingClusterNetwork data={funderFilteredData} />}
                {funderNetworkView === 'sankey' && <FunderSankey data={funderFilteredData} funders={funders} />}
                {funderNetworkView === 'flows' && <FunderGeographicFlowMap data={funderFilteredData} funders={funders} />}
              </FullscreenModal>
            )}
          </section>
        )}

        {activeTab === 'journal' && (
          <section id="panel-journal" role="tabpanel" aria-labelledby="tab-journal" tabIndex={0} className="space-y-8 animate-in fade-in duration-500 focus:outline-none">
            {/* Tab Purpose & Analytical Intent */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-6 border border-blue-500/20 dark:from-blue-500/15 dark:border-blue-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300" aria-hidden="true">
                      <Globe size={16} />
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-blue-900 dark:text-blue-200">
                      {t.dashboard.reachTitle}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                    {t.dashboard.reachDesc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300 shrink-0 bg-blue-100/60 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-300/40 dark:border-blue-700/50">
                  <span>{t.dashboard.reachSource}</span>
                </div>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div role="group" aria-label="Global reach sub-views" className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl shadow-inner">
                <button
                  onClick={() => setReachSubTab('overview')}
                  aria-pressed={reachSubTab === 'overview'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    reachSubTab === 'overview'
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Globe size={15} aria-hidden="true" /> {t.dashboard.reachOverview}
                </button>
                <button
                  onClick={() => setReachSubTab('networks')}
                  aria-pressed={reachSubTab === 'networks'}
                  className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                    reachSubTab === 'networks'
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Share2 size={15} aria-hidden="true" /> {t.dashboard.reachNetworks}
                </button>
              </div>

              {reachSubTab === 'networks' && (
                <button
                  onClick={() => setIsReachFullscreen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors shadow-sm cursor-pointer"
                >
                  <Maximize2 size={14} aria-hidden="true" /> {t.common.fullscreen}
                </button>
              )}
            </div>

            {reachSubTab === 'overview' ? (
              <div className="space-y-12 animate-in fade-in duration-300">
                {/* Global Reach KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{t.dashboard.affiliatedCountries}</span>
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Globe size={20} />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                      {formatNum(globalReachStats.totalCountries)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t.dashboard.representedWorldwide}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{t.dashboard.affiliatedInstitutions}</span>
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Building2 size={20} />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                      {formatNum(globalReachStats.totalInstitutions)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t.dashboard.distinctOrganizations}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.authorAffiliationsTitle}</h3>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-1 block">
                        {t.dashboard.authorAffiliationsSubtitle.replace('{count}', formatNum(globalReachStats.totalCountries))}
                      </span>
                    </div>
                  </div>
                  <div className="h-[600px] w-full border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                    <WorldMap
                      data={countryData}
                      selectedCountry={selectedCountry}
                      onSelectCountry={setSelectedCountry}
                    />
                  </div>
                </div>

                {/* Top Contributing Countries */}
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.topContributingCountries}</h3>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">
                        {t.dashboard.rankedByPubs}
                      </span>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                      <button
                        onClick={() => setCountryLimit(10)}
                        aria-label="Show top 10 countries"
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-l-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                          countryLimit === 10 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        Top 10
                      </button>
                      <button
                        onClick={() => setCountryLimit(25)}
                        aria-label="Show top 25 countries"
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-600 transition-all ${
                          countryLimit === 25 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        Top 25
                      </button>
                      <button
                        onClick={() => setCountryLimit(50)}
                        aria-label="Show top 50 countries"
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-r-lg transition-all ${
                          countryLimit === 50 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        Top 50
                      </button>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="mb-8 border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                    <div style={{ height: `${Math.max(350, Math.min(countryLimit, topCountriesData.length) * 36)}px`, width: '100%' }}>
                      <ChartContainer width="100%" height="100%">
                        <BarChart
                          data={topCountriesData.slice(0, countryLimit)}
                          layout="vertical"
                          margin={{ left: 20, right: 40, top: 10, bottom: 10 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={180}
                            tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
                            labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
                            itemStyle={{ color: '#0D9488', fontWeight: '700' }}
                            cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                          />
                          <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>

                  {/* Country Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {topCountriesData.slice(0, countryLimit).map((country, idx) => {
                      const isSelected = country.code === selectedCountry;
                      return (
                        <div
                          key={country.code}
                          onClick={() => setSelectedCountry(country.code)}
                          className={`flex flex-col justify-between p-4 rounded-xl border transition-all shadow-sm group cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/30 dark:bg-blue-950/50 dark:border-blue-500'
                              : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                          title={t.dashboard.clickToExplore.replace('{country}', country.name)}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black text-zinc-400 font-mono">#{idx + 1}</span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                              }`}
                            >
                              {country.code}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mb-2" title={country.name}>
                            {country.name}
                          </p>
                          <div className="flex items-baseline justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                              {formatNum(country.value)} <span className="text-[10px] font-normal text-zinc-400">{t.common.pubs}</span>
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                              {country.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Country Affiliations Explorer */}
                <CountryInstitutionsExplorer
                  data={filteredData}
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                />

                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                  <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.dashboard.topContributingInstitutions}</h3>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">{t.dashboard.deduplicatedRor}</span>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                      <button onClick={() => setInstitutionLimit(100)} aria-label="Show top 100 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-l-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${institutionLimit === 100 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 100</button>
                      <button onClick={() => setInstitutionLimit(500)} aria-label="Show top 500 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-600 transition-all ${institutionLimit === 500 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 500</button>
                      <button onClick={() => setInstitutionLimit(1000)} aria-label="Show top 1000 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-r-lg transition-all ${institutionLimit === 1000 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 1000</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
                    {institutionData.map((inst, idx) => (
                      <div key={inst.ror || inst.name} className="flex items-center justify-between border-b border-zinc-50 py-3 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors px-2 rounded-lg">
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-sans">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans" title={inst.name}>{inst.name}</p>
                            {inst.ror ? (
                              <a
                                href={inst.ror.startsWith('http') ? inst.ror : `https://ror.org/${inst.ror}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase truncate hover:underline flex items-center gap-1"
                              >
                                {inst.ror.split('/').pop()}
                              </a>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">{t.dashboard.noRor}</span>
                            )}
                          </div>
                        </div>
                        <span className="ml-2 flex-shrink-0 text-xs font-black text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md font-sans">{formatNum(inst.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Networks & Collaborations Sub-Tab */
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Visualisation Mode Selector Pills */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl">
                  <button
                    onClick={() => setNetworkViewMode('flow')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      networkViewMode === 'flow'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Route size={14} /> {t.dashboard.geographicFlows}
                  </button>
                  <button
                    onClick={() => setNetworkViewMode('country-network')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      networkViewMode === 'country-network'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Globe size={14} /> {t.dashboard.countryNetwork}
                  </button>
                  <button
                    onClick={() => setNetworkViewMode('institution-network')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      networkViewMode === 'institution-network'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Share2 size={14} /> {t.dashboard.institutionNetwork}
                  </button>
                  <button
                    onClick={() => setNetworkViewMode('country-matrix')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      networkViewMode === 'country-matrix'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Grid3x3 size={14} /> {t.dashboard.collaborationMatrix}
                  </button>
                </div>

                {/* Methodological Guide for Collaboration Views */}
                <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 p-3.5 border border-blue-100 dark:border-blue-900/40 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    {networkViewMode === 'flow' && (
                      <p><strong>{t.dashboard.geoFlowsTitle}:</strong> {t.dashboard.geoFlowsDesc}</p>
                    )}
                    {networkViewMode === 'country-network' && (
                      <p><strong>{t.dashboard.countryNetworkTitle}:</strong> {t.dashboard.countryNetworkDesc}</p>
                    )}
                    {networkViewMode === 'institution-network' && (
                      <p><strong>{t.dashboard.institutionNetworkTitle}:</strong> {t.dashboard.institutionNetworkDesc}</p>
                    )}
                    {networkViewMode === 'country-matrix' && (
                      <p><strong>{t.dashboard.collabMatrixTitle}:</strong> {t.dashboard.collabMatrixDesc}</p>
                    )}
                  </div>
                </div>

                {/* Render Selected Network Component */}
                <div className="relative">
                  {networkViewMode === 'flow' && <CountryGeographicFlowMap data={filteredData} />}
                  {networkViewMode === 'country-network' && <CountryCollaborationNetwork data={filteredData} />}
                  {networkViewMode === 'institution-network' && <CollaborationWeb data={filteredData} />}
                  {networkViewMode === 'country-matrix' && <CountryCollaborationMatrix data={filteredData} />}
                </div>

                {/* Fullscreen Modal View */}
                <FullscreenModal
                  isOpen={isReachFullscreen}
                  onClose={() => setIsReachFullscreen(false)}
                  title={
                    networkViewMode === 'flow'
                      ? t.flowMap.countryTitle
                      : networkViewMode === 'country-network'
                      ? t.dashboard.countryNetwork
                      : networkViewMode === 'institution-network'
                      ? t.dashboard.institutionNetwork
                      : t.dashboard.collaborationMatrix
                  }
                  subtitle={t.dashboard.fullscreenSubtitle}
                >
                  <div className="h-full w-full min-h-[600px] flex flex-col justify-center">
                    {networkViewMode === 'flow' && <CountryGeographicFlowMap data={filteredData} />}
                    {networkViewMode === 'country-network' && <CountryCollaborationNetwork data={filteredData} />}
                    {networkViewMode === 'institution-network' && <CollaborationWeb data={filteredData} />}
                    {networkViewMode === 'country-matrix' && <CountryCollaborationMatrix data={filteredData} />}
                  </div>
                </FullscreenModal>
              </div>
            )}
          </section>
        )}

        {activeTab === 'lineage' && (
          <section id="panel-lineage" role="tabpanel" aria-labelledby="tab-lineage" tabIndex={0} className="space-y-8 animate-in fade-in duration-500 focus:outline-none">
            {/* Tab Purpose & Analytical Intent */}
            <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500/10 via-fuchsia-500/5 to-transparent p-6 border border-fuchsia-500/20 dark:from-fuchsia-500/15 dark:border-fuchsia-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300" aria-hidden="true">
                      <Search size={16} />
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-fuchsia-900 dark:text-fuchsia-200">
                      {t.lineage.subtitle}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
                    {t.lineage.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-800 dark:text-fuchsia-300 shrink-0 bg-fuchsia-100/60 dark:bg-fuchsia-950/50 px-3 py-1.5 rounded-xl border border-fuchsia-300/40 dark:border-fuchsia-700/50">
                  <span>{t.lineage.source}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <h3 className="mb-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Research Lineage</h3>
              <ResearchLineage data={filteredData} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
