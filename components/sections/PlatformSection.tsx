'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Clock,
  BookOpen,
  Share2,
  Sparkles,
  Network,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import ChartContainer from '@/components/ChartContainer';
import TopicTreeMap from '@/components/TopicTreeMap';
import SdgRadar from '@/components/SdgRadar';
import FunderCofundingNetwork from '@/components/FunderCofundingNetwork';
import FunderSankey from '@/components/FunderSankey';
import CountryGeographicFlowMap from '@/components/CountryGeographicFlowMap';
import ResearchLineage from '@/components/ResearchLineage';
import NetworkExplorer from '@/components/NetworkExplorer';
import FullscreenModal from '@/components/FullscreenModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export default function PlatformSection() {
  const { locale } = useTranslation();
  const { data } = useDashboard();
  const { platformFilteredData, platformPeerReviewStats, funders } = data;
  const filteredData = platformFilteredData;
  const peerReviewStats = platformPeerReviewStats;

  const [networkTab, setNetworkTab] = useState<'funders' | 'sankey' | 'collab'>('funders');
  const [impactTab, setImpactTab] = useState<'sdg' | 'topics' | 'lineage'>('sdg');
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Annual publication volume evolution
  const yearlyPubsData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((p) => {
      const y = p.year.toString();
      counts[y] = (counts[y] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredData]);

  // Disciplinary distribution (Physical Sciences, Social Sciences, etc.)
  const disciplinaryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((p) => {
      const field = p.primary_topic?.field || (locale === 'fr' ? 'Non classifié' : 'Unclassified');
      counts[field] = (counts[field] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredData, locale]);

  // Cumulative journals count over time
  const cumulativeJournalsPerYear = useMemo(() => {
    const firstYearByJournal: Record<string, number> = {};
    filteredData.forEach((p) => {
      const key = p.journal.code || p.journal.name;
      if (!key) return;
      if (!firstYearByJournal[key] || p.year < firstYearByJournal[key]) {
        firstYearByJournal[key] = p.year;
      }
    });

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Set(filteredData.map((p) => p.year)))
      .filter((y) => y >= 1996 && y <= currentYear)
      .sort((a, b) => a - b);

    if (years.length === 0) return [];

    const minYear = years[0];
    let cumulative = Object.values(firstYearByJournal).filter((y) => y < minYear).length;

    return years.map((year) => {
      const newThisYear = Object.values(firstYearByJournal).filter((y) => y === year).length;
      cumulative += newThisYear;
      return {
        year: year.toString(),
        count: cumulative,
        newJournals: newThisYear,
      };
    });
  }, [filteredData]);

  return (
    <section aria-labelledby="platform-section-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Purpose Banner: Décrire l'utilisation + sources */}
      <div className="rounded-3xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-white dark:via-zinc-900 to-transparent p-6 sm:p-8 ring-1 ring-[var(--episciences-cyan-01)]/30 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Globe size={20} />
              </span>
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {locale === 'fr' ? 'Données de la plateforme' : 'Platform Global Impact'}
              </span>
            </div>
            <h1 id="platform-section-heading" className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {locale === 'fr' ? 'Trajectoire et impact global d’Episciences' : 'Episciences Trajectory & Global Impact'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-4xl leading-relaxed font-medium">
              {locale === 'fr'
                ? 'Cet espace présente l’impact global de la plateforme Episciences, développé par le CCSD. Destiné aux tutelles, financeurs de la plateforme et observatoires de la science ouverte, il mesure la croissance des publications, les délais d’évaluation par les pairs, la dynamique des revues et leur rayonnement sociétal.'
                : 'This section showcases the global trajectory of the Episciences platform, developed by CCSD. Aimed at institutional stakeholders, platform funders, and open science observatories, it measures publication growth, peer-review turnaround, journal dynamics, and societal impact.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] shrink-0" />
            <span>
              {locale === 'fr'
                ? 'Sources : API Episciences, OpenAlex, OpenAIRE Graph v3, ROR, zbMATH Open.'
                : 'Sources: Episciences API, OpenAlex, OpenAIRE Graph v3, ROR, zbMATH Open.'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Four Quadrants (Single column layout) */}
      <div className="flex flex-col gap-8">
        {/* =========================================================================
            BLOC 1: VOLUMES DE PUBLICATION
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Volumes de publication' : 'Publication Volumes'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Croissance annuelle des parutions sur la plateforme' : 'Annual Growth & Publication Trends'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--episciences-cyan-00)]/20 px-3 py-1 text-xs font-black text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {formatNum(filteredData.length)} {locale === 'fr' ? 'articles au total' : 'total articles'}
              </span>
            </div>
          </div>

          {/* Yearly publications bar chart */}
          <div className="space-y-2">
            <div className="h-64 w-full">
              <ChartContainer>
                <BarChart data={yearlyPubsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                    formatter={(val: unknown) => [formatNum(Number(val) || 0), locale === 'fr' ? 'Articles' : 'Articles']}
                  />
                  <Bar dataKey="count" fill="#0aa0be" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Diamond Open Access affirmation */}
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--episciences-cyan-00)]/10 p-3 text-xs text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] font-semibold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>
              {locale === 'fr'
                ? '100% Modèle Diamant : gratuité totale pour les auteurs (aucun frais APC) et pour les lecteurs.'
                : '100% Diamond Open Access: no author-facing fees (APC-free) and fully open to readers.'}
            </span>
          </div>
        </div>

        {/* =========================================================================
            BLOC 2: DÉLAIS D'ÉVALUATION PAR LES PAIRS (PEER-REVIEW)
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Délais d’évaluation par les pairs' : 'Peer-Review Turnaround Delay'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr'
                    ? 'Temps d’expertise éditoriale entre première soumission sur archive et parution finale'
                    : 'Duration between first submission to repository and journal publication'}
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 self-start sm:self-auto">
              <span className="text-3xl font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)]">
                {peerReviewStats.medianMonths}
              </span>
              <span className="text-xs font-bold text-zinc-500">
                {locale === 'fr' ? 'mois (médiane)' : 'months (median)'}
              </span>
            </div>
          </div>

          {/* Delay distribution bins */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {locale === 'fr' ? 'Distribution des délais d’expertise' : 'Review Turnaround Distribution'}
              </span>
              <span>
                {locale === 'fr'
                  ? `Calculé sur ${formatNum(peerReviewStats.validCount)} articles réguliers`
                  : `Based on ${formatNum(peerReviewStats.validCount)} regular articles`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {peerReviewStats.byRange.map((bin) => (
                <div key={bin.range} className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3.5 text-center ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
                  <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{bin.range}</div>
                  <div className="text-base font-black text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-01)] mt-1">{bin.percentage}%</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{formatNum(bin.count)} {locale === 'fr' ? 'articles' : 'pubs'}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
            {locale === 'fr'
              ? 'Note méthodologique : cet indicateur mesure la rapidité du processus éditorial géré par les comités de revues sur Episciences. Les articles importés rétroactivement avec une date de soumission antérieure ne sont pas inclus afin de ne pas biaiser la médiane.'
              : 'Methodological note: this indicator measures editorial turnaround on Episciences. Backfilled legacy articles with earlier preprint dates are excluded to prevent skewing the median.'}
          </p>
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
                  {locale === 'fr' ? 'Revues hébergées' : 'Hosted Journals'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Évolution du catalogue & Répartition disciplinaire' : 'Catalog Growth & Field Distribution'}
                </p>
              </div>
            </div>
          </div>

          {/* Cumulative journals evolution */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Évolution cumulée des revues hébergées' : 'Cumulative Hosted Journals Evolution'}
            </h3>
            <div className="h-60 w-full">
              <ChartContainer>
                <AreaChart data={cumulativeJournalsPerYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="journalsCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20208c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#20208c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                    formatter={(val: unknown, _name: unknown, item: { payload?: { newJournals?: number } }) => {
                      const count = Number(val) || 0;
                      const added = item.payload?.newJournals ? ` (+${item.payload.newJournals} ${locale === 'fr' ? 'créée(s)' : 'added'})` : '';
                      return [
                        `${count} ${locale === 'fr' ? 'revues au catalogue' : 'journals in catalog'}${added}`,
                        locale === 'fr' ? 'Total cumulé' : 'Cumulative total',
                      ];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#20208c"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#journalsCumulativeGrad)"
                    dot={{ r: 3, fill: '#20208c' }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* Disciplinary breakdown chart */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {locale === 'fr' ? 'Répartition disciplinaire des publications' : 'Disciplinary Breakdown'}
            </h3>
            <div className="h-56 w-full">
              <ChartContainer>
                <BarChart
                  data={disciplinaryData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={130}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', fontSize: '12px' }}
                    formatter={(val: unknown) => [formatNum(Number(val) || 0), locale === 'fr' ? 'Publications' : 'Publications']}
                  />
                  <Bar dataKey="count" fill="#57bec3" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 3: RÉSEAUX
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Share2 size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Réseaux & Synergies' : 'Networks & Synergies'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Financeurs, institutions représentées & coopérations' : 'Funders, Institutions & Worldwide Flows'}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setNetworkTab('funders')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    networkTab === 'funders'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Synergies' : 'Synergies'}
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkTab('sankey')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    networkTab === 'sankey'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  Sankey
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkTab('collab')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    networkTab === 'collab'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {locale === 'fr' ? 'Flux pays' : 'Flows'}
                </button>
              </div>

              {/* Fullscreen Explorer Button */}
              <button
                type="button"
                onClick={() => setIsNetworkModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                title="Ouvrir l'explorateur immersif de graphe"
              >
                <Network size={14} />
                <span className="hidden sm:inline">Graphe</span>
              </button>
            </div>
          </div>

          {/* Network display */}
          <div className="min-h-[340px]">
            {networkTab === 'funders' && <FunderCofundingNetwork data={filteredData} />}
            {networkTab === 'sankey' && <FunderSankey data={filteredData} funders={funders} />}
            {networkTab === 'collab' && <CountryGeographicFlowMap data={filteredData} />}
          </div>
        </div>

        {/* =========================================================================
            QUADRANT 4: IMPACT DES PUBLICATIONS
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900/90 dark:ring-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--episciences-cyan-00)]/15 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {locale === 'fr' ? 'Impact des publications' : 'Scholarly & Societal Impact'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === 'fr' ? 'Thématiques de recherche & Contribution aux ODD' : 'Research Topics & UN SDGs'}
                </p>
              </div>
            </div>

            {/* Toggle controls */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setImpactTab('sdg')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  impactTab === 'sdg'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'ODD' : 'SDGs'}
              </button>
              <button
                type="button"
                onClick={() => setImpactTab('topics')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  impactTab === 'topics'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Thématiques' : 'Topics'}
              </button>
              <button
                type="button"
                onClick={() => setImpactTab('lineage')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  impactTab === 'lineage'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {locale === 'fr' ? 'Filiation' : locale === 'es' ? 'Filiación' : 'Lineage'}
              </button>
            </div>
          </div>

          {/* Impact display */}
          <div className="min-h-[480px] w-full">
            {impactTab === 'sdg' && <SdgRadar data={filteredData.flatMap((p) => p.sdgs)} />}
            {impactTab === 'topics' && <TopicTreeMap data={filteredData} />}
            {impactTab === 'lineage' && <ResearchLineage data={filteredData} />}
          </div>
        </div>
      </div>

      {/* Immersive Network Explorer Modal */}
      <FullscreenModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        title={locale === 'fr' ? 'Explorateur immersif de réseau multi-entités' : 'Multi-Modal Relational Network'}
      >
        <div className="h-full w-full p-4">
          <NetworkExplorer data={filteredData} funders={funders} />
        </div>
      </FullscreenModal>
    </section>
  );
}
