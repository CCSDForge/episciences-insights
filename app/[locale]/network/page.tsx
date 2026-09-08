import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getPublications, getFunders } from '@/lib/data';
import NetworkExplorer from '@/components/NetworkExplorer';
import { Locale, translations } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    en: 'Network Explorer - Episciences Insights',
    fr: 'Explorateur de réseaux - Episciences Insights',
    es: 'Explorador de redes - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    en: 'Interactive network analysis of co-funding, global affiliations, MSC classifications, and research topics across Episciences publications.',
    fr: 'Analyse interactive des réseaux de co-financement, collaborations internationales, classifications MSC et thématiques de recherche pour Episciences.',
    es: 'Análisis interactivo de redes de cofinanciamiento, colaboraciones internacionales, clasificaciones MSC y temas de investigación para Episciences.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
    alternates: {
      canonical: `${siteUrl}/${loc}/network/`,
      languages: {
        'x-default': `${siteUrl}/en/network/`,
        en: `${siteUrl}/en/network/`,
        fr: `${siteUrl}/fr/network/`,
        es: `${siteUrl}/es/network/`,
      },
    },
    openGraph: {
      title: titles[loc],
      description: descriptions[loc],
      url: `${siteUrl}/${loc}/network/`,
      siteName: 'Episciences Insights',
      locale: loc === 'fr' ? 'fr_FR' : loc === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LocaleNetworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const [publications, funders] = await Promise.all([getPublications(), getFunders()]);
  const t = translations[validLocale];
  const numLocale = validLocale === 'fr' ? 'fr-FR' : validLocale === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="skip-link">{t.common.skipToContent}</a>

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link
            href={`/${validLocale}/`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={14} />
            {t.common.backToDashboard}
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            {t.header.networkExplorerBtn}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-zinc-600 dark:text-zinc-400">
            {t.networkExplorer.subtitle.replace('{count}', publications.length.toLocaleString(numLocale))}
          </p>
        </header>

        <main id="main-content">
          <NetworkExplorer data={publications} funders={funders} />
        </main>
      </div>
    </div>
  );
}
