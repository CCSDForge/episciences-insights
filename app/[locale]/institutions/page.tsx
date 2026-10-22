import type { Metadata } from 'next';
import InstitutionSection from '@/components/sections/InstitutionSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Statistiques par institution - Episciences Insights',
    en: 'Institution Statistics - Episciences Insights',
    es: 'Estadísticas por institución - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Indicateurs à destination des universités et centres de recherche : réseaux de co-autorat, revues hébergeuses et financeurs.',
    en: 'Indicators for universities and research bodies: co-authorship networks, publishing journals, and research grants.',
    es: 'Indicadores para universidades y centros de investigación: redes de coautoría, revistas receptoras y financiación.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/institutions/`,
      languages: {
        'x-default': `${siteUrl}/en/institutions/`,
        en: `${siteUrl}/en/institutions/`,
        fr: `${siteUrl}/fr/institutions/`,
        es: `${siteUrl}/es/institutions/`,
      },
    },
  };
}

export default function InstitutionPage() {
  return <InstitutionSection />;
}
