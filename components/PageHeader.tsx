'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen, Download, Globe, MousePointerClick, Wallet } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { UsageSummary } from '@/lib/types';

interface PageHeaderProps {
  corpusStats: {
    publications: number;
    sdgs: number;
    funders: number;
  };
  initialUsageStats: {
    downloads: number;
    views: number;
    countries: number;
  } | null;
  kpiSummary: UsageSummary | null;
}

function formatNum(val: number): string {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

export default function PageHeader({ corpusStats, initialUsageStats }: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 transition-colors">
      {/* Background Decorative Elements */}
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10 pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10 pointer-events-none" />

      {/* Intro section */}
      <div className="relative p-8 sm:p-12 lg:p-16 pb-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
          <div className="space-y-4 max-w-4xl text-center lg:text-left">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Episciences{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="font-heading text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-200">
              {t.pageHeader.subtitle}
            </p>
            <div className="pt-2 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium space-y-3">
              <p>{t.pageHeader.descriptionP1}</p>
              <p>{t.pageHeader.descriptionP2}</p>
            </div>
          </div>

          {/* Episciences Logo Stamp */}
          <div className="shrink-0 flex items-center justify-center">
            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2 ring-1 ring-white/60 transition-transform hover:scale-105 lg:h-40 lg:w-40 shadow-lg"
              style={{
                background: 'radial-gradient(ellipse at 50% 15%, #ffffff 0%, #f4f7ff 55%, #eaefff 100%)',
                boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15), 0 0 0 1px rgba(220,230,255,0.5)',
              }}
            >
              <Image
                src="/episciences.svg"
                alt="Episciences Logo"
                width={140}
                height={140}
                className="relative z-10 h-auto w-[85%]"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Banner (Matching Image 361 Design System) */}
      <div className="p-8 sm:p-12 lg:px-16 pt-0 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* 1. Publications */}
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
              <BookOpen size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.pageHeader.publications}
              </span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {formatNum(corpusStats.publications)}
            </div>
          </div>

          {/* 2. Total Downloads */}
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
              <Download size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.pageHeader.totalDownloads}
              </span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {initialUsageStats ? formatNum(initialUsageStats.downloads) : '-'}
            </div>
          </div>

          {/* 3. Abstract Views */}
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
              <MousePointerClick size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.pageHeader.abstractViews}
              </span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {initialUsageStats ? formatNum(initialUsageStats.views) : '-'}
            </div>
          </div>

          {/* 4. Funders Represented */}
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
              <Wallet size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.pageHeader.fundersRepresented}
              </span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {formatNum(corpusStats.funders)}
            </div>
          </div>

          {/* 5. Global Coverage */}
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-colors sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
              <Globe size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.pageHeader.globalReach}
              </span>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {initialUsageStats ? (
                <>
                  {formatNum(initialUsageStats.countries)}{' '}
                  <span className="text-base font-bold text-zinc-500 dark:text-zinc-400">
                    {t.pageHeader.countriesAndTerritories}
                  </span>
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
