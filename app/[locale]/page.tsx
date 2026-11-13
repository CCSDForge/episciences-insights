import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import { translations, Locale } from '@/lib/i18n/translations';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;
  const t = translations[validLocale];

  return {
    title: t.homePage.metaTitle,
    description: t.homePage.metaDescription,
    alternates: {
      canonical: `${siteUrl}/${locale}/`,
      languages: {
        'x-default': `${siteUrl}/en/`,
        en: `${siteUrl}/en/`,
        fr: `${siteUrl}/fr/`,
        es: `${siteUrl}/es/`,
      },
    },
  };
}

export default async function LocaleHomePage() {
  return <HomePageClient />;
}
