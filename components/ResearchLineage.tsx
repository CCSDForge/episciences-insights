'use client';

import React, { useMemo, useState } from 'react';
import { Publication } from '@/lib/types';
import { Link as LinkIcon, Network, History, ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ResearchLineageProps {
  data: Publication[];
}

export default function ResearchLineage({ data }: ResearchLineageProps) {
  const { t } = useTranslation();
  const [selectedPaper, setSelectedPaper] = useState<Publication | null>(data[0] || null);

  const stats = useMemo(() => {
    let totalRefs = 0;
    let totalRelated = 0;
    data.forEach(p => {
      totalRefs += p.referenced_works_count || 0;
      totalRelated += p.related_works?.length || 0;
    });
    return { totalRefs, totalRelated };
  }, [data]);

  const topImpactPapers = useMemo(() => {
    return [...data]
      .sort((a, b) => ((b.referenced_works_count || 0) + (b.related_works?.length || 0)) - ((a.referenced_works_count || 0) + (a.related_works?.length || 0)))
      .slice(0, 50);
  }, [data]);

  const getDoiUrl = (doi: string) => {
    if (doi.startsWith('http')) return doi;
    return `https://doi.org/${doi}`;
  };

  return (
    <div className="space-y-12">
      {/* Introduction Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-gradient-to-br from-fuchsia-600 to-violet-700 p-10 rounded-3xl text-white shadow-2xl">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest">
            <History size={12} /> {t.lineage.heritage}
          </div>
          <h3 className="text-4xl font-black tracking-tight font-heading">{t.lineage.theResearchLineage}</h3>
          <p className="text-fuchsia-100 max-w-xl leading-relaxed">
            {t.lineage.intro}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-3xl font-black">{stats.totalRefs.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t.lineage.foundationalRefs}</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-3xl font-black">{stats.totalRelated.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t.lineage.scientificNeighbors}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Interactive Selection */}
        <div className="w-full lg:w-1/3 space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 px-2">{t.lineage.mostInterconnected}</h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {topImpactPapers.map((paper) => (
              <button
                key={paper.doi}
                onClick={() => setSelectedPaper(paper)}
                aria-pressed={selectedPaper?.doi === paper.doi}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  selectedPaper?.doi === paper.doi 
                    ? 'bg-white dark:bg-zinc-800 border-fuchsia-500 shadow-xl ring-4 ring-fuchsia-500/10' 
                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">{paper.year}</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><LinkIcon size={12} aria-hidden="true" /> {paper.referenced_works_count}</span>
                    <span className="flex items-center gap-1"><Network size={12} aria-hidden="true" /> {paper.related_works?.length}</span>
                  </div>
                </div>
                <span className={`block text-sm font-bold leading-snug ${selectedPaper?.doi === paper.doi ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {paper.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detailed Lineage Flow */}
        <div className="flex-1">
          {selectedPaper ? (
            <div className="sticky top-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                
                {/* 1. Foundations (References) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-fuchsia-600 dark:text-fuchsia-400">
                    <History size={20} />
                    <h5 className="text-xs font-black uppercase tracking-[0.2em]">{t.lineage.scientificFoundations}</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(selectedPaper.referenced_works_count || 0, 12) }).map((_, i) => (
                      <div key={i} className="h-2 w-8 rounded-full bg-fuchsia-200 dark:bg-fuchsia-900/30" />
                    ))}
                    {(selectedPaper.referenced_works_count || 0) > 12 && (
                      <span className="text-[10px] font-bold text-zinc-400">+{selectedPaper.referenced_works_count! - 12} {t.lineage.morePapersReferenced}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 italic">
                    {selectedPaper.referenced_works_count && selectedPaper.referenced_works_count > 0 
                      ? t.lineage.buildsUpon.replace('{count}', String(selectedPaper.referenced_works_count))
                      : t.lineage.noFoundational}
                  </p>
                </div>

                {/* 2. The Bridge */}
                <div className="flex items-center justify-center py-4">
                  <div className="h-12 w-0.5 bg-gradient-to-b from-fuchsia-500 to-violet-500" />
                </div>

                {/* 3. The Core Paper */}
                <div className="relative p-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-violet-500 shadow-lg z-10">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-violet-500 rounded-full" />
                  <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2">{t.lineage.selectedPublication}</p>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-4">{selectedPaper.title}</h4>
                  <div className="flex flex-col gap-3 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="shrink-0" /> 
                      <span>{selectedPaper.journal.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LinkIcon size={14} className="shrink-0" />
                      <a 
                        href={getDoiUrl(selectedPaper.doi)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fuchsia-600 dark:text-fuchsia-400 hover:underline break-all"
                        aria-label={`View DOI for ${selectedPaper.title}`}
                      >
                        {getDoiUrl(selectedPaper.doi)}
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. The Bridge */}
                <div className="flex items-center justify-center py-4">
                  <div className="h-12 w-0.5 bg-gradient-to-b from-violet-500 to-teal-500" />
                </div>

                {/* 5. Horizons (Related) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
                      <Network size={20} />
                      <h5 className="text-xs font-black uppercase tracking-[0.2em]">{t.lineage.scientificHorizons}</h5>
                    </div>
                    {selectedPaper.related_works && selectedPaper.related_works.length > 0 && (
                      <span className="text-[10px] font-black bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full">
                        {selectedPaper.related_works.length} {t.lineage.worksMapped}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPaper.related_works && selectedPaper.related_works.length > 0 ? (
                      selectedPaper.related_works.slice(0, 20).map((link, i) => (
                        <a 
                          key={i} 
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20 transition-colors group"
                          aria-label={`View related work on OpenAlex`}
                        >
                          <div className="h-6 w-6 rounded-lg bg-fuchsia-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                            <ArrowRight size={12} />
                          </div>
                          <span className="text-[10px] font-mono text-fuchsia-700 dark:text-fuchsia-400 truncate">OpenAlex: {link.split('/').pop()}</span>
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400 italic col-span-full py-4 text-center bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl">{t.lineage.noRelated}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">{t.lineage.selectPaperPrompt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

