'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Globe,
  Building2,
  Route,
  Share2,
  Grid3x3,
  Info,
  Maximize2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import ChartExportMenu from '@/components/ChartExportMenu';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import WorldMap from '@/components/WorldMap';
import CountryInstitutionsExplorer from '@/components/CountryInstitutionsExplorer';
import CountryCollaborationNetwork from '@/components/CountryCollaborationNetwork';
import CountryCollaborationMatrix from '@/components/CountryCollaborationMatrix';
import CollaborationWeb from '@/components/CollaborationWeb';
import FullscreenModal from '@/components/FullscreenModal';
import ViewSegmentedControl, { ViewOption } from '@/components/ViewSegmentedControl';

const CountryGeographicFlowMap = dynamic(
  () => import('@/components/CountryGeographicFlowMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 animate-pulse" />
    ),
  }
);

type ReachView = 'overview' | 'flows' | 'country-network' | 'institution-network' | 'country-matrix';

export default function ReachSection() {
  const { t } = useTranslation();
  const { state, actions, data } = useDashboard();
  const { countryLimit, institutionLimit } = state;
  const { setCountryLimit, setInstitutionLimit } = actions;
  const {
    filteredData,
    globalReachStats,
    countryData,
    topCountriesData,
    institutionData,
  } = data;

  const [activeView, setActiveView] = useState<ReachView>('overview');
  const [selectedCountry, setSelectedCountry] = useState<string>('FR');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const authorAffiliationsMapRef = useRef<HTMLDivElement>(null);
  const topCountriesChartRef = useRef<HTMLDivElement>(null);
  const relationalReachRef = useRef<HTMLDivElement>(null);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  const REACH_VIEWS: ViewOption<ReachView>[] = [
    { id: 'overview', label: t.dashboard.reachOverview, icon: <Globe size={15} /> },
    { id: 'flows', label: t.dashboard.geographicFlows, icon: <Route size={15} /> },
    { id: 'country-network', label: t.dashboard.countryNetwork, icon: <Globe size={15} /> },
    { id: 'institution-network', label: t.dashboard.institutionNetwork, icon: <Share2 size={15} /> },
    { id: 'country-matrix', label: t.dashboard.collaborationMatrix, icon: <Grid3x3 size={15} /> },
  ];

  return (
    <section id="panel-reach" aria-labelledby="reach-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* Purpose Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-[var(--episciences-cyan-00)]/5 to-transparent p-6 border border-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true">
                <Globe size={16} />
              </span>
              <h1 id="reach-heading" className="text-base font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {t.dashboard.reachTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {t.dashboard.reachDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] shrink-0 bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-[var(--episciences-cyan-01)]/40 dark:border-[var(--episciences-cyan-00)]/40 shadow-xs">
            <span>{t.dashboard.reachSource}</span>
          </div>
        </div>
      </div>

      {/* Unified View Segmented Control */}
      <ViewSegmentedControl<ReachView>
        views={REACH_VIEWS}
        activeView={activeView}
        onChange={setActiveView}
        ariaLabel="Modes de visualisation du rayonnement mondial"
      />

      {/* View 1: Overview */}
      {activeView === 'overview' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {t.dashboard.affiliatedCountries}
                </span>
                <div className="p-2 rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]">
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

            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {t.dashboard.affiliatedInstitutions}
                </span>
                <div className="p-2 rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]">
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

          {/* World Map */}
          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.dashboard.authorAffiliationsTitle}
                </h2>
                <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-1 block">
                  {t.dashboard.authorAffiliationsSubtitle.replace('{count}', formatNum(globalReachStats.totalCountries))}
                </span>
              </div>
              <ChartExportMenu
                targetRef={authorAffiliationsMapRef}
                data={countryData}
                filename="episciences-author-affiliations-map"
                csvColumns={[
                  { key: 'name', header: 'Country_Code' },
                  { key: 'value', header: 'Publications_Count' },
                ]}
              />
            </div>
            <div ref={authorAffiliationsMapRef} className="h-[600px] w-full border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
              <WorldMap
                data={countryData}
                selectedCountry={selectedCountry}
                onSelectCountry={(code) => {
                  setSelectedCountry(code);
                  const el = document.getElementById('country-affiliations-explorer');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                valueUnit={t.common.pubs}
              />
            </div>
          </div>

          {/* Top Contributing Countries */}
          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.dashboard.topContributingCountries}
                </h2>
                <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">
                  {t.dashboard.rankedByPubs}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                  {([10, 25, 50] as const).map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setCountryLimit(limit)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        countryLimit === limit
                          ? 'bg-white dark:bg-zinc-700 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Top {limit}
                    </button>
                  ))}
                </div>
                <ChartExportMenu
                  targetRef={topCountriesChartRef}
                  data={topCountriesData.slice(0, countryLimit)}
                  filename={`episciences-top-countries-${countryLimit}`}
                  csvColumns={[
                    { key: 'name', header: 'Country' },
                    { key: 'value', header: 'Publications_Count' },
                  ]}
                />
              </div>
            </div>

            <div ref={topCountriesChartRef} className="h-[380px] w-full mb-8">
              <ChartContainer width="100%" height="100%">
                <BarChart
                  data={topCountriesData.slice(0, countryLimit)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
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
                    itemStyle={{ color: '#0aa0be', fontWeight: '700' }}
                  />
                  <Bar dataKey="value" fill="var(--episciences-cyan-01)" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Country Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {topCountriesData.slice(0, countryLimit).map((country, idx) => {
                const isSelected = country.code === selectedCountry;
                return (
                  <div
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`flex flex-col justify-between p-4 rounded-xl border transition-all shadow-xs group cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--episciences-cyan-00)]/15 border-[var(--episciences-cyan-01)] ring-2 ring-[var(--episciences-cyan-01)]/30 dark:bg-[var(--episciences-cyan-00)]/20'
                        : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                    title={t.dashboard.clickToExplore.replace('{country}', country.name)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black text-zinc-400 font-mono">#{idx + 1}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono transition-colors ${
                          isSelected
                            ? 'bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]'
                            : 'text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] bg-[var(--episciences-cyan-00)]/15 dark:bg-[var(--episciences-cyan-00)]/20'
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

          {/* Top Contributing Institutions */}
          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.dashboard.topContributingInstitutions}
                </h2>
                <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">
                  {t.dashboard.deduplicatedRor}
                </span>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                {([100, 500, 1000] as const).map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => setInstitutionLimit(limit)}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      institutionLimit === limit
                        ? 'bg-white dark:bg-zinc-700 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Top {limit}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
              {institutionData.map((inst, idx) => (
                <div
                  key={inst.ror || inst.name}
                  className="flex items-center justify-between border-b border-zinc-50 py-3 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors px-2 rounded-lg"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-sans">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans" title={inst.name}>
                        {inst.name}
                      </p>
                      {inst.ror && (
                        <a
                          href={inst.ror.startsWith('http') ? inst.ror : `https://ror.org/${inst.ror}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] font-mono font-bold uppercase truncate hover:underline flex items-center gap-1"
                        >
                          {inst.ror.split('/').pop()}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-sm font-black text-zinc-900 dark:text-zinc-100 font-sans">
                    {formatNum(inst.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relational Views */}
      {activeView !== 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Methodological Guide */}
          <div className="rounded-xl bg-[var(--episciences-cyan-00)]/10 dark:bg-[var(--episciences-cyan-00)]/15 p-3.5 border border-[var(--episciences-cyan-01)]/30 text-xs text-zinc-600 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] shrink-0 mt-0.5" />
              <div>
                {activeView === 'flows' && (
                  <p><strong>{t.dashboard.geoFlowsTitle}:</strong> {t.dashboard.geoFlowsDesc}</p>
                )}
                {activeView === 'country-network' && (
                  <p><strong>{t.dashboard.countryNetworkTitle}:</strong> {t.dashboard.countryNetworkDesc}</p>
                )}
                {activeView === 'institution-network' && (
                  <p><strong>{t.dashboard.institutionNetworkTitle}:</strong> {t.dashboard.institutionNetworkDesc}</p>
                )}
                {activeView === 'country-matrix' && (
                  <p><strong>{t.dashboard.collabMatrixTitle}:</strong> {t.dashboard.collabMatrixDesc}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <ChartExportMenu
                targetRef={relationalReachRef}
                filename={`episciences-reach-${activeView}`}
              />
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 shadow-xs border border-zinc-200/80 dark:border-zinc-700 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                title={t.common.fullscreen}
                aria-label={t.common.fullscreen}
              >
                <Maximize2 size={13} aria-hidden="true" />
                <span className="hidden sm:inline">{t.common.fullscreen}</span>
              </button>
            </div>
          </div>

          <div ref={relationalReachRef}>
            {activeView === 'flows' && <CountryGeographicFlowMap data={filteredData} />}
            {activeView === 'country-network' && <CountryCollaborationNetwork data={filteredData} />}
            {activeView === 'institution-network' && <CollaborationWeb data={filteredData} />}
            {activeView === 'country-matrix' && <CountryCollaborationMatrix data={filteredData} />}
          </div>
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <FullscreenModal
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          title={
            activeView === 'flows' ? t.dashboard.geographicFlows :
            activeView === 'country-network' ? t.dashboard.countryNetwork :
            activeView === 'institution-network' ? t.dashboard.institutionNetwork :
            t.dashboard.collaborationMatrix
          }
          subtitle={`${filteredData.length.toLocaleString('en-US')} ${t.common.publications.toLowerCase()}`}
        >
          {activeView === 'flows' && <CountryGeographicFlowMap data={filteredData} />}
          {activeView === 'country-network' && <CountryCollaborationNetwork data={filteredData} />}
          {activeView === 'institution-network' && <CollaborationWeb data={filteredData} />}
          {activeView === 'country-matrix' && <CountryCollaborationMatrix data={filteredData} />}
        </FullscreenModal>
      )}
    </section>
  );
}
