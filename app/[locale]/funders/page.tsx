import type { Metadata } from 'next';
import FundersSection from '@/components/sections/FundersSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Impact des financeurs - Episciences Insights',
    en: 'Funder Impact & Co-funding - Episciences Insights',
    es: 'Impacto de financiadores & Cofinanciamiento - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Agences de financement de la recherche, chronologie des projets et réseaux de co-financement nationaux et internationaux.',
    en: 'Research funding bodies, awards timeline, and co-funding relational networks across Episciences publications.',
    es: 'Organismos de financiación de la investigación, cronología de subvenciones y redes de cofinanciamiento.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/funders/`,
      languages: {
        'x-default': `${siteUrl}/en/funders/`,
        en: `${siteUrl}/en/funders/`,
        fr: `${siteUrl}/fr/funders/`,
        es: `${siteUrl}/es/funders/`,
      },
    },
  };
}

export default function FundersPage() {
  return <FundersSection />;
}
