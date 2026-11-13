import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import { Locale } from '@/lib/i18n/translations';
import { getDictionary } from '@/lib/i18n/getDictionary';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const t = await getDictionary(validLocale);

  return {
    title: t.homePage.metaTitle,
    description: t.homePage.metaDescription,
    alternates: {
      canonical: `${siteUrl}/${validLocale}/`,
      languages: {
        'x-default': `${siteUrl}/en/`,
        en: `${siteUrl}/en/`,
        fr: `${siteUrl}/fr/`,
        es: `${siteUrl}/es/`,
      },
    },
    openGraph: {
      title: t.homePage.metaTitle,
      description: t.homePage.metaDescription,
      url: `${siteUrl}/${validLocale}/`,
      siteName: 'Episciences Insights',
      locale: validLocale === 'fr' ? 'fr_FR' : validLocale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LocaleHomePage() {
  return <HomePageClient />;
}
