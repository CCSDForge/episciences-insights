'use client';

import React, { useMemo } from 'react';
import { Publication } from '@/lib/types';
import { Network, Info } from 'lucide-react';
import { NetworkGraph, NetworkNode } from './NetworkGraph';

interface CollaborationWebProps {
  data: Publication[];
}

const CENTER_X = 400;
const CENTER_Y = 300;
const RADIUS = 200;

export default function CollaborationWeb({ data }: CollaborationWebProps) {
  const network = useMemo(() => {
    const nodesMap: Record<string, { id: string; name: string; count: number; country: string }> = {};
    const linksMap: Record<string, number> = {};

    data.forEach(p => {
      const institutionsInPaper = new Set<string>();
      p.authors.forEach(a => {
        a.institutions.forEach(inst => {
          const id = inst.ror || inst.name;
          if (!nodesMap[id]) nodesMap[id] = { id, name: inst.name, count: 0, country: inst.country || '?' };
          nodesMap[id].count += 1;
          institutionsInPaper.add(id);
        });
      });
      const instArray = Array.from(institutionsInPaper).sort();
      for (let i = 0; i < instArray.length; i++) {
        for (let j = i + 1; j < instArray.length; j++) {
          const key = `${instArray[i]}|${instArray[j]}`;
          linksMap[key] = (linksMap[key] || 0) + 1;
        }
      }
    });

    const allNodes = Object.values(nodesMap).sort((a, b) => b.count - a.count);
    const allLinks = Object.entries(linksMap);
    const nodes = allNodes.slice(0, 20);
    const topNodeIds = new Set(nodes.map(n => n.id));

    const nodePositions = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return { ...node, x: CENTER_X + RADIUS * Math.cos(angle), y: CENTER_Y + RADIUS * Math.sin(angle), angle };
    });

    const links = allLinks
      .map(([key, weight]) => { const [source, target] = key.split('|'); return { source, target, weight }; })
      .filter(l => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    return { nodePositions, links, totalInstitutions: allNodes.length, totalConnections: allLinks.length };
  }, [data]);

  if (network.links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl">
        <Network size={32} className="mb-4 opacity-50" />
        <p className="text-sm font-bold uppercase tracking-widest">Collaborative data unavailable for this selection</p>
      </div>
    );
  }

  return (
    <NetworkGraph.Provider nodePositions={network.nodePositions} links={network.links} centerX={CENTER_X} centerY={CENTER_Y}>
      <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">

        {/* Graph */}
        <div className="relative flex-1 min-h-[500px] lg:min-h-[650px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <NetworkGraph.Canvas
            tooltipId="collab-tooltip"
            activeColor="#2563eb"
            inactiveColor="#cbd5e1"
            activeNodeColor="#1d4ed8"
            inactiveNodeColor="#64748b"
            getLinkTooltip={(src, tgt, weight) => `${src.name} ↔ ${tgt.name} (${weight} papers)`}
            getNodeTooltip={(node) => `${node.name} (${node.country as string}) - ${node.count as number} publications`}
            background={
              <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="8 8" />
            }
            renderNodeLabel={(node: NetworkNode, isHighlighted: boolean) => (
              (isHighlighted || (node.count as number) > 3) ? (
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
                  {(node.name as string).length > 35 ? (node.name as string).substring(0, 32) + '...' : node.name as string}
                </text>
              ) : null
            )}
          />
          <NetworkGraph.Tooltip id="collab-tooltip" />
        </div>

        {/* Sidebar */}
        <div className="lg:w-[380px] flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                <Network size={24} />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 font-heading">Global Reach</h4>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Institutional Synergy Map</p>
          </div>

          <NetworkGraph.DetailPanel
            className="h-[320px] shrink-0 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 shadow-inner flex flex-col justify-center overflow-hidden"
            renderEmpty={() => (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Info className="text-zinc-400 dark:text-zinc-600" size={32} />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[200px]">Hover over nodes or lines to reveal the global research network</p>
              </div>
            )}
            renderLinkDetail={(src, tgt, weight) => (
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Cross-Institutional Collab</p>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-black text-zinc-400 uppercase mb-1">Partner A</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{src.name as string}</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black shadow-xl shadow-blue-600/30 ring-4 ring-blue-600/10">
                      {weight} Joint Publications
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-black text-zinc-400 uppercase mb-1">Partner B</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right">{tgt.name as string}</p>
                  </div>
                </div>
              </div>
            )}
            renderNodeDetail={(node) => (
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Institution Profile</p>
                <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{node.name as string}</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Impact</p>
                    <p className="text-2xl font-black text-blue-600">{node.count as number} <span className="text-[10px] text-zinc-400">Pubs</span></p>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Region</p>
                    <p className="text-lg font-black text-zinc-700 dark:text-zinc-300">{node.country as string}</p>
                  </div>
                </div>
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
              <p className="text-3xl font-black text-blue-400">{network.totalInstitutions}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">Total Institutions</p>
            </div>
            <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
              <p className="text-3xl font-black text-blue-400">{network.totalConnections}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">Total Connections</p>
            </div>
          </div>
          {network.totalInstitutions > 20 && (
            <p className="text-[9px] text-zinc-400 italic text-center">Graph displays the Top 20 institutions by publication volume for clarity.</p>
          )}
        </div>
      </div>
    </NetworkGraph.Provider>
  );
}
