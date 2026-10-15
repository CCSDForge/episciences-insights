import type { Metadata } from 'next';
import ReachSection from '@/components/sections/ReachSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Rayonnement mondial & Collaborations - Episciences Insights',
    en: 'Global Reach & International Collaboration - Episciences Insights',
    es: 'Alcance global & Colaboración internacional - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Cartographie mondiale des affiliations d\'auteurs, collaborations bilatérales et réseau des institutions de recherche.',
    en: 'Geographic footprint of author affiliations, bilateral co-publication hubs, and academic institutions mapped via ROR identifiers.',
    es: 'Huella geográfica de afiliaciones de autores, redes de coautoría internacional e instituciones académicas mapeadas mediante identificadores ROR.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/reach/`,
      languages: {
        'x-default': `${siteUrl}/en/reach/`,
        en: `${siteUrl}/en/reach/`,
        fr: `${siteUrl}/fr/reach/`,
        es: `${siteUrl}/es/reach/`,
      },
    },
  };
}

export default function ReachPage() {
  return <ReachSection />;
}
