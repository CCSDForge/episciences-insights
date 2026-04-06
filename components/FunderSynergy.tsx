'use client';

import React, { useMemo } from 'react';
import { Publication } from '@/lib/types';
import { Info, Handshake } from 'lucide-react';
import { NetworkGraph, NetworkNode } from './NetworkGraph';

interface FunderSynergyProps {
  data: Publication[];
}

const CENTER_X = 400;
const CENTER_Y = 300;
const RADIUS = 200;

export default function FunderSynergy({ data }: FunderSynergyProps) {
  const network = useMemo(() => {
    const nodesMap: Record<string, { id: string; name: string; count: number }> = {};
    const linksMap: Record<string, number> = {};

    data.forEach(p => {
      const fundersInPaper = Array.from(new Set(p.awards.map(a => a.funder))).filter(Boolean);
      fundersInPaper.forEach(funder => {
        if (!nodesMap[funder]) nodesMap[funder] = { id: funder, name: funder, count: 0 };
        nodesMap[funder].count += 1;
      });
      if (fundersInPaper.length > 1) {
        const sorted = fundersInPaper.sort();
        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const key = `${sorted[i]}|${sorted[j]}`;
            linksMap[key] = (linksMap[key] || 0) + 1;
          }
        }
      }
    });

    const allNodes = Object.values(nodesMap).sort((a, b) => b.count - a.count);
    const allLinks = Object.entries(linksMap);
    const nodes = allNodes.slice(0, 15);
    const topNodeIds = new Set(nodes.map(n => n.id));

    const nodePositions = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return { ...node, x: CENTER_X + RADIUS * Math.cos(angle), y: CENTER_Y + RADIUS * Math.sin(angle), angle };
    });

    const links = allLinks
      .map(([key, weight]) => { const [source, target] = key.split('|'); return { source, target, weight }; })
      .filter(l => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    return { nodePositions, links, totalFunders: allNodes.length, totalSynergies: allLinks.length };
  }, [data]);

  if (network.totalSynergies === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-teal-50/30 dark:bg-teal-900/10 rounded-3xl border-2 border-dashed border-teal-100 dark:border-teal-900/30">
        <Handshake size={48} className="text-teal-200 dark:text-teal-800 mb-4" />
        <h4 className="text-lg font-bold text-teal-900 dark:text-teal-100 mb-2">No Co-funding Patterns Detected</h4>
        <p className="text-sm text-teal-600/70 dark:text-teal-400/60 max-w-md italic">
          We haven't identified any publications in this selection that were co-funded by multiple institutions.
          As the dataset grows, cross-funder synergies will appear here.
        </p>
      </div>
    );
  }

  return (
    <NetworkGraph.Provider nodePositions={network.nodePositions} links={network.links} centerX={CENTER_X} centerY={CENTER_Y}>
      <div className="w-full flex flex-col xl:flex-row gap-10 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">

        {/* Graph */}
        <div className="relative flex-1 min-h-[500px] select-none bg-teal-50/20 dark:bg-teal-950/10 rounded-2xl border border-teal-50 dark:border-teal-900/20 overflow-hidden">
          <NetworkGraph.Canvas
            tooltipId="funder-synergy-tooltip"
            activeColor="#0d9488"
            inactiveColor="#99f6e4"
            activeNodeColor="#0d9488"
            inactiveNodeColor="#2dd4bf"
            getLinkTooltip={(src, tgt, weight) => `${src.name} & ${tgt.name}: ${weight} co-funded publications`}
            getNodeTooltip={(node) => `${node.name} - involved in ${node.count as number} publications`}
            renderNodeLabel={(node, isHighlighted) => (
              (isHighlighted || (node.count as number) > 2) ? (
                <text
                  x={node.x + (node.x > CENTER_X ? 20 : -20)}
                  y={node.y}
                  textAnchor={node.x > CENTER_X ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize={isHighlighted ? '13' : '10'}
                  fontWeight={isHighlighted ? '900' : '700'}
                  fill="currentColor"
                  style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                  className={`pointer-events-none drop-shadow-md ${isHighlighted ? 'text-teal-900 dark:text-teal-50' : 'text-teal-600 dark:text-teal-400'}`}
                >
                  {(node.name as string).length > 40 ? (node.name as string).substring(0, 37) + '...' : node.name as string}
                </text>
              ) : null
            )}
          />
          <NetworkGraph.Tooltip id="funder-synergy-tooltip" />
        </div>

        {/* Sidebar */}
        <div className="xl:w-[400px] flex flex-col gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/20">
                <Handshake size={28} />
              </div>
              <h4 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Funder Synergy Web</h4>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This map reveals the strong bonds between funding agencies.
              Thicker lines represent more frequent <strong>co-funding</strong> of research projects published on Episciences.
            </p>
          </div>

          <NetworkGraph.DetailPanel
            className="h-[320px] shrink-0 p-8 rounded-[2rem] bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 shadow-inner flex flex-col justify-center overflow-hidden"
            renderEmpty={() => (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-950 shadow-xl flex items-center justify-center text-teal-200 dark:text-teal-800">
                  <Info size={40} />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[240px]">Explore co-funding strategies by hovering over the connections</p>
              </div>
            )}
            renderLinkDetail={(src, tgt, weight) => (
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">Co-Funding Hub</p>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-teal-50 dark:border-teal-900/30">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{src.name as string}</p>
                  </div>
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="px-5 py-2 bg-teal-600 text-white rounded-full text-xs font-black shadow-xl shadow-teal-600/30 ring-4 ring-white dark:ring-zinc-900">
                      {weight} Joint Grants
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-teal-50 dark:border-teal-900/30">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right leading-tight">{tgt.name as string}</p>
                  </div>
                </div>
              </div>
            )}
            renderNodeDetail={(node) => (
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">Funder Insight</p>
                <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{node.name as string}</h5>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-teal-50 dark:border-teal-900/30 shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Involvement</p>
                  <p className="text-3xl font-black text-teal-600">{node.count as number} <span className="text-xs text-zinc-400 font-bold">Total Publications</span></p>
                </div>
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-zinc-900 dark:bg-black text-white shadow-xl ring-1 ring-white/10">
              <p className="text-4xl font-black text-teal-400">{network.totalFunders}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-2">Active Funders</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-zinc-900 dark:bg-black text-white shadow-xl ring-1 ring-white/10">
              <p className="text-4xl font-black text-teal-400">{network.totalSynergies}</p>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-2">Funding Bridges</p>
            </div>
          </div>
        </div>
      </div>
    </NetworkGraph.Provider>
  );
}
