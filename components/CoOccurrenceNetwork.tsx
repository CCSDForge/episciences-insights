'use client';

import React, { useMemo } from 'react';
import { Publication } from '@/lib/types';
import { Info } from 'lucide-react';
import { NetworkGraph, NetworkNode } from './NetworkGraph';
import { COLOR_RAMPS, rampStep } from '@/lib/colorRamps';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export interface CoOccurrenceEntity {
  id: string;
  name: string;
  meta?: Record<string, string>;
}

interface CoOccurrenceNetworkProps {
  data: Publication[];
  getEntities: (p: Publication) => CoOccurrenceEntity[];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  entityLabelPlural: string;
  metaLabel?: string;
  colorTheme: 'blue' | 'teal' | 'indigo';
  tooltipId: string;
  emptyMessage: string;
  maxNodes?: number;
}

const CENTER_X = 400;
const CENTER_Y = 300;
const RADIUS = 200;

const THEMES = {
  blue: {
    iconBg: 'bg-blue-600 shadow-blue-600/20',
    activeColor: '#2563eb',
    activeNodeColor: '#1d4ed8',
    badgeBg: 'bg-blue-600 shadow-blue-600/30 ring-blue-600/10',
    labelColor: 'text-blue-600',
    statColor: 'text-blue-400',
  },
  teal: {
    iconBg: 'bg-teal-600 shadow-teal-600/20',
    activeColor: '#0d9488',
    activeNodeColor: '#0f766e',
    badgeBg: 'bg-teal-600 shadow-teal-600/30 ring-teal-600/10',
    labelColor: 'text-teal-600',
    statColor: 'text-teal-400',
  },
  indigo: {
    iconBg: 'bg-indigo-600 shadow-indigo-600/20',
    activeColor: '#4f46e5',
    activeNodeColor: '#4338ca',
    badgeBg: 'bg-indigo-600 shadow-indigo-600/30 ring-indigo-600/10',
    labelColor: 'text-indigo-600 dark:text-indigo-400',
    statColor: 'text-indigo-400',
  },
} as const;

export default function CoOccurrenceNetwork({
  data, getEntities, icon, title, subtitle, entityLabelPlural, metaLabel, colorTheme, tooltipId, emptyMessage, maxNodes = 25,
}: CoOccurrenceNetworkProps) {
  const { t } = useTranslation();
  const theme = THEMES[colorTheme];
  const ramp = COLOR_RAMPS[colorTheme];

  const network = useMemo(() => {
    const nodesMap: Record<string, { id: string; name: string; count: number; meta?: Record<string, string> }> = {};
    const linksMap: Record<string, number> = {};

    data.forEach((p) => {
      const inPaper = new Map<string, CoOccurrenceEntity>();
      getEntities(p).forEach((e) => { if (e.id) inPaper.set(e.id, e); });

      inPaper.forEach((e) => {
        if (!nodesMap[e.id]) nodesMap[e.id] = { id: e.id, name: e.name, count: 0, meta: e.meta };
        nodesMap[e.id].count += 1;
      });

      const ids = Array.from(inPaper.keys()).sort();
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = `${ids[i]}|${ids[j]}`;
          linksMap[key] = (linksMap[key] || 0) + 1;
        }
      }
    });

    const allNodes = Object.values(nodesMap).sort((a, b) => b.count - a.count);
    const allLinks = Object.entries(linksMap);
    const nodes = allNodes.slice(0, maxNodes);
    const topNodeIds = new Set(nodes.map((n) => n.id));

    const nodePositions = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return { ...node, x: CENTER_X + RADIUS * Math.cos(angle), y: CENTER_Y + RADIUS * Math.sin(angle), angle };
    });

    const links = allLinks
      .map(([key, weight]) => { const [source, target] = key.split('|'); return { source, target, weight }; })
      .filter((l) => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    const maxWeight = links.reduce((max, l) => Math.max(max, l.weight), 0);
    const maxCount = nodes.reduce((max, n) => Math.max(max, n.count), 0);

    return { nodePositions, links, totalEntities: allNodes.length, totalConnections: allLinks.length, maxWeight, maxCount };
  }, [data, getEntities, maxNodes]);

  const getLinkColor = useMemo(() => (weight: number) => rampStep(weight, network.maxWeight, ramp), [network.maxWeight, ramp]);
  const getLinkWidth = useMemo(() => (weight: number) => {
    if (!network.maxWeight || network.maxWeight <= 1) return 1.5;
    const ratio = Math.log(weight + 1) / Math.log(network.maxWeight + 1);
    return 1.5 + ratio * 4.5;
  }, [network.maxWeight]);
  const getNodeColor = useMemo(() => (count: number) => rampStep(count, network.maxCount, ramp), [network.maxCount, ramp]);

  if (network.links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl">
        <div className="mb-4 opacity-50 [&_svg]:h-8 [&_svg]:w-8">{icon}</div>
        <p className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <NetworkGraph.Provider nodePositions={network.nodePositions} links={network.links} centerX={CENTER_X} centerY={CENTER_Y}>
      <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">

        {/* Graph — aspect-[4/3] matches the Canvas viewBox (800x600) so widening
            the page grows the graph itself instead of just adding letterbox padding */}
        <div className="relative flex-1 aspect-[4/3] min-h-[500px] max-h-[750px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <NetworkGraph.Canvas
            tooltipId={tooltipId}
            activeColor={theme.activeColor}
            activeNodeColor={theme.activeNodeColor}
            getLinkColor={getLinkColor}
            getLinkWidth={getLinkWidth}
            getNodeColor={getNodeColor}
            getLinkTooltip={(src, tgt, weight) => `${src.name} ↔ ${tgt.name} (${weight} papers)`}
            getNodeTooltip={(node) => `${node.name} - ${node.count as number} publications`}
            background={
              <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="8 8" />
            }
            renderNodeLabel={(node: NetworkNode, isHighlighted: boolean) => {
              const cos = Math.cos(node.angle);
              const sin = Math.sin(node.angle);

              let textAnchor: 'start' | 'end' | 'middle' = 'start';
              let dominantBaseline: 'middle' | 'auto' | 'hanging' = 'middle';
              let x = node.x;
              let y = node.y;

              if (cos > 0.3) {
                textAnchor = 'start';
                dominantBaseline = 'middle';
                x = node.x + (isHighlighted ? 18 : 14);
              } else if (cos < -0.3) {
                textAnchor = 'end';
                dominantBaseline = 'middle';
                x = node.x - (isHighlighted ? 18 : 14);
              } else if (sin < 0) {
                textAnchor = 'middle';
                dominantBaseline = 'auto';
                y = node.y - (isHighlighted ? 18 : 14);
              } else {
                textAnchor = 'middle';
                dominantBaseline = 'hanging';
                y = node.y + (isHighlighted ? 18 : 14);
              }

              const rawName = (node.name as string) || '';
              const displayName = rawName.length > 32 ? rawName.substring(0, 30) + '…' : rawName;

              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  fontSize={isHighlighted ? '13' : '10'}
                  fontWeight={isHighlighted ? '900' : '700'}
                  fill="currentColor"
                  style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                  className={`pointer-events-none drop-shadow-md transition-all duration-200 ${
                    isHighlighted ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {displayName}
                </text>
              );
            }}
          />
          <NetworkGraph.Tooltip id={tooltipId} />
        </div>

        {/* Sidebar */}
        <div className="lg:w-[380px] flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 text-white rounded-xl shadow-lg ${theme.iconBg}`}>
                {icon}
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 font-heading">{title}</h4>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{subtitle}</p>
          </div>

          <NetworkGraph.DetailPanel
            className="h-[320px] shrink-0 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 shadow-inner flex flex-col justify-center overflow-hidden"
            renderEmpty={() => (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Info className="text-zinc-400 dark:text-zinc-600" size={32} />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[200px]">{t.common.hoverHint}</p>
              </div>
            )}
            renderLinkDetail={(src, tgt, weight) => (
              <div className="space-y-6">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.labelColor}`}>{t.common.sharedConnection}</p>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t.common.partnerA}</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{src.name as string}</p>
                  </div>
                  <div className="flex justify-center">
                    <div className={`px-4 py-1.5 text-white rounded-full text-xs font-black shadow-xl ring-4 ${theme.badgeBg}`}>
                      {weight} {t.common.jointPublications}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t.common.partnerB}</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right">{tgt.name as string}</p>
                  </div>
                </div>
              </div>
            )}
            renderNodeDetail={(node) => {
              const meta = node.meta as Record<string, string> | undefined;
              const metaValue = metaLabel && meta ? meta[metaLabel] : undefined;
              return (
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{t.common.profile}</p>
                  <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{node.name as string}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{t.common.impact}</p>
                      <p className={`text-2xl font-black ${theme.labelColor}`}>{node.count as number} <span className="text-[10px] text-zinc-400">{t.common.pubs}</span></p>
                    </div>
                    {metaValue && (
                      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{metaLabel}</p>
                        <p className="text-lg font-black text-zinc-700 dark:text-zinc-300">{metaValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
              <p className={`text-3xl font-black ${theme.statColor}`}>{network.totalEntities}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">
                {t.coOccurrence.totalEntities.replace('{label}', entityLabelPlural)}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
              <p className={`text-3xl font-black ${theme.statColor}`}>{network.totalConnections}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.coOccurrence.totalConnections}</p>
            </div>
          </div>
          {network.totalEntities > maxNodes && (
            <p className="text-[9px] text-zinc-400 italic text-center">
              {t.coOccurrence.topLimitNotice
                .replace('{max}', String(maxNodes))
                .replace('{label}', entityLabelPlural.toLowerCase())}
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-1">{t.common.fewer}</span>
            {ramp.map((color) => (
              <span
                key={color}
                className="h-3 w-3 rounded-full border border-white dark:border-zinc-900"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{t.common.more}</span>
          </div>
        </div>
      </div>
    </NetworkGraph.Provider>
  );
}
