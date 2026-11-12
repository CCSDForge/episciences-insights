'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Building2,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import PageHeader from '@/components/PageHeader';

export default function HomePageClient() {
  const { t, locale } = useTranslation();
  const { data } = useDashboard();
  const { stats, usageSummary } = data;

  const initialUsageStats = useMemo(() => {
    if (!usageSummary) return null;
    return {
      downloads: Object.values(usageSummary.yearlySummary).reduce((s, v) => s + v.downloads, 0),
      views: Object.values(usageSummary.yearlySummary).reduce((s, v) => s + v.views, 0),
      countries: Object.keys(usageSummary.countryYearlySummary).length,
    };
  }, [usageSummary]);

  const corpusStats = useMemo(() => ({
    publications: stats.totalPubs,
    sdgs: stats.totalSdgs,
    funders: stats.totalFunders,
  }), [stats]);

  const PERSONA_SECTIONS = [
    {
      href: `/${locale}/journals`,
      title: t.homePage.journalsTitle,
      badge: t.homePage.journalsBadge,
      desc: t.homePage.journalsDesc,
      icon: <BookOpen className="h-6 w-6 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-03)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/institutions`,
      title: t.homePage.institutionsTitle,
      badge: t.homePage.institutionsBadge,
      desc: t.homePage.institutionsDesc,
      icon: <Building2 className="h-6 w-6 text-[var(--episciences-cyan-02)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-02)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/platform`,
      title: t.homePage.platformTitle,
      badge: t.homePage.platformBadge,
      desc: t.homePage.platformDesc,
      icon: <Globe className="h-6 w-6 text-[var(--ccsd-bleu-01)] dark:text-[var(--episciences-cyan-01)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--ccsd-bleu-01)] dark:hover:border-[var(--episciences-cyan-01)]',
    },
  ];

  return (
    <div className="space-y-16">
      {/* 1. Hero Block with the 5 KPI cards (Maquette 1) */}
      <PageHeader
        corpusStats={corpusStats}
        initialUsageStats={initialUsageStats}
        kpiSummary={usageSummary}
      />

      {/* 2. Three User-Oriented Navigation Cards */}
      <section aria-labelledby="section-personas-title" className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 id="section-personas-title" className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.homePage.sectionTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium max-w-3xl">
            {t.homePage.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONA_SECTIONS.map((sec) => (
            <Link
              key={sec.href}
              href={sec.href}
              className={`group relative flex flex-col justify-between rounded-3xl bg-white p-7 ring-1 ring-zinc-200 transition-all hover:-translate-y-1 dark:bg-zinc-900/90 dark:ring-zinc-800 ${sec.borderHover}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-200/80 dark:ring-zinc-700/60 transition-transform group-hover:scale-110">
                    {sec.icon}
                  </div>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {sec.badge}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--episciences-cyan-03)] dark:group-hover:text-[var(--episciences-cyan-01)] transition-colors">
                  {sec.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                  {sec.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] group-hover:translate-x-1 transition-transform">
                <span>{t.homePage.enterView}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
