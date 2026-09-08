'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import { COLOR_RAMPS } from '@/lib/colorRamps';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface LicenseSpectrumProps {
  licenses: { name: string; count: number }[];
  total: number;
}

const TOOLTIP_ID = 'license-spectrum-tooltip';
const RAMP = COLOR_RAMPS.teal;

// Rank 0 (most common) gets the darkest step, fading toward the lighter
// end — the same "more = darker" convention already used by the
// co-occurrence network/matrix ramps elsewhere in the dashboard.
const colorForRank = (rank: number) => RAMP[Math.max(0, RAMP.length - 1 - Math.min(rank, RAMP.length - 1))];

const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function LicenseSpectrum({ licenses, total }: LicenseSpectrumProps) {
  const { t } = useTranslation();
  if (licenses.length === 0 || total === 0) return null;

  return (
    <div>
      <div className="flex w-full h-10 rounded-2xl overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800" role="img" aria-label={t.dashboard.licensingTitle}>
        {licenses.map((license, i) => {
          const pct = (license.count / total) * 100;
          return (
            <div
              key={license.name}
              className="h-full border-r-2 border-white last:border-r-0 dark:border-zinc-900"
              style={{ width: `${pct}%`, backgroundColor: colorForRank(i) }}
              data-tooltip-id={TOOLTIP_ID}
              data-tooltip-content={`${license.name} - ${formatNum(license.count)} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
        {licenses.map((license, i) => (
          <div key={license.name} className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: colorForRank(i) }} aria-hidden="true" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate" title={license.name}>{license.name}</span>
            <span className="text-[10px] font-black text-zinc-400 shrink-0 ml-auto">{((license.count / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <Tooltip id={TOOLTIP_ID} style={{ backgroundColor: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', zIndex: 100, maxWidth: '320px' }} />
    </div>
  );
}
