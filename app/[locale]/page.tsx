import type { Metadata } from 'next';
import { getLastUpdated } from '@/lib/data';
import HomePageClient from '@/components/HomePageClient';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const title = locale === 'fr'
    ? 'Episciences Insights - Synthèse & Tableau de bord de la recherche'
    : locale === 'es'
    ? 'Episciences Insights - Resumen y Panel de Investigación'
    : 'Episciences Insights - Open Access Research & Impact Dashboard';

  const description = locale === 'fr'
    ? 'Visualisation de l’impact des publications en libre accès diamant d’Episciences : usages, rayonnement mondial, ODD de l’ONU, financements et science ouverte.'
    : locale === 'es'
    ? 'Visualización del impacto de las publicaciones de acceso abierto diamante de Episciences.'
    : 'Visualizing scientific research impact, readership, funding, and open science indicators for Episciences diamond open-access publications.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/`,
      languages: {
        'x-default': `${siteUrl}/en/`,
        en: `${siteUrl}/en/`,
        fr: `${siteUrl}/fr/`,
        es: `${siteUrl}/es/`,
      },
    },
  };
}

export default async function LocaleHomePage() {
  const lastUpdated = getLastUpdated();
  return <HomePageClient lastUpdated={lastUpdated} />;
}
