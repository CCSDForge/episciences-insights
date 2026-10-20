'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Library,
  BarChart3,
  Share2,
  Grid3x3,
  Sigma,
  Info,
  Maximize2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useDashboard } from '@/components/DashboardContext';
import TopicTreeMap from '@/components/TopicTreeMap';
import SdgRadar from '@/components/SdgRadar';
import TopicCoOccurrenceNetwork from '@/components/TopicCoOccurrenceNetwork';
import TopicCoOccurrenceMatrix from '@/components/TopicCoOccurrenceMatrix';
import MscCoOccurrenceNetwork from '@/components/MscCoOccurrenceNetwork';
import MscCoOccurrenceMatrix from '@/components/MscCoOccurrenceMatrix';
import FullscreenModal from '@/components/FullscreenModal';
import ChartExportMenu from '@/components/ChartExportMenu';
import ViewSegmentedControl, { ViewOption } from '@/components/ViewSegmentedControl';

type TopicsView = 'overview' | 'topics-network' | 'topics-matrix' | 'msc-network' | 'msc-matrix';

export default function TopicsSection() {
  const { t, locale } = useTranslation();
  const { state, actions, data } = useDashboard();
  const { topicDomainFilter } = state;
  const { setTopicDomainFilter } = actions;
  const { filteredData, topicDomains } = data;

  const [activeView, setActiveView] = useState<TopicsView>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const treemapRef = useRef<HTMLDivElement>(null);
  const sdgRadarRef = useRef<HTMLDivElement>(null);
  const relationalTopicsRef = useRef<HTMLDivElement>(null);

  const treemapData = useMemo(() => {
    const counts: Record<string, { domain: string; field: string; count: number }> = {};
    filteredData.forEach((p) => {
      if (!p.primary_topic) return;
      const domain = p.primary_topic.domain || 'Other';
      const field = p.primary_topic.field || 'Other';
      if (topicDomainFilter !== 'all' && domain !== topicDomainFilter) return;
      const key = `${domain}___${field}`;
      if (!counts[key]) counts[key] = { domain, field, count: 0 };
      counts[key].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredData, topicDomainFilter]);

  const sdgData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.flatMap((p) => p.sdgs).forEach((s) => {
      map[s.id] = (map[s.id] || 0) + 1;
    });
    return Object.entries(map).map(([id, count]) => ({ id, count }));
  }, [filteredData]);

  const TOPICS_VIEWS: ViewOption<TopicsView>[] = [
    { id: 'overview', label: t.dashboard.topicsOverview, icon: <BarChart3 size={15} /> },
    { id: 'topics-network', label: t.dashboard.topicsNetwork, icon: <Share2 size={15} /> },
    { id: 'topics-matrix', label: t.dashboard.topicsMatrix, icon: <Grid3x3 size={15} /> },
    { id: 'msc-network', label: t.dashboard.mscNetwork, icon: <Sigma size={15} /> },
    { id: 'msc-matrix', label: t.dashboard.mscMatrix, icon: <Grid3x3 size={15} /> },
  ];

  return (
    <section id="panel-topics" aria-labelledby="topics-heading" className="space-y-8 animate-in fade-in duration-300">
      {/* Purpose Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--episciences-cyan-00)]/15 via-[var(--episciences-cyan-00)]/5 to-transparent p-6 border border-[var(--episciences-cyan-01)]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)]" aria-hidden="true">
                <Library size={16} />
              </span>
              <h1 id="topics-heading" className="text-base font-black uppercase tracking-wider text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)]">
                {t.dashboard.topicsTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {t.dashboard.topicsDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] shrink-0 bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-[var(--episciences-cyan-01)]/40 dark:border-[var(--episciences-cyan-00)]/40 shadow-xs">
            <span>{t.dashboard.topicsSource}</span>
          </div>
        </div>
      </div>

      {/* Unified View Segmented Control */}
      <ViewSegmentedControl<TopicsView>
        views={TOPICS_VIEWS}
        activeView={activeView}
        onChange={setActiveView}
        ariaLabel="Modes de visualisation des thématiques de recherche"
      />

      {/* View: Overview (Treemap + SDGs) */}
      {activeView === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-zinc-100 pb-8 dark:border-zinc-800">
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.dashboard.researchLandscape}
                </h2>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mt-2">
                  {t.dashboard.interactiveTreemap}
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 max-w-2xl leading-relaxed">
                  {t.dashboard.treemapExplanation}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="topic-domain-select-sec" className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {t.dashboard.filterByDomain}
                    </label>
                    <select
                      id="topic-domain-select-sec"
                      value={topicDomainFilter}
                      onChange={(e) => setTopicDomainFilter(e.target.value)}
                      className="min-w-[220px] rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-xs focus:ring-2 focus:ring-[var(--primary-focus)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none cursor-pointer"
                    >
                      <option value="all">{t.dashboard.allDomains}</option>
                      {topicDomains.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="self-end pb-1">
                    <ChartExportMenu
                      targetRef={treemapRef}
                      data={treemapData}
                      filename={`episciences-topics-treemap-${topicDomainFilter}`}
                      csvColumns={[
                        { key: 'domain', header: 'Domain' },
                        { key: 'field', header: 'Field' },
                        { key: 'count', header: 'Publications_Count' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div ref={treemapRef} className="h-[550px] w-full">
              <TopicTreeMap data={filteredData.filter((p) => topicDomainFilter === 'all' || p.primary_topic?.domain === topicDomainFilter)} />
            </div>
          </div>

          {/* SDG Radar Chart */}
          <div className="rounded-2xl bg-white p-8 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">
                  {t.header.sdgTitle}
                </h2>
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  {locale === 'fr'
                    ? "Alignement avec les 17 Objectifs de Développement Durable de l'ONU"
                    : locale === 'es'
                    ? "Alineación con los 17 Objetivos de Desarrollo Sostenible de la ONU"
                    : "Alignment with the 17 UN Sustainable Development Goals"}
                </p>
              </div>
              <ChartExportMenu
                targetRef={sdgRadarRef}
                data={sdgData}
                filename="episciences-sdg-radar"
                csvColumns={[
                  { key: 'id', header: 'SDG_ID' },
                  { key: 'count', header: 'Publications_Count' },
                ]}
              />
            </div>
            <div ref={sdgRadarRef} className="h-[480px] w-full">
              <SdgRadar data={filteredData.flatMap((p) => p.sdgs)} />
            </div>
          </div>
        </div>
      )}

      {/* Relational Views */}
      {activeView !== 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Methodological Guide */}
          <div className="rounded-xl bg-[var(--episciences-cyan-00)]/10 dark:bg-[var(--episciences-cyan-00)]/15 p-3.5 border border-[var(--episciences-cyan-01)]/30 text-xs text-zinc-600 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info size={16} className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] shrink-0 mt-0.5" />
              <div>
                {activeView === 'topics-network' && (
                  <p><strong>{t.dashboard.topicsNetworkTitle}:</strong> {t.dashboard.topicsNetworkDesc}</p>
                )}
                {activeView === 'topics-matrix' && (
                  <p><strong>{t.dashboard.topicsMatrixTitle}:</strong> {t.dashboard.topicsMatrixDesc}</p>
                )}
                {activeView === 'msc-network' && (
                  <p><strong>{t.dashboard.mscNetworkTitle}:</strong> {t.dashboard.mscNetworkDesc}</p>
                )}
                {activeView === 'msc-matrix' && (
                  <p><strong>{t.dashboard.mscMatrixTitle}:</strong> {t.dashboard.mscMatrixDesc}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <ChartExportMenu
                targetRef={relationalTopicsRef}
                filename={`episciences-topics-${activeView}`}
              />
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 shadow-xs border border-zinc-200/80 dark:border-zinc-700 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                title={t.common.fullscreen}
                aria-label={t.common.fullscreen}
              >
                <Maximize2 size={13} aria-hidden="true" />
                <span className="hidden sm:inline">{t.common.fullscreen}</span>
              </button>
            </div>
          </div>

          <div ref={relationalTopicsRef}>
            {activeView === 'topics-network' && <TopicCoOccurrenceNetwork data={filteredData} />}
            {activeView === 'topics-matrix' && <TopicCoOccurrenceMatrix data={filteredData} />}
            {activeView === 'msc-network' && <MscCoOccurrenceNetwork data={filteredData} />}
            {activeView === 'msc-matrix' && <MscCoOccurrenceMatrix data={filteredData} />}
          </div>
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <FullscreenModal
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          title={
            activeView === 'topics-network' ? t.dashboard.topicsNetwork :
            activeView === 'topics-matrix' ? t.dashboard.topicsMatrix :
            activeView === 'msc-network' ? t.dashboard.mscNetwork :
            t.dashboard.mscMatrix
          }
          subtitle={`${filteredData.length.toLocaleString('en-US')} ${t.common.publications.toLowerCase()}`}
        >
          {activeView === 'topics-network' && <TopicCoOccurrenceNetwork data={filteredData} />}
          {activeView === 'topics-matrix' && <TopicCoOccurrenceMatrix data={filteredData} />}
          {activeView === 'msc-network' && <MscCoOccurrenceNetwork data={filteredData} />}
          {activeView === 'msc-matrix' && <MscCoOccurrenceMatrix data={filteredData} />}
        </FullscreenModal>
      )}
    </section>
  );
}
