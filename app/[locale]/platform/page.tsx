import type { Metadata } from 'next';
import PlatformSection from '@/components/sections/PlatformSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Données de la plateforme - Episciences Insights',
    en: 'Platform Data - Episciences Insights',
    es: 'Datos de la plataforma - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Impact global et trajectoire d’Episciences : croissance des volumes, délais d’évaluation, réseaux et ODD.',
    en: 'Global impact and trajectory of Episciences: volume growth, review turnaround, collaboration networks, and UN SDGs.',
    es: 'Impacto global y trayectoria de Episciences: crecimiento de publicaciones, tiempos de revisión, redes y ODS.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/platform/`,
      languages: {
        'x-default': `${siteUrl}/en/platform/`,
        en: `${siteUrl}/en/platform/`,
        fr: `${siteUrl}/fr/platform/`,
        es: `${siteUrl}/es/platform/`,
      },
    },
  };
}

export default function PlatformPage() {
  return <PlatformSection />;
}
