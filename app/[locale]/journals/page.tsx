import type { Metadata } from 'next';
import JournalSection from '@/components/sections/JournalSection';
import { Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Statistiques des revues - Episciences Insights',
    en: 'Journal Statistics - Episciences Insights',
    es: 'Estadísticas de revistas - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Tableau de bord dédié aux comités éditoriaux : lectorat, autorat, thématiques et financeurs.',
    en: 'Editorial dashboard for journal teams: readership, authorship, topics, and research funders.',
    es: 'Panel editorial para revistas: lectores, autoría, temas y entidades financiadoras.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/journals/`,
      languages: {
        'x-default': `${siteUrl}/en/journals/`,
        en: `${siteUrl}/en/journals/`,
        fr: `${siteUrl}/fr/journals/`,
        es: `${siteUrl}/es/journals/`,
      },
    },
  };
}

export default function JournalPage() {
  return <JournalSection />;
}
