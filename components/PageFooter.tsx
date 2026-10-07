'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface PageFooterProps {
  lastUpdated?: string | null;
}

export default function PageFooter({ lastUpdated }: PageFooterProps) {
  const { t, locale } = useTranslation();

  const formattedDate = React.useMemo(() => {
    if (!lastUpdated) return null;
    const date = new Date(lastUpdated);
    if (isNaN(date.getTime())) return null;
    const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }, [lastUpdated, locale]);

  return (
    <footer className="mt-20 border-t border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p className="font-semibold">{t.footer.license}</p>
      <p className="mt-2">{t.footer.source}</p>
      {formattedDate && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {t.footer.lastUpdated.replace('{date}', formattedDate)}
        </p>
      )}
    </footer>
  );
}
