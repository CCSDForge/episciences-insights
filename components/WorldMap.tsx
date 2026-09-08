'use client';

import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLog } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import { ISO_NUMERIC_TO_ALPHA2 } from '@/lib/isoNumericToAlpha2';
import { useTranslation } from '@/lib/i18n/LanguageContext';

// Reliable TopoJSON source from world-atlas
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: { name: string; value: number }[]; // name is ISO country code (2 letters)
  legendLabel?: string;
  colorRange?: [string, string];
  selectedCountry?: string | null;
  onSelectCountry?: (code: string) => void;
}

export default function WorldMap({
  data,
  legendLabel,
  colorRange = ["#dbeafe", "#2563eb"],
  selectedCountry,
  onSelectCountry,
}: WorldMapProps) {
  const { t } = useTranslation();
  const effectiveLegendLabel = legendLabel || t.dashboard.authorAffiliationsTitle;

  const dataMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      if (d.name) map[d.name.toUpperCase()] = d.value;
    });
    return map;
  }, [data]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.value), 1);
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLog<string>()
      .domain([1, maxValue])
      .range(colorRange);
  }, [maxValue, colorRange]);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  return (
    <div className="h-full w-full relative" role="region" aria-label={effectiveLegendLabel}>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 140
        }}
        width={800}
        height={450}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: Array<{ properties: { ISO_A2?: string; iso_a2?: string; name: string }; id: string | number; rsmKey: string }> }) =>
            geographies.map((geo) => {
              const { ISO_A2, iso_a2, name } = geo.properties;
              const numericId = geo.id?.toString().padStart(3, '0');
              const countryCode = ISO_A2 || iso_a2 || (numericId ? ISO_NUMERIC_TO_ALPHA2[numericId] : null);
              const value = countryCode ? (dataMap[countryCode.toUpperCase()] || 0) : 0;
              const isSelected = Boolean(countryCode && selectedCountry && countryCode.toUpperCase() === selectedCountry.toUpperCase());
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  role={value > 0 ? "button" : undefined}
                  tabIndex={value > 0 ? 0 : -1}
                  aria-label={`${name}: ${formatNum(value)} items${value > 0 ? ' (click or press Enter to view affiliations)' : ''}`}
                  aria-pressed={value > 0 ? isSelected : undefined}
                  data-tooltip-id="world-map-tooltip"
                  data-tooltip-content={`${name}: ${formatNum(value)} items${value > 0 ? ' (click to view affiliations)' : ''}`}
                  onClick={() => {
                    if (countryCode && onSelectCountry && value > 0) {
                      onSelectCountry(countryCode.toUpperCase());
                    }
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if ((e.key === 'Enter' || e.key === ' ') && countryCode && onSelectCountry && value > 0) {
                      e.preventDefault();
                      onSelectCountry(countryCode.toUpperCase());
                    }
                  }}
                  fill={isSelected ? '#1d4ed8' : value > 0 ? colorScale(value) : "#f1f5f9"}
                  stroke={isSelected ? '#172554' : "#cbd5e1"}
                  strokeWidth={isSelected ? 1.8 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: colorRange[1], outline: "none", cursor: value > 0 ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                  className="focus-visible:stroke-teal-500 focus-visible:stroke-2 focus-visible:outline-none"
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      <Tooltip 
        id="world-map-tooltip" 
        style={{ 
          backgroundColor: "#111827", 
          color: "#fff", 
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 100
        }}
      />

      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          <span>{t.common.min}</span>
          <div
            className="h-2.5 w-28 rounded-full border border-zinc-200 dark:border-zinc-700"
            style={{ background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})` }}
            aria-hidden="true"
          />
          <span>{t.common.max}</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic font-sans">{effectiveLegendLabel}</p>
      </div>
    </div>
  );
}
