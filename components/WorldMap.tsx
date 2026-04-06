'use client';

import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLog } from 'd3-scale';
import { Tooltip } from 'react-tooltip';

// Reliable TopoJSON source from world-atlas
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: { name: string; value: number }[]; // name is ISO country code (2 letters)
  legendLabel?: string;
  colorRange?: [string, string];
}

export default function WorldMap({ data, legendLabel = "Geographical author distribution (Log scale)", colorRange = ["#dbeafe", "#2563eb"] }: WorldMapProps) {

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
  }, [maxValue]);

  const idToIso: Record<string, string> = {
    // Europe
    "008": "AL", "020": "AD", "040": "AT", "112": "BY", "056": "BE",
    "070": "BA", "100": "BG", "191": "HR", "196": "CY", "203": "CZ",
    "208": "DK", "233": "EE", "246": "FI", "250": "FR", "276": "DE",
    "300": "GR", "348": "HU", "352": "IS", "372": "IE", "380": "IT",
    "428": "LV", "438": "LI", "440": "LT", "442": "LU", "470": "MT",
    "498": "MD", "492": "MC", "499": "ME", "528": "NL", "807": "MK",
    "578": "NO", "616": "PL", "620": "PT", "642": "RO", "643": "RU",
    "674": "SM", "688": "RS", "703": "SK", "705": "SI", "724": "ES",
    "752": "SE", "756": "CH", "804": "UA", "826": "GB", "336": "VA",
    "051": "AM", "031": "AZ", "268": "GE",
    // Americas
    "032": "AR", "084": "BZ", "068": "BO", "076": "BR", "124": "CA",
    "152": "CL", "170": "CO", "188": "CR", "192": "CU", "214": "DO",
    "218": "EC", "222": "SV", "320": "GT", "332": "HT", "340": "HN",
    "484": "MX", "558": "NI", "591": "PA", "600": "PY", "604": "PE",
    "630": "PR", "840": "US", "858": "UY", "862": "VE", "388": "JM",
    "780": "TT", "044": "BS", "052": "BB", "308": "GD",
    // Africa
    "012": "DZ", "024": "AO", "204": "BJ", "072": "BW", "854": "BF",
    "108": "BI", "120": "CM", "132": "CV", "140": "CF", "148": "TD",
    "174": "KM", "178": "CG", "180": "CD", "262": "DJ", "818": "EG",
    "226": "GQ", "232": "ER", "231": "ET", "266": "GA", "288": "GH",
    "324": "GN", "624": "GW", "384": "CI", "404": "KE", "426": "LS",
    "430": "LR", "434": "LY", "450": "MG", "454": "MW", "466": "ML",
    "478": "MR", "480": "MU", "175": "YT", "504": "MA", "508": "MZ",
    "516": "NA", "562": "NE", "566": "NG", "646": "RW", "678": "ST",
    "686": "SN", "694": "SL", "706": "SO", "710": "ZA", "728": "SS",
    "729": "SD", "748": "SZ", "834": "TZ", "768": "TG", "788": "TN",
    "800": "UG", "894": "ZM", "716": "ZW",
    // Asia
    "004": "AF", "050": "BD", "064": "BT", "096": "BN", "116": "KH",
    "156": "CN", "626": "TL", "356": "IN", "360": "ID", "364": "IR",
    "368": "IQ", "376": "IL", "392": "JP", "400": "JO", "398": "KZ",
    "408": "KP", "410": "KR", "414": "KW", "417": "KG", "418": "LA",
    "422": "LB", "458": "MY", "462": "MV", "496": "MN", "104": "MM",
    "524": "NP", "512": "OM", "586": "PK", "275": "PS", "608": "PH",
    "634": "QA", "682": "SA", "702": "SG", "144": "LK", "760": "SY",
    "158": "TW", "762": "TJ", "764": "TH", "795": "TM", "784": "AE",
    "860": "UZ", "704": "VN", "887": "YE",
    // Oceania
    "036": "AU", "242": "FJ", "296": "KI", "584": "MH", "583": "FM",
    "520": "NR", "554": "NZ", "585": "PW", "598": "PG", "090": "SB",
    "776": "TO", "798": "TV", "548": "VU", "882": "WS",
  };

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="h-full w-full relative">
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
              const countryCode = ISO_A2 || iso_a2 || (numericId ? idToIso[numericId] : null);
              const value = countryCode ? (dataMap[countryCode.toUpperCase()] || 0) : 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  data-tooltip-id="world-map-tooltip"
                  data-tooltip-content={`${name}: ${formatNum(value)} items`}
                  fill={value > 0 ? colorScale(value) : "#f1f5f9"}
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: colorRange[1], outline: "none", cursor: "pointer" },
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
          <span>Min.</span>
          <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#dbeafe] to-[#2563eb] border border-zinc-200" />
          <span>Max.</span>
        </div>
        <p className="text-[9px] text-zinc-400 italic font-sans">{legendLabel}</p>
      </div>
    </div>
  );
}
