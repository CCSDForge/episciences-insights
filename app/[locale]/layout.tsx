import React from 'react';
import { Locale } from '@/lib/i18n/translations';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = (locale === 'fr' || locale === 'es' ? locale : 'en') as Locale;

  return (
    <LanguageProvider initialLocale={validLocale}>
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6 flex items-center gap-2 print:hidden">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      {children}
    </LanguageProvider>
  );
}
