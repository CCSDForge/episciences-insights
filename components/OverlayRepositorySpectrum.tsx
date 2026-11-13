'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ExternalLink } from 'lucide-react';

interface OverlayRepositorySpectrumProps {
  repositories: { name: string; count: number }[];
  total: number;
}

const TOOLTIP_ID = 'overlay-repo-spectrum-tooltip';

type RepoDescKey = 'halDesc' | 'arxivDesc' | 'zenodoDesc' | 'darusDesc';

const REPO_META: Record<
  string,
  {
    color: string;
    ringColor: string;
    bgTint: string;
    descKey: RepoDescKey;
    url?: string;
  }
> = {
  HAL: {
    color: '#ff5722', // Orange CCSD vif et lumineux
    ringColor: 'ring-orange-500/40',
    bgTint: 'bg-orange-500/5 dark:bg-orange-500/15',
    descKey: 'halDesc',
    url: 'https://hal.science',
  },
  arXiv: {
    color: '#dc2626', // Rouge vif carmin (red-600) éclatant sur fond sombre
    ringColor: 'ring-red-500/40',
    bgTint: 'bg-red-500/5 dark:bg-red-500/15',
    descKey: 'arxivDesc',
    url: 'https://arxiv.org',
  },
  Zenodo: {
    color: '#0284c7', // Bleu Zenodo CERN éclatant (sky-600)
    ringColor: 'ring-sky-500/40',
    bgTint: 'bg-sky-500/5 dark:bg-sky-500/15',
    descKey: 'zenodoDesc',
    url: 'https://zenodo.org',
  },
  DaRUS: {
    color: '#7c3aed', // Violet lumineux (violet-600)
    ringColor: 'ring-purple-500/40',
    bgTint: 'bg-purple-500/5 dark:bg-purple-500/15',
    descKey: 'darusDesc',
    url: 'https://darus.uni-stuttgart.de',
  },
};

const DEFAULT_META: {
  color: string;
  ringColor: string;
  bgTint: string;
  descKey?: RepoDescKey;
} = {
  color: '#0aa0be', // Cyan 01 Episciences
  ringColor: 'ring-[var(--episciences-cyan-01)]/40',
  bgTint: 'bg-[var(--episciences-cyan-00)]/15',
};

export default function OverlayRepositorySpectrum({ repositories, total }: OverlayRepositorySpectrumProps) {
  const { t } = useTranslation();

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  if (!repositories || repositories.length === 0 || total === 0) return null;

  return (
    <>
      <div className="space-y-4">
      {/* 1. High-contrast Segmented Proportion Bar */}
      <div
        className="flex items-center gap-1.5 w-full p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 ring-1 ring-zinc-300 dark:ring-zinc-600 shadow-inner"
        role="progressbar"
        aria-label={t.repositorySpectrum.ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {repositories.map((repo) => {
          const meta = REPO_META[repo.name] || DEFAULT_META;
          const pct = (repo.count / total) * 100;
          const label = `${repo.name} : ${formatNum(repo.count)} ${t.repositorySpectrum.articles} (${pct.toFixed(1)}%)`;

          return (
            <div
              key={repo.name}
              className="h-4 sm:h-5 rounded-lg transition-all hover:brightness-125 shadow-xs cursor-pointer"
              style={{
                width: `${pct}%`,
                minWidth: pct > 0 ? '12px' : 0,
                backgroundColor: meta.color,
              }}
              data-tooltip-id={TOOLTIP_ID}
              data-tooltip-content={label}
            />
          );
        })}
      </div>

      {/* 2. Repository Detail Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {repositories.map((repo) => {
          const meta = REPO_META[repo.name] || DEFAULT_META;
          const pct = (repo.count / total) * 100;
          const desc = meta.descKey ? t.repositorySpectrum[meta.descKey] : t.repositorySpectrum.defaultDesc;

          return (
            <div
              key={repo.name}
              className={`rounded-2xl p-4 ring-1 transition-all ${meta.ringColor} ${meta.bgTint} flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                      {repo.name}
                    </span>
                  </div>
                  {meta.url && (
                    <a
                      href={meta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
                      aria-label={`${t.repositorySpectrum.officialWebsiteOf} ${repo.name}`}
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-baseline justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: meta.color }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {formatNum(repo.count)}{' '}
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {t.repositorySpectrum.articles}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <Tooltip
        id={TOOLTIP_ID}
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 100,
        }}
      />
    </>
  );
}
