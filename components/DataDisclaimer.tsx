'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function DataDisclaimer() {
  const { t } = useTranslation();

  return (
    <section className="mt-16 rounded-3xl bg-zinc-100/50 p-8 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="rounded-2xl bg-white dark:bg-zinc-800 p-3 shadow-sm shrink-0">
          <Globe className="h-6 w-6 text-zinc-400" />
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
            {t.disclaimer.title}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
              {t.disclaimer.metricsP1}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
              {t.disclaimer.metricsP2}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-700/50 pt-4 mt-2">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">{t.disclaimer.downloadsNoteTitle}</span>{' '}
            {t.disclaimer.downloadsNote}
          </p>
        </div>
      </div>
    </section>
  );
}
