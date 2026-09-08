'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function PageFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p className="font-semibold">{t.footer.license}</p>
      <p className="mt-2">{t.footer.source}</p>
    </footer>
  );
}
