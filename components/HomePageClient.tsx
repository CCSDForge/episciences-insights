'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Globe,
  Library,
  Wallet,
  Search,
  Network,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useDashboard } from '@/components/DashboardContext';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import PageHeader from '@/components/PageHeader';

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

  const SECTIONS = [
    {
      href: `/${locale}/usage`,
      title: locale === 'fr' ? 'Statistiques & Dynamique' : locale === 'es' ? 'Estadísticas y Uso' : 'Usage & Impact',
      badge: locale === 'fr' ? 'Chronologie & Consultations' : locale === 'es' ? 'Cronología y Consultas' : 'Timeline & Reads',
      desc: locale === 'fr'
        ? 'Évolution temporelle des articles, volumétrie des consultations et téléchargements, dynamique des revues.'
        : locale === 'es'
        ? 'Evolución temporal de publicaciones, descargas, consultas y dinámicas por revista.'
        : 'Publication chronology, readership metrics, abstract views, and journal dynamics.',
      icon: <BarChart3 className="h-6 w-6 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-03)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/reach`,
      title: locale === 'fr' ? 'Rayonnement Mondial' : locale === 'es' ? 'Alcance Global' : 'Global Reach',
      badge: locale === 'fr' ? 'Cartographie & Affiliations' : locale === 'es' ? 'Cartografía y Colaboraciones' : 'World Map & Affiliations',
      desc: locale === 'fr'
        ? 'Distribution géographique des auteurs, collaborations internationales et institutions partenaires.'
        : locale === 'es'
        ? 'Distribución geográfica de autores, colaboraciones internacionales e instituciones.'
        : 'Geographic distribution of authors, international co-authorship rates, and partner institutions.',
      icon: <Globe className="h-6 w-6 text-[var(--episciences-cyan-02)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-02)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/topics`,
      title: locale === 'fr' ? 'Thématiques & ODD' : locale === 'es' ? 'Temas y ODS' : 'Topics & SDGs',
      badge: locale === 'fr' ? 'Objectifs ONU & MSC 2020' : locale === 'es' ? 'Objetivos ONU y MSC 2020' : 'UN SDGs & MSC 2020',
      desc: locale === 'fr'
        ? 'Alignement avec les 17 Objectifs de Développement Durable de l’ONU et classifications zbMATH Open.'
        : locale === 'es'
        ? 'Alineación con los 17 ODS de la ONU y clasificaciones matemáticas zbMATH Open.'
        : 'Alignment with the 17 UN Sustainable Development Goals and zbMATH Open mathematics classifications.',
      icon: <Library className="h-6 w-6 text-[var(--ccsd-bleu-01)] dark:text-[var(--episciences-cyan-01)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--ccsd-bleu-01)] dark:hover:border-[var(--episciences-cyan-01)]',
    },
    {
      href: `/${locale}/funders`,
      title: locale === 'fr' ? 'Bailleurs & Financements' : locale === 'es' ? 'Financiadores y Proyectos' : 'Funders & Grants',
      badge: locale === 'fr' ? 'Agences & Programmes' : locale === 'es' ? 'Agencias y Programas' : 'Agencies & Programs',
      desc: locale === 'fr'
        ? 'Cartographie des bailleurs de fonds (ANR, Commission Européenne, NSF...), programmes et bourses.'
        : locale === 'es'
        ? 'Mapeo de financiadores (ANR, Comisión Europea, NSF...), proyectos y becas.'
        : 'Mapping of funding agencies (ANR, European Commission, NSF...), grants, and research programs.',
      icon: <Wallet className="h-6 w-6 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-03)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/open-science`,
      title: locale === 'fr' ? 'Science Ouverte & Filiation' : locale === 'es' ? 'Ciencia Abierta y Linaje' : 'Open Science & Provenance',
      badge: locale === 'fr' ? 'Dépôts, Licences & Données' : locale === 'es' ? 'Repositorios, Licencias y Datos' : 'Repositories & Scholix',
      desc: locale === 'fr'
        ? 'Dépôts en archives ouvertes (HAL, arXiv, Zenodo), licences Creative Commons, logiciels et jeux de données.'
        : locale === 'es'
        ? 'Depósitos en repositorios abiertos (HAL, arXiv...), licencias CC, software y conjuntos de datos vinculados.'
        : 'Open repository hosting (HAL, arXiv, Zenodo), Creative Commons licenses, and linked datasets/software.',
      icon: <Search className="h-6 w-6 text-[var(--episciences-cyan-01)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--episciences-cyan-01)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
    {
      href: `/${locale}/network`,
      title: locale === 'fr' ? 'Graphe du Réseau' : locale === 'es' ? 'Grafo de Red' : 'Network Graph',
      badge: locale === 'fr' ? 'Explorateur Relationnel' : locale === 'es' ? 'Explorador Relacional' : 'Relational Explorer',
      desc: locale === 'fr'
        ? 'Exploration interactive en graphe reliant les publications, co-auteurs, institutions et financeurs.'
        : locale === 'es'
        ? 'Visualización interactiva en grafo de publicaciones, coautores, instituciones y financiadores.'
        : 'Interactive graph visualization connecting publications, co-authors, research bodies, and funders.',
      icon: <Network className="h-6 w-6 text-[var(--ccsd-bleu-00)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true" />,
      borderHover: 'hover:border-[var(--ccsd-bleu-00)] dark:hover:border-[var(--episciences-cyan-00)]',
    },
  ];

  return (
    <div className="space-y-16">
      {/* 1. Hero Block with the 6 KPI cards (from /tmp/pasted-image-9.png) */}
      <PageHeader
        corpusStats={corpusStats}
        initialUsageStats={initialUsageStats}
        kpiSummary={usageSummary}
      />

      {/* 2. Exploration Cards Grid */}
      <section aria-labelledby="section-navigation-title" className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 id="section-navigation-title" className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {locale === 'fr'
              ? 'Explorer les dimensions de la recherche'
              : locale === 'es'
              ? 'Explorar las dimensiones de la investigación'
              : 'Explore Research Dimensions'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium max-w-3xl">
            {locale === 'fr'
              ? 'Naviguez à travers les différentes sections pour analyser en profondeur les impacts, collaborations et engagements en science ouverte d’Episciences.'
              : locale === 'es'
              ? 'Navegue por las distintas secciones para analizar en profundidad los impactos, colaboraciones y compromisos de ciencia abierta de Episciences.'
              : 'Navigate through each section for an in-depth analysis of scientific impact, global collaborations, and open science indicators.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((sec) => (
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
                <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--episciences-cyan-03)] dark:group-hover:text-[var(--episciences-cyan-01)] transition-colors">
                  {sec.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                  {sec.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] group-hover:translate-x-1 transition-transform">
                <span>{locale === 'fr' ? 'Accéder à la section' : locale === 'es' ? 'Ver sección' : 'View section'}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Data Sources, Methodology & Partners (integrated on Home page) */}
      <section
        aria-labelledby="home-sources-title"
        className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--episciences-cyan-03)]/10 text-[var(--episciences-cyan-03)] dark:bg-[var(--episciences-cyan-00)]/15 dark:text-[var(--episciences-cyan-00)]">
            <Database size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 id="home-sources-title" className="font-heading text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {t.disclaimer.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {locale === 'fr'
                ? 'Provenance des données, processus d’enrichissement automatisé et périmètre de mesure'
                : locale === 'es'
                ? 'Procedencia de los datos, proceso de enriquecimiento y alcance de medición'
                : 'Data provenance, automated enrichment pipelines, and measurement scope'}
            </p>
          </div>
        </div>

        {/* Narrative & Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
          <p>{t.disclaimer.metricsP1}</p>
          <p>{t.disclaimer.metricsP2}</p>
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
              aria-label="CCSD - Centre pour la Communication Scientifique Directe"
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
                className="hidden h-12 sm:h-14 w-auto dark:block"
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

          {/* Legal & Timestamp */}
          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1 pt-4">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">{t.footer.license}</p>
            <p>{t.footer.source}</p>
            {formattedDate && (
              <p className="text-zinc-400 dark:text-zinc-500">
                {t.footer.lastUpdated.replace('{date}', formattedDate)}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
