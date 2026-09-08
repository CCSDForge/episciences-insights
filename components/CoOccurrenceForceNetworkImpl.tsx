'use client';

import React, { useMemo, useState } from 'react';
import { Publication } from '@/lib/types';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import { COLOR_RAMPS, COMMUNITY_COLORS, rampStep } from '@/lib/colorRamps';
import { useTranslation } from '@/lib/i18n/LanguageContext';

// This is a distinct, additional view alongside CoOccurrenceNetwork's fixed
// circular layout — same generic getEntities-driven data prep, but plotted
// as a real force simulation with Louvain community coloring instead of a
// ring. It's intentionally its own self-contained component (own hover
// state, own SVG rendering) rather than reusing NetworkGraph.tsx, so the
// existing circular network view is untouched by this addition.

export interface CoOccurrenceEntity {
  id: string;
  name: string;
  meta?: Record<string, string>;
}

interface CoOccurrenceForceNetworkProps {
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
const RADIUS_MIN = 6;
const RADIUS_MAX = 20;
// d3-force's default alphaDecay (derived from alphaMin=0.001) assumes ~300
// ticks to fully cool down — this just runs that convergence synchronously
// instead of over animation frames, so the layout is a fixed data point by
// the time it's ever rendered.
const SIMULATION_TICKS = 300;

interface SimNode extends SimulationNodeDatum {
  id: string;
  name: string;
  count: number;
  community: number;
  meta?: Record<string, string>;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  weight: number;
}

interface PositionedNode {
  id: string;
  name: string;
  count: number;
  community: number;
  meta?: Record<string, string>;
  x: number;
  y: number;
}

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

function nodeRadiusFor(count: number, maxCount: number): number {
  if (maxCount <= 0) return RADIUS_MIN;
  const ratio = Math.log(count + 1) / Math.log(maxCount + 1);
  return RADIUS_MIN + ratio * (RADIUS_MAX - RADIUS_MIN);
}

// See NetworkGraph.tsx's identical helper for why this exists — kept as its
// own copy here rather than imported, to keep this component fully
// self-contained and not create an accidental coupling to the circular
// layout's internals.
function roundCoord(n: number) {
  return Math.round(n * 10000) / 10000;
}

export default function CoOccurrenceForceNetwork({
  data, getEntities, icon, title, subtitle, entityLabelPlural, metaLabel, colorTheme, tooltipId, emptyMessage, maxNodes = 20,
}: CoOccurrenceForceNetworkProps) {
  const { t } = useTranslation();
  const theme = THEMES[colorTheme];
  const ramp = COLOR_RAMPS[colorTheme];
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{ src: string; tgt: string; weight: number } | null>(null);

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

    const links = allLinks
      .map(([key, weight]) => { const [source, target] = key.split('|'); return { source, target, weight }; })
      .filter((l) => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    const maxWeight = links.reduce((max, l) => Math.max(max, l.weight), 0);
    const maxCount = nodes.reduce((max, n) => Math.max(max, n.count), 0);

    // Louvain community detection — groups nodes into natural clusters based
    // on the same co-occurrence edges already computed above, so "which
    // funders/countries/topics tend to appear together" becomes a color,
    // not just an implicit position on the canvas.
    const graph = new Graph({ type: 'undirected' });
    nodes.forEach((n) => graph.addNode(n.id));
    links.forEach((l) => graph.mergeEdge(l.source, l.target, { weight: l.weight }));
    const communities = nodes.length > 0 ? louvain(graph, { getEdgeWeight: 'weight' }) : {};
    const communityCount = new Set(Object.values(communities)).size;

    // Force-directed layout: nodes repel each other (forceManyBody), edges
    // pull co-occurring nodes together (forceLink), forceCenter keeps the
    // whole graph anchored on the canvas, forceCollide keeps nodes from
    // overlapping once sized by publication volume below.
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n, community: communities[n.id] ?? 0 }));
    const simLinks: SimLink[] = links.map((l) => ({ source: l.source, target: l.target, weight: l.weight }));

    if (simNodes.length > 0) {
      const simulation = forceSimulation(simNodes)
        .force('link', forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(150).strength(0.25))
        .force('charge', forceManyBody().strength(-450))
        .force('center', forceCenter(CENTER_X, CENTER_Y))
        .force('collide', forceCollide<SimNode>((d) => nodeRadiusFor(d.count, maxCount) + 14))
        .stop();
      for (let i = 0; i < SIMULATION_TICKS; i++) simulation.tick();
    }

    const positionMap: Record<string, PositionedNode> = {};
    simNodes.forEach((n) => {
      positionMap[n.id] = { ...n, x: roundCoord(n.x ?? CENTER_X), y: roundCoord(n.y ?? CENTER_Y) };
    });

    return { positionMap, links, totalEntities: allNodes.length, totalConnections: allLinks.length, maxWeight, maxCount, communityCount };
  }, [data, getEntities, maxNodes]);

  const nodePositions = Object.values(network.positionMap);
  const getLinkColor = (weight: number) => rampStep(weight, network.maxWeight, ramp);
  const getNodeColor = (community: number) => COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];

  if (network.links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl">
        <div className="mb-4 opacity-50 [&_svg]:h-8 [&_svg]:w-8">{icon}</div>
        <p className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  const hoveredSrc = hoveredLink ? network.positionMap[hoveredLink.src] : null;
  const hoveredTgt = hoveredLink ? network.positionMap[hoveredLink.tgt] : null;
  const hoveredNode = hoveredNodeId ? network.positionMap[hoveredNodeId] : null;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">

      {/* Graph — aspect-[4/3] matches the SVG viewBox (800x600) so widening
          the page grows the graph itself instead of just adding letterbox padding */}
      <div className="relative flex-1 aspect-[4/3] min-h-[500px] max-h-[750px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <svg viewBox="0 0 800 600" className="w-full h-full preserve-3d">
          {/* Links */}
          {network.links.map((link, i) => {
            const src = network.positionMap[link.source];
            const tgt = network.positionMap[link.target];
            if (!src || !tgt) return null;

            const isHighlighted = hoveredLink?.src === link.source && hoveredLink?.tgt === link.target;
            const isNodeRelated = hoveredNodeId === link.source || hoveredNodeId === link.target;
            const isEmphasized = isHighlighted || isNodeRelated;
            const d = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;

            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLink({ src: link.source, tgt: link.target, weight: link.weight })}
                  onMouseLeave={() => setHoveredLink(null)}
                  data-tooltip-id={tooltipId}
                  data-tooltip-content={`${src.name} ↔ ${tgt.name} (${link.weight} papers)`}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={isEmphasized ? theme.activeColor : getLinkColor(link.weight)}
                  strokeWidth={isHighlighted ? 6 : Math.max(2, link.weight * 1.5)}
                  strokeOpacity={isEmphasized ? 0.9 : 0.55}
                  className="transition-all duration-500 pointer-events-none"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodePositions.map((node) => {
            const isHighlighted = hoveredNodeId === node.id || hoveredLink?.src === node.id || hoveredLink?.tgt === node.id;
            const baseRadius = nodeRadiusFor(node.count, network.maxCount);

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                data-tooltip-id={tooltipId}
                data-tooltip-content={`${node.name} - ${node.count} publications`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHighlighted ? baseRadius + 4 : baseRadius}
                  fill={isHighlighted ? theme.activeNodeColor : getNodeColor(node.community)}
                  stroke="white"
                  strokeWidth="3"
                  className={`transition-all duration-300 ${isHighlighted ? '' : 'network-mark-node'}`}
                />
                {(isHighlighted || node.count > 3) && (
                  <text
                    x={node.x + (node.x > CENTER_X ? 18 : -18)}
                    y={node.y}
                    textAnchor={node.x > CENTER_X ? 'start' : 'end'}
                    dominantBaseline="middle"
                    fontSize={isHighlighted ? '14' : '10'}
                    fontWeight={isHighlighted ? '900' : '700'}
                    fill="currentColor"
                    style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                    className={`pointer-events-none drop-shadow-md ${isHighlighted ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'}`}
                  >
                    {node.name.length > 35 ? `${node.name.substring(0, 32)}...` : node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <Tooltip
          id={tooltipId}
          style={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', fontWeight: '600', zIndex: 100, maxWidth: '320px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
        />
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

        <div className="h-[320px] shrink-0 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 shadow-inner flex flex-col justify-center overflow-hidden">
          {hoveredLink && hoveredSrc && hoveredTgt ? (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.labelColor}`}>{t.common.sharedConnection}</p>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t.common.partnerA}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{hoveredSrc.name}</p>
                </div>
                <div className="flex justify-center">
                  <div className={`px-4 py-1.5 text-white rounded-full text-xs font-black shadow-xl ring-4 ${theme.badgeBg}`}>
                    {hoveredLink.weight} {t.common.jointPublications}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-black text-zinc-400 uppercase mb-1">{t.common.partnerB}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right">{hoveredTgt.name}</p>
                </div>
              </div>
            </div>
          ) : hoveredNode ? (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{t.common.profile}</p>
              <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{hoveredNode.name}</h5>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm w-fit">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getNodeColor(hoveredNode.community) }} aria-hidden="true" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.coOccurrence.clusterPrefix} {hoveredNode.community + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{t.common.impact}</p>
                  <p className={`text-2xl font-black ${theme.labelColor}`}>{hoveredNode.count} <span className="text-[10px] text-zinc-400">{t.common.pubs}</span></p>
                </div>
                {metaLabel && hoveredNode.meta?.[metaLabel] && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{metaLabel}</p>
                    <p className="text-lg font-black text-zinc-700 dark:text-zinc-300">{hoveredNode.meta[metaLabel]}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Info className="text-zinc-400 dark:text-zinc-600" size={32} />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[200px]">{t.common.hoverHint}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className={`text-2xl font-black ${theme.statColor}`}>{network.totalEntities}</p>
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.coOccurrence.totalEntities.replace('{entityLabelPlural}', entityLabelPlural)}</p>
          </div>
          <div className="p-4 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className={`text-2xl font-black ${theme.statColor}`}>{network.totalConnections}</p>
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.coOccurrence.totalConnections}</p>
          </div>
          <div className="p-4 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className={`text-2xl font-black ${theme.statColor}`}>{network.communityCount}</p>
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.coOccurrence.clusters}</p>
          </div>
        </div>
        {network.totalEntities > maxNodes && (
          <p className="text-[9px] text-zinc-400 italic text-center">{t.coOccurrence.topLimitNotice.replace('{max}', maxNodes.toString()).replace('{entityLabelPlural}', entityLabelPlural.toLowerCase())}</p>
        )}

        <p className="text-[10px] text-zinc-400 italic text-center">{t.coOccurrence.louvainLegend}</p>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-1">{t.coOccurrence.fewerShared}</span>
          {ramp.map((color) => (
            <span key={color} className="h-3 w-3 rounded-full border border-white dark:border-zinc-900" style={{ backgroundColor: color }} />
          ))}
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{t.coOccurrence.moreShared}</span>
        </div>
      </div>
    </div>
  );
}
