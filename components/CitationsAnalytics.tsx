'use client';

import React, { useMemo } from 'react';
import { Publication, VenueCitationSummary } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Quote,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Info,
  BarChart3,
  List,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface CitationsAnalyticsProps {
  data: Publication[];
  venueCitations?: Record<string, VenueCitationSummary>;
}

function formatNum(val: number): string {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

export default function CitationsAnalytics({ data, venueCitations = {} }: CitationsAnalyticsProps) {
  const { t } = useTranslation();

  // 1. Core KPIs
  const stats = useMemo(() => {
    let totalCitations = 0;
    let citedPapersCount = 0;
    let externalCount = 0;
    let journalScCount = 0;
    let authorScCount = 0;
    const timespanDaysList: number[] = [];
    const yearlyMap: Record<string, number> = {};

    data.forEach((p) => {
      const oc = p.opencitations;
      if (!oc) return;

      const cCount = oc.citation_count || 0;
      if (cCount > 0) {
        totalCitations += cCount;
        citedPapersCount++;
      }

      if (oc.self_citations) {
        externalCount += oc.self_citations.external_count || 0;
        journalScCount += oc.self_citations.journal_count || 0;
        authorScCount += oc.self_citations.author_count || 0;
      }

      if (oc.median_citation_timespan_days && oc.median_citation_timespan_days > 0) {
        timespanDaysList.push(oc.median_citation_timespan_days);
      }

      if (oc.citations_by_year) {
        Object.entries(oc.citations_by_year).forEach(([year, count]) => {
          yearlyMap[year] = (yearlyMap[year] || 0) + count;
        });
      }
    });

    const citedRate = data.length > 0 ? (citedPapersCount / data.length) * 100 : 0;
    const trackedSelfTotal = externalCount + journalScCount + authorScCount;
    const externalRate =
      trackedSelfTotal > 0 ? (externalCount / trackedSelfTotal) * 100 : totalCitations > 0 ? 100 : 0;

    let medianLatencyMonths = 0;
    if (timespanDaysList.length > 0) {
      timespanDaysList.sort((a, b) => a - b);
      const mid = Math.floor(timespanDaysList.length / 2);
      const medianDays =
        timespanDaysList.length % 2 !== 0
          ? timespanDaysList[mid]
          : (timespanDaysList[mid - 1] + timespanDaysList[mid]) / 2;
      medianLatencyMonths = Math.round(medianDays / 30.4375);
    }

    const yearlyData = Object.entries(yearlyMap)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    return {
      totalCitations,
      citedPapersCount,
      citedRate,
      externalCount,
      journalScCount,
      authorScCount,
      externalRate,
      medianLatencyMonths,
      yearlyData,
    };
  }, [data]);

  // 2. Top cited publications
  const topCitedPapers = useMemo(() => {
    return [...data]
      .filter((p) => (p.opencitations?.citation_count || 0) > 0)
      .sort((a, b) => (b.opencitations?.citation_count || 0) - (a.opencitations?.citation_count || 0))
      .slice(0, 10);
  }, [data]);

  const [venueViewMode, setVenueViewMode] = React.useState<'chart' | 'list'>('chart');
  const [venueLimit, setVenueLimit] = React.useState<number>(12);

  // 3. Venue citations comparison (authoritative overlay journals)
  const venueData = useMemo(() => {
    if (!venueCitations || Object.keys(venueCitations).length === 0) return [];

    const seenKeys = new Set<string>();
    const list: { name: string; count: number; issn: string; code?: string }[] = [];

    Object.values(venueCitations).forEach((v) => {
      if (!v) return;
      // Primary dedup key is canonical journal_code if available, otherwise issn
      const key = v.journal_code || v.issn;
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);

      if (v.count > 0) {
        list.push({
          name: v.journal_name || v.journal_code || v.issn,
          count: v.count,
          issn: v.issn,
          code: v.journal_code,
        });
      }
    });

    return list.sort((a, b) => b.count - a.count);
  }, [venueCitations]);

  const displayedVenues = useMemo(() => {
    return venueLimit === -1 ? venueData : venueData.slice(0, venueLimit);
  }, [venueData, venueLimit]);

  const maxVenueCount = useMemo(() => {
    return venueData.length > 0 ? venueData[0].count : 1;
  }, [venueData]);

  // 4. Breakdown data for self-citations chart
  const breakdownData = useMemo(() => {
    return [
      { name: t.citations.externalCitations, value: stats.externalCount, color: '#10b981' }, // emerald
      { name: t.citations.journalSelf, value: stats.journalScCount, color: '#f59e0b' }, // amber
      { name: t.citations.authorSelf, value: stats.authorScCount, color: '#8b5cf6' }, // violet
    ].filter((item) => item.value > 0);
  }, [stats, t]);

  const getDoiUrl = (doi: string) => {
    if (doi.startsWith('http')) return doi;
    return `https://doi.org/${doi}`;
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-8 text-white shadow-xl lg:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Quote size={12} aria-hidden="true" />
              <span>{t.citations.source}</span>
            </div>
            <h3 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">
              {t.citations.title}
            </h3>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-violet-100 sm:text-base">
              {t.citations.desc}
            </p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Open Citations */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.citations.kpiTotal}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Quote size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {formatNum(stats.totalCitations)}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.citations.kpiTotalDesc}
          </p>
        </div>

        {/* Cited Publications Rate */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.citations.kpiCitedRate}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {stats.citedRate.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-zinc-400">
              ({formatNum(stats.citedPapersCount)} / {formatNum(data.length)})
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.citations.kpiCitedRateDesc}
          </p>
        </div>

        {/* External Citation Ratio */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.citations.kpiExternalRate}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {stats.externalRate.toFixed(1)}%
            </span>
            {stats.externalCount > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ({formatNum(stats.externalCount)} ext.)
              </span>
            )}
          </div>
          <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.citations.kpiExternalRateDesc}
          </p>
        </div>

        {/* Impact Latency */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.citations.kpiMedianTimespan}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {stats.medianLatencyMonths > 0 ? stats.medianLatencyMonths : '—'}
            </span>
            {stats.medianLatencyMonths > 0 && (
              <span className="text-xs font-bold uppercase text-zinc-400">
                {t.citations.months}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.citations.kpiMedianTimespanDesc}
          </p>
        </div>
      </div>

      {/* Row 1: Timeline & Nature of Citations */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Annual Citation Growth Chart */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-1">
            <h4 className="font-heading text-base font-black text-zinc-900 dark:text-zinc-50">
              {t.citations.timelineTitle}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.citations.timelineSubtitle}
            </p>
          </div>

          {stats.yearlyData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={{ stroke: '#e4e4e7' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/95">
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                              {payload[0].payload.year}
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-heading text-sm font-black text-violet-600 dark:text-violet-400">
                                {formatNum(Number(payload[0].value))}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {t.citations.kpiTotal}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#citationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center text-zinc-400">
              <Info size={32} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">{t.citations.noData}</p>
            </div>
          )}
        </div>

        {/* Nature Breakdown (External vs Journal vs Author) */}
        <div className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="space-y-1">
            <h4 className="font-heading text-base font-black text-zinc-900 dark:text-zinc-50">
              {t.citations.selfCitationBreakdown}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.citations.kpiExternalRateDesc}
            </p>
          </div>

          {breakdownData.length > 0 ? (
            <div className="my-auto flex flex-col items-center py-4">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0];
                          return (
                            <div className="rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800/95">
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {item.name}: {formatNum(Number(item.value))}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="mt-4 w-full space-y-2">
                {breakdownData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                      {formatNum(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-56 flex-col items-center justify-center text-zinc-400">
              <Info size={32} className="mb-2 opacity-40" />
              <p className="text-xs font-medium">{t.citations.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Overlay Journals Venues Comparison */}
      {venueData.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-violet-600 dark:text-violet-400" />
                <h4 className="font-heading text-base font-black text-zinc-900 dark:text-zinc-50">
                  {t.citations.venuesTitle}
                </h4>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.citations.venuesSubtitle}
              </p>
            </div>

            {/* Controls: Limits & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setVenueLimit(10)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    venueLimit === 10
                      ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setVenueLimit(20)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    venueLimit === 20
                      ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Top 20
                </button>
                <button
                  onClick={() => setVenueLimit(-1)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    venueLimit === -1
                      ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {venueData.length}
                </button>
              </div>

              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setVenueViewMode('chart')}
                  aria-label="Chart view"
                  className={`p-1.5 rounded-lg transition-all ${
                    venueViewMode === 'chart'
                      ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <BarChart3 size={15} />
                </button>
                <button
                  onClick={() => setVenueViewMode('list')}
                  aria-label="List view"
                  className={`p-1.5 rounded-lg transition-all ${
                    venueViewMode === 'list'
                      ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {venueViewMode === 'chart' ? (
            <div className="w-full overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div style={{ height: `${Math.max(400, displayedVenues.length * 40)}px`, minWidth: '600px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayedVenues}
                    layout="vertical"
                    margin={{ top: 10, right: 40, left: 240, bottom: 10 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      axisLine={{ stroke: '#e4e4e7' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                      axisLine={false}
                      tickLine={false}
                      width={230}
                      tickFormatter={(val: string) => (val.length > 32 ? `${val.slice(0, 31)}…` : val)}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/95">
                              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {d.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                {d.code && (
                                  <span className="font-mono rounded bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 uppercase font-bold text-violet-600 dark:text-violet-300">
                                    {d.code}
                                  </span>
                                )}
                                <span>ISSN: {d.issn}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="font-heading text-base font-black text-violet-600 dark:text-violet-400">
                                  {formatNum(Number(d.count))}
                                </span>
                                <span className="text-xs text-zinc-500">{t.citations.kpiTotal}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {displayedVenues.map((v, idx) => {
                const percent = Math.min(100, Math.max(2, (v.count / maxVenueCount) * 100));
                return (
                  <div
                    key={v.code || v.issn}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                            #{idx + 1}
                          </span>
                          {v.code && (
                            <span className="text-[10px] font-mono font-bold uppercase rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-1.5 py-0.5">
                              {v.code}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ISSN: {v.issn}
                        </span>
                      </div>

                      <h5 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">
                        {v.name}
                      </h5>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {t.citations.kpiTotal}
                        </span>
                        <span className="font-heading text-base font-black text-violet-600 dark:text-violet-400">
                          {formatNum(v.count)}
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-700/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Row 3: Top Cited Publications */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <h4 className="font-heading text-base font-black text-zinc-900 dark:text-zinc-50">
              {t.citations.topCitedTitle}
            </h4>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.citations.topCitedSubtitle}
          </p>
        </div>

        {topCitedPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {topCitedPapers.map((paper, idx) => {
              const oc = paper.opencitations;
              const extCount = oc?.self_citations?.external_count;

              return (
                <div
                  key={paper.doi}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 transition-all hover:border-violet-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:border-violet-700 dark:hover:bg-zinc-800"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-black text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        {paper.year} • {paper.journal.name}
                      </span>
                    </div>

                    <h5 className="font-heading text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50 line-clamp-2">
                      {paper.title}
                    </h5>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Quote size={14} className="text-violet-600 dark:text-violet-400" />
                        <span className="font-heading text-base font-black text-zinc-900 dark:text-zinc-50">
                          {formatNum(oc?.citation_count || 0)}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                          citations
                        </span>
                      </div>

                      {extCount !== undefined && extCount > 0 && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {formatNum(extCount)} {t.citations.externalCitations.toLowerCase()}
                        </span>
                      )}
                    </div>

                    <a
                      href={getDoiUrl(paper.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
                      aria-label={`Open DOI for ${paper.title}`}
                    >
                      <span>DOI</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-zinc-400">
            <Info size={32} className="mb-2 opacity-40" />
            <p className="text-xs font-medium">{t.citations.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
