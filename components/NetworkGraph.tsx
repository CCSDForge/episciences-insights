'use client';

import React, { createContext, use, useState } from 'react';
import { Tooltip } from 'react-tooltip';

export interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  [key: string]: unknown;
}

export interface NetworkLink {
  source: string;
  target: string;
  weight: number;
}

interface HoveredLink { src: string; tgt: string; weight: number }

interface NetworkGraphContextValue {
  hoveredLink: HoveredLink | null;
  hoveredNode: string | null;
  setHoveredLink: (link: HoveredLink | null) => void;
  setHoveredNode: (id: string | null) => void;
  positionMap: Record<string, NetworkNode>;
  links: NetworkLink[];
  centerX: number;
  centerY: number;
}

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

function useNetworkGraph() {
  const ctx = use(NetworkGraphContext);
  if (!ctx) throw new Error('useNetworkGraph must be used within NetworkGraph.Provider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ProviderProps {
  nodePositions: NetworkNode[];
  links: NetworkLink[];
  centerX: number;
  centerY: number;
  children: React.ReactNode;
}

function Provider({ nodePositions, links, centerX, centerY, children }: ProviderProps) {
  const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const positionMap = Object.fromEntries(nodePositions.map(n => [n.id, n]));

  return (
    <NetworkGraphContext value={{ hoveredLink, hoveredNode, setHoveredLink, setHoveredNode, positionMap, links, centerX, centerY }}>
      {children}
    </NetworkGraphContext>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

interface CanvasProps {
  tooltipId: string;
  activeColor: string;
  inactiveColor: string;
  activeNodeColor: string;
  inactiveNodeColor: string;
  renderNodeLabel: (node: NetworkNode, isHighlighted: boolean) => React.ReactNode;
  getLinkTooltip: (src: NetworkNode, tgt: NetworkNode, weight: number) => string;
  getNodeTooltip: (node: NetworkNode) => string;
  /** Optional background element rendered behind arcs (e.g. dashed circle) */
  background?: React.ReactNode;
}

function Canvas({
  tooltipId,
  activeColor,
  inactiveColor,
  activeNodeColor,
  inactiveNodeColor,
  renderNodeLabel,
  getLinkTooltip,
  getNodeTooltip,
  background,
}: CanvasProps) {
  const { hoveredLink, hoveredNode, setHoveredLink, setHoveredNode, positionMap, links, centerX, centerY } = useNetworkGraph();

  const nodePositions = Object.values(positionMap);

  return (
    <svg viewBox="0 0 800 600" className="w-full h-full preserve-3d">
      {background}

      {/* Arcs */}
      {links.map((link, i) => {
        const src = positionMap[link.source];
        const tgt = positionMap[link.target];
        if (!src || !tgt) return null;

        const isHighlighted = hoveredLink?.src === link.source && hoveredLink?.tgt === link.target;
        const isNodeRelated = hoveredNode === link.source || hoveredNode === link.target;
        const d = `M ${src.x} ${src.y} Q ${centerX} ${centerY} ${tgt.x} ${tgt.y}`;

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
              data-tooltip-content={getLinkTooltip(src, tgt, link.weight)}
            />
            <path
              d={d}
              fill="none"
              stroke={isHighlighted || isNodeRelated ? activeColor : inactiveColor}
              strokeWidth={isHighlighted ? 6 : Math.max(2, link.weight * 1.5)}
              strokeOpacity={isHighlighted || isNodeRelated ? 0.9 : 0.2}
              className="transition-all duration-500 pointer-events-none"
            />
          </g>
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
            data-tooltip-id={tooltipId}
            data-tooltip-content={getNodeTooltip(node)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={isHighlighted ? 14 : 10}
              fill={isHighlighted ? activeNodeColor : inactiveNodeColor}
              stroke="white"
              strokeWidth="3"
              className="transition-all duration-300"
            />
            {renderNodeLabel(node, isHighlighted)}
          </g>
        );
      })}
    </svg>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  renderEmpty: () => React.ReactNode;
  renderLinkDetail: (src: NetworkNode, tgt: NetworkNode, weight: number) => React.ReactNode;
  renderNodeDetail: (node: NetworkNode) => React.ReactNode;
  className?: string;
}

function DetailPanel({ renderEmpty, renderLinkDetail, renderNodeDetail, className }: DetailPanelProps) {
  const { hoveredLink, hoveredNode, positionMap } = useNetworkGraph();

  return (
    <div className={className}>
      {hoveredLink ? (
        <div className="animate-in fade-in slide-in-from-right-4">
          {renderLinkDetail(positionMap[hoveredLink.src], positionMap[hoveredLink.tgt], hoveredLink.weight)}
        </div>
      ) : hoveredNode ? (
        <div className="animate-in fade-in slide-in-from-right-4">
          {renderNodeDetail(positionMap[hoveredNode])}
        </div>
      ) : (
        renderEmpty()
      )}
    </div>
  );
}

// ─── GraphTooltip ─────────────────────────────────────────────────────────────

interface GraphTooltipProps {
  id: string;
  style?: React.CSSProperties;
}

function GraphTooltip({ id, style }: GraphTooltipProps) {
  return (
    <Tooltip
      id={id}
      style={{
        backgroundColor: '#0f172a',
        color: '#fff',
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '12px',
        fontWeight: '600',
        zIndex: 100,
        maxWidth: '320px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        ...style,
      }}
    />
  );
}

// ─── Compound export ──────────────────────────────────────────────────────────

export const NetworkGraph = {
  Provider,
  Canvas,
  DetailPanel,
  Tooltip: GraphTooltip,
};

export { useNetworkGraph };
