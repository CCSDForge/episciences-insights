'use client';

import React, { useMemo, useState } from 'react';
import { Publication } from '@/lib/types';
import {
  Link as LinkIcon,
  Network,
  History,
  BookOpen,
  Search,
  X,
  ExternalLink,
  Tag,
  Users,
  Compass,
  CheckCircle2,
  Info,
  ArrowUpRight,
  Quote,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ResearchLineageProps {
  data: Publication[];
}

export default function ResearchLineage({ data }: ResearchLineageProps) {
  const { t, locale } = useTranslation();
  const [selectedPaper, setSelectedPaper] = useState<Publication | null>(data[0] || null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    let totalRefs = 0;
    let totalRelated = 0;
    data.forEach((p) => {
      totalRefs += p.referenced_works_count || 0;
      totalRelated += p.related_works?.length || 0;
    });
    return { totalRefs, totalRelated };
  }, [data]);

  const [displayLimit, setDisplayLimit] = useState(100);

  const allFilteredPapers = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...data].sort((a, b) => {
        const scoreB = (b.referenced_works_count || 0) + (b.related_works?.length || 0);
        const scoreA = (a.referenced_works_count || 0) + (a.related_works?.length || 0);
        return scoreB - scoreA;
      });
    }
    const q = searchQuery.toLowerCase().trim();
    return data.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(q);
      const authorMatch = p.authors?.some((a) => a.name.toLowerCase().includes(q));
      const journalMatch = p.journal?.name?.toLowerCase().includes(q);
      const doiMatch = p.doi?.toLowerCase().includes(q);
      return titleMatch || authorMatch || journalMatch || doiMatch;
    });
  }, [data, searchQuery]);

  React.useEffect(() => {
    setDisplayLimit(100);
  }, [searchQuery]);

  const visiblePapers = useMemo(() => {
    return allFilteredPapers.slice(0, displayLimit);
  }, [allFilteredPapers, displayLimit]);

  const getDoiUrl = (doi: string) => {
    if (doi.startsWith('http')) return doi;
    return `https://doi.org/${doi}`;
  };

  const refCount = selectedPaper?.referenced_works_count || 0;
  const relatedCount = selectedPaper?.related_works?.length || 0;
  const citationsCount = selectedPaper?.open_science?.impact?.citation_count;

  return (
    <div className="space-y-10">
      {/* Introduction Header Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-gradient-to-br from-[#0aa0be] via-[#005fb9] to-[#00005f] p-8 sm:p-10 rounded-3xl text-white shadow-xl">
        <div className="lg:col-span-2 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest">
            <History size={12} /> {t.lineage.heritage}
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
            {t.lineage.theResearchLineage}
          </h3>
          <p className="text-cyan-100 max-w-xl text-xs sm:text-sm leading-relaxed">
            {t.lineage.intro}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <p className="text-2xl sm:text-3xl font-black">{stats.totalRefs.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
              {t.lineage.foundationalRefs}
            </p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <p className="text-2xl sm:text-3xl font-black">{stats.totalRelated.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
              {t.lineage.scientificNeighbors}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector on Left, Enriched Lineage on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Interactive Selection with Search */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {searchQuery.trim() ? t.lineage.articlesMatching : t.lineage.mostInterconnected}
            </h4>
            <span className="text-[11px] font-semibold text-zinc-400">
              {t.lineage.showingCount
                .replace('{visible}', String(visiblePapers.length))
                .replace('{total}', String(allFilteredPapers.length))}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="lineage-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.lineage.searchPlaceholder}
              aria-label={t.lineage.searchPlaceholder}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0aa0be] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label={t.lineage.clearSearch}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Paper List */}
          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {visiblePapers.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <p className="text-xs font-medium">{t.lineage.noResults}</p>
              </div>
            ) : (
              <>
                {visiblePapers.map((paper) => {
                  const isSelected = selectedPaper?.doi === paper.doi;
                  const authorDisplay = paper.authors?.length
                    ? `${paper.authors[0].name}${paper.authors.length > 1 ? ` et al.` : ''}`
                    : null;

                  return (
                    <button
                      key={paper.doi}
                      type="button"
                      onClick={() => setSelectedPaper(paper)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-800/90 border-[#0aa0be] shadow-lg ring-2 ring-[#0aa0be]/20'
                          : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-[11px] font-black text-[#005fb9] dark:text-[#57bec3] uppercase tracking-wider">
                          {paper.year}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                          <span
                            className="flex items-center gap-1"
                            title={`${paper.referenced_works_count || 0} références`}
                          >
                            <LinkIcon size={11} aria-hidden="true" />
                            {paper.referenced_works_count || 0}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title={`${paper.related_works?.length || 0} travaux connexes`}
                          >
                            <Network size={11} aria-hidden="true" />
                            {paper.related_works?.length || 0}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`block text-xs font-bold leading-snug line-clamp-2 ${
                          isSelected
                            ? 'text-zinc-900 dark:text-zinc-50'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {paper.title}
                      </span>

                      {authorDisplay && (
                        <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {authorDisplay}
                        </p>
                      )}
                    </button>
                  );
                })}

                {visiblePapers.length < allFilteredPapers.length && (
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((prev) => prev + 50)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer mt-2"
                  >
                    {t.lineage.loadMore}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Detailed Lineage View */}
        <div className="flex-1 w-full">
          {selectedPaper ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. Core Publication Card (The Centerpiece) */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-[#0aa0be] dark:border-[#57bec3]/60 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005fb9]/10 dark:bg-[#57bec3]/15 text-[#005fb9] dark:text-[#57bec3] text-[10px] font-black uppercase tracking-widest">
                    <span>{t.lineage.selectedPublication}</span>
                    <span>•</span>
                    <span>{selectedPaper.year}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <CheckCircle2 size={12} />
                      {t.lineage.openAccessDiamond}
                    </span>
                    {selectedPaper.episciences?.overlay_repository && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        Overlay: {selectedPaper.episciences.overlay_repository}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-snug mb-4">
                  {selectedPaper.title}
                </h3>

                {/* Authors Chip List */}
                {selectedPaper.authors && selectedPaper.authors.length > 0 && (
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Users size={14} className="text-zinc-400 shrink-0 mr-1" aria-hidden="true" />
                    {selectedPaper.authors.slice(0, 6).map((author, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                      >
                        {author.name}
                        {author.institutions && author.institutions[0]?.country && (
                          <span className="text-[10px] font-normal text-zinc-400 uppercase">
                            ({author.institutions[0].country})
                          </span>
                        )}
                      </span>
                    ))}
                    {selectedPaper.authors.length > 6 && (
                      <span className="text-xs text-zinc-400 font-medium">
                        +{selectedPaper.authors.length - 6} autres
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                      <BookOpen size={14} className="text-[#0aa0be] shrink-0" aria-hidden="true" />
                      <span>{selectedPaper.journal.name}</span>
                    </div>
                    {selectedPaper.primary_topic && (
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        <Tag size={12} className="shrink-0" aria-hidden="true" />
                        <span>
                          {selectedPaper.primary_topic.name}
                          {selectedPaper.primary_topic.field && ` (${selectedPaper.primary_topic.field})`}
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={getDoiUrl(selectedPaper.doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.lineage.viewArticle} (${locale === 'fr' ? 'ouvre un nouvel onglet' : locale === 'es' ? 'abre en una nueva pestaña' : 'opens in a new tab'})`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#005fb9] hover:bg-[#0aa0be] text-white font-bold transition-colors shrink-0 shadow-sm"
                  >
                    <span>{t.lineage.viewArticle}</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* 2. Connected Lineage Pillars (Past & Horizons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pillar A: Scientific Foundations (Past / Amont) */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 text-[#005fb9] dark:text-[#57bec3]">
                      <History size={18} aria-hidden="true" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {t.lineage.scientificFoundations}
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 font-heading">
                        {refCount}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {t.lineage.foundationalRefs}
                      </span>
                    </div>

                    {/* Depth Badge */}
                    <div>
                      {refCount > 50 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                          {t.lineage.deepCorpus}
                        </span>
                      ) : refCount >= 20 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {t.lineage.standardCorpus}
                        </span>
                      ) : refCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {t.lineage.targetedCorpus}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {refCount > 0
                        ? t.lineage.buildsUpon.replace('{count}', String(refCount))
                        : t.lineage.noFoundational}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2 text-[11px] text-zinc-400">
                    <Info size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t.lineage.referencesHint}</span>
                  </div>
                </div>

                {/* Pillar B: Scientific Horizons & Related Works (Future / Aval) */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400">
                        <Compass size={18} aria-hidden="true" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          {t.lineage.scientificHorizons}
                        </h4>
                      </div>
                      {relatedCount > 0 && (
                        <span
                          className="text-[10px] font-black bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800"
                          title={t.lineage.openAlexLimitExplanation}
                        >
                          {relatedCount} {t.lineage.worksMapped}
                        </span>
                      )}
                    </div>

                    {/* Citations metric if known */}
                    {citationsCount != null && citationsCount > 0 ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs font-bold text-teal-800 dark:text-teal-300">
                        <Quote size={14} className="shrink-0" />
                        <span>
                          {citationsCount} {t.lineage.citationsCount}
                        </span>
                      </div>
                    ) : null}

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {t.lineage.semanticAffinityDesc}
                    </p>

                    {/* Explanatory callout for OpenAlex related works ceiling */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
                      <Info size={14} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{t.lineage.openAlexLimitExplanation}</span>
                    </div>

                    {/* Related Works Grid */}
                    {relatedCount > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {selectedPaper.related_works!.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 hover:border-[#0aa0be] hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all group"
                          >
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 truncate pr-2">
                              <Network size={12} className="text-[#0aa0be] shrink-0" />
                              <span className="truncate">{t.lineage.relatedWorkIndex} #{idx + 1}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-[#005fb9] dark:text-[#57bec3] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                              {t.lineage.consultOnOpenAlex}
                              <ArrowUpRight size={11} />
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-4 text-center bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl">
                        {t.lineage.noRelated}
                      </p>
                    )}
                  </div>

                  {/* Primary Rebound Action */}
                  {relatedCount > 0 && (
                    <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <a
                        href={selectedPaper.related_works![0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-100 transition-colors"
                      >
                        <Compass size={14} className="text-[#0aa0be]" />
                        <span>{t.lineage.exploreOpenAlex}</span>
                        <ExternalLink size={12} className="text-zinc-400" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">
                {t.lineage.selectPaperPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
