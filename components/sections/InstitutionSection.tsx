'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  Library,
  Wallet,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import ChartExportMenu from '@/components/ChartExportMenu';
import CountryCollaborationNetwork from '@/components/CountryCollaborationNetwork';
import CountryCollaborationMatrix from '@/components/CountryCollaborationMatrix';
import CountryGeographicFlowMap from '@/components/CountryGeographicFlowMap';
import TopicTreeMap from '@/components/TopicTreeMap';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import FunderStoryline from '@/components/FunderStoryline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getCountryName } from '@/lib/countryNames';

export default function InstitutionSection() {
  const { locale } = useTranslation();
  const { state, data } = useDashboard();
  const { institutionFilter } = state;
  const { filteredData, funderData, institutionsList, globalReachStats } = data;

  const [collabView, setCollabView] = useState<'network' | 'matrix' | 'flow'>('network');
  const [topicView, setTopicView] = useState<'treemap' | 'network' | 'msc'>('treemap');
  const [journalLimit, setJournalLimit] = useState<'all' | '10'>('all');

  const collabRef = useRef<HTMLDivElement>(null);
  const journalsChartRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const fundersRef = useRef<HTMLDivElement>(null);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Currently selected institution object
  const currentInstitution = useMemo(() => {
    if (institutionFilter === 'all') return null;
    return (
      institutionsList.find(
        (i) => i.id === institutionFilter || i.ror === institutionFilter || i.name === institutionFilter
      ) || null
    );
  }, [institutionFilter, institutionsList]);

  // Distribution of the institution's publications across Episciences journals (all with >= 1 publication)
  const allJournalDistribution = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    filteredData.forEach((p) => {
      const name = p.journal.name || 'Unknown Journal';
      if (!counts[name]) counts[name] = { name, count: 0 };
      counts[name].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const displayedJournals = useMemo(() => {
    if (journalLimit === '10') {
      return allJournalDistribution.slice(0, 10);
    }
    return allJournalDistribution;
  }, [allJournalDistribution, journalLimit]);

  const journalChartHeight = useMemo(() => {
    return Math.max(380, displayedJournals.length * 32);
  }, [displayedJournals]);

  // Partner countries with which this institution collaborates
  const partnerCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((p) => {
      p.authors.forEach((a) => {
        a.institutions.forEach((inst) => {
          if (inst.country) {
            counts[inst.country] = (counts[inst.country] || 0) + 1;
          }
        });
      });
    });
    return Object.entries(counts)
      .map(([code, count]) => ({
        code,
        name: getCountryName(code),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredData]);

  return (
    <section aria-labelledby="institution-section-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Purpose Banner: Décrire l'utilisation + sources */}
      <div className="rounded-3xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-white dark:via-zinc-900 to-transparent p-6 sm:p-8 ring-1 ring-[var(--episciences-cyan-01)]/30 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Building2 size={20} />
              </span>
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {locale === 'fr' ? 'Statistiques par institution' : locale === 'es' ? 'Estadísticas por institución' : 'Institution Dashboard'}
              </span>
            </div>
            <h1 id="institution-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentInstitution ? currentInstitution.name : locale === 'fr' ? 'Toutes les institutions' : locale === 'es' ? 'Todas las instituciones' : 'All Institutions'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {locale === 'fr'
                ? 'Cet espace est conçu pour les universités, organismes de recherche et bibliométriciens. Il permet d’évaluer la visibilité de votre établissement dans les revues Episciences, d’identifier les coopérations scientifiques internationales et les bailleurs finançant vos équipes.'
                : locale === 'es'
                ? 'Este espacio está diseñado para universidades, centros de investigación y bibliómetras. Permite evaluar la presencia de su institución en las revistas Episciences, identificar colaboraciones científicas internacionales y organismos que financian a sus equipos.'
                : 'This section is designed for universities, research bodies, and bibliometrics offices. It enables measuring your institution’s contribution to Episciences overlay journals, analyzing co-authorship networks, and mapping research grants.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] shrink-0" />
            <span>
              {locale === 'fr'
                ? 'Sources : API Episciences, ROR (Research Organization Registry), OpenAlex et OpenAIRE Graph.'
                : locale === 'es'
                ? 'Fuentes: API Episciences, ROR (Research Organization Registry), OpenAlex y OpenAIRE Graph.'
                : 'Sources: Episciences API, ROR (Research Organization Registry), OpenAlex and OpenAIRE Graph.'}
            </span>
          </div>
        </div>
      </div>

      {/* Institution Details Quick Bar (if filtered) */}
      {currentInstitution && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-bold">
              {locale === 'fr' ? 'Établissement sélectionné :' : locale === 'es' ? 'Institución seleccionada:' : 'Selected Institution:'}
            </span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-black">{currentInstitution.name}</strong>
            {currentInstitution.country && (
              <span className="rounded-md bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                {currentInstitution.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">{locale === 'fr' ? 'Volume :' : locale === 'es' ? 'Volumen:' : 'Volume:'}</span>
              <span className="font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {formatNum(filteredData.length)} {locale === 'fr' ? 'publications' : locale === 'es' ? 'publicaciones' : 'publications'}
              </span>
            </div>

            {currentInstitution.ror && (
              <a
                href={currentInstitution.ror}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] hover:underline"
              >
                <span>{locale === 'fr' ? 'Fiche ROR' : locale === 'es' ? 'Ficha ROR' : 'ROR Record'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 2. Four Quadrants (Single column layout) */}
      <div className="flex flex-col gap-8">
        {/* =========================================================================
            QUADRANT 1: AUTORAT & RÉSEAUX CO-AUTORAT
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Autorat & Réseaux' : locale === 'es' ? 'Autoría y Redes' : 'Authorship & Networks'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Co-publications & Réseaux de co-autorat' : locale === 'es' ? 'Copublicaciones y redes de coautoría' : 'Co-authorships & Partnership networks'}
                </p>
              </div>
            </div>

            {/* Toggle views */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={locale === 'fr' ? 'Mode de visualisation des coopérations' : locale === 'es' ? 'Modo de visualización de cooperaciones' : 'Collaboration view mode'} className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setCollabView('network')}
                  aria-pressed={collabView === 'network'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'network'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Réseau' : locale === 'es' ? 'Red' : 'Network'}
                </button>
                <button
                  type="button"
                  onClick={() => setCollabView('matrix')}
                  aria-pressed={collabView === 'matrix'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'matrix'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Matrice' : locale === 'es' ? 'Matriz' : 'Matrix'}
                </button>
                <button
                  type="button"
                  onClick={() => setCollabView('flow')}
                  aria-pressed={collabView === 'flow'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    collabView === 'flow'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Flux' : locale === 'es' ? 'Flujos' : 'Flows'}
                </button>
              </div>

              <ChartExportMenu
                targetRef={collabRef}
                filename={`episciences-institution-collab-${collabView}-${institutionFilter}`}
              />
            </div>
          </div>

          {/* Network display */}
          <div ref={collabRef} className="min-h-[300px]">
            {collabView === 'network' && <CountryCollaborationNetwork data={filteredData} />}
            {collabView === 'matrix' && <CountryCollaborationMatrix data={filteredData} />}
            {collabView === 'flow' && <CountryGeographicFlowMap data={filteredData} />}
          </div>

          {/* Partner countries stats */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {locale === 'fr' ? 'Coopérations internationales' : locale === 'es' ? 'Cooperaciones internacionales' : 'International Collaboration Scope'}
              </span>
              <span className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {globalReachStats.intlCollabRate}% {locale === 'fr' ? 'de co-publications internationales' : locale === 'es' ? 'de copublicaciones internacionales' : 'intl. co-authorship rate'}
              </span>
            </div>
            {partnerCountries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partnerCountries.map((c) => (
                  <span
                    key={c.code}
                    className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {c.name} ({formatNum(c.count)})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 2: REVUES
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Revues' : locale === 'es' ? 'Revistas' : 'Overlay Journals'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Représentation dans les publications par revue' : locale === 'es' ? 'Distribución en publicaciones por revista' : 'Distribution across Episciences journals'}
                </p>
              </div>
            </div>
          </div>

          {/* Journal breakdown chart */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {locale === 'fr'
                  ? `Revues hébergeant les articles de l’institution (${displayedJournals.length})`
                  : locale === 'es'
                  ? `Revistas que publican artículos de la institución (${displayedJournals.length})`
                  : `Publishing Journals (${displayedJournals.length})`}
              </h3>
              <div className="flex items-center gap-2">
                {allJournalDistribution.length > 10 && (
                  <div
                    role="group"
                    aria-label={locale === 'fr' ? 'Nombre de revues à afficher' : locale === 'es' ? 'Número de revistas para mostrar' : 'Number of journals to show'}
                    className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg shadow-inner"
                  >
                    <button
                      type="button"
                      onClick={() => setJournalLimit('all')}
                      aria-pressed={journalLimit === 'all'}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        journalLimit === 'all'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      {locale === 'fr' ? `Toutes (${allJournalDistribution.length})` : locale === 'es' ? `Todas (${allJournalDistribution.length})` : `All (${allJournalDistribution.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalLimit('10')}
                      aria-pressed={journalLimit === '10'}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        journalLimit === '10'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      Top 10
                    </button>
                  </div>
                )}
                <ChartExportMenu
                  targetRef={journalsChartRef}
                  data={allJournalDistribution}
                  filename={`episciences-institution-journals-${institutionFilter}`}
                  csvColumns={[
                    { key: 'name', header: 'Journal_Name' },
                    { key: 'count', header: 'Publications_Count' },
                  ]}
                />
              </div>
            </div>
            <div ref={journalsChartRef} className="w-full max-h-[540px] overflow-y-auto pr-1">
              <div style={{ height: `${journalChartHeight}px` }} className="w-full">
                <ChartContainer minHeight={380}>
                  <BarChart
                    data={displayedJournals}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={260}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val: string) => (val.length > 36 ? `${val.slice(0, 34)}…` : val)}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                      formatter={(val: unknown) => [formatNum(Number(val) || 0), locale === 'fr' ? 'Publications' : locale === 'es' ? 'Publicaciones' : 'Publications']}
                      labelFormatter={(label: unknown) => String(label ?? '')}
                    />
                    <Bar dataKey="count" fill="#0aa0be" maxBarSize={22} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* Table summary */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {locale === 'fr' ? 'Détail des revues' : locale === 'es' ? 'Detalle de revistas' : 'Journal Summary'}
              </h3>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {allJournalDistribution.length}{' '}
                {locale === 'fr'
                  ? (allJournalDistribution.length > 1 ? 'revues représentées' : 'revue représentée')
                  : locale === 'es'
                  ? 'revistas'
                  : (allJournalDistribution.length > 1 ? 'journals represented' : 'journal represented')}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {allJournalDistribution.map((j) => (
                <div key={j.name} className="py-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-3">{j.name}</span>
                  <span className="font-bold text-zinc-600 dark:text-zinc-400">{formatNum(j.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 3: THÉMATIQUES
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Library size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Thématiques' : locale === 'es' ? 'Temáticas' : 'Research Topics'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Vue d’ensemble & Domaines scientifiques' : locale === 'es' ? 'Resumen y dominios científicos' : 'Topic Overview & Fields'}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={locale === 'fr' ? 'Mode de visualisation des thématiques' : locale === 'es' ? 'Modo de visualización de temas' : 'Topic view mode'} className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setTopicView('treemap')}
                  aria-pressed={topicView === 'treemap'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    topicView === 'treemap'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Treemap' : locale === 'es' ? 'Treemap' : 'Treemap'}
                </button>
                <button
                  type="button"
                  onClick={() => setTopicView('network')}
                  aria-pressed={topicView === 'network'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    topicView === 'network'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Réseau' : locale === 'es' ? 'Red' : 'Network'}
                </button>
                <button
                  type="button"
                  onClick={() => setTopicView('msc')}
                  aria-pressed={topicView === 'msc'}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    topicView === 'msc'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  MSC 2020
                </button>
              </div>

              <ChartExportMenu
                targetRef={topicsRef}
                filename={`episciences-institution-topics-${topicView}-${institutionFilter}`}
              />
            </div>
          </div>

          <div ref={topicsRef} className="min-h-[480px] w-full">
            {topicView === 'treemap' && <TopicTreeMap data={filteredData} />}
            {topicView === 'network' && <TopicCoOccurrenceNetwork data={filteredData} />}
            {topicView === 'msc' && <MscCoOccurrenceNetwork data={filteredData} />}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 4: FINANCEURS
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Financeurs' : locale === 'es' ? 'Financiadores' : 'Research Funders'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Évolution & Volume par financeurs' : locale === 'es' ? 'Evolución y volumen por financiador' : 'Funding Timeline & Funder Volume'}
                </p>
              </div>
            </div>

            <ChartExportMenu
              targetRef={fundersRef}
              data={funderData}
              filename={`episciences-institution-funders-${institutionFilter}`}
              csvColumns={[
                { key: 'name', header: 'Funder_Name' },
                { key: 'value', header: 'Publications_Count' },
              ]}
            />
          </div>

          {/* Funder Storyline */}
          <div ref={fundersRef} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Évolution temporelle des financements' : locale === 'es' ? 'Evolución temporal de la financiación' : 'Grants Timeline'}
            </h3>
            <FunderStoryline data={filteredData} />
          </div>

          {/* Funder List */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Bailleurs finançant les travaux de l’institution' : locale === 'es' ? 'Organismos que financian el trabajo de la institución' : 'Funding Bodies'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {funderData.slice(0, 6).map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-2.5 text-xs"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={f.name}>
                    {f.name}
                  </span>
                  <span className="rounded-md bg-white dark:bg-zinc-700 px-2 py-0.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
