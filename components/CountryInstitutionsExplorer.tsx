'use client';

import React, { useState, useMemo } from 'react';
import { Publication } from '@/lib/types';
import { getCountryName } from '@/lib/countryNames';
import { COMMUNITY_COLORS } from '@/lib/colorRamps';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Treemap,
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { Building2, LayoutGrid, BarChart2, Globe, ExternalLink, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface CountryInstitutionsExplorerProps {
  data: Publication[];
  selectedCountry?: string;
  onSelectCountry?: (code: string) => void;
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  color?: string;
  size?: number;
  count?: number;
}

function wrapText(text: string, maxCharsPerLine: number, maxLines = 2): string[] {
  if (text.length <= maxCharsPerLine) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) break;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  if (lines.length > 0) {
    const totalWordsCount = lines.join(' ').split(/\s+/).length;
    if (totalWordsCount < words.length) {
      const lastIdx = lines.length - 1;
      const last = lines[lastIdx];
      lines[lastIdx] = last.length > maxCharsPerLine - 2
        ? `${last.substring(0, maxCharsPerLine - 2)}…`
        : `${last}…`;
    }
  }

  return lines.slice(0, maxLines);
}

function TreemapCell(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', color = '#3b82f6', size = 0, count: rawCount } = props;
  const count = rawCount ?? size;

  // Round positions and dimensions to integer pixels to prevent subpixel font blur
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);

  // Adaptive font sizing based on available dimensions
  let fontSize = 11;
  if (rw < 90 || rh < 50) fontSize = 9;
  else if (rw < 140 || rh < 65) fontSize = 10;

  const maxChars = Math.max(6, Math.floor((rw - 14) / (fontSize * 0.56)));
  const canFitTwoLines = rh >= 46 && rw >= 48;
  const canFitThreeLines = rh >= 72 && rw >= 80;
  const maxLines = canFitThreeLines ? 3 : canFitTwoLines ? 2 : 1;

  const canShowText = rw >= 36 && rh >= 20;
  const lines = canShowText ? wrapText(name, maxChars, maxLines) : [];
  const canShowCount = rh >= (lines.length > 0 ? (lines.length * (fontSize + 2) + 20) : 18);

  const startX = rx + 7;
  const startY = ry + fontSize + 4;

  return (
    <g>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        fill={color || '#3b82f6'}
        stroke="#ffffff"
        strokeWidth={1.5}
        fillOpacity={0.95}
        rx={5}
        ry={5}
        className="transition-all duration-200 hover:fill-opacity-100 cursor-pointer dark:stroke-zinc-900"
      />
      {canShowText && (
        <text
          x={startX}
          y={startY}
          fill="#ffffff"
          fontSize={fontSize}
          fontWeight="600"
          textRendering="geometricPrecision"
          className="pointer-events-none select-none antialiased"
          style={{
            fontFamily: 'var(--font-noto-sans), var(--font-manrope), system-ui, sans-serif',
          }}
        >
          {lines.map((line, idx) => (
            <tspan
              key={idx}
              x={startX}
              dy={idx === 0 ? 0 : fontSize + 2}
            >
              {line}
            </tspan>
          ))}
          {canShowCount && (
            <tspan
              x={startX}
              dy={fontSize + 3}
              fill="rgba(255, 255, 255, 0.9)"
              fontSize={Math.max(9, fontSize - 1)}
              fontWeight="500"
            >
              {count} pub{count > 1 ? 's' : ''}
            </tspan>
          )}
        </text>
      )}
    </g>
  );
}

export default function CountryInstitutionsExplorer({
  data,
  selectedCountry: externalSelectedCountry,
  onSelectCountry: externalOnSelectCountry,
}: CountryInstitutionsExplorerProps) {
  const { t } = useTranslation();
  const [internalCountry, setInternalCountry] = useState<string>('FR');
  const [viewMode, setViewMode] = useState<'treemap' | 'bars'>('treemap');
  const [limit, setLimit] = useState<15 | 30 | 50>(30);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Compute all countries sorted by publication count
  const countries = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      p.authors.forEach((a) =>
        a.institutions.forEach((i) => {
          if (i.country) seen.add(i.country.toUpperCase());
        })
      );
      seen.forEach((c) => map.set(c, (map.get(c) || 0) + 1));
    });
    return Array.from(map.entries())
      .map(([code, count]) => ({
        code,
        name: getCountryName(code),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const activeCountry = externalSelectedCountry || internalCountry;

  const handleSelectCountry = (code: string) => {
    setInternalCountry(code);
    if (externalOnSelectCountry) {
      externalOnSelectCountry(code);
    }
  };

  // Top 8 frequent countries for quick-select chips
  const quickCountries = useMemo(() => countries.slice(0, 8), [countries]);

  // Compute institutions for the active country
  const { institutions, totalCountryPubs } = useMemo(() => {
    const counts = new Map<string, { name: string; ror: string | null; count: number }>();
    let totalCountryPubs = 0;

    data.forEach((p) => {
      let pubHasCountry = false;
      const seenInsts = new Set<string>();

      p.authors.forEach((a) => {
        a.institutions.forEach((inst) => {
          if (inst.country?.toUpperCase() === activeCountry) {
            pubHasCountry = true;
            const key = inst.ror || inst.name;
            if (key && !seenInsts.has(key)) {
              seenInsts.add(key);
              const current = counts.get(key) || { name: inst.name, ror: inst.ror, count: 0 };
              current.count += 1;
              counts.set(key, current);
            }
          }
        });
      });

      if (pubHasCountry) totalCountryPubs++;
    });

    const institutions = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .map((inst) => ({
        ...inst,
        percentage: totalCountryPubs > 0 ? Math.round((inst.count / totalCountryPubs) * 1000) / 10 : 0,
      }));

    return { institutions, totalCountryPubs };
  }, [data, activeCountry]);

  // Treemap data format
  const treeData = useMemo(() => {
    const top = institutions.slice(0, limit);
    return top.map((inst, idx) => ({
      name: inst.name,
      size: inst.count,
      count: inst.count,
      percentage: inst.percentage,
      ror: inst.ror,
      color: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length],
    }));
  }, [institutions, limit]);

  const activeCountryName = getCountryName(activeCountry);

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-8">
      {/* Header with Title & Country Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                {t.countryInstitutions.title}
              </h3>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">
                {t.countryInstitutions.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Country Selector dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('treemap')}
              aria-label="Treemap view"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'treemap'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={14} /> {t.countryInstitutions.treemap}
            </button>
            <button
              onClick={() => setViewMode('bars')}
              aria-label="Bar chart view"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'bars'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <BarChart2 size={14} /> {t.countryInstitutions.barChart}
            </button>
          </div>

          {/* Full Country Select Dropdown */}
          <div className="relative">
            <select
              id="country-affiliation-select"
              aria-label="Select Country"
              value={activeCountry}
              onChange={(e) => handleSelectCountry(e.target.value)}
              className="appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({formatNum(c.count)} {t.common.pubs})
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Quick Select Country Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-2 flex items-center gap-1.5">
          <Globe size={13} /> {t.countryInstitutions.quickSelect}
        </span>
        {quickCountries.map((c) => {
          const isSelected = c.code === activeCountry;
          return (
            <button
              key={c.code}
              onClick={() => handleSelectCountry(c.code)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="font-mono text-[10px] font-black opacity-75">{c.code}</span>
              <span>{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                {formatNum(c.count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Country Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-blue-900 dark:text-blue-100 font-heading">
            {activeCountryName}
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-full font-mono">
            {activeCountry}
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold text-zinc-600 dark:text-zinc-300">
          <div>
            <span className="text-zinc-400 font-normal">{t.countryInstitutions.publications} </span>
            <span className="font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{formatNum(totalCountryPubs)}</span>
          </div>
          <div>
            <span className="text-zinc-400 font-normal">{t.countryInstitutions.identifiedInstitutions} </span>
            <span className="font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{formatNum(institutions.length)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-normal">{t.countryInstitutions.limit} </span>
            <div className="flex bg-white dark:bg-zinc-800 rounded-lg p-0.5 shadow-sm border border-zinc-200 dark:border-zinc-700">
              {([15, 30, 50] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLimit(l)}
                  className={`px-2 py-0.5 text-[10px] font-black rounded ${
                    limit === l ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      {institutions.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          {t.countryInstitutions.noAffiliation.replace('{country}', activeCountryName)}
        </div>
      ) : viewMode === 'treemap' ? (
        /* Treemap View */
        <div className="h-[560px] min-h-[560px] w-full bg-zinc-50/50 dark:bg-zinc-950/30 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          <ChartContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              aspectRatio={16 / 9}
              stroke="#fff"
              content={(cellProps: Record<string, unknown>) => {
                const payload = cellProps.payload as { count?: number; name?: string; color?: string } | undefined;
                const size = typeof cellProps.size === 'number' ? cellProps.size : 0;
                const name = typeof cellProps.name === 'string' ? cellProps.name : (payload?.name || '');
                const color = typeof cellProps.color === 'string' ? cellProps.color : (payload?.color || '#3b82f6');
                const count = payload?.count ?? size;
                return (
                  <TreemapCell
                    {...(cellProps as TreemapContentProps)}
                    count={count}
                    name={name}
                    color={color}
                  />
                );
              }}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl text-white font-sans space-y-1 z-50">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{activeCountryName}</p>
                      <p className="text-sm font-bold text-white max-w-sm">{item.name}</p>
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-4 text-xs">
                        <span className="font-black text-teal-400">{formatNum(item.count)} publications</span>
                        <span className="font-bold text-zinc-400">{item.percentage}% of country</span>
                      </div>
                      {item.ror && (
                        <p className="text-[10px] font-mono text-zinc-400 pt-1">ROR: {item.ror}</p>
                      )}
                    </div>
                  );
                }}
              />
            </Treemap>
          </ChartContainer>
        </div>
      ) : (
        /* Bar Chart View */
        <div className="border border-zinc-100 rounded-2xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
          <div style={{ height: `${Math.max(380, Math.min(limit, institutions.length) * 34)}px`, width: '100%' }}>
            <ChartContainer width="100%" height="100%">
              <BarChart
                data={institutions.slice(0, limit)}
                layout="vertical"
                margin={{ left: 20, right: 40, top: 10, bottom: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={240}
                  tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl text-white font-sans space-y-1 z-50">
                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{activeCountryName}</p>
                        <p className="text-sm font-bold text-white max-w-sm">{item.name}</p>
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-4 text-xs">
                          <span className="font-black text-teal-400">{formatNum(item.count)} publications</span>
                          <span className="font-bold text-zinc-400">{item.percentage}% of country</span>
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* Top Institutions Grid Cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
          Ranked Institutions in {activeCountryName} ({Math.min(limit, institutions.length)} of {institutions.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {institutions.slice(0, limit).map((inst, idx) => (
            <div
              key={inst.ror || inst.name}
              className="flex flex-col justify-between p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700 text-[10px] font-black text-zinc-700 dark:text-zinc-300 font-sans">
                  {idx + 1}
                </span>
                {inst.ror ? (
                  <a
                    href={inst.ror.startsWith('http') ? inst.ror : `https://ror.org/${inst.ror}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase truncate hover:underline flex items-center gap-1 shrink-0"
                    title={`View ${inst.name} on ROR`}
                  >
                    {inst.ror.split('/').pop()}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-tighter shrink-0">
                    No ROR
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5rem]" title={inst.name}>
                {inst.name}
              </p>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="font-black text-zinc-900 dark:text-zinc-100">
                  {formatNum(inst.count)} <span className="text-[10px] font-normal text-zinc-400">pubs</span>
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full text-[10px]">
                  {inst.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
