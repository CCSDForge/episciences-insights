'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker, useGeographies } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import type { Geometry } from 'geojson';
import { Tooltip } from 'react-tooltip';
import { Route } from 'lucide-react';
import { Publication } from '@/lib/types';
import { COLOR_RAMPS, rampStep } from '@/lib/colorRamps';
import { getCountryName } from '@/lib/countryNames';
import { ISO_NUMERIC_TO_ALPHA2 } from '@/lib/isoNumericToAlpha2';
import NodeCountSlider from './NodeCountSlider';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface CountryGeographicFlowMapProps {
  data: Publication[];
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const TOOLTIP_ID = 'country-flow-map-tooltip';
const DEFAULT_MAX_NODES = 20;
const MIN_NODES = 10;
const MAX_NODES_LIMIT = 50;
const NODE_STEP = 5;
const RAMP = COLOR_RAMPS.blue;

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

interface GeographyFeature {
  id?: string | number;
  properties?: { ISO_A2?: string; iso_a2?: string };
  geometry: Geometry;
}

// Derives each country's centroid from the same TopoJSON already used to
// draw the basemap below, rather than a separately maintained lat/lng table
// — guarantees the dot sits on the same border data it's drawn over.
// useGeographies needs the map's projection context, so this has to run as
// a child of <ComposableMap>; it renders nothing itself.
function CentroidCollector({ onReady }: { onReady: (centroids: Record<string, [number, number]>) => void }) {
  const { geographies } = useGeographies({ geography: geoUrl }) as { geographies: GeographyFeature[] };

  useEffect(() => {
    if (geographies.length === 0) return;
    const map: Record<string, [number, number]> = {};
    geographies.forEach((geo) => {
      const numericId = geo.id?.toString().padStart(3, '0');
      const code = geo.properties?.ISO_A2 || geo.properties?.iso_a2 || (numericId ? ISO_NUMERIC_TO_ALPHA2[numericId] : undefined);
      if (!code || code === '-99') return;
      const [lng, lat] = geoCentroid(geo.geometry);
      if (Number.isFinite(lng) && Number.isFinite(lat)) map[code.toUpperCase()] = [lng, lat];
    });
    onReady(map);
  }, [geographies, onReady]);

  return null;
}

export default function CountryGeographicFlowMap({ data }: CountryGeographicFlowMapProps) {
  const { t } = useTranslation();
  const [centroids, setCentroids] = useState<Record<string, [number, number]> | null>(null);
  const [maxNodes, setMaxNodes] = useState(DEFAULT_MAX_NODES);
  const handleCentroidsReady = useCallback((c: Record<string, [number, number]>) => setCentroids(c), []);

  const { nodes, links, totalCountries, maxWeight } = useMemo(() => {
    if (!centroids) return { nodes: [], links: [], totalCountries: 0, maxWeight: 1 };

    const pubCounts = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      p.authors.forEach((a) => a.institutions.forEach((inst) => {
        const code = inst.country?.toUpperCase();
        if (code && centroids[code]) seen.add(code);
      }));
      seen.forEach((code) => pubCounts.set(code, (pubCounts.get(code) || 0) + 1));
    });

    const topCodes = Array.from(pubCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNodes)
      .map(([code]) => code);
    const topSet = new Set(topCodes);

    const nodes = topCodes.map((code) => ({
      id: code,
      name: getCountryName(code),
      lng: centroids[code][0],
      lat: centroids[code][1],
      count: pubCounts.get(code) || 0,
    }));

    const pairCounts = new Map<string, number>();
    data.forEach((p) => {
      const seen = new Set<string>();
      p.authors.forEach((a) => a.institutions.forEach((inst) => {
        const code = inst.country?.toUpperCase();
        if (code && topSet.has(code)) seen.add(code);
      }));
      const codes = Array.from(seen).sort();
      for (let i = 0; i < codes.length; i++) {
        for (let j = i + 1; j < codes.length; j++) {
          const key = `${codes[i]}|${codes[j]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    });

    const maxWeight = Math.max(1, ...Array.from(pairCounts.values()));
    const links = Array.from(pairCounts.entries()).map(([key, weight]) => {
      const [a, b] = key.split('|');
      return { nameA: getCountryName(a), nameB: getCountryName(b), from: centroids[a], to: centroids[b], weight };
    });

    return { nodes, links, totalCountries: pubCounts.size, maxWeight };
  }, [data, centroids, maxNodes]);

  const maxCount = Math.max(1, ...nodes.map((n) => n.count));

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden">
      <div className="relative flex-1 aspect-[16/9] min-h-[420px] select-none bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 145 }}
          width={800}
          height={450}
          style={{ width: '100%', height: '100%' }}
        >
          <CentroidCollector onReady={handleCentroidsReady} />

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
              from={link.from}
              to={link.to}
              stroke={rampStep(link.weight, maxWeight, RAMP)}
              strokeWidth={Math.max(0.75, Math.min(5, link.weight))}
              strokeOpacity={0.55}
              data-tooltip-id={TOOLTIP_ID}
              data-tooltip-content={t.flowMap.tooltipLinkCountry
                .replace('{nameA}', link.nameA)
                .replace('{nameB}', link.nameB)
                .replace('{count}', formatNum(link.weight))}
            />
          ))}

          {nodes.map((node) => {
            const r = 3 + (Math.log(node.count + 1) / Math.log(maxCount + 1)) * 9;
            return (
              <Marker key={node.id} coordinates={[node.lng, node.lat]}>
                <circle
                  r={r}
                  fill="#2563eb"
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1}
                  data-tooltip-id={TOOLTIP_ID}
                  data-tooltip-content={t.flowMap.tooltipNodeCountry
                    .replace('{name}', node.name)
                    .replace('{count}', formatNum(node.count))}
                />
              </Marker>
            );
          })}
        </ComposableMap>

        {!centroids && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/60 dark:bg-zinc-950/40">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 animate-pulse">{t.flowMap.loading}</p>
          </div>
        )}
      </div>

      <div className="lg:w-[320px] flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 text-white rounded-xl shadow-lg bg-blue-600 shadow-blue-600/20">
              <Route size={24} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 font-heading">{t.flowMap.countryTitle}</h4>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{t.flowMap.countrySubtitle}</p>
        </div>

        <NodeCountSlider
          value={maxNodes}
          onChange={setMaxNodes}
          min={MIN_NODES}
          max={MAX_NODES_LIMIT}
          step={NODE_STEP}
          label={t.flowMap.sliderLabelCountries}
          color="blue"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className="text-3xl font-black text-blue-400">{nodes.length}</p>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.flowMap.countriesShown}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-black text-white shadow-lg">
            <p className="text-3xl font-black text-blue-400">{links.length}</p>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">{t.flowMap.coAuthorshipTies}</p>
          </div>
        </div>

        {totalCountries > maxNodes && (
          <p className="text-[9px] text-zinc-400 italic text-center">
            {t.flowMap.sliderNoteCountry.replace('{max}', String(maxNodes))}
          </p>
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {t.flowMap.nodeExplanationCountry}
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
