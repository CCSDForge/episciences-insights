'use client';

import React, { useState, useMemo } from 'react';
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
import CountryCollaborationNetwork from '@/components/CountryCollaborationNetwork';
import CountryCollaborationMatrix from '@/components/CountryCollaborationMatrix';
import CountryGeographicFlowMap from '@/components/CountryGeographicFlowMap';
import TopicTreeMap from '@/components/TopicTreeMap';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import FunderStoryline from '@/components/FunderStoryline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function InstitutionSection() {
  const { locale } = useTranslation();
  const { state, data } = useDashboard();
  const { institutionFilter } = state;
  const { filteredData, funderData, institutionsList, globalReachStats } = data;

  const [collabView, setCollabView] = useState<'network' | 'matrix' | 'flow'>('network');
  const [topicView, setTopicView] = useState<'treemap' | 'network' | 'msc'>('treemap');

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

  // Distribution of the institution's publications across Episciences journals
  const journalDistribution = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    filteredData.forEach((p) => {
      const name = p.journal.name || 'Unknown Journal';
      if (!counts[name]) counts[name] = { name, count: 0 };
      counts[name].count += 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

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
      .map(([code, count]) => ({ code, count }))
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
                {locale === 'fr' ? 'Statistiques par institution' : 'Institution Dashboard'}
              </span>
            </div>
            <h1 id="institution-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentInstitution ? currentInstitution.name : locale === 'fr' ? 'Toutes les institutions' : 'All Institutions'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {locale === 'fr'
                ? 'Cet espace est conçu pour les universités, organismes de recherche et bibliométriciens. Il permet d’évaluer la visibilité de votre établissement dans les revues Episciences, d’identifier les coopérations scientifiques internationales et les bailleurs finançant vos équipes.'
                : 'This section is designed for universities, research bodies, and bibliometrics offices. It enables measuring your institution’s contribution to Episciences overlay journals, analyzing co-authorship networks, and mapping research grants.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] shrink-0" />
            <span>
              {locale === 'fr'
                ? 'Sources : API Episciences, ROR (Research Organization Registry), OpenAlex et OpenAIRE Graph.'
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
              {locale === 'fr' ? 'Établissement sélectionné :' : 'Selected Institution:'}
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
              <span className="text-zinc-500">{locale === 'fr' ? 'Volume :' : 'Volume:'}</span>
              <span className="font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {formatNum(filteredData.length)} {locale === 'fr' ? 'publications' : 'publications'}
              </span>
            </div>

            {currentInstitution.ror && (
              <a
                href={currentInstitution.ror}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] hover:underline"
              >
                <span>Fiche ROR</span>
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
                  {locale === 'fr' ? 'Autorat & Réseaux' : 'Authorship & Networks'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Co-publications & Réseaux de co-autorat' : 'Co-authorships & Partnership networks'}
                </p>
              </div>
            </div>

            {/* Toggle views */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setCollabView('network')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  collabView === 'network'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Réseau' : 'Network'}
              </button>
              <button
                type="button"
                onClick={() => setCollabView('matrix')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  collabView === 'matrix'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Matrice' : 'Matrix'}
              </button>
              <button
                type="button"
                onClick={() => setCollabView('flow')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  collabView === 'flow'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Flux' : 'Flows'}
              </button>
            </div>
          </div>

          {/* Network display */}
          <div className="min-h-[300px]">
            {collabView === 'network' && <CountryCollaborationNetwork data={filteredData} />}
            {collabView === 'matrix' && <CountryCollaborationMatrix data={filteredData} />}
            {collabView === 'flow' && <CountryGeographicFlowMap data={filteredData} />}
          </div>

          {/* Partner countries stats */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {locale === 'fr' ? 'Coopérations internationales' : 'International Collaboration Scope'}
              </span>
              <span className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {globalReachStats.intlCollabRate}% {locale === 'fr' ? 'de co-publications internationales' : 'intl. co-authorship rate'}
              </span>
            </div>
            {partnerCountries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partnerCountries.map((c) => (
                  <span
                    key={c.code}
                    className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {c.code} ({c.count})
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
                  {locale === 'fr' ? 'Revues' : 'Overlay Journals'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Représentation dans les publications par revue' : 'Distribution across Episciences journals'}
                </p>
              </div>
            </div>
          </div>

          {/* Journal breakdown chart */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Revues hébergeant les articles de l’institution' : 'Top Publishing Journals'}
            </h3>
            <div className="h-[420px] w-full">
              <ChartContainer minHeight={380}>
                <BarChart
                  data={journalDistribution}
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
                    formatter={(val: unknown) => [formatNum(Number(val) || 0), locale === 'fr' ? 'Publications' : 'Publications']}
                    labelFormatter={(label: unknown) => String(label ?? '')}
                  />
                  <Bar dataKey="count" fill="#0aa0be" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Table summary */}
          <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Détail des revues' : 'Journal Summary'}
            </h3>
            <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {journalDistribution.map((j) => (
                <div key={j.name} className="py-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-3">{j.name}</span>
                  <span className="font-bold text-zinc-600 dark:text-zinc-400">{j.count}</span>
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
                  {locale === 'fr' ? 'Thématiques' : 'Research Topics'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Vue d’ensemble & Domaines scientifiques' : 'Topic Overview & Fields'}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setTopicView('treemap')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'treemap'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Treemap' : 'Treemap'}
              </button>
              <button
                type="button"
                onClick={() => setTopicView('network')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'network'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Réseau' : 'Network'}
              </button>
              <button
                type="button"
                onClick={() => setTopicView('msc')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  topicView === 'msc'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                MSC 2020
              </button>
            </div>
          </div>

          <div className="min-h-[480px] w-full">
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
                  {locale === 'fr' ? 'Financeurs' : 'Research Funders'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Évolution & Volume par financeurs' : 'Funding Timeline & Funder Volume'}
                </p>
              </div>
            </div>
          </div>

          {/* Funder Storyline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Évolution temporelle des financements' : 'Grants Timeline'}
            </h3>
            <FunderStoryline data={filteredData} />
          </div>

          {/* Funder List */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Bailleurs finançant les travaux de l’institution' : 'Funding Bodies'}
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
