import type { Metadata } from 'next';
import HelpSection from '@/components/sections/HelpSection';
import { Locale } from '@/lib/i18n/translations';
import { getCorpusStats } from '@/lib/data';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';

  const titles: Record<Locale, string> = {
    fr: 'Méthodologie et sources de données - Episciences Insights',
    en: 'Methodological Note & Scientometric Framework - Episciences Insights',
    es: 'Nota metodológica y Marco cienciométrico - Episciences Insights',
  };

  const descriptions: Record<Locale, string> = {
    fr: 'Sources des données, collecte et traitement, méthodes de calcul, limites et reproductibilité d\'Episciences Insights.',
    en: 'Scholarly and technical documentation: primary data sources, ingestion pipeline, entity reconciliation, formal models, and software architecture.',
    es: 'Documentación científica y técnica: fuentes de datos primarias, pipeline de ingesta, reconciliación de entidades, modelos formales y arquitectura de software.',
  };

  return {
    title: titles[loc],
    description: descriptions[loc],
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

export default function HelpPage() {
  const corpusStats = getCorpusStats();
  return <HelpSection corpusStats={corpusStats} />;
}

