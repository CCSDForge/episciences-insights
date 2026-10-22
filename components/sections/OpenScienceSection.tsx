'use client';

import React from 'react';
import { Search, Scale, Database, Code2, Archive } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ResearchLineage from '@/components/ResearchLineage';
import LicenseSpectrum from '@/components/LicenseSpectrum';
import ChartExportMenu from '@/components/ChartExportMenu';

export default function OpenScienceSection() {
  const { t } = useTranslation();
  const { data } = useDashboard();
  const { filteredData, openScienceStats } = data;

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  return (
    <section id="panel-open-science" aria-labelledby="open-science-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* Purpose Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-[var(--episciences-cyan-00)]/5 to-transparent p-6 border border-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true">
                <Search size={16} />
              </span>
              <h1 id="open-science-heading" className="text-base font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {t.lineage.subtitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {t.lineage.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] shrink-0 bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-[var(--episciences-cyan-01)]/40 dark:border-[var(--episciences-cyan-00)]/40 shadow-xs">
            <span>{t.lineage.source}</span>
          </div>
        </div>
      </div>

      {/* Open Science KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Open Repositories */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
            <Archive size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.kpiRepositoriesTitle}</span>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900 dark:text-zinc-50">
            {formatNum(openScienceStats.totalRepositories)}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t.dashboard.kpiRepositoriesDesc}
          </p>
        </div>

        {/* 2. Open Licenses */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
            <Scale size={16} className="text-[#0aa0be] dark:text-[#57bec3]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.licensingTitle}</span>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900 dark:text-zinc-50">
            {formatNum(openScienceStats.totalLicenseMentions)}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t.dashboard.licenseDeclarations}
          </p>
        </div>

        {/* 3. Linked Datasets (Scholix) */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
            <Database size={16} className="text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.kpiDatasetsTitle}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black font-heading text-zinc-900 dark:text-zinc-50">
              {formatNum(openScienceStats.totalWithDatasets)}
            </p>
            <span className="text-xs font-semibold text-zinc-400">
              ({formatNum(openScienceStats.totalDatasets)} {t.lineage.datasetsCountLabel.toLowerCase()})
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t.dashboard.kpiDatasetsDesc}
          </p>
        </div>

        {/* 4. Linked Software (Scholix) */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
            <Code2 size={16} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.kpiSoftwareTitle}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black font-heading text-zinc-900 dark:text-zinc-50">
              {formatNum(openScienceStats.totalWithSoftware)}
            </p>
            <span className="text-xs font-semibold text-zinc-400">
              ({formatNum(openScienceStats.totalSoftware)} {t.lineage.softwareCountLabel.toLowerCase()})
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t.dashboard.kpiSoftwareDesc}
          </p>
        </div>
      </div>

      {/* Licensing Spectrum Card */}
      <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 text-white rounded-xl shadow-md bg-[var(--episciences-cyan-03)] dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
              <Scale size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                {t.dashboard.licensingTitle}
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {t.dashboard.licensingSubtitle}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                {t.dashboard.licensingDesc}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {openScienceStats.totalLicenseMentions > 0 && (
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 max-w-sm text-right">
                {formatNum(openScienceStats.totalLicenseMentions)} {t.dashboard.licenseDeclarations}
              </p>
            )}
            {openScienceStats.topLicenses.length > 0 && (
              <ChartExportMenu
                data={openScienceStats.topLicenses.map((l) => ({
                  license: l.name,
                  count: l.count,
                  percentage: `${((l.count / openScienceStats.totalLicenseMentions) * 100).toFixed(1)}%`,
                }))}
                filename="episciences-open-access-licenses"
                csvColumns={[
                  { key: 'license', header: 'License' },
                  { key: 'count', header: 'Declarations_Count' },
                  { key: 'percentage', header: 'Percentage' },
                ]}
              />
            )}
          </div>
        </div>

        {openScienceStats.totalLicenseMentions === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <Scale size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              {t.dashboard.noLicenseData}
            </p>
          </div>
        ) : (
          <LicenseSpectrum licenses={openScienceStats.topLicenses} total={openScienceStats.totalLicenseMentions} />
        )}
      </div>

      {/* Research Lineage Explorer */}
      <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <h2 className="mb-8 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
          {t.lineage.title}
        </h2>
        <ResearchLineage data={filteredData} />
      </div>
    </section>
  );
}
