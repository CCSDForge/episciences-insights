'use client';

import React from 'react';
import Image from 'next/image';
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
      <div className="mb-6 flex justify-center">
        <a
          href="https://www.ccsd.cnrs.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-90 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
          aria-label="CCSD - Centre pour la Communication Scientifique Directe"
        >
          {/* Logo CCSD pour thème clair */}
          <Image
            src="/ccsd-logo-light.svg"
            alt="CCSD - Centre pour la Communication Scientifique Directe"
            width={180}
            height={50}
            className="h-12 sm:h-14 w-auto dark:hidden"
          />
          {/* Logo CCSD pour thème sombre */}
          <Image
            src="/ccsd-logo-dark.svg"
            alt="CCSD - Centre pour la Communication Scientifique Directe"
            width={180}
            height={50}
            className="hidden h-12 sm:h-14 w-auto dark:block"
          />
        </a>
      </div>

      {/* Logos des tutelles du CCSD (MESR, CNRS, Inria, INRAE) */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {/* MESRE */}
        <a
          href="https://www.enseignementsup-recherche.gouv.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
          aria-label="Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace"
        >
          <Image
            src="/tutelles/mesre-light.png"
            alt="Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace"
            width={180}
            height={150}
            className="h-20 sm:h-[6.5rem] w-auto dark:hidden"
          />
          <Image
            src="/tutelles/mesre-dark.png"
            alt="Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace"
            width={180}
            height={150}
            className="hidden h-20 sm:h-[6.5rem] w-auto dark:block"
          />
        </a>

        {/* CNRS */}
        <a
          href="https://www.cnrs.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
          aria-label="CNRS - Centre national de la recherche scientifique"
        >
          <Image
            src="/tutelles/cnrs-light.svg"
            alt="CNRS - Centre national de la recherche scientifique"
            width={100}
            height={100}
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src="/tutelles/cnrs-dark.svg"
            alt="CNRS - Centre national de la recherche scientifique"
            width={100}
            height={100}
            className="hidden h-9 w-auto dark:block"
          />
        </a>

        {/* Inria */}
        <a
          href="https://www.inria.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
          aria-label="Inria - Institut national de recherche en sciences et technologies du numérique"
        >
          <Image
            src="/tutelles/inria-light.svg"
            alt="Inria"
            width={120}
            height={35}
            className="h-7 w-auto dark:hidden"
          />
          <Image
            src="/tutelles/inria-dark.svg"
            alt="Inria"
            width={120}
            height={35}
            className="hidden h-7 w-auto dark:block"
          />
        </a>

        {/* INRAE */}
        <a
          href="https://www.inrae.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
          aria-label="INRAE - Institut national de recherche pour l'agriculture, l'alimentation et l'environnement"
        >
          <Image
            src="/tutelles/inrae-light.png"
            alt="INRAE"
            width={120}
            height={32}
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/tutelles/inrae-dark.png"
            alt="INRAE"
            width={120}
            height={32}
            className="hidden h-6 w-auto dark:block"
          />
        </a>
      </div>
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
