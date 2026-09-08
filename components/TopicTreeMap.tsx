'use client';

import React, { useMemo } from 'react';
import { Publication } from '@/lib/types';
import { Treemap, Tooltip } from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { getDomainColor } from '@/lib/domainColors';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface TopicTreeMapProps {
  data: Publication[];
}

interface CustomizedContentProps {
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  color?: string;
  [key: string]: unknown;
}

const CustomizedContent = (props: CustomizedContentProps) => {
  const { depth = 0, x = 0, y = 0, width = 0, height = 0, name = '', color = '#64748b' } = props;

  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);

  return (
    <g>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        fill={color || '#64748b'}
        stroke="#ffffff"
        strokeWidth={depth === 1 ? 4 : 0.5}
        fillOpacity={depth === 1 ? 0.9 : 0.7}
        className="transition-all duration-300 hover:fill-opacity-100 cursor-pointer dark:stroke-zinc-900"
      />
      {rw > 45 && rh > 20 && (
        <text
          x={Math.round(rx + rw / 2)}
          y={Math.round(ry + rh / 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={rw < 120 ? 10 : 12}
          fontWeight="600"
          textRendering="geometricPrecision"
          className="pointer-events-none select-none tracking-normal antialiased"
          style={{ 
            fontFamily: 'var(--font-manrope), system-ui, sans-serif',
            pointerEvents: 'none'
          }}
        >
          {name.length > (rw / 7) ? name.substring(0, Math.floor(rw / 7) - 2) + '..' : name}
        </text>
      )}
    </g>
  );
};

export default function TopicTreeMap({ data }: TopicTreeMapProps) {
  const { t } = useTranslation();
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
      const color = getDomainColor(d.name);

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
        {t.treemap.noData}
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2" role="region" aria-label={t.treemap.ariaLabel}>
      <ChartContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="size"
          aspectRatio={16 / 9}
          stroke="#fff"
          content={CustomizedContent}
        >
          <Tooltip 
            formatter={(value: unknown, name: unknown, props: { payload?: { domain?: string } }) => {
              const domain = props.payload?.domain || t.treemap.unknownDomain;
              return [
                <div key="tt" className="space-y-1 font-sans">
                  <p className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{domain}</p>
                  <p className="text-sm font-bold text-white">{String(name || '')}</p>
                  <p className="text-teal-400 font-black">{String(value || 0)} {t.common.publications}</p>
                </div>,
                null
              ] as [React.ReactNode, null];
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
      </ChartContainer>
    </div>
  );
}

