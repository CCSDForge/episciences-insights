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

// Math.cos/Math.sin aren't guaranteed bit-identical across JS engines
// (Node on the server vs V8-in-Chrome on the client can differ in the
// last bit for some inputs), which previously caused React hydration
// mismatches on every SSR'd circular layout (e.g. "238.1966011250105" vs
// "238.19660112501052"). Rounding here, once, protects every consumer.
function roundCoord(n: number) {
  return Math.round(n * 10000) / 10000;
}

function Provider({ nodePositions, links, centerX, centerY, children }: ProviderProps) {
  const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const positionMap = Object.fromEntries(
    nodePositions.map(n => [n.id, { ...n, x: roundCoord(n.x), y: roundCoord(n.y) }])
  );

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
  activeNodeColor: string;
  /** Non-highlighted link stroke, by magnitude (few = light, many = dark) */
  getLinkColor: (weight: number) => string;
  /** Optional link stroke width by weight */
  getLinkWidth?: (weight: number) => number;
  /** Non-highlighted node fill, by magnitude (few = light, many = dark) */
  getNodeColor: (count: number) => string;
  renderNodeLabel: (node: NetworkNode, isHighlighted: boolean) => React.ReactNode;
  getLinkTooltip: (src: NetworkNode, tgt: NetworkNode, weight: number) => string;
  getNodeTooltip: (node: NetworkNode) => string;
  /** Optional background element rendered behind arcs (e.g. dashed circle) */
  background?: React.ReactNode;
}

function Canvas({
  tooltipId,
  activeColor,
  activeNodeColor,
  getLinkColor,
  getLinkWidth,
  getNodeColor,
  renderNodeLabel,
  getLinkTooltip,
  getNodeTooltip,
  background,
}: CanvasProps) {
  const { hoveredLink, hoveredNode, setHoveredLink, setHoveredNode, positionMap, links, centerX, centerY } = useNetworkGraph();

  const nodePositions = Object.values(positionMap);
  const maxWeight = React.useMemo(() => Math.max(1, ...links.map(l => l.weight)), [links]);
  const defaultGetLinkWidth = React.useMemo(() => (weight: number) => {
    if (maxWeight <= 1) return 1.5;
    const ratio = Math.log(weight + 1) / Math.log(maxWeight + 1);
    return 1.5 + ratio * 4.5;
  }, [maxWeight]);

  const calcWidth = getLinkWidth ?? defaultGetLinkWidth;
  const isAnyHovered = hoveredNode !== null || hoveredLink !== null;

  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {background}

      {/* Arcs */}
      {links.map((link, i) => {
        const src = positionMap[link.source];
        const tgt = positionMap[link.target];
        if (!src || !tgt) return null;

        const isHighlighted = hoveredLink?.src === link.source && hoveredLink?.tgt === link.target;
        const isNodeRelated = hoveredNode === link.source || hoveredNode === link.target;
        const isEmphasized = isHighlighted || isNodeRelated;
        const d = `M ${src.x} ${src.y} Q ${centerX} ${centerY} ${tgt.x} ${tgt.y}`;

        const baseWidth = calcWidth(link.weight);
        const strokeWidth = isHighlighted
          ? Math.max(6, baseWidth + 2.5)
          : isNodeRelated
          ? Math.max(3.5, baseWidth + 1.5)
          : baseWidth;

        const strokeOpacity = isHighlighted
          ? 1
          : isNodeRelated
          ? 0.85
          : isAnyHovered
          ? 0.12
          : 0.55;

        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(16, strokeWidth + 8)}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredLink({ src: link.source, tgt: link.target, weight: link.weight })}
              onMouseLeave={() => setHoveredLink(null)}
              data-tooltip-id={tooltipId}
              data-tooltip-content={getLinkTooltip(src, tgt, link.weight)}
            />
            <path
              d={d}
              fill="none"
              stroke={isEmphasized ? activeColor : getLinkColor(link.weight)}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              className="transition-all duration-300 pointer-events-none"
            />
          </g>
        );
      })}

      {/* Node Circles */}
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
              fill={isHighlighted ? activeNodeColor : getNodeColor((node.count as number) ?? 0)}
              stroke="white"
              strokeWidth="3"
              className={`transition-all duration-300 ${isHighlighted ? '' : 'network-mark-node'}`}
            />
          </g>
        );
      })}

      {/* Node Labels (rendered on top of circles) */}
      {nodePositions.map(node => {
        const isHighlighted = hoveredNode === node.id || hoveredLink?.src === node.id || hoveredLink?.tgt === node.id;
        return (
          <g key={`label-${node.id}`} className="pointer-events-none">
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
