'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Database,
  GitBranch,
  ShieldCheck,
  Scale,
  Cpu,
  Layers,
  FileCode,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { renderLinkedText } from '@/lib/renderLinkedText';
import type { CorpusStats } from '@/lib/data';

interface HelpSectionProps {
  corpusStats?: CorpusStats;
}

export default function HelpSection({ corpusStats }: HelpSectionProps = {}) {
  const { t, locale } = useTranslation();
  const m = t.methodology;

  const totalPubsFormatted = (corpusStats?.totalPublications ?? 8062).toLocaleString(
    locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US'
  );
  const totalJournals = String(corpusStats?.totalHostedJournals ?? 47);

  const sec1P1Resolved = m.sec1P1
    .replace('{publicationsCount}', totalPubsFormatted)
    .replace('{journalsCount}', totalJournals);

  const dataSources = [
    {
      name: 'Episciences',
      url: 'https://www.episciences.org',
      access: 'API REST (api.episciences.org)',
      scope: locale === 'fr'
        ? 'Liste des articles publiés, nom et code des revues, affiliations des auteurs, dates de soumission et de publication, codes MSC 2020'
        : locale === 'es'
        ? 'Lista de artículos publicados, nombre y código de las revistas, afiliaciones de autores, fechas de envío y publicación, códigos MSC 2020'
        : 'List of published articles, journal names and codes, author affiliations, submission and publication dates, MSC 2020 codes',
      pivot: 'DOI, docid, rvcode',
    },
    {
      name: 'OpenAlex',
      url: 'https://openalex.org',
      access: 'API REST Works & Funders (api.openalex.org)',
      scope: locale === 'fr'
        ? 'Auteurs, affiliations, pays, ODD, thématiques, nombre de références, travaux liés, noms des financeurs'
        : locale === 'es'
        ? 'Autores, afiliaciones, países, ODS, temáticas, número de referencias, trabajos relacionados, nombres de financiadores'
        : 'Authors, affiliations, countries, SDGs, research topics, reference counts, related works, funder names',
      pivot: 'DOI, OpenAlex ID',
    },
    {
      name: 'OpenAIRE Graph',
      url: 'https://graph.openaire.eu',
      access: 'API v3 Research Products (api.openaire.eu)',
      scope: locale === 'fr'
        ? 'Projets financés, archives d\'hébergement (HAL, arXiv, Zenodo...), licences, codes JEL'
        : locale === 'es'
        ? 'Proyectos financiados, repositorios de alojamiento (HAL, arXiv, Zenodo...), licencias, códigos JEL'
        : 'Funded research projects, hosting repositories (HAL, arXiv, Zenodo...), licenses, JEL codes',
      pivot: 'DOI, OpenAIRE PID',
    },
    {
      name: 'ROR (Research Organization Registry)',
      url: 'https://ror.org',
      access: 'API REST Organization (api.ror.org)',
      scope: locale === 'fr'
        ? 'Identifiants des organismes, pays des établissements, localisation des financeurs (latitude, longitude)'
        : locale === 'es'
        ? 'Identificadores de instituciones, países de los centros, localización de los financiadores (latitud, longitud)'
        : 'Organization persistent identifiers, institution countries, funder geolocations (latitude, longitude)',
      pivot: 'ROR ID',
    },
    {
      name: 'zbMATH Open',
      url: 'https://zbmath.org',
      access: locale === 'fr' ? 'Via l\'export Episciences' : locale === 'es' ? 'A través de la exportación Episciences' : 'Via Episciences export',
      scope: locale === 'fr'
        ? 'Codes de la Mathematics Subject Classification (MSC 2020)'
        : locale === 'es'
        ? 'Códigos de la Mathematics Subject Classification (MSC 2020)'
        : 'Mathematics Subject Classification 2020 (MSC 2020) official codes',
      pivot: locale === 'fr' ? 'Code MSC 2020' : locale === 'es' ? 'Código MSC 2020' : 'MSC 2020 Code',
    },
    {
      name: 'Episciences KPI Logs',
      url: 'https://www.episciences.org',
      access: 'kpi_downloads.json',
      scope: locale === 'fr'
        ? 'Téléchargements et consultations de pages, par revue, par article et par pays'
        : locale === 'es'
        ? 'Descargas de texto completo y visualizaciones de resúmenes por revista, por artículo y por país'
        : 'Full-text file downloads and abstract views per journal, per paper, and per country',
      pivot: 'DOI, rvcode',
    },
  ];

  return (
    <article className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Navigation retour */}
      <div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-400 dark:hover:text-[var(--episciences-cyan-00)] transition-colors group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          <span>{m.backToDashboard}</span>
        </Link>
      </div>

      {/* Header académique */}
      <header className="rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-[var(--episciences-cyan-00)]/10 p-8 sm:p-10 shadow-xs ring-1 ring-zinc-200 dark:from-zinc-900 dark:via-zinc-900 dark:to-[var(--episciences-cyan-00)]/10 dark:ring-zinc-800">
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] border border-[var(--episciences-cyan-01)]/30">
            <BookOpen size={13} aria-hidden="true" />
            <span>{m.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading leading-tight">
            {m.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {m.subtitle}
          </p>

          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Affiliation : </span>
              {m.institution}
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Auteurs : </span>
              {m.author}
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Date : </span>
              {m.date}
            </div>
          </div>
        </div>
      </header>

      {/* Sommaire interactif */}
      <nav
        aria-label={m.tocTitle}
        className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
      >
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
          <Layers size={14} aria-hidden="true" />
          <span>{m.tocTitle}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold">
          <a
            href="#sec1"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocContext}
          </a>
          <a
            href="#sec2"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocSources}
          </a>
          <a
            href="#sec3"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocPipeline}
          </a>
          <a
            href="#sec4"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocModels}
          </a>
          <a
            href="#sec5"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocLimits}
          </a>
          <a
            href="#sec6"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocFair}
          </a>
          <a
            href="#sec7"
            className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
          >
            {m.tocReferences}
          </a>
        </div>
      </nav>

      {/* SECTION 1 */}
      <section
        id="sec1"
        aria-labelledby="sec1-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <Scale size={20} aria-hidden="true" />
          </div>
          <h2 id="sec1-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec1Title}
          </h2>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {sec1P1Resolved}
        </p>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {m.sec1P2}
        </p>

        {/* Callout Diamant */}
        <div className="rounded-xl border border-[var(--episciences-cyan-01)]/40 bg-[var(--episciences-cyan-00)]/10 p-5 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
            {m.sec1CalloutTitle}
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {renderLinkedText(m.sec1CalloutDesc)}
          </p>
        </div>
      </section>

      {/* SECTION 2 */}
      <section
        id="sec2"
        aria-labelledby="sec2-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <Database size={20} aria-hidden="true" />
          </div>
          <h2 id="sec2-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec2Title}
          </h2>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {m.sec2P1}
        </p>

        {/* Tableau comparatif des sources */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
                <th scope="col" className="p-3.5 font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {m.sourceThName}
                </th>
                <th scope="col" className="p-3.5 font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {m.sourceThAccess}
                </th>
                <th scope="col" className="p-3.5 font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {m.sourceThScope}
                </th>
                <th scope="col" className="p-3.5 font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {m.sourceThPivot}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
              {dataSources.map((s, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[var(--episciences-cyan-03)] dark:hover:text-[var(--episciences-cyan-00)] underline underline-offset-2"
                    >
                      <span>{s.name}</span>
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {s.access}
                  </td>
                  <td className="p-3.5 leading-relaxed">
                    {s.scope}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {s.pivot}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3 */}
      <section
        id="sec3"
        aria-labelledby="sec3-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <GitBranch size={20} aria-hidden="true" />
          </div>
          <h2 id="sec3-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec3Title}
          </h2>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {m.sec3P1}
        </p>

        {/* 5 étapes d'ingestion */}
        <div className="space-y-4">
          {[
            { title: m.step1Title, desc: m.step1Desc, icon: '01' },
            { title: m.step2Title, desc: m.step2Desc, icon: '02' },
            { title: m.step3Title, desc: m.step3Desc, icon: '03' },
            { title: m.step4Title, desc: m.step4Desc, icon: '04' },
            { title: m.step5Title, desc: m.step5Desc, icon: '05' },
          ].map((st, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-start gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] font-black text-xs flex items-center justify-center font-mono">
                {st.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {st.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 */}
      <section
        id="sec4"
        aria-labelledby="sec4-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <Cpu size={20} aria-hidden="true" />
          </div>
          <h2 id="sec4-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec4Title}
          </h2>
        </div>

        {/* 4.1 SDG */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {m.sdgTitle}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {m.sdgP1}
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {m.sdgFormulaExplanation}
          </p>
        </div>

        {/* 4.2 Louvain */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {m.networkTitle}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {m.networkP1}
          </p>
        </div>

        {/* 4.3 Usage & Epistemic Boundaries */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {m.usageTitle}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {m.usageP1}
          </p>
          <div className="rounded-xl border border-amber-300/60 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-zinc-800 dark:text-zinc-200">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              {m.usageWarning}
            </p>
          </div>
        </div>

        {/* 4.4 Lineage */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {m.lineageTitle}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {m.lineageP1}
          </p>
        </div>

        {/* 4.5 Citations */}
        {m.citationsTitle && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {m.citationsTitle}
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {m.citationsP1}
            </p>
          </div>
        )}

        {/* 4.6 Topics & Classifications */}
        {m.topicsTitle && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {m.topicsTitle}
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {m.topicsP1}
            </p>
          </div>
        )}

        {/* 4.7 Geographic reach */}
        {m.reachMethodTitle && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {m.reachMethodTitle}
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {m.reachMethodP1}
            </p>
          </div>
        )}
      </section>

      {/* SECTION 5 */}
      <section
        id="sec5"
        aria-labelledby="sec5-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <h2 id="sec5-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec5Title}
          </h2>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {m.sec5P1}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {m.limit1Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {m.limit1Desc}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {m.limit2Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {m.limit2Desc}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {m.limit3Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {m.limit3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6 */}
      <section
        id="sec6"
        aria-labelledby="sec6-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="p-2 rounded-xl bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]">
            <FileCode size={20} aria-hidden="true" />
          </div>
          <h2 id="sec6-heading" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
            {m.sec6Title}
          </h2>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {m.sec6P1}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {m.ssgTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {m.ssgDesc}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {m.compressionTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {m.compressionDesc}
            </p>
          </div>
        </div>

        {/* Licences & Données ouvertes */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            {m.licenseTitle}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {m.licenseDesc}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="/data/publications.json"
              download="episciences-publications.json"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[var(--episciences-cyan-03)] transition-colors shadow-2xs"
            >
              <Download size={13} aria-hidden="true" />
              <span>{m.downloadPubs}</span>
            </a>
            <a
              href="/data/funders.json"
              download="episciences-funders.json"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[var(--episciences-cyan-03)] transition-colors shadow-2xs"
            >
              <Download size={13} aria-hidden="true" />
              <span>{m.downloadFunders}</span>
            </a>
          </div>
        </div>

        {/* Protocole CLI */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            {m.reproTitle}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {m.reproDesc}
          </p>
          <pre className="rounded-xl bg-zinc-950 p-4 text-[11px] font-mono text-zinc-200 overflow-x-auto border border-zinc-800 leading-relaxed">
{`# 1. Cloner le dépôt (GPL v3)
git clone https://github.com/CCSDForge/episciences-insights.git
cd episciences-insights && npm install

# 2. Récupérer la liste des DOI depuis l'API Episciences
npm run sync:dois

# 3. Collecter et fusionner les métadonnées
npm run collect

# Optionnel : collecter les liens Scholix (données et logiciels)
npm run collect:links

# 4. Générer le site statique
npm run build`}
          </pre>
        </div>
      </section>

      {/* SECTION 7 */}
      <section
        id="sec7"
        aria-labelledby="sec7-heading"
        className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 space-y-4"
      >
        <h2 id="sec7-heading" className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          {m.sec7Title}
        </h2>
        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed list-disc list-inside">
          {m.references.map((ref, idx) => (
            <li key={idx}>{renderLinkedText(ref)}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
