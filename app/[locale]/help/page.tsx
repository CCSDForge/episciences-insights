import type { Metadata } from 'next';
import HelpSection from '@/components/sections/HelpSection';
import { Locale } from '@/lib/i18n/translations';
import { getCorpusStats } from '@/lib/data';
import { getHelpPageData } from '@/lib/help';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const helpData = getHelpPageData(loc);

  return {
    title: `${helpData.frontmatter.title} - Episciences Insights`,
    description: helpData.frontmatter.subtitle,
    alternates: {
      canonical: `${siteUrl}/${loc}/help/`,
      languages: {
        'x-default': `${siteUrl}/en/help/`,
        en: `${siteUrl}/en/help/`,
        fr: `${siteUrl}/fr/help/`,
        es: `${siteUrl}/es/help/`,
      },
    },
  };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const corpusStats = getCorpusStats();
  const helpData = getHelpPageData(loc, corpusStats);

  return <HelpSection locale={loc} data={helpData} />;
}
