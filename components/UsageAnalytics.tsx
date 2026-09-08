'use client';

import React, { useMemo } from 'react';
import { useDashboard } from './DashboardContext';
import { 
  XAxis, YAxis, Tooltip, 
  CartesianGrid, AreaChart, Area
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { Download, MousePointerClick, Globe, Star, Zap, BarChart3, Filter } from 'lucide-react';
import WorldMap from './WorldMap';
import { UsageStats, TopPaper } from '@/lib/types';
import { getCountryName } from '@/lib/countryNames';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function UsageAnalytics() {
  const { t, locale } = useTranslation();
  const { state, data } = useDashboard();
  const { journalFilter, yearFilter } = state;
  const { usageSummary } = data;

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  // Resolve ISSN-based journalFilter to rvcode used in KPI data
  const rvcode = useMemo(() => {
    if (!usageSummary) return null;
    return journalFilter !== 'all'
      ? (usageSummary.journalIssnToRvcode?.[journalFilter] ?? journalFilter)
      : null;
  }, [usageSummary, journalFilter]);

  // Reactive filtering logic
  const filteredUsage = useMemo(() => {
    if (!usageSummary) return { downloads: 0, views: 0, papers: 0 };
    
    let base = usageSummary.yearlySummary;
    let papers = (Object.values(usageSummary.paperCounts) as number[]).reduce((a, b) => a + b, 0);

    if (rvcode) {
      base = usageSummary.journalYearlySummary[rvcode] || {};
      papers = usageSummary.paperCounts[rvcode] || 0;
    }

    if (yearFilter !== 'all') {
      const yearData = base[yearFilter] || { downloads: 0, views: 0 };
      return {
        downloads: yearData.downloads,
        views: yearData.views,
        papers
      };
    }

    const totals = (Object.values(base) as UsageStats[]).reduce((acc, curr) => ({
      downloads: acc.downloads + curr.downloads,
      views: acc.views + curr.views
    }), { downloads: 0, views: 0 });

    return { ...totals, papers };
  }, [usageSummary, rvcode, yearFilter]);

  const yearlyData = useMemo(() => {
    if (!usageSummary) return [];
    const base = rvcode
      ? (usageSummary.journalYearlySummary[rvcode] || {})
      : usageSummary.yearlySummary;

    type YearPoint = {
      year: string;
      downloads: number | null;
      views: number | null;
      downloadsProjected?: number | null;
      viewsProjected?: number | null;
    };

    const entries: YearPoint[] = Object.entries(base)
      .map(([year, stats]: [string, UsageStats]) => ({
        year,
        downloads: stats.downloads,
        views: stats.views
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // The current year is partial (in progress), so its raw total reads as a
    // sudden drop vs. the prior full year. Replace it with a dashed
    // projection extrapolated from how much of the year has elapsed,
    // bridged from the last complete year so the dashed segment connects.
    const currentYearIndex = entries.findIndex((e) => e.year === usageSummary.currentYear);
    if (currentYearIndex === -1) return entries;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
    const elapsedFraction = (now.getTime() - startOfYear.getTime()) / (startOfNextYear.getTime() - startOfYear.getTime());

    const current = entries[currentYearIndex];
    const project = (value: number) => (elapsedFraction > 0 ? Math.round(value / elapsedFraction) : value);

    return entries.map((entry, idx) => {
      if (idx === currentYearIndex - 1) {
        return { ...entry, downloadsProjected: entry.downloads, viewsProjected: entry.views };
      }
      if (idx === currentYearIndex) {
        return {
          ...entry,
          downloads: null,
          views: null,
          downloadsProjected: project(current.downloads ?? 0),
          viewsProjected: project(current.views ?? 0)
        };
      }
      return entry;
    });
  }, [usageSummary, rvcode]);

  const geoData = useMemo(() => {
    if (!usageSummary) return [];
    if (rvcode && usageSummary.journalCountrySummary?.[rvcode]) {
      return Object.entries(usageSummary.journalCountrySummary[rvcode])
        .map(([country, stats]: [string, UsageStats]) => ({ name: country, value: stats.downloads }))
        .sort((a, b) => b.value - a.value);
    }
    return Object.entries(usageSummary.countryYearlySummary)
      .map(([country, stats]: [string, Record<string, UsageStats>]) => ({ name: country, value: stats.all.downloads }))
      .sort((a, b) => b.value - a.value);
  }, [usageSummary, rvcode]);

  if (!usageSummary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
          <Zap className="h-12 w-12 text-zinc-400" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Usage Data Unavailable</h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">KPI data file not found or could not be parsed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Dynamic Filter Banner */}
      {(journalFilter !== 'all' || yearFilter !== 'all') && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-600 p-1.5 text-white shadow-sm">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-black text-amber-900 dark:text-amber-100">{t.usage.filteredAnalytics}</span>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                {t.usage.showingStats
                  .replace('{year}', yearFilter === 'all' ? (locale === 'fr' ? 'cumulées' : locale === 'es' ? 'acumuladas' : 'cumulative') : yearFilter)
                  .replace('{journal}', journalFilter === 'all' ? t.usage.allJournals : journalFilter)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white dark:bg-amber-900/40 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800">
              {formatNum(filteredUsage.papers)} {t.usage.papersTracked}
            </span>
          </div>
        </div>
      )}

      {/* Hero Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800" role="region" aria-label="Usage Pulse Trends">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                {journalFilter === 'all' ? t.usage.globalPulse : t.usage.journalPulse}
              </h3>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mt-1">
                {t.usage.pulseSubtitle.replaceAll('{year}', String(usageSummary.currentYear))}
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                 <div className="h-3 w-3 rounded-full bg-amber-500" aria-hidden="true" />
                 <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">{t.usage.downloads}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="h-3 w-3 rounded-full bg-slate-400" aria-hidden="true" />
                 <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">{t.usage.views}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
                   <line x1="0" y1="4" x2="14" y2="4" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="4 3" />
                 </svg>
                 <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">{t.usage.estimate}</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ChartContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [formatNum(Number(value || 0)), String(name)]}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="views" name={t.usage.views} stroke="#94a3b8" fill="transparent" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8' }} connectNulls={false} />
                <Area type="monotone" dataKey="downloads" name={t.usage.downloads} stroke="#d97706" fillOpacity={1} fill="url(#colorDownloads)" strokeWidth={3} dot={{ r: 6, fill: '#d97706' }} connectNulls={false} />
                <Area type="monotone" dataKey="viewsProjected" name={`${t.usage.views} (${t.usage.estimate.toLowerCase()})`} stroke="#94a3b8" strokeDasharray="6 5" fill="transparent" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8', fillOpacity: 0.4 }} connectNulls={false} legendType="none" />
                <Area type="monotone" dataKey="downloadsProjected" name={`${t.usage.downloads} (${t.usage.estimate.toLowerCase()})`} stroke="#d97706" strokeDasharray="6 5" fill="transparent" strokeWidth={3} dot={{ r: 6, fill: '#d97706', fillOpacity: 0.4 }} connectNulls={false} legendType="none" />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 flex flex-col">
          <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading mb-2">{t.usage.usageImpact}</h3>
          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-8">
            {yearFilter === 'all' ? t.usage.cumulative : yearFilter} {t.usage.isolatedMetrics}
          </p>
          
          <div className="flex-1 flex flex-col justify-around">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30">
                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true">
                  <Download size={22} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.usage.downloads}</span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap tracking-tight">{formatNum(filteredUsage.downloads)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true">
                  <MousePointerClick size={22} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.usage.views}</span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap tracking-tight">{formatNum(filteredUsage.views)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-6 border border-amber-100 dark:border-amber-900/30 text-center">
              <BarChart3 className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-lg font-black text-amber-700 dark:text-amber-300 uppercase tracking-tighter">
                {journalFilter === 'all' ? t.usage.archiveVolume : t.usage.journalVolume}
              </p>
              <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80 uppercase tracking-wider mt-1">{t.usage.aggregatedKpis}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Audience */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.usage.globalReadership}</h3>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mt-1">{t.usage.downloadsByCountry}</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 flex items-center gap-3">
               <Globe className="h-4 w-4 text-blue-500" />
               <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatNum(geoData.length)} {t.usage.activeCountries}</span>
             </div>
          </div>
        </div>
        
        {/* Map Container with responsive aspect ratio to prevent truncation */}
        <div className="w-full border border-zinc-100 rounded-3xl dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 mb-8 relative shadow-inner group overflow-hidden">
          <div className="aspect-[16/9] w-full min-h-[400px] md:min-h-[500px]">
            <WorldMap
              data={geoData}
              legendLabel={t.usage.mapLegend}
              colorRange={["#fef3c7", "#d97706"]}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {geoData.slice(0, 24).map((country) => (
            <div key={country.name} title={country.name} className="flex flex-col items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm">
              <span className="text-[10px] font-black text-zinc-400 uppercase mb-1 text-center truncate max-w-full">{country.name ? getCountryName(country.name) : '??'}</span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{formatNum(country.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Papers - Only shown if a journal is selected */}
      {rvcode && usageSummary.journalTopPapers[rvcode] && (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-amber-500" />
              <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.usage.mostDownloaded}</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.usage.top20Trending}</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {usageSummary.journalTopPapers[rvcode!].map((paper: TopPaper, idx: number) => (
              <div key={paper.doi} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-50/50 p-6 ring-1 ring-zinc-200 transition-all hover:bg-white hover:shadow-xl hover:ring-amber-200 dark:bg-zinc-800/30 dark:ring-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:ring-amber-900">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-black text-white dark:bg-zinc-50 dark:text-zinc-900 font-sans">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{formatNum(paper.downloads)} <span className="text-[10px] uppercase text-zinc-400 ml-1">dl</span></span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{formatNum(paper.views)} {t.common.views}</span>
                  </div>
                </div>
                <h4 className="mb-4 text-sm font-bold leading-relaxed text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-3 min-h-[3rem]">
                  {paper.title}
                </h4>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-700/50">
                  <a 
                    href={`https://doi.org/${paper.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono font-bold text-blue-600 hover:underline truncate max-w-[180px]"
                  >
                    {paper.doi}
                  </a>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 shrink-0">
                    <MousePointerClick size={12} />
                    {t.usage.readOnline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
