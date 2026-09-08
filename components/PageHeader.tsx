'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Download, Globe, MousePointerClick, Network, Wallet } from 'lucide-react';
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

export default function PageHeader({ corpusStats, initialUsageStats, kpiSummary }: PageHeaderProps) {
  const { t, locale } = useTranslation();

  return (
    <header className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 lg:p-12">
      {/* Background Decorative Elements */}
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10 pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-10 lg:flex-row-reverse lg:gap-16">
        {/* Logo wrapper */}
        <div className="relative shrink-0 flex items-end justify-center" style={{ width: '160px', height: '200px' }}>
          <div
            className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2 ring-1 ring-white/60 transition-transform hover:scale-110 lg:h-40 lg:w-40"
            style={{
              background: 'radial-gradient(ellipse at 50% 15%, #ffffff 0%, #f4f7ff 55%, #eaefff 100%)',
              boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15), 0 0 0 1px rgba(220,230,255,0.5)',
            }}
          >
            <Image
              src="/episciences.svg"
              alt="Episciences - Open Access Publishing Platform"
              width={140}
              height={140}
              className="relative z-10 h-auto w-[85%]"
              priority
            />
          </div>
        </div>

        <div className="text-center lg:text-left flex-1">
          <h1 className="font-heading text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Episciences <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Insights</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium text-zinc-600 dark:text-zinc-400 sm:text-xl font-sans">
            {t.header.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/15 dark:text-blue-300">
              {t.header.overlayJournals}
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-500/15 dark:text-teal-300">
              {t.header.diamondDashboard}
            </span>
            <Link
              href="/network"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-teal-700 transition-colors"
            >
              <Network size={14} />
              <span>{t.header.networkExplorerBtn}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Usage KPIs Summary */}
      <div className="mt-12 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {t.common.publications}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
              {formatNum(corpusStats.publications)}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {t.header.sdgTitle}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
              {formatNum(corpusStats.sdgs)}{' '}
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                {t.header.of17}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {t.common.funders}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
              {formatNum(corpusStats.funders)}
            </div>
          </div>

          {kpiSummary && initialUsageStats && (
            <>
              <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {t.common.downloads}
                  </span>
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                  {formatNum(initialUsageStats.downloads)}
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {t.header.abstractViews}
                  </span>
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                  {formatNum(initialUsageStats.views)}
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {t.header.globalCoverage}
                  </span>
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                  {formatNum(initialUsageStats.countries)}{' '}
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    {t.header.countriesMetric}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        {kpiSummary && (
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 text-center lg:text-left pl-2">
            {locale === 'fr'
              ? `* Statistiques d'usage jusqu'en ${kpiSummary.currentYear} (${kpiSummary.currentYear} partiel, année en cours)`
              : locale === 'es'
              ? `* Estadísticas de uso hasta ${kpiSummary.currentYear} (${kpiSummary.currentYear} parcial, año en curso)`
              : `* Usage statistics through ${kpiSummary.currentYear} (${kpiSummary.currentYear} figures are partial, year in progress)`}
          </p>
        )}
      </div>
    </header>
  );
}
