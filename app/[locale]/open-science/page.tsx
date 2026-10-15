import type { Metadata } from 'next';
import OpenScienceSection from '@/components/sections/OpenScienceSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Science ouverte & Lignage - Episciences Insights',
    en: 'Research Lineage & Open Science - Episciences Insights',
    es: 'Linaje de investigación & Ciencia abierta - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Indicateurs de science ouverte, diversité des licences libres Creative Commons et généalogie des dépôts préprints.',
    en: 'Open science indicators, Creative Commons open license distribution, and preprint lineage tracking.',
    es: 'Indicadores de ciencia abierta, distribución de licencias abiertas y linaje de preprints.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/open-science/`,
      languages: {
        'x-default': `${siteUrl}/en/open-science/`,
        en: `${siteUrl}/en/open-science/`,
        fr: `${siteUrl}/fr/open-science/`,
        es: `${siteUrl}/es/open-science/`,
      },
    },
  };
}

export default function OpenSciencePage() {
  return <OpenScienceSection />;
}
