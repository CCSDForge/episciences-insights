import type { Metadata } from 'next';
import { getPublications, getFunders } from '@/lib/data';
import { getKpiSummary } from '@/lib/dashboardData';
import Dashboard from '@/components/Dashboard';
import PageHeader from '@/components/PageHeader';
import DataDisclaimer from '@/components/DataDisclaimer';
import PageFooter from '@/components/PageFooter';
import { Locale, translations } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    en: 'Episciences Insights - Scientific Impact & Open Access Dashboard',
    fr: "Episciences Insights - Tableau de bord de l'impact scientifique et du libre accès",
    es: 'Episciences Insights - Panel de impacto científico y acceso abierto',
  };

  const descriptions: Record<Locale, string> = {
    en: 'Visualizing scientific research impact, funding, SDGs, author distributions, and open science indicators for Episciences open access publications.',
    fr: "Visualisation de l'impact de la recherche scientifique, des financements, des ODD, de la répartition mondiale des auteurs et des indicateurs de science ouverte pour les publications en libre accès d'Episciences.",
    es: 'Visualización del impacto de la investigación científica, financiamiento, ODS, distribución global de autores e indicadores de ciencia abierta para las publicaciones de acceso abierto de Episciences.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/`,
      languages: {
        'x-default': `${siteUrl}/en/`,
        en: `${siteUrl}/en/`,
        fr: `${siteUrl}/fr/`,
        es: `${siteUrl}/es/`,
      },
    },
    openGraph: {
      title: titles[loc],
      description: descriptions[loc],
      url: `${siteUrl}/${loc}/`,
      siteName: 'Episciences Insights',
      locale: loc === 'fr' ? 'fr_FR' : loc === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const t = translations[validLocale];

  const [publications, funders] = await Promise.all([getPublications(), getFunders()]);
  const kpiSummary = await getKpiSummary(publications);

  const initialUsageStats = kpiSummary ? {
    downloads: Object.values(kpiSummary.yearlySummary).reduce((s, v) => s + v.downloads, 0),
    views: Object.values(kpiSummary.yearlySummary).reduce((s, v) => s + v.views, 0),
    countries: Object.keys(kpiSummary.countryYearlySummary).length,
  } : null;

  const corpusStats = {
    publications: publications.length,
    sdgs: new Set(publications.flatMap((p) => p.sdgs.map((s) => s.id))).size,
    funders: new Set(publications.flatMap((p) => p.awards.map((a) => a.funder))).size,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="skip-link">{t.common.skipToContent}</a>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          corpusStats={corpusStats}
          initialUsageStats={initialUsageStats}
          kpiSummary={kpiSummary}
        />

        <main id="main-content">
          <Dashboard initialData={publications} usageSummary={kpiSummary} funders={funders} />
          <DataDisclaimer />
        </main>

        <PageFooter />
      </div>
    </div>
  );
}
