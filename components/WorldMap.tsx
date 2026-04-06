'use client';

import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLog } from 'd3-scale';
import { Tooltip } from 'react-tooltip';

// Reliable TopoJSON source from world-atlas
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: { name: string; value: number }[]; // name is ISO country code (2 letters)
}

export default function WorldMap({ data }: WorldMapProps) {

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
      .range(["#dbeafe", "#2563eb"]); // blue-100 to blue-600
  }, [maxValue]);

  const idToIso = useMemo(() => ({
    "686": "SN", "250": "FR", "840": "US", "826": "GB", "276": "DE", 
    "380": "IT", "724": "ES", "124": "CA", "036": "AU", "156": "CN", 
    "392": "JP", "076": "BR", "643": "RU", "356": "IN", "710": "ZA", 
    "410": "KR", "120": "CM", "178": "CG", "180": "CD", "231": "ET", 
    "404": "KE", "504": "MA", "566": "NG", "788": "TN", "818": "EG", 
    "204": "BJ", "854": "BF", "384": "CI", "288": "GH", "466": "ML", 
    "508": "MZ", "450": "MG", "800": "UG", "024": "AO", "140": "CF", 
    "148": "TD", "266": "GA", "324": "GN", "478": "MR", "516": "NA", 
    "562": "NE", "646": "RW", "706": "SO", "728": "SS", "729": "SD", 
    "736": "SD", "834": "TZ", "894": "ZM", "716": "ZW",
  }), []);

  return (
    <div className="h-full w-full relative min-h-[400px]">
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
          {({ geographies }: any) =>
            geographies.map((geo: any) => {
              const { ISO_A2, iso_a2, name } = geo.properties;
              const numericId = geo.id?.toString().padStart(3, '0');
              const countryCode = ISO_A2 || iso_a2 || (numericId ? (idToIso as any)[numericId] : null);
              const value = countryCode ? (dataMap[countryCode.toUpperCase()] || 0) : 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  data-tooltip-id="world-map-tooltip"
                  data-tooltip-content={`${name}: ${value} publications`}
                  fill={value > 0 ? colorScale(value) : "#f1f5f9"}
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1d4ed8", outline: "none", cursor: "pointer" }, // blue-700
                    pressed: { outline: "none" },
                  }}
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
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span>1 pub.</span>
          <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#dbeafe] to-[#2563eb] border border-zinc-200" />
          <span>{maxValue} pub.</span>
        </div>
        <p className="text-[9px] text-zinc-400 italic font-sans">Geographical author distribution (Log scale)</p>
      </div>
    </div>
  );
}
