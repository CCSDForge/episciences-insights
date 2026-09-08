'use client';

import React, { useMemo, useState } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { Tooltip } from 'react-tooltip';
import { Waypoints } from 'lucide-react';
import { Publication, FundersFile } from '@/lib/types';
import { getCountryName } from '@/lib/countryNames';
import { getDomainColor } from '@/lib/domainColors';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderSankeyProps {
  data: Publication[];
  funders: FundersFile;
}

type NodeKind = 'country' | 'funder' | 'domain';
type TopN = 15 | 25 | 40;

interface NodeExtra {
  id: string;
  name: string;
  kind: NodeKind;
}

const TOOLTIP_ID = 'funder-sankey-tooltip';
// Country = blue (matches the country/"Global Reach" theme elsewhere),
// funder = teal (matches the funder theme elsewhere), domain reuses the
// shared getDomainColor() palette so it lines up with the topic treemap.
const COUNTRY_COLOR = '#2563eb';
const FUNDER_COLOR = '#0d9488';

// Links stay dim at rest so 40 overlapping flows don't turn into visual noise;
// hovering a node lights up its whole path and mutes everything unrelated,
// which is how a reader actually traces one flow through a dense diagram.
const BASE_LINK_OPACITY = 0.32;
const ACTIVE_LINK_OPACITY = 0.9;
const DIM_LINK_OPACITY = 0.06;
const DIM_NODE_OPACITY = 0.25;
// Minimum vertical gap between two label baselines (10px bold text needs a
// little more than its own height to not visually merge with a neighbor).
const LABEL_MIN_GAP = 13;

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

function colorForNode(node: { kind: NodeKind; name: string }): string {
  if (node.kind === 'domain') return getDomainColor(node.name);
  return node.kind === 'funder' ? FUNDER_COLOR : COUNTRY_COLOR;
}

interface LaidOutNode { id: string; kind: NodeKind; y0?: number; y1?: number }
interface LaidOutLink { source: LaidOutNode; target: LaidOutNode }
type Hovered = { kind: 'node'; id: string } | { kind: 'link'; index: number };

// The leftmost (country) and rightmost (domain) columns always show every
// label regardless of how thin the node is, which is exactly where labels
// collide once a node's flow is small. Nudge colliding labels apart along
// the column and let the caller draw a leader line back to the true node
// position for any label that moved.
function declutterLabelYs(nodes: LaidOutNode[], minGap: number, maxY: number): Map<string, number> {
  const items = nodes
    .map((n) => ({ id: n.id, y: ((n.y0 || 0) + (n.y1 || 0)) / 2 }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) {
    if (items[i].y - items[i - 1].y < minGap) items[i].y = items[i - 1].y + minGap;
  }
  const overflow = items.length ? items[items.length - 1].y - maxY : 0;
  if (overflow > 0) {
    for (let i = items.length - 1; i >= 0; i--) items[i].y -= overflow;
    for (let i = 1; i < items.length; i++) {
      if (items[i].y - items[i - 1].y < minGap) items[i].y = items[i - 1].y + minGap;
    }
  }
  return new Map(items.map((it) => [it.id, it.y]));
}

// A hovered country/domain propagates two hops (through its funders) so the
// whole country -> funder -> domain path lights up, not just the one edge
// under the cursor. A hovered funder only needs one hop each way. Kept
// direction-aware rather than a generic BFS: domains are shared hubs that
// almost every funder links to, so an undirected walk from a country would
// eventually light up the entire diagram through that hub.
function computeHighlight(hovered: Hovered, links: LaidOutLink[]): { nodes: Set<string>; links: Set<number> } {
  const nodeIds = new Set<string>();
  const linkIdxs = new Set<number>();

  if (hovered.kind === 'link') {
    const link = links[hovered.index];
    if (!link) return { nodes: nodeIds, links: linkIdxs };
    linkIdxs.add(hovered.index);
    nodeIds.add(link.source.id);
    nodeIds.add(link.target.id);
    return { nodes: nodeIds, links: linkIdxs };
  }

  nodeIds.add(hovered.id);
  const asSource: number[] = [];
  const asTarget: number[] = [];
  links.forEach((l, i) => {
    if (l.source.id === hovered.id) asSource.push(i);
    if (l.target.id === hovered.id) asTarget.push(i);
  });

  if (asSource.length && !asTarget.length) {
    // Country: walk forward through its funders to their domains.
    const midIds = new Set<string>();
    asSource.forEach((i) => { linkIdxs.add(i); nodeIds.add(links[i].target.id); midIds.add(links[i].target.id); });
    links.forEach((l, i) => {
      if (midIds.has(l.source.id)) { linkIdxs.add(i); nodeIds.add(l.target.id); }
    });
  } else if (asTarget.length && !asSource.length) {
    // Domain: walk backward through its funders to their countries.
    const midIds = new Set<string>();
    asTarget.forEach((i) => { linkIdxs.add(i); nodeIds.add(links[i].source.id); midIds.add(links[i].source.id); });
    links.forEach((l, i) => {
      if (midIds.has(l.target.id)) { linkIdxs.add(i); nodeIds.add(l.source.id); }
    });
  } else {
    // Funder: one hop in each direction.
    links.forEach((l, i) => {
      if (l.source.id === hovered.id || l.target.id === hovered.id) {
        linkIdxs.add(i);
        nodeIds.add(l.source.id);
        nodeIds.add(l.target.id);
      }
    });
  }

  return { nodes: nodeIds, links: linkIdxs };
}

export default function FunderSankey({ data, funders }: FunderSankeyProps) {
  const { t } = useTranslation();
  const [topN, setTopN] = useState<TopN>(15);
  const [hovered, setHovered] = useState<Hovered | null>(null);

  const { graph, totalFunders, width, height } = useMemo(() => {
    // Publications per funder, deduplicated within a publication — restricted
    // to funders resolved to a funders.json entry with a known country, since
    // a country-less funder has nowhere to sit on the left column.
    const funderPubCounts = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      (p.awards || []).forEach((a) => {
        if (a.funder_id && funders[a.funder_id]?.country_code) seen.add(a.funder_id);
      });
      seen.forEach((id) => funderPubCounts.set(id, (funderPubCounts.get(id) || 0) + 1));
    });

    const topFunderIds = new Set(
      Array.from(funderPubCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([id]) => id)
    );

    const countryFunderLinks = new Map<string, number>();
    const funderDomainLinks = new Map<string, number>();
    const nodeNames = new Map<string, string>();

    data.forEach((p) => {
      const domain = p.primary_topic?.domain;
      const seenFunders = new Set<string>();
      (p.awards || []).forEach((a) => {
        if (a.funder_id && topFunderIds.has(a.funder_id)) seenFunders.add(a.funder_id);
      });

      seenFunders.forEach((funderId) => {
        const info = funders[funderId];
        const countryId = `country:${info.country_code}`;
        const funderNodeId = `funder:${funderId}`;
        nodeNames.set(countryId, getCountryName(info.country_code as string));
        nodeNames.set(funderNodeId, info.name);

        const cfKey = `${countryId}|${funderNodeId}`;
        countryFunderLinks.set(cfKey, (countryFunderLinks.get(cfKey) || 0) + 1);

        if (domain) {
          const domainNodeId = `domain:${domain}`;
          nodeNames.set(domainNodeId, domain);
          const fdKey = `${funderNodeId}|${domainNodeId}`;
          funderDomainLinks.set(fdKey, (funderDomainLinks.get(fdKey) || 0) + 1);
        }
      });
    });

    const nodeIds = new Set<string>();
    const rawLinks: { source: string; target: string; value: number }[] = [];
    countryFunderLinks.forEach((value, key) => {
      const [source, target] = key.split('|');
      nodeIds.add(source); nodeIds.add(target);
      rawLinks.push({ source, target, value });
    });
    funderDomainLinks.forEach((value, key) => {
      const [source, target] = key.split('|');
      nodeIds.add(source); nodeIds.add(target);
      rawLinks.push({ source, target, value });
    });

    const w = 960;

    if (nodeIds.size === 0 || rawLinks.length === 0) {
      return { graph: null, totalFunders: funderPubCounts.size, width: w, height: 520 };
    }

    const rawNodes: NodeExtra[] = Array.from(nodeIds).map((id) => ({
      id,
      name: nodeNames.get(id) || id,
      kind: id.startsWith('country:') ? 'country' : id.startsWith('funder:') ? 'funder' : 'domain',
    }));

    const countByKind: Record<NodeKind, number> = { country: 0, funder: 0, domain: 0 };
    rawNodes.forEach((n) => { countByKind[n.kind] += 1; });
    const h = Math.max(520, Math.max(countByKind.country, countByKind.funder, countByKind.domain) * 26);

    const sankeyGenerator = sankey<NodeExtra, Record<string, unknown>>()
      .nodeId((d) => d.id)
      .nodeWidth(14)
      .nodePadding(10)
      .extent([[1, 1], [w - 1, h - 1]]);

    const laidOut = sankeyGenerator({
      nodes: rawNodes.map((n) => ({ ...n })),
      links: rawLinks.map((l) => ({ ...l })),
    });

    return { graph: laidOut, totalFunders: funderPubCounts.size, width: w, height: h };
  }, [data, funders, topN]);

  const labelPositions = useMemo(() => {
    if (!graph) return new Map<string, number>();
    const maxDepth = Math.max(...graph.nodes.map((n) => n.depth || 0));
    const leftNodes = graph.nodes.filter((n) => (n.depth || 0) === 0);
    const rightNodes = graph.nodes.filter((n) => (n.depth || 0) === maxDepth);
    return new Map([
      ...declutterLabelYs(leftNodes, LABEL_MIN_GAP, height),
      ...declutterLabelYs(rightNodes, LABEL_MIN_GAP, height),
    ]);
  }, [graph, height]);

  const highlight = useMemo(() => {
    if (!graph || !hovered) return null;
    return computeHighlight(hovered, graph.links as unknown as LaidOutLink[]);
  }, [graph, hovered]);

  if (!graph) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-3xl border-2 border-dashed bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30">
        <div className="mb-4 text-teal-200 dark:text-teal-800 [&_svg]:h-12 [&_svg]:w-12"><Waypoints size={24} /></div>
        <h4 className="text-lg font-bold mb-2 text-teal-900 dark:text-teal-100">{t.funderSankey.noDataTitle}</h4>
        <p className="text-sm italic max-w-md text-teal-600/70 dark:text-teal-400/60">{t.funderSankey.noDataDesc}</p>
      </div>
    );
  }

  // Only the biggest funder nodes get a permanent label — the middle column
  // can hold up to `topN` of them and most names are long, so labeling every
  // one would collide with country labels on the left and domain labels on
  // the right. The rest are still fully inspectable via tooltip.
  const labeledFunderIds = new Set(
    graph.nodes
      .filter((n) => n.kind === 'funder')
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 8)
      .map((n) => n.id)
  );

  const linkPath = sankeyLinkHorizontal();
  const maxDepth = Math.max(...graph.nodes.map((n) => n.depth || 0));

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 text-white rounded-2xl shadow-lg bg-teal-600 shadow-teal-600/20">
            <Waypoints size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">{t.funderSankey.title}</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{t.funderSankey.subtitle}</p>
          </div>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
          {([15, 25, 40] as TopN[]).map((n) => (
            <button
              key={n}
              onClick={() => setTopN(n)}
              aria-label={`Show top ${n} funders`}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 border-zinc-200 dark:border-zinc-600 ${
                topN === n ? 'bg-white dark:bg-zinc-700 shadow-sm text-teal-700 dark:text-teal-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-100 rounded-2xl dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ minWidth: 720, height: 'auto' }}>
          <g>
            {graph.links.map((link, i) => {
              const source = link.source as unknown as { name: string; kind: NodeKind };
              const target = link.target as unknown as { name: string; kind: NodeKind };
              const d = linkPath(link as never);
              if (!d) return null;
              const opacity = !highlight ? BASE_LINK_OPACITY : (highlight.links.has(i) ? ACTIVE_LINK_OPACITY : DIM_LINK_OPACITY);
              return (
                <path
                  key={`link-${i}`}
                  d={d}
                  fill="none"
                  stroke={colorForNode(target)}
                  strokeOpacity={opacity}
                  strokeWidth={Math.max(1, link.width || 1)}
                  className="cursor-pointer transition-[stroke-opacity] duration-150"
                  onMouseEnter={() => setHovered({ kind: 'link', index: i })}
                  onMouseLeave={() => setHovered(null)}
                  data-tooltip-id={TOOLTIP_ID}
                  data-tooltip-content={`${source.name} → ${target.name}: ${formatNum(link.value)} publications`}
                />
              );
            })}
          </g>
          <g>
            {graph.nodes.map((node) => {
              const x0 = node.x0 || 0, x1 = node.x1 || 0, y0 = node.y0 || 0, y1 = node.y1 || 0;
              const isLeftmost = (node.depth || 0) === 0;
              const isRightmost = (node.depth || 0) === maxDepth;
              const showLabel = isLeftmost || isRightmost || labeledFunderIds.has(node.id);
              const label = node.name.length > 34 ? `${node.name.slice(0, 32)}…` : node.name;
              const trueCenterY = (y0 + y1) / 2;
              const labelY = (isLeftmost || isRightmost) ? (labelPositions.get(node.id) ?? trueCenterY) : trueCenterY;
              const labelMoved = Math.abs(labelY - trueCenterY) > 2;
              const nodeOpacity = !highlight ? 1 : (highlight.nodes.has(node.id) ? 1 : DIM_NODE_OPACITY);

              return (
                <g key={node.id} opacity={nodeOpacity} className="transition-opacity duration-150">
                  <rect
                    x={x0}
                    y={y0}
                    width={Math.max(1, x1 - x0)}
                    height={Math.max(1, y1 - y0)}
                    fill={colorForNode(node)}
                    rx={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered({ kind: 'node', id: node.id })}
                    onMouseLeave={() => setHovered(null)}
                    data-tooltip-id={TOOLTIP_ID}
                    data-tooltip-content={`${node.name}: ${formatNum(node.value || 0)} publications`}
                  />
                  {showLabel && (
                    <>
                      {labelMoved && (
                        <line
                          x1={isRightmost ? x0 - 4 : x1 + 4}
                          y1={trueCenterY}
                          x2={isRightmost ? x0 - 4 : x1 + 4}
                          y2={labelY}
                          stroke="currentColor"
                          strokeWidth={1}
                          className="text-zinc-300 dark:text-zinc-700 pointer-events-none"
                        />
                      )}
                      <text
                        x={isRightmost ? x0 - 8 : x1 + 8}
                        y={labelY}
                        textAnchor={isRightmost ? 'end' : 'start'}
                        dominantBaseline="middle"
                        fontSize={10}
                        fontWeight={700}
                        className="fill-zinc-600 dark:fill-zinc-400 pointer-events-none"
                      >
                        {label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        {t.funderSankey.showingTop
          .replace('{top}', String(Math.min(topN, totalFunders)))
          .replace('{total}', String(totalFunders))}
      </p>

      <Tooltip id={TOOLTIP_ID} style={{ backgroundColor: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', zIndex: 100, maxWidth: '320px' }} />
    </div>
  );
}
