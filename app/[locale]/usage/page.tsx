import type { Metadata } from 'next';
import UsageSection from '@/components/sections/UsageSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Statistiques de consultation - Episciences Insights',
    en: 'Usage Analytics - Episciences Insights',
    es: 'Estadísticas de uso - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Statistiques de téléchargements, lectorat mondial et consultations pour les publications d\'Episciences.',
    en: 'Downloads, global readership, and view metrics for Episciences diamond open access publications.',
    es: 'Métricas de descargas, lectores globales y visualizaciones para publicaciones de Episciences.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/usage/`,
      languages: {
        'x-default': `${siteUrl}/en/usage/`,
        en: `${siteUrl}/en/usage/`,
        fr: `${siteUrl}/fr/usage/`,
        es: `${siteUrl}/es/usage/`,
      },
    },
  };
}

export default function UsagePage() {
  return <UsageSection />;
}
