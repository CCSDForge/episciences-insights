'use client';

import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { Handshake } from 'lucide-react';
import { Publication } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderStorylineProps {
  data: Publication[];
}

// Capped at 7 named series + a folded "Other" — same ceiling as
// LicenseSpectrum's topLicenses, the token limit for a stacked chart legend
// before it stops being readable at a glance.
const TOP_N = 7;
const SERIES_COLORS = ['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#4f46e5'];
const OTHER_COLOR = '#94a3b8';

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

export default function FunderStoryline({ data }: FunderStorylineProps) {
  const { t } = useTranslation();
  const { chartData, series, colorByName, totalFunders } = useMemo(() => {
    const totalsByFunder: Record<string, number> = {};
    data.forEach((p) => p.awards.forEach((a) => {
      if (a.funder) totalsByFunder[a.funder] = (totalsByFunder[a.funder] || 0) + 1;
    }));

    const topFunders = Object.entries(totalsByFunder)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name]) => name);
    const topSet = new Set(topFunders);
    const hasOther = Object.keys(totalsByFunder).length > TOP_N;
    const series = hasOther ? [...topFunders, t.funderStoryline.other] : topFunders;
    const colorByName = new Map(series.map((name, i) => [name, name === t.funderStoryline.other ? OTHER_COLOR : SERIES_COLORS[i]]));

    const byYear: Record<string, Record<string, number>> = {};
    data.forEach((p) => {
      const fundersInPub = new Set(p.awards.map((a) => a.funder).filter(Boolean));
      if (fundersInPub.size === 0) return;
      const year = p.year.toString();
      if (!byYear[year]) byYear[year] = {};
      fundersInPub.forEach((f) => {
        const key = topSet.has(f) ? f : t.funderStoryline.other;
        byYear[year][key] = (byYear[year][key] || 0) + 1;
      });
    });

    const chartData = Object.keys(byYear).sort().map((year) => ({ year, ...byYear[year] }));

    return { chartData, series, colorByName, totalFunders: Object.keys(totalsByFunder).length };
  }, [data, t.funderStoryline.other]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-3xl border-2 border-dashed bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30">
        <Handshake size={48} className="mb-4 text-teal-200 dark:text-teal-800" />
        <h4 className="text-lg font-bold mb-2 text-teal-900 dark:text-teal-100">{t.funderStoryline.noDataTitle}</h4>
        <p className="text-sm italic max-w-md text-teal-600/70 dark:text-teal-400/60">{t.funderStoryline.noDataDesc}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 text-white rounded-2xl shadow-lg bg-teal-600 shadow-teal-600/20">
            <Handshake size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.funderStoryline.title}</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{t.funderStoryline.subtitle}</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t.funderStoryline.topShown
            .replace('{shown}', String(series.includes(t.funderStoryline.other) ? TOP_N : series.length))
            .replace('{total}', formatNum(totalFunders))}
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ChartContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
            <YAxis hide />
            <Tooltip
              formatter={(value, name) => [`${formatNum(Number(value) || 0)} ${t.common.publications}`, String(name)]}
              contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
              labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
            />
            {series.map((name) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stackId="1"
                stroke={colorByName.get(name)}
                fill={colorByName.get(name)}
                fillOpacity={0.75}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        {series.map((name) => (
          <div key={name} className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: colorByName.get(name) }} aria-hidden="true" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[220px]" title={name}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
