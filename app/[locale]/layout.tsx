import React from 'react';
import { Locale } from '@/lib/i18n/translations';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { DashboardProvider } from '@/components/DashboardContext';
import AppHeader from '@/components/AppHeader';
import PageFooter from '@/components/PageFooter';
import { getPublications, getFunders, getLastUpdated } from '@/lib/data';
import { getKpiSummary } from '@/lib/dashboardData';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;

  const [dictionary, publications, funders] = await Promise.all([
    getDictionary(validLocale),
    getPublications(),
    getFunders(),
  ]);
  const lastUpdated = getLastUpdated();
  const kpiSummary = await getKpiSummary(publications);

  return (
    <LanguageProvider initialLocale={validLocale} dictionary={dictionary}>
      <DashboardProvider usageSummary={kpiSummary} funders={funders}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
          <a href="#main-content" className="skip-link">
            {dictionary.common.skipToContent}
          </a>

          <AppHeader />

          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
            <main id="main-content">
              {children}
            </main>
          </div>

          <PageFooter lastUpdated={lastUpdated} />
        </div>
      </DashboardProvider>
    </LanguageProvider>
  );
}
