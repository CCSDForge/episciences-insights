'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Building2,
  Globe,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { renderLinkedText } from '@/lib/renderLinkedText';

interface HomePageClientProps {
  lastUpdated?: string | null;
}

export default function HomePageClient({ lastUpdated }: HomePageClientProps) {
  const { t, locale } = useTranslation();
  const { data } = useDashboard();
  const { stats, usageSummary } = data;

  const initialUsageStats = useMemo(() => {
    if (!usageSummary) return null;
    return {
      downloads: Object.values(usageSummary.yearlySummary).reduce((s, v) => s + v.downloads, 0),
      views: Object.values(usageSummary.yearlySummary).reduce((s, v) => s + v.views, 0),
      countries: Object.keys(usageSummary.countryYearlySummary).length,
    };
  }, [usageSummary]);

  const corpusStats = useMemo(() => ({
    publications: stats.totalPubs,
    sdgs: stats.totalSdgs,
    funders: stats.totalFunders,
  }), [stats]);

  const formattedDate = useMemo(() => {
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

  const PERSONA_SECTIONS = [
    {
      href: `/${locale}/journals`,
      title: locale === 'fr' ? 'Statistiques des revues' : locale === 'es' ? 'Estadísticas de revistas' : 'Journal Statistics',
      badge: locale === 'fr' ? 'Comités éditoriaux & Revues' : locale === 'es' ? 'Comités editoriales' : 'Editorial Boards & Journals',
      desc: locale === 'fr'
        ? 'Indicateurs de lectorat (dynamique d’usage, pays), autorat, thématiques et financeurs pour le pilotage de chaque revue.'
        : locale === 'es'
        ? 'Indicadores de lectores (dinámica de uso, países), autoría, temas y financiadores para la gestión de cada revista.'
        : 'Readership metrics (usage trends, countries), authorship, topics, and funders for editorial evaluation.',
      icon: <BookOpen className="h-6 w-6 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-03)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/institutions`,
      title: locale === 'fr' ? 'Statistiques par institution' : locale === 'es' ? 'Estadísticas por institución' : 'Institution Statistics',
      badge: locale === 'fr' ? 'Établissements & Recherche' : locale === 'es' ? 'Instituciones y Centros' : 'Universities & Research Bodies',
      desc: locale === 'fr'
        ? 'Mesurez la production de votre établissement sur Episciences : réseaux de co-autorat, revues hébergeant vos articles et financeurs.'
        : locale === 'es'
        ? 'Mida la producción de su institución en Episciences: redes de coautoría, revistas receptoras y entidades financiadoras.'
        : 'Measure your institution’s footprint on Episciences: co-authorship networks, hosting journals, topics, and funding bodies.',
      icon: <Building2 className="h-6 w-6 text-[var(--episciences-cyan-02)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-02)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/platform`,
      title: locale === 'fr' ? 'Données de la plateforme' : locale === 'es' ? 'Datos de la plataforma' : 'Platform Data',
      badge: locale === 'fr' ? 'Impact Global & Tutelles' : locale === 'es' ? 'Impacto Global y Tutelas' : 'Global Impact & Stakeholders',
      desc: locale === 'fr'
        ? 'Bilan global de la plateforme : évolution des publications, délais d’évaluation par les pairs, réseaux de coopération et ODD.'
        : locale === 'es'
        ? 'Balance global de la plataforma: evolución de publicaciones, tiempos de revisión por pares, redes de cooperación y ODS.'
        : 'Global platform metrics: publication volume, peer-review timelines, international collaboration networks, and UN SDGs.',
      icon: <Globe className="h-6 w-6 text-[var(--ccsd-bleu-01)] dark:text-[var(--episciences-cyan-01)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--ccsd-bleu-01)] dark:hover:border-[var(--episciences-cyan-01)]',
    },
  ];

  return (
    <div className="space-y-16">
      {/* 1. Hero Block with the 5 KPI cards (Maquette 1) */}
      <PageHeader
        corpusStats={corpusStats}
        initialUsageStats={initialUsageStats}
        kpiSummary={usageSummary}
      />

      {/* 2. Three User-Oriented Navigation Cards */}
      <section aria-labelledby="section-personas-title" className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 id="section-personas-title" className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {locale === 'fr'
              ? 'Accéder aux statistiques par profil'
              : locale === 'es'
              ? 'Acceder a las estadísticas por perfil'
              : 'Access Statistics by Profile'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium max-w-3xl">
            {locale === 'fr'
              ? 'Sélectionnez votre espace pour explorer les données adaptées à vos besoins de pilotage, d’évaluation ou de suivi de la science ouverte.'
              : locale === 'es'
              ? 'Seleccione su espacio para explorar los datos adaptados a sus necesidades de gestión, evaluación o seguimiento de la ciencia abierta.'
              : 'Select your workspace to explore data tailored to your editorial, institutional, or open science monitoring needs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONA_SECTIONS.map((sec) => (
            <Link
              key={sec.href}
              href={sec.href}
              className={`group relative flex flex-col justify-between rounded-3xl bg-white p-7 shadow-xs ring-1 ring-zinc-200 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900/90 dark:ring-zinc-800 ${sec.borderHover}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-200/80 dark:ring-zinc-700/60 transition-transform group-hover:scale-110">
                    {sec.icon}
                  </div>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {sec.badge}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--episciences-cyan-03)] dark:group-hover:text-[var(--episciences-cyan-01)] transition-colors">
                  {sec.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                  {sec.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] group-hover:translate-x-1 transition-transform">
                <span>{locale === 'fr' ? 'Accéder à la vue' : locale === 'es' ? 'Ver espacio' : 'Enter view'}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Disclaimer and Link to Methodology (Matching bottom of Mockup 1) */}
      <section
        aria-labelledby="home-methodology-title"
        className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--episciences-cyan-03)]/10 text-[var(--episciences-cyan-03)] dark:bg-[var(--episciences-cyan-00)]/15 dark:text-[var(--episciences-cyan-00)]">
              <ShieldCheck size={26} aria-hidden="true" />
            </div>
            <div>
              <h2 id="home-methodology-title" className="font-heading text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {locale === 'fr'
                  ? 'Disclaimer et renvoi vers la page méthodologies'
                  : locale === 'es'
                  ? 'Aviso legal y enlace a la metodología'
                  : 'Disclaimer & Methodological Framework'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {locale === 'fr'
                  ? 'Transparence des sources ouvertes, non-utilisation du facteur d’impact et respect des chartes DORA et CoARA'
                  : locale === 'es'
                  ? 'Transparencia de fuentes abiertas, no uso del factor de impacto y respeto a DORA y CoARA'
                  : 'Open source transparency, non-use of impact factors, and full alignment with DORA and CoARA'}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/help`}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
          >
            <span>{locale === 'fr' ? 'Consulter la méthodologie' : locale === 'es' ? 'Ver metodología' : 'View methodology'}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Narrative & Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
          <p>{renderLinkedText(t.disclaimer.metricsP1)}</p>
          <p>{renderLinkedText(t.disclaimer.metricsP2)}</p>
        </div>

        {/* Downloads Note */}
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {t.disclaimer.downloadsNoteTitle}{' '}
          </span>
          {t.disclaimer.downloadsNote}
        </p>

        {/* CCSD and Tutelles Logos */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 space-y-6">
          <div className="flex justify-center">
            <a
              href="https://www.ccsd.cnrs.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center opacity-90 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
              aria-label={`CCSD - Centre pour la Communication Scientifique Directe (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
            >
              <Image
                src="/ccsd-logo-light.svg"
                alt="CCSD - Centre pour la Communication Scientifique Directe"
                width={180}
                height={50}
                className="h-12 sm:h-14 w-auto dark:hidden"
              />
              <Image
                src="/ccsd-logo-dark.svg"
                alt="CCSD - Centre pour la Communication Scientifique Directe"
                width={180}
                height={50}
                className="h-12 sm:h-14 w-auto hidden dark:block"
              />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {/* MESRE */}
            <a
              href="https://www.enseignementsup-recherche.gouv.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
              aria-label={`Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
            >
              <Image
                src="/tutelles/mesre-light.png"
                alt="Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace"
                width={180}
                height={150}
                className="h-16 sm:h-20 w-auto dark:hidden"
              />
              <Image
                src="/tutelles/mesre-dark.png"
                alt="Ministère de l'Enseignement Supérieur, de la Recherche et de l'Espace"
                width={180}
                height={150}
                className="hidden h-16 sm:h-20 w-auto dark:block"
              />
            </a>

            {/* CNRS */}
            <a
              href="https://www.cnrs.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center opacity-85 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md"
              aria-label={`CNRS - Centre national de la recherche scientifique (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
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
              aria-label={`Inria - Institut national de recherche en sciences et technologies du numérique (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
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
              aria-label={`INRAE - Institut national de recherche pour l'agriculture, l'alimentation et l'environnement (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
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
        </div>

        {formattedDate && (
          <p className="text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {t.footer.lastUpdated.replace('{date}', formattedDate)}
          </p>
        )}
      </section>
    </div>
  );
}
