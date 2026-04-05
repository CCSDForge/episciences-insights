'use client';

import React, { useMemo, useState } from 'react';
import { Publication } from '@/lib/types';
import { Network, Info, Handshake } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface FunderSynergyProps {
  data: Publication[];
}

export default function FunderSynergy({ data }: FunderSynergyProps) {
  const [hoveredLink, setHoveredLink] = useState<{ src: string; tgt: string; weight: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const network = useMemo(() => {
    const nodesMap: Record<string, { id: string; name: string; count: number }> = {};
    const linksMap: Record<string, number> = {};

    data.forEach(p => {
      // Get unique funders for this paper
      const fundersInPaper = Array.from(new Set(p.awards.map(a => a.funder))).filter(Boolean);
      
      fundersInPaper.forEach(funder => {
        if (!nodesMap[funder]) {
          nodesMap[funder] = { id: funder, name: funder, count: 0 };
        }
        nodesMap[funder].count += 1;
      });

      // Create links for co-funded papers
      if (fundersInPaper.length > 1) {
        const sortedFunders = fundersInPaper.sort();
        for (let i = 0; i < sortedFunders.length; i++) {
          for (let j = i + 1; j < sortedFunders.length; j++) {
            const linkId = `${sortedFunders[i]}|${sortedFunders[j]}`;
            linksMap[linkId] = (linksMap[linkId] || 0) + 1;
          }
        }
      }
    });

    const allNodes = Object.values(nodesMap).sort((a, b) => b.count - a.count);
    const totalFunders = allNodes.length;
    const allLinks = Object.entries(linksMap);
    const totalSynergies = allLinks.length;

    // Limit to top 15 funders for the web to keep it very clear
    const nodes = allNodes.slice(0, 15);
    const topNodeIds = new Set(nodes.map(n => n.id));

    const links = allLinks
      .map(([key, weight]) => {
        const [source, target] = key.split('|');
        return { source, target, weight };
      })
      .filter(l => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    return { nodes, links, totalFunders, totalSynergies };
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

  const radius = 200;
  const centerX = 400; // Shifted center to allow labels on both sides
  const centerY = 300;
  
  const nodePositions = network.nodes.map((node, i) => {
    const angle = (i / network.nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle
    };
  });

  const positionMap = Object.fromEntries(nodePositions.map(n => [n.id, n]));

  return (
    <div className="w-full flex flex-col xl:flex-row gap-10 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">
      <div className="relative flex-1 min-h-[500px] select-none bg-teal-50/20 dark:bg-teal-950/10 rounded-2xl border border-teal-50 dark:border-teal-900/20 overflow-hidden">
        {/* Widened viewBox (800x600) to give space for long names on sides */}
        <svg viewBox="0 0 800 600" className="w-full h-full preserve-3d">
          {/* Synergy Arcs */}
          {network.links.map((link, i) => {
            const src = positionMap[link.source];
            const tgt = positionMap[link.target];
            if (!src || !tgt) return null;

            const isHighlighted = hoveredLink?.src === link.source && hoveredLink?.tgt === link.target;
            const isNodeRelated = hoveredNode === link.source || hoveredNode === link.target;
            
            const d = `M ${src.x} ${src.y} Q ${centerX} ${centerY} ${tgt.x} ${tgt.y}`;
            
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={isHighlighted || isNodeRelated ? "#0d9488" : "#99f6e4"} 
                strokeWidth={isHighlighted ? 6 : Math.max(3, link.weight * 2)}
                strokeOpacity={isHighlighted || isNodeRelated ? 0.9 : 0.2}
                className="transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHoveredLink({ src: link.source, tgt: link.target, weight: link.weight })}
                onMouseLeave={() => setHoveredLink(null)}
                data-tooltip-id="funder-synergy-tooltip"
                data-tooltip-content={`${src.name} & ${tgt.name}: ${link.weight} co-funded publications`}
              />
            );
          })}

          {/* Funder Nodes */}
          {nodePositions.map(node => {
            const isHighlighted = hoveredNode === node.id || hoveredLink?.src === node.id || hoveredLink?.tgt === node.id;
            
            return (
              <g 
                key={node.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                data-tooltip-id="funder-synergy-tooltip"
                data-tooltip-content={`${node.name} - involved in ${node.count} publications`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHighlighted ? 14 : 10}
                  fill={isHighlighted ? "#0d9488" : "#2dd4bf"}
                  stroke="white"
                  strokeWidth="3"
                  className="transition-all duration-300 shadow-lg"
                />
                {/* Text Labels - increased character limit and better positioning */}
                {(isHighlighted || node.count > 2) && (
                  <text
                    x={node.x + (node.x > centerX ? 20 : -20)}
                    y={node.y}
                    textAnchor={node.x > centerX ? "start" : "end"}
                    dominantBaseline="middle"
                    fontSize={isHighlighted ? "13" : "10"}
                    fontWeight={isHighlighted ? "900" : "700"}
                    fill="currentColor"
                    style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                    className={`pointer-events-none drop-shadow-md ${isHighlighted ? 'text-teal-900 dark:text-teal-50' : 'text-teal-600 dark:text-teal-400'}`}
                  >
                    {node.name.length > 40 ? node.name.substring(0, 37) + '...' : node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        <Tooltip 
          id="funder-synergy-tooltip" 
          style={{ 
            backgroundColor: "#0f172a", 
            color: "#fff", 
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: 100,
            maxWidth: "320px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}
        />
      </div>

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

        <div className="flex-1 min-h-[220px] p-8 rounded-[2rem] bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 shadow-inner flex flex-col justify-center transition-all">
          {hoveredLink ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">Co-Funding Hub</p>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-teal-50 dark:border-teal-900/30">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{positionMap[hoveredLink.src].name}</p>
                </div>
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="px-5 py-2 bg-teal-600 text-white rounded-full text-xs font-black shadow-xl shadow-teal-600/30 ring-4 ring-white dark:ring-zinc-900">
                    {hoveredLink.weight} Joint Grants
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-teal-50 dark:border-teal-900/30">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right leading-tight">{positionMap[hoveredLink.tgt].name}</p>
                </div>
              </div>
            </div>
          ) : hoveredNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">Funder Insight</p>
              <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{positionMap[hoveredNode].name}</h5>
              <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-teal-50 dark:border-teal-900/30 shadow-sm">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Involvement</p>
                <p className="text-3xl font-black text-teal-600">{positionMap[hoveredNode].count} <span className="text-xs text-zinc-400 font-bold">Total Publications</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-950 shadow-xl flex items-center justify-center text-teal-200 dark:text-teal-800">
                <Info size={40} />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[240px]">Explore co-funding strategies by hovering over the connections</p>
            </div>
          )}
        </div>
        
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
  );
}
