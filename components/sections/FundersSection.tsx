'use client';

import React, { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  FlaskConical,
  BarChart3,
  Share2,
  Grid3x3,
  Orbit,
  Waypoints,
  Route,
  Search,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import FunderStoryline from '@/components/FunderStoryline';
import FunderCofundingNetwork from '@/components/FunderCofundingNetwork';
import FunderCofundingMatrix from '@/components/FunderCofundingMatrix';
import FunderCofundingClusterNetwork from '@/components/FunderCofundingClusterNetwork';
import FunderSankey from '@/components/FunderSankey';
import FullscreenModal from '@/components/FullscreenModal';
import ViewSegmentedControl, { ViewOption } from '@/components/ViewSegmentedControl';

const FunderGeographicFlowMap = dynamic(
  () => import('@/components/FunderGeographicFlowMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 animate-pulse" />
    ),
  }
);

type FunderView = 'overview' | 'network' | 'matrix' | 'cluster' | 'sankey' | 'flows';

export default function FundersSection() {
  const { t } = useTranslation();
  const { state, actions, data, meta } = useDashboard();
  const { funderFilter, funderLimit, isFunderOpen, funderSearch } = state;
  const { setFunderFilter, setFunderLimit, setIsFunderOpen, setFunderSearch } = actions;
  const { filteredData, funderData, groupedFunders, funders } = data;
  const { dropdownRef } = meta;

  const [activeView, setActiveView] = useState<FunderView>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const funderButtonRef = useRef<HTMLButtonElement>(null);

  const funderFilteredData = useMemo(() => {
    if (funderFilter === 'all') return filteredData;
    return filteredData.filter((p) => p.awards.some((a) => a.funder === funderFilter));
  }, [filteredData, funderFilter]);

  const FUNDER_VIEWS: ViewOption<FunderView>[] = [
    { id: 'overview', label: t.dashboard.funderOverview, icon: <BarChart3 size={15} /> },
    { id: 'network', label: t.common.network, icon: <Share2 size={15} /> },
    { id: 'matrix', label: t.common.matrix, icon: <Grid3x3 size={15} /> },
    { id: 'cluster', label: t.common.cluster, icon: <Orbit size={15} /> },
    { id: 'sankey', label: 'Sankey', icon: <Waypoints size={15} /> },
    { id: 'flows', label: t.common.flowMap, icon: <Route size={15} /> },
  ];

  return (
    <section id="panel-funder" aria-labelledby="funders-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* Purpose Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-[var(--episciences-cyan-00)]/5 to-transparent p-6 border border-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true">
                <FlaskConical size={16} />
              </span>
              <h1 id="funders-heading" className="text-base font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {t.dashboard.funderTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {t.dashboard.funderDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] shrink-0 bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-[var(--episciences-cyan-01)]/40 dark:border-[var(--episciences-cyan-00)]/40 shadow-xs">
            <span>{t.dashboard.funderSource}</span>
          </div>
        </div>
      </div>

      {/* Control Row: Views + Search Specific Funder */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <ViewSegmentedControl<FunderView>
          views={FUNDER_VIEWS}
          activeView={activeView}
          onChange={setActiveView}
          onFullscreen={activeView !== 'overview' ? () => setIsFullscreen(true) : undefined}
          ariaLabel="Modes de visualisation des financeurs"
          className="border-b-0 pb-0"
        />

        {/* Funder Search Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px] max-w-[320px]" ref={dropdownRef}>
            <button
              ref={funderButtonRef}
              id="funder-filter-button-sec"
              type="button"
              aria-label={t.dashboard.filterByFunder}
              aria-haspopup="listbox"
              aria-expanded={isFunderOpen}
              onClick={() => setIsFunderOpen(!isFunderOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all text-left cursor-pointer"
            >
              <span className="truncate">{funderFilter === 'all' ? t.dashboard.allFunders : funderFilter}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5 transition-transform ${isFunderOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isFunderOpen && (
              <div className="absolute right-0 z-50 mt-1 w-[320px] rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                    <input
                      autoFocus
                      id="funder-search-input-sec"
                      aria-label={t.dashboard.filterByFunder}
                      type="text"
                      placeholder={t.dashboard.funderSearchPlaceholder}
                      value={funderSearch}
                      onChange={(e) => setFunderSearch(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>
                <ul role="listbox" className="max-h-60 overflow-y-auto p-1 text-xs">
                  <li
                    role="option"
                    aria-selected={funderFilter === 'all'}
                    onClick={() => { setFunderFilter('all'); setIsFunderOpen(false); setFunderSearch(''); }}
                    className={`px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${funderFilter === 'all' ? 'bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] font-bold' : ''}`}
                  >
                    {t.dashboard.allFunders}
                  </li>
                  {Object.entries(groupedFunders).map(([country, list]) => (
                    <React.Fragment key={country}>
                      <li className="px-3 pt-2 pb-1 font-bold text-[10px] uppercase text-zinc-400 tracking-wider">
                        {country}
                      </li>
                      {list.map((f) => (
                        <li
                          key={f}
                          role="option"
                          aria-selected={funderFilter === f}
                          onClick={() => { setFunderFilter(f); setIsFunderOpen(false); setFunderSearch(''); }}
                          className={`px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${funderFilter === f ? 'bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}
                        >
                          {f}
                        </li>
                      ))}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {funderFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setFunderFilter('all')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              title="Reset funder filter"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t.common.reset}</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview View: Storyline & Volume */}
      {activeView === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <FunderStoryline data={funderFilteredData} />

          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.dashboard.funderVolumeTitle}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t.dashboard.funderVolumeDesc}
                </p>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                {([50, 100, 500] as const).map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => setFunderLimit(limit)}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      funderLimit === limit
                        ? 'bg-white dark:bg-zinc-700 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Top {limit}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-hidden pr-2 border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30" style={{ height: '520px' }}>
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
                      itemStyle={{ color: '#0aa0be', fontWeight: '700' }}
                      cursor={{ fill: 'rgba(10, 160, 190, 0.05)' }}
                    />
                    <Bar dataKey="value" fill="var(--episciences-cyan-01)" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relational Views */}
      {activeView !== 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="relative">
            {activeView === 'network' && <FunderCofundingNetwork data={funderFilteredData} />}
            {activeView === 'matrix' && <FunderCofundingMatrix data={funderFilteredData} />}
            {activeView === 'cluster' && <FunderCofundingClusterNetwork data={funderFilteredData} />}
            {activeView === 'sankey' && <FunderSankey data={funderFilteredData} funders={funders} />}
            {activeView === 'flows' && <FunderGeographicFlowMap data={funderFilteredData} funders={funders} />}
          </div>
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <FullscreenModal
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          title={`Financeurs - ${FUNDER_VIEWS.find((v) => v.id === activeView)?.label || activeView}`}
          subtitle={`${filteredData.length.toLocaleString('en-US')} ${t.common.publications.toLowerCase()}`}
        >
          {activeView === 'network' && <FunderCofundingNetwork data={funderFilteredData} />}
          {activeView === 'matrix' && <FunderCofundingMatrix data={funderFilteredData} />}
          {activeView === 'cluster' && <FunderCofundingClusterNetwork data={funderFilteredData} />}
          {activeView === 'sankey' && <FunderSankey data={funderFilteredData} funders={funders} />}
          {activeView === 'flows' && <FunderGeographicFlowMap data={funderFilteredData} funders={funders} />}
        </FullscreenModal>
      )}
    </section>
  );
}
