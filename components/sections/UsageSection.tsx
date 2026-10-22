'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import UsageAnalytics from '@/components/UsageAnalytics';

export default function UsageSection() {
  const { t } = useTranslation();
  const { data } = useDashboard();
  const { usageSummary } = data;

  return (
    <section id="panel-usage" aria-labelledby="usage-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* Purpose Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-[var(--episciences-cyan-00)]/5 to-transparent p-6 border border-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true">
                <BarChart3 size={16} />
              </span>
              <h1 id="usage-heading" className="text-base font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {t.dashboard.usageTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {t.dashboard.usageDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] shrink-0 bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-[var(--episciences-cyan-01)]/40 dark:border-[var(--episciences-cyan-00)]/40 shadow-xs">
            <span>{t.dashboard.usageSource}</span>
          </div>
        </div>
      </div>

      {usageSummary ? (
        <UsageAnalytics />
      ) : (
        <div className="p-12 text-center text-zinc-500 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
          Chargement des statistiques d&apos;usage...
        </div>
      )}
    </section>
  );
}
