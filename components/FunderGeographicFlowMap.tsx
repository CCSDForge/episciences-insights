'use client';

import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { Route } from 'lucide-react';
import { Publication, FundersFile } from '@/lib/types';
import { COLOR_RAMPS, rampStep } from '@/lib/colorRamps';
import NodeCountSlider from './NodeCountSlider';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface FunderGeographicFlowMapProps {
  data: Publication[];
  funders: FundersFile;
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const TOOLTIP_ID = 'funder-flow-map-tooltip';
const DEFAULT_MAX_NODES = 20;
const MIN_NODES = 10;
const MAX_NODES_LIMIT = 50;
const NODE_STEP = 5;
const RAMP = COLOR_RAMPS.teal;

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

export default function FunderGeographicFlowMap({ data, funders }: FunderGeographicFlowMapProps) {
  const { t } = useTranslation();
  const [maxNodes, setMaxNodes] = useState(DEFAULT_MAX_NODES);

  const { nodes, links, totalFunders, maxWeight } = useMemo(() => {
    const pubCounts = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      (p.awards || []).forEach((a) => {
        const info = a.funder_id ? funders[a.funder_id] : undefined;
        if (a.funder_id && info?.lat != null && info?.lng != null) seen.add(a.funder_id);
      });
      seen.forEach((id) => pubCounts.set(id, (pubCounts.get(id) || 0) + 1));
    });

    const topIds = Array.from(pubCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNodes)
      .map(([id]) => id);
    const topIdSet = new Set(topIds);

    const nodes = topIds.map((id) => ({
      id,
      name: funders[id].name,
      lat: funders[id].lat as number,
      lng: funders[id].lng as number,
      count: pubCounts.get(id) || 0,
    }));

    const pairCounts = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      (p.awards || []).forEach((a) => { if (a.funder_id && topIdSet.has(a.funder_id)) seen.add(a.funder_id); });
      const ids = Array.from(seen).sort();
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = `${ids[i]}|${ids[j]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    });

    const maxWeight = Math.max(0, ...Array.from(pairCounts.values()));
    const links = Array.from(pairCounts.entries()).map(([key, weight]) => {
      const [a, b] = key.split('|');
      return { a: funders[a], b: funders[b], nameA: funders[a].name, nameB: funders[b].name, weight };
    });

    return { nodes, links, totalFunders: pubCounts.size, maxWeight: Math.max(1, maxWeight) };
  }, [data, funders, maxNodes]);

  const maxCount = Math.max(1, ...nodes.map((n) => n.count));

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-3xl border-2 border-dashed bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30">
        <div className="mb-4 text-teal-200 dark:text-teal-800 [&_svg]:h-12 [&_svg]:w-12"><Route size={24} /></div>
        <h4 className="text-lg font-bold mb-2 text-teal-900 dark:text-teal-100">No Geolocated Funder Data Available</h4>
        <p className="text-sm italic max-w-md text-teal-600/70 dark:text-teal-400/60">No publications in this selection carry a funder resolved to HQ coordinates.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">
      <div className="relative flex-1 aspect-[16/9] min-h-[420px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 145 }}
          width={800}
          height={450}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>

          {links.map((link, i) => (
            <Line
              key={`link-${i}`}
              from={[link.a.lng as number, link.a.lat as number]}
              to={[link.b.lng as number, link.b.lat as number]}
              stroke={rampStep(link.weight, maxWeight, RAMP)}
              strokeWidth={Math.max(0.75, Math.min(5, link.weight))}
              strokeOpacity={0.55}
              data-tooltip-id={TOOLTIP_ID}
              data-tooltip-content={`${link.nameA} ↔ ${link.nameB}: ${formatNum(link.weight)} ${t.common.jointPublications.toLowerCase()}`}
            />
          ))}

          {nodes.map((node) => {
            const r = 3 + (Math.log(node.count + 1) / Math.log(maxCount + 1)) * 9;
            return (
              <Marker key={node.id} coordinates={[node.lng, node.lat]}>
                <circle
                  r={r}
                  fill="#0d9488"
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1}
                  data-tooltip-id={TOOLTIP_ID}
                  data-tooltip-content={`${node.name}: ${formatNum(node.count)} ${t.common.publications.toLowerCase()}`}
                />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <div className="lg:w-[320px] flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 text-white rounded-xl shadow-lg bg-teal-600 shadow-teal-600/20">
              <Route size={24} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 font-heading">{t.flowMap.funderTitle}</h4>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{t.flowMap.funderSubtitle}</p>
        </div>

        <NodeCountSlider
          value={maxNodes}
          onChange={setMaxNodes}
          min={MIN_NODES}
          max={MAX_NODES_LIMIT}
          step={NODE_STEP}
          label={t.flowMap.sliderLabelFunders}
          color="teal"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className="text-3xl font-black text-teal-400">{nodes.length}</p>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.flowMap.fundersShown}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className="text-3xl font-black text-teal-400">{links.length}</p>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.flowMap.fundingTies}</p>
          </div>
        </div>

        {totalFunders > maxNodes && (
          <p className="text-[9px] text-zinc-400 italic text-center">
            {t.flowMap.sliderNoteFunder.replace('{max}', String(maxNodes))}
          </p>
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {t.flowMap.nodeExplanationFunder}
        </p>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-1">{t.common.fewer}</span>
          {RAMP.map((color) => (
            <span key={color} className="h-3 w-3 rounded-full border border-white dark:border-zinc-900" style={{ backgroundColor: color }} />
          ))}
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{t.common.more}</span>
        </div>
      </div>

      <Tooltip id={TOOLTIP_ID} style={{ backgroundColor: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', zIndex: 100, maxWidth: '320px' }} />
    </div>
  );
}
