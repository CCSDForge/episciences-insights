'use client';

import React, { useMemo, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

interface SDG {
  label: string;
  id: string;
  score?: number;
}

interface SdgRadarProps {
  data: SDG[];
}

export default function SdgRadar({ data }: SdgRadarProps) {
  const [hoveredSdg, setHoveredSdg] = useState<string | null>(null);

  const { radarData, sdgMapping } = useMemo(() => {
    const sdgMap: Record<string, { full: string; short: string; score: number }> = {
      "https://metadata.un.org/sdg/1": { full: "No Poverty", short: "SDG 1", score: 0 },
      "https://metadata.un.org/sdg/2": { full: "Zero Hunger", short: "SDG 2", score: 0 },
      "https://metadata.un.org/sdg/3": { full: "Good Health & Well-being", short: "SDG 3", score: 0 },
      "https://metadata.un.org/sdg/4": { full: "Quality Education", short: "SDG 4", score: 0 },
      "https://metadata.un.org/sdg/5": { full: "Gender Equality", short: "SDG 5", score: 0 },
      "https://metadata.un.org/sdg/6": { full: "Clean Water & Sanitation", short: "SDG 6", score: 0 },
      "https://metadata.un.org/sdg/7": { full: "Affordable & Clean Energy", short: "SDG 7", score: 0 },
      "https://metadata.un.org/sdg/8": { full: "Decent Work & Economic Growth", short: "SDG 8", score: 0 },
      "https://metadata.un.org/sdg/9": { full: "Industry, Innovation & Infrastructure", short: "SDG 9", score: 0 },
      "https://metadata.un.org/sdg/10": { full: "Reduced Inequalities", short: "SDG 10", score: 0 },
      "https://metadata.un.org/sdg/11": { full: "Sustainable Cities & Communities", short: "SDG 11", score: 0 },
      "https://metadata.un.org/sdg/12": { full: "Responsible Consumption", short: "SDG 12", score: 0 },
      "https://metadata.un.org/sdg/13": { full: "Climate Action", short: "SDG 13", score: 0 },
      "https://metadata.un.org/sdg/14": { full: "Life Below Water", short: "SDG 14", score: 0 },
      "https://metadata.un.org/sdg/15": { full: "Life On Land", short: "SDG 15", score: 0 },
      "https://metadata.un.org/sdg/16": { full: "Peace, Justice & Strong Institutions", short: "SDG 16", score: 0 },
      "https://metadata.un.org/sdg/17": { full: "Partnerships for the Goals", short: "SDG 17", score: 0 },
    };

    data.forEach(s => {
      if (sdgMap[s.id]) {
        sdgMap[s.id].score = Math.max(sdgMap[s.id].score, s.score || 1); 
      }
    });

    return {
      radarData: Object.values(sdgMap).map(d => ({
        subject: d.short,
        full: d.full,
        A: d.score,
        fullMark: 1,
      })),
      sdgMapping: Object.values(sdgMap)
    };
  }, [data]);

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="h-[450px] md:h-[550px] w-full" role="region" aria-label="SDG Impact Radar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
            <PolarGrid stroke="#e5e7eb" className="dark:stroke-zinc-800" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={(props) => {
                const { x, y, payload } = props;
                const isHovered = hoveredSdg === payload.value;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={props.textAnchor}
                    fill={isHovered ? "#0D9488" : "#71717a"}
                    fontSize={isHovered ? 14 : 11}
                    fontWeight={isHovered ? 900 : 800}
                    className="transition-all duration-200"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
            <Tooltip 
              formatter={(value: any) => [Number(value).toFixed(2), 'Impact Score']}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                backgroundColor: '#09090b',
                color: '#fff',
                fontSize: '12px',
                padding: '12px'
              }}
              itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
            />
            <Radar 
              name="SDG Impact" 
              dataKey="A" 
              stroke="#0D9488" 
              fill="#0D9488" 
              fillOpacity={0.5} 
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Improved Non-Scrolling Legend */}
      <div className="w-full border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Legend & Full Titles</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sdgMapping.map((sdg) => (
            <div 
              key={sdg.short} 
              onMouseEnter={() => setHoveredSdg(sdg.short)}
              onMouseLeave={() => setHoveredSdg(null)}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all border cursor-help ${
                sdg.score > 0 
                  ? 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-100/50 dark:border-teal-900/30' 
                  : 'bg-zinc-50/30 dark:bg-zinc-900/20 border-transparent opacity-60'
              } ${hoveredSdg === sdg.short ? 'ring-2 ring-teal-500 border-transparent shadow-lg scale-[1.02]' : ''}`}
            >
              <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${sdg.score > 0 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
              <div className="min-w-0">
                <p className={`text-[10px] font-black leading-none mb-1 ${sdg.score > 0 ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500'}`}>
                  {sdg.short}
                </p>
                <p className={`text-xs font-bold leading-tight ${sdg.score > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                  {sdg.full}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
