import type { Metadata } from 'next';
import TopicsSection from '@/components/sections/TopicsSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Paysage thématique & MSC 2020 - Episciences Insights',
    en: 'Research Landscape & MSC 2020 - Episciences Insights',
    es: 'Panorama temático & MSC 2020 - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Domaines scientifiques, Objectifs de Développement Durable (ODD), réseaux de co-occurrence et classifications mathématiques MSC 2020.',
    en: 'Interactive research fields treemap, UN Sustainable Development Goals (SDGs), and MSC 2020 mathematics classifications.',
    es: 'Áreas temáticas de investigación, Objetivos de Desarrollo Sostenible (ODS) y clasificaciones matemáticas MSC 2020.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/topics/`,
      languages: {
        'x-default': `${siteUrl}/en/topics/`,
        en: `${siteUrl}/en/topics/`,
        fr: `${siteUrl}/fr/topics/`,
        es: `${siteUrl}/es/topics/`,
      },
    },
  };
}

export default function TopicsPage() {
  return <TopicsSection />;
}
