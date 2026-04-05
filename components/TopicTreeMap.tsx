'use client';

import React, { useMemo } from 'react';
import { Publication } from '@/lib/types';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface TopicTreeMapProps {
  data: Publication[];
}

// Color palette for different domains
const COLORS = [
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#2563eb', // Blue
  '#db2777', // Pink
  '#ea580c', // Orange
];

const CustomizedContent = (props: any) => {
  const { depth, x, y, width, height, name, color } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color || '#64748b'}
        stroke="#ffffff"
        strokeWidth={depth === 1 ? 4 : 0.5}
        fillOpacity={depth === 1 ? 0.9 : 0.7}
        className="transition-all duration-300 hover:fill-opacity-100 cursor-pointer dark:stroke-zinc-900"
      />
      {width > 45 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={width < 120 ? 10 : 13}
          fontWeight="600"
          className="pointer-events-none select-none tracking-normal"
          style={{ 
            fontFamily: 'var(--font-manrope), sans-serif',
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.6))',
            pointerEvents: 'none'
          }}
        >
          {name.length > (width / 7) ? name.substring(0, Math.floor(width / 7) - 2) + '..' : name}
        </text>
      )}
    </g>
  );
};

export default function TopicTreeMap({ data }: TopicTreeMapProps) {
  const treeData = useMemo(() => {
    const domains: Record<string, { name: string; children: Record<string, { name: string; size: number; domain: string }> }> = {};

    data.forEach(p => {
      if (!p.primary_topic) return;
      const domainName = p.primary_topic.domain || 'Other';
      const fieldName = p.primary_topic.field || 'Other';

      if (!domains[domainName]) {
        domains[domainName] = { name: domainName, children: {} };
      }
      
      if (!domains[domainName].children[fieldName]) {
        domains[domainName].children[fieldName] = { 
          name: fieldName, 
          size: 0,
          domain: domainName
        };
      }
      
      domains[domainName].children[fieldName].size += 1;
    });

    const domainList = Object.values(domains);

    return domainList.map((d) => {
      // Stable color selection based on name hash
      let hash = 0;
      for (let i = 0; i < d.name.length; i++) {
        hash = d.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = COLORS[Math.abs(hash) % COLORS.length];

      return {
        name: d.name,
        color: color,
        children: Object.values(d.children).map(c => ({
          ...c,
          color: color
        })).sort((a, b) => b.size - a.size)
      };
    }).sort((a, b) => {
      const aSize = a.children.reduce((acc, curr) => acc + curr.size, 0);
      const bSize = b.children.reduce((acc, curr) => acc + curr.size, 0);
      return bSize - aSize;
    });
  }, [data]);

  if (treeData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200">
        No topic data available for the current selection
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2" role="region" aria-label="Scientific Landscape Treemap">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="size"
          aspectRatio={16 / 9}
          stroke="#fff"
          content={<CustomizedContent />}
        >
          <Tooltip 
            formatter={(value: any, name: any, props: any) => {
              const domain = props.payload?.domain || 'Unknown Domain';
              return [
                <div key="tt" className="space-y-1 font-sans">
                  <p className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{domain}</p>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="text-teal-400 font-black">{value} Publications</p>
                </div>,
                null
              ];
            }}
            contentStyle={{ 
              borderRadius: '20px', 
              border: 'none', 
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
              backgroundColor: '#09090b',
              padding: '16px'
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

