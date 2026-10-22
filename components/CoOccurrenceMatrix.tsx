'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Tooltip } from 'react-tooltip';
import { Publication } from '@/lib/types';
import { COLOR_RAMPS, rampStep } from '@/lib/colorRamps';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import ChartExportMenu from '@/components/ChartExportMenu';

type TopN = 15 | 25 | 40;

interface Entity {
  id: string;
  name: string;
}

interface CoOccurrenceMatrixProps {
  data: Publication[];
  getEntities: (p: Publication) => Entity[];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  entityLabelPlural: string;
  colorTheme: 'teal' | 'blue' | 'indigo';
  tooltipId: string;
  noDataTitle: string;
  noDataDescription: string;
}

const THEME_STYLES = {
  teal: {
    iconBg: 'bg-teal-600 shadow-teal-600/20',
    activeText: 'text-teal-700 dark:text-teal-400',
    noDataBg: 'bg-teal-50/30 dark:bg-teal-900/10',
    noDataBorder: 'border-teal-100 dark:border-teal-900/30',
    noDataIcon: 'text-teal-200 dark:text-teal-800',
    noDataTitleText: 'text-teal-900 dark:text-teal-100',
    noDataDescText: 'text-teal-600/70 dark:text-teal-400/60',
  },
  blue: {
    iconBg: 'bg-blue-600 shadow-blue-600/20',
    activeText: 'text-blue-700 dark:text-blue-400',
    noDataBg: 'bg-blue-50/30 dark:bg-blue-900/10',
    noDataBorder: 'border-blue-100 dark:border-blue-900/30',
    noDataIcon: 'text-blue-200 dark:text-blue-800',
    noDataTitleText: 'text-blue-900 dark:text-blue-100',
    noDataDescText: 'text-blue-600/70 dark:text-blue-400/60',
  },
  indigo: {
    iconBg: 'bg-indigo-600 shadow-indigo-600/20',
    activeText: 'text-indigo-700 dark:text-indigo-400',
    noDataBg: 'bg-indigo-50/30 dark:bg-indigo-900/10',
    noDataBorder: 'border-indigo-100 dark:border-indigo-900/30',
    noDataIcon: 'text-indigo-200 dark:text-indigo-800',
    noDataTitleText: 'text-indigo-900 dark:text-indigo-100',
    noDataDescText: 'text-indigo-600/70 dark:text-indigo-400/60',
  },
} as const;

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

export default function CoOccurrenceMatrix({
  data, getEntities, icon, title, subtitle, entityLabelPlural, colorTheme, tooltipId, noDataTitle, noDataDescription,
}: CoOccurrenceMatrixProps) {
  const { t } = useTranslation();
  const [topN, setTopN] = useState<TopN>(25);
  const matrixContainerRef = useRef<HTMLDivElement>(null);
  const theme = THEME_STYLES[colorTheme];
  const ramp = COLOR_RAMPS[colorTheme];

  const { entities, totals, pairCounts, maxPair, namesById } = useMemo(() => {
    const totalsMap: Record<string, number> = {};
    const pairMap: Record<string, number> = {};
    const names: Record<string, string> = {};

    data.forEach((p) => {
      const inPaper = new Map<string, string>();
      getEntities(p).forEach((e) => { if (e.id) inPaper.set(e.id, e.name); });
      inPaper.forEach((name, id) => {
        totalsMap[id] = (totalsMap[id] || 0) + 1;
        names[id] = name;
      });
      const sorted = Array.from(inPaper.keys()).sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}|${sorted[j]}`;
          pairMap[key] = (pairMap[key] || 0) + 1;
        }
      }
    });

    const topEntities = Object.entries(totalsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([id]) => id);

    let max = 0;
    Object.entries(pairMap).forEach(([key, count]) => {
      const [a, b] = key.split('|');
      if (topEntities.includes(a) && topEntities.includes(b)) max = Math.max(max, count);
    });

    return { entities: topEntities, totals: totalsMap, pairCounts: pairMap, maxPair: max, namesById: names };
  }, [data, topN, getEntities]);

  const getCount = useCallback((a: string, b: string) => {
    if (a === b) return totals[a] || 0;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    return pairCounts[key] || 0;
  }, [totals, pairCounts]);

  const rampColors = useCallback((count: number) => rampStep(count, maxPair, ramp), [maxPair, ramp]);

  const matrixData = useMemo(() => {
    return entities.map((rowId) => {
      const rowName = namesById[rowId] || rowId;
      const rowObj: Record<string, string | number> = {
        entity: rowName,
        id: rowId,
        totalPublications: totals[rowId] || 0,
      };
      entities.forEach((colId) => {
        const colName = namesById[colId] || colId;
        rowObj[colName] = getCount(rowId, colId);
      });
      return rowObj;
    });
  }, [entities, namesById, totals, getCount]);

  const csvColumns = useMemo(() => {
    return [
      { key: 'entity', header: entityLabelPlural ? entityLabelPlural.toUpperCase() : 'ENTITY' },
      { key: 'totalPublications', header: 'TOTAL_PUBLICATIONS' },
      ...entities.map((colId) => ({
        key: namesById[colId] || colId,
        header: (namesById[colId] || colId).replace(/,/g, ' '),
      })),
    ];
  }, [entities, namesById, entityLabelPlural]);

  if (entities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-8 text-center rounded-3xl border-2 border-dashed ${theme.noDataBg} ${theme.noDataBorder}`}>
        <div className={`mb-4 ${theme.noDataIcon} [&_svg]:h-12 [&_svg]:w-12`}>{icon}</div>
        <h4 className={`text-lg font-bold mb-2 ${theme.noDataTitleText}`}>{noDataTitle}</h4>
        <p className={`text-sm italic max-w-md ${theme.noDataDescText}`}>{noDataDescription}</p>
      </div>
    );
  }

  const cellSize = 32;
  const labelColWidth = 240;
  const headerRowHeight = 150;
  const totalWidth = labelColWidth + entities.length * cellSize;
  const totalHeight = headerRowHeight + entities.length * cellSize;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 text-white rounded-2xl shadow-lg ${theme.iconBg}`} aria-hidden="true">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{title}</h3>
            <p className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
            {([15, 25, 40] as TopN[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTopN(n)}
                aria-label={`Top ${n} ${entityLabelPlural}`}
                aria-pressed={topN === n}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 border-zinc-200 dark:border-zinc-600 ${
                  topN === n ? `bg-white dark:bg-zinc-700 shadow-sm ${theme.activeText}` : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {t.matrix.showTop.replace('{n}', String(n))}
              </button>
            ))}
          </div>

          <ChartExportMenu
            targetRef={matrixContainerRef}
            data={matrixData}
            filename={`episciences-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-top${topN}`}
            csvColumns={csvColumns}
          />
        </div>
      </div>

      <div className="overflow-auto border border-zinc-100 rounded-2xl dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 p-4">
        <div ref={matrixContainerRef} className="inline-block min-w-full">
          <svg
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="block font-sans select-none"
            role="img"
            aria-label={`${title} - ${subtitle}`}
          >
            {/* Column headers (rotated) */}
            {entities.map((colId, cIdx) => {
              const x = labelColWidth + cIdx * cellSize + cellSize / 2;
              const y = headerRowHeight - 10;
              const rawName = namesById[colId] || colId;
              const shortName = rawName.length > 30 ? `${rawName.slice(0, 28)}…` : rawName;
              return (
                <g key={`col-${colId}`} transform={`translate(${x}, ${y})`}>
                  <text
                    transform="rotate(-52)"
                    textAnchor="start"
                    className="text-[10px] font-bold fill-zinc-600 dark:fill-zinc-400"
                    fontSize="10"
                    fontWeight="700"
                  >
                    <title>{rawName}</title>
                    {shortName}
                  </text>
                </g>
              );
            })}

            {/* Rows */}
            {entities.map((rowId, rIdx) => {
              const rowY = headerRowHeight + rIdx * cellSize;
              const rawName = namesById[rowId] || rowId;
              const shortName = rawName.length > 32 ? `${rawName.slice(0, 30)}…` : rawName;

              return (
                <g key={`row-${rowId}`}>
                  {/* Row header label */}
                  <text
                    x={labelColWidth - 12}
                    y={rowY + cellSize / 2 + 4}
                    textAnchor="end"
                    className="text-[11px] font-bold fill-zinc-700 dark:fill-zinc-300"
                    fontSize="11"
                    fontWeight="700"
                  >
                    <title>{rawName}</title>
                    {shortName}
                  </text>

                  {/* Cells */}
                  {entities.map((colId, cIdx) => {
                    const colX = labelColWidth + cIdx * cellSize;
                    const isDiagonal = rowId === colId;
                    const count = getCount(rowId, colId);
                    const isEmpty = !isDiagonal && count === 0;
                    const tooltip = isDiagonal
                      ? t.matrix.diagonalTooltip
                          .replace('{name}', rawName)
                          .replace('{count}', formatNum(count))
                      : t.matrix.crossTooltip
                          .replace('{nameA}', rawName)
                          .replace('{nameB}', namesById[colId] || colId)
                          .replace('{count}', formatNum(count));

                    const fillColor = isDiagonal || isEmpty
                      ? undefined
                      : rampColors(count);

                    return (
                      <rect
                        key={`cell-${rowId}-${colId}`}
                        x={colX + 1}
                        y={rowY + 1}
                        width={cellSize - 2}
                        height={cellSize - 2}
                        rx={4}
                        ry={4}
                        fill={fillColor}
                        className={`${
                          isDiagonal || isEmpty
                            ? 'fill-zinc-100 dark:fill-zinc-800'
                            : ''
                        } stroke-white dark:stroke-zinc-900 transition-opacity hover:opacity-80 cursor-pointer`}
                        strokeWidth="1"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={tooltip}
                        aria-label={tooltip}
                        role="gridcell"
                        tabIndex={0}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t.coOccurrence.sortedByVolume
            .replace('{count}', String(entities.length))
            .replace('{label}', entityLabelPlural)
            .replace('{max}', formatNum(maxPair))}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mr-1">{t.common.fewer}</span>
          {ramp.map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-sm border border-white dark:border-zinc-900"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">{t.common.more}</span>
        </div>
      </div>

      <Tooltip id={tooltipId} style={{ backgroundColor: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', zIndex: 100, maxWidth: '320px' }} />
    </div>
  );
}
