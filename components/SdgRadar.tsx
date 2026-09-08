'use client';

import React, { useMemo, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip 
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';
import { SDG } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SdgRadarProps {
  data: SDG[];
}

const UN_SDG_NAMES_FR: Record<number, string> = {
  1: "Pas de pauvreté",
  2: "Faim « zéro »",
  3: "Bonne santé et bien-être",
  4: "Éducation de qualité",
  5: "Égalité entre les sexes",
  6: "Eau propre et assainissement",
  7: "Énergie propre et d'un coût abordable",
  8: "Travail décent et croissance économique",
  9: "Industrie, innovation et infrastructure",
  10: "Inégalités réduites",
  11: "Villes et communautés durables",
  12: "Consommation et production responsables",
  13: "Mesures relatives à la lutte contre les changements climatiques",
  14: "Vie aquatique",
  15: "Vie terrestre",
  16: "Paix, justice et institutions efficaces",
  17: "Partenariats pour la réalisation des objectifs",
};

const UN_SDG_NAMES_EN: Record<number, string> = {
  1: "No Poverty",
  2: "Zero Hunger",
  3: "Good Health & Well-being",
  4: "Quality Education",
  5: "Gender Equality",
  6: "Clean Water & Sanitation",
  7: "Affordable & Clean Energy",
  8: "Decent Work & Economic Growth",
  9: "Industry, Innovation & Infrastructure",
  10: "Reduced Inequalities",
  11: "Sustainable Cities & Communities",
  12: "Responsible Consumption",
  13: "Climate Action",
  14: "Life Below Water",
  15: "Life On Land",
  16: "Peace, Justice & Strong Institutions",
  17: "Partnerships for the Goals",
};

const UN_SDG_NAMES_ES: Record<number, string> = {
  1: "Fin de la pobreza",
  2: "Hambre cero",
  3: "Salud y bienestar",
  4: "Educación de calidad",
  5: "Igualdad de género",
  6: "Agua limpia y saneamiento",
  7: "Energía asequible y no contaminante",
  8: "Trabajo decente y crecimiento económico",
  9: "Industria, innovación e infraestructura",
  10: "Reducción de las desigualdades",
  11: "Ciudades y comunidades sostenibles",
  12: "Producción y consumo responsables",
  13: "Acción por el clima",
  14: "Vida submarina",
  15: "Vida de ecosistemas terrestres",
  16: "Paz, justicia e instituciones sólidas",
  17: "Alianzas para lograr los objetivos",
};

function LegendCard({
  sdg,
  isHovered,
  onHover,
  onLeave,
}: {
  sdg: { full: string; short: string; score: number };
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-default ${
        isHovered
          ? 'bg-teal-50/60 border-teal-500 shadow-md shadow-teal-500/10 dark:bg-teal-950/40 dark:border-teal-400'
          : 'bg-white border-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800/80 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <span
          className={`flex-shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
            isHovered
              ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-zinc-950'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          {sdg.short}
        </span>
        <span
          className={`text-xs font-bold truncate leading-tight transition-colors ${
            isHovered
              ? 'text-teal-950 dark:text-teal-100'
              : 'text-zinc-700 dark:text-zinc-300'
          }`}
          title={sdg.full}
        >
          {sdg.full}
        </span>
      </div>
      <span
        className={`flex-shrink-0 text-xs font-mono font-black ${
          isHovered
            ? 'text-teal-600 dark:text-teal-400'
            : 'text-zinc-400 dark:text-zinc-500'
        }`}
      >
        {sdg.score.toFixed(2)}
      </span>
    </div>
  );
}

export default function SdgRadar({ data }: SdgRadarProps) {
  const { locale, t } = useTranslation();
  const [hoveredSdg, setHoveredSdg] = useState<string | null>(null);

  const { radarData, sdgMapping } = useMemo(() => {
    const names = locale === 'fr' ? UN_SDG_NAMES_FR : locale === 'es' ? UN_SDG_NAMES_ES : UN_SDG_NAMES_EN;
    const prefix = locale === 'fr' ? 'ODD' : locale === 'es' ? 'ODS' : 'SDG';
    const sdgMap: Record<string, { full: string; short: string; score: number }> = {};

    for (let i = 1; i <= 17; i++) {
      const uri = `https://metadata.un.org/sdg/${i}`;
      sdgMap[uri] = {
        full: names[i] || `SDG ${i}`,
        short: `${prefix} ${i}`,
        score: 0,
      };
    }

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
  }, [data, locale]);

  const leftLegend = sdgMapping.slice(0, Math.ceil(sdgMapping.length / 2));
  const rightLegend = sdgMapping.slice(Math.ceil(sdgMapping.length / 2));

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-2">
        {/* Side legend — visible alongside the chart on wide screens so both stay in view together */}
        <div className="hidden xl:flex flex-col gap-2 xl:w-64 flex-shrink-0">
          {leftLegend.map((sdg) => (
            <LegendCard
              key={sdg.short}
              sdg={sdg}
              isHovered={hoveredSdg === sdg.short}
              onHover={() => setHoveredSdg(sdg.short)}
              onLeave={() => setHoveredSdg(null)}
            />
          ))}
        </div>

        <div className="h-[450px] md:h-[550px] w-full flex-1 min-w-0" role="region" aria-label={t.radar.ariaLabel}>
        <ChartContainer width="100%" height="100%">
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
              formatter={(value: unknown) => [Number(value || 0).toFixed(2), t.radar.impactScore]}
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
              name={t.radar.sdgImpact} 
              dataKey="A" 
              stroke="#0D9488" 
              fill="#0D9488" 
              fillOpacity={0.5} 
              isAnimationActive={true}
            />
          </RadarChart>
        </ChartContainer>
        </div>

        <div className="hidden xl:flex flex-col gap-2 xl:w-64 flex-shrink-0">
          {rightLegend.map((sdg) => (
            <LegendCard
              key={sdg.short}
              sdg={sdg}
              isHovered={hoveredSdg === sdg.short}
              onHover={() => setHoveredSdg(sdg.short)}
              onLeave={() => setHoveredSdg(null)}
            />
          ))}
        </div>
      </div>

      {/* Full-width legend fallback for screens too narrow to flank the chart */}
      <div className="xl:hidden w-full border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">
          {t.radar.legendTitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sdgMapping.map((sdg) => (
            <LegendCard
              key={sdg.short}
              sdg={sdg}
              isHovered={hoveredSdg === sdg.short}
              onHover={() => setHoveredSdg(sdg.short)}
              onLeave={() => setHoveredSdg(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
