'use client';

import React, { useMemo, useState } from 'react';
import { Publication } from '@/lib/types';
import { Network, Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface CollaborationWebProps {
  data: Publication[];
}

export default function CollaborationWeb({ data }: CollaborationWebProps) {
  const [hoveredLink, setHoveredLink] = useState<{ src: string; tgt: string; weight: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const network = useMemo(() => {
    const nodesMap: Record<string, { id: string; name: string; count: number; country: string }> = {};
    const linksMap: Record<string, number> = {};

    data.forEach(p => {
      const institutionsInPaper = new Set<string>();
      p.authors.forEach(a => {
        a.institutions.forEach(inst => {
          const id = inst.ror || inst.name;
          if (!nodesMap[id]) {
            nodesMap[id] = { id, name: inst.name, count: 0, country: inst.country || '?' };
          }
          nodesMap[id].count += 1;
          institutionsInPaper.add(id);
        });
      });

      const instArray = Array.from(institutionsInPaper).sort();
      for (let i = 0; i < instArray.length; i++) {
        for (let j = i + 1; j < instArray.length; j++) {
          const linkId = `${instArray[i]}|${instArray[j]}`;
          linksMap[linkId] = (linksMap[linkId] || 0) + 1;
        }
      }
    });

    const allNodes = Object.values(nodesMap).sort((a, b) => b.count - a.count);
    const totalInstitutions = allNodes.length;

    const allLinks = Object.entries(linksMap);
    const totalConnections = allLinks.length;

    // Take top 20 for better legibility in the circular graph
    const nodes = allNodes.slice(0, 20); 
    const topNodeIds = new Set(nodes.map(n => n.id));

    const links = allLinks
      .map(([key, weight]) => {
        const [source, target] = key.split('|');
        return { source, target, weight };
      })
      .filter(l => topNodeIds.has(l.source) && topNodeIds.has(l.target));

    return { nodes, links, totalInstitutions, totalConnections };
  }, [data]);

  if (network.links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl">
        <Network size={32} className="mb-4 opacity-50" />
        <p className="text-sm font-bold uppercase tracking-widest">Collaborative data unavailable for this selection</p>
      </div>
    );
  }

  const radius = 200;
  const centerX = 400; // Shift center to allow more space for labels on sides
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
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">
      <div className="relative flex-1 min-h-[500px] lg:min-h-[650px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        {/* Widened viewBox (800x600) to allow long labels on left/right */}
        <svg viewBox="0 0 800 600" className="w-full h-full preserve-3d">
          {/* Background circle */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="8 8" />
          
          {/* Links */}
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
                stroke={isHighlighted || isNodeRelated ? "#2563eb" : "#cbd5e1"} 
                strokeWidth={isHighlighted ? 6 : Math.max(2, link.weight * 1.5)}
                strokeOpacity={isHighlighted || isNodeRelated ? 0.9 : 0.15}
                className="transition-all duration-500 cursor-pointer dark:stroke-zinc-700"
                onMouseEnter={() => setHoveredLink({ src: link.source, tgt: link.target, weight: link.weight })}
                onMouseLeave={() => setHoveredLink(null)}
                data-tooltip-id="collab-tooltip"
                data-tooltip-content={`${src.name} ↔ ${tgt.name} (${link.weight} papers)`}
              />
            );
          })}

          {/* Nodes */}
          {nodePositions.map(node => {
            const isHighlighted = hoveredNode === node.id || hoveredLink?.src === node.id || hoveredLink?.tgt === node.id;
            
            return (
              <g 
                key={node.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                data-tooltip-id="collab-tooltip"
                data-tooltip-content={`${node.name} (${node.country}) - ${node.count} publications`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHighlighted ? 12 : 8}
                  fill={isHighlighted ? "#1d4ed8" : "#64748b"}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-300 shadow-2xl"
                />
                {/* Labels - increased character limit and better positioning */}
                {(isHighlighted || node.count > 3) && (
                  <text
                    x={node.x + (node.x > centerX ? 18 : -18)}
                    y={node.y}
                    textAnchor={node.x > centerX ? "start" : "end"}
                    dominantBaseline="middle"
                    fontSize={isHighlighted ? "14" : "10"}
                    fontWeight={isHighlighted ? "900" : "700"}
                    fill="currentColor"
                    style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                    className={`pointer-events-none drop-shadow-md ${isHighlighted ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'}`}
                  >
                    {node.name.length > 35 ? node.name.substring(0, 32) + '...' : node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        <Tooltip 
          id="collab-tooltip" 
          style={{ 
            backgroundColor: "#09090b", 
            color: "#fff", 
            borderRadius: "12px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: 100,
            maxWidth: "300px"
          }}
        />
      </div>

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

        <div className="flex-1 min-h-[200px] p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 shadow-inner flex flex-col justify-center transition-all">
          {hoveredLink ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Cross-Institutional Collab</p>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-black text-zinc-400 uppercase mb-1">Partner A</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{positionMap[hoveredLink.src].name}</p>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black shadow-xl shadow-blue-600/30 ring-4 ring-blue-600/10">
                    {hoveredLink.weight} Joint Publications
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-black text-zinc-400 uppercase mb-1">Partner B</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right">{positionMap[hoveredLink.tgt].name}</p>
                </div>
              </div>
            </div>
          ) : hoveredNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Institution Profile</p>
              <h5 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{positionMap[hoveredNode].name}</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Impact</p>
                  <p className="text-2xl font-black text-blue-600">{positionMap[hoveredNode].count} <span className="text-[10px] text-zinc-400">Pubs</span></p>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Region</p>
                  <p className="text-lg font-black text-zinc-700 dark:text-zinc-300">{positionMap[hoveredNode].country}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Info className="text-zinc-400 dark:text-zinc-600" size={32} />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic max-w-[200px]">Hover over nodes or lines to reveal the global research network</p>
            </div>
          )}
        </div>
        
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
  );
}
