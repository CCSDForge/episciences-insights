'use client';

import React from 'react';
import { Publication } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FlaskConical, Map as MapIcon, Search, ChevronDown, Library, BookOpen, Globe, Wallet, BarChart3 } from 'lucide-react';

import WorldMap from './WorldMap';
import SdgRadar from './SdgRadar';
import TopicTreeMap from './TopicTreeMap';
import CollaborationWeb from './CollaborationWeb';
import ResearchLineage from './ResearchLineage';
import FunderSynergy from './FunderSynergy';
import UsageAnalytics from './UsageAnalytics';
import { DashboardProvider, useDashboard } from './DashboardContext';

interface DashboardProps {
  initialData: Publication[];
  usageSummary: any | null;
}

export default function Dashboard({ initialData, usageSummary }: DashboardProps) {
  return (
    <DashboardProvider initialData={initialData} usageSummary={usageSummary}>
      <DashboardContent />
    </DashboardProvider>
  );
}

function DashboardContent() {
  const { state, actions, data, meta } = useDashboard();
  const { activeTab, yearFilter, funderFilter, journalFilter, funderLimit, institutionLimit, topicDomainFilter, isFunderOpen, funderSearch } = state;
  const { setActiveTab, setYearFilter, setFunderFilter, setJournalFilter, setFunderLimit, setInstitutionLimit, setTopicDomainFilter, setIsFunderOpen, setFunderSearch } = actions;
  const { filteredData, usageSummary, stats, sdgData, funderData, institutionData, countryData, topicData, topicDomains, years, groupedFunders, journals } = data;
  const { dropdownRef } = meta;

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <section aria-label="Filters" className="flex flex-wrap gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex flex-col gap-3">
          <label htmlFor="filter-year" className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Publication Year
          </label>
          <div className="relative">
            <select
              id="filter-year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="min-w-[140px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="filter-journal" className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Journal / Source
          </label>
          <div className="relative">
            <select
              id="filter-journal"
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="min-w-[240px] max-w-[300px] appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none w-full"
            >
              <option value="all">All Journals</option>
              {journals.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[320px] flex-1 relative" ref={dropdownRef}>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Search Research Funder
          </label>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isFunderOpen}
              onClick={() => setIsFunderOpen(!isFunderOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all text-left"
            >
              <span className="truncate">{funderFilter === 'all' ? 'All Funders' : funderFilter}</span>
              <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isFunderOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFunderOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Type to filter list..."
                      value={funderSearch}
                      onChange={(e) => setFunderSearch(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>
                <ul role="listbox" className="max-h-[400px] overflow-y-auto py-2 text-sm scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                  <li
                    role="option"
                    aria-selected={funderFilter === 'all'}
                    onClick={() => { setFunderFilter('all'); setIsFunderOpen(false); setFunderSearch(''); }}
                    className={`px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer font-black border-b border-zinc-50 dark:border-zinc-800 transition-colors uppercase text-[10px] tracking-widest ${funderFilter === 'all' ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/10' : 'text-zinc-900 dark:text-zinc-100'}`}
                  >
                    All Funders
                  </li>
                  {Object.entries(groupedFunders).map(([letter, list]) => (
                    <React.Fragment key={letter}>
                      <li className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest text-zinc-400 sticky top-0 z-10 backdrop-blur-sm border-y border-zinc-100 dark:border-zinc-800">
                        {letter}
                      </li>
                      {list.map(f => (
                        <li
                          key={f}
                          role="option"
                          aria-selected={funderFilter === f}
                          onClick={() => { setFunderFilter(f); setIsFunderOpen(false); setFunderSearch(''); }}
                          className={`px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors border-l-4 ${funderFilter === f ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-bold' : 'border-transparent text-zinc-700 dark:text-zinc-300'}`}
                        >
                          {f}
                        </li>
                      ))}
                    </React.Fragment>
                  ))}
                  {Object.keys(groupedFunders).length === 0 && (
                    <li className="px-4 py-8 text-center text-zinc-400 italic">No funders found matching your search</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Global Dynamic KPIs */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              <BookOpen size={18} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Publications</p>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-zinc-50">{formatNum(stats.totalPubs)}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
              <Globe size={18} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">SDGs Impacted</p>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-zinc-50">{formatNum(stats.totalSdgs)}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Wallet size={18} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Funding Agencies</p>
          </div>
          <p className="mt-3 text-3xl font-black text-zinc-900 dark:text-zinc-50">{formatNum(stats.totalFunders)}</p>
        </div>
      </section>

      {/* Modern Tabs with WAI-ARIA and Fading Scroll */}
      <div className="sticky top-0 z-20 -mx-6 mb-8 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="fade-scroll-x overflow-x-auto scrollbar-hide flex justify-center">
          <nav role="tablist" aria-label="Dashboard Views" className="flex py-4 px-6 gap-2">
            <button
              id="tab-usage"
              role="tab"
              aria-selected={activeTab === 'usage'}
              aria-controls="panel-usage"
              onClick={() => setActiveTab('usage')}
              className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap ${
                activeTab === 'usage'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BarChart3 size={16} /> Usage Analytics
            </button>
            <button
              id="tab-funder"
              role="tab"
              aria-selected={activeTab === 'funder'}
              aria-controls="panel-funder"
              onClick={() => setActiveTab('funder')}
              className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap ${
                activeTab === 'funder'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FlaskConical size={16} /> Funder Impact
            </button>
            <button
              id="tab-journal"
              role="tab"
              aria-selected={activeTab === 'journal'}
              aria-controls="panel-journal"
              onClick={() => setActiveTab('journal')}
              className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap ${
                activeTab === 'journal'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MapIcon size={16} /> Global Reach
            </button>
            <button
              id="tab-topics"
              role="tab"
              aria-selected={activeTab === 'topics'}
              aria-controls="panel-topics"
              onClick={() => setActiveTab('topics')}
              className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap ${
                activeTab === 'topics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Library size={16} /> Research Landscape
            </button>
            <button
              id="tab-lineage"
              role="tab"
              aria-selected={activeTab === 'lineage'}
              aria-controls="panel-lineage"
              onClick={() => setActiveTab('lineage')}
              className={`flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap ${
                activeTab === 'lineage'
                  ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Search size={16} /> Research Lineage
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[600px] focus:outline-none">
        {activeTab === 'usage' && (
          <section id="panel-usage" role="tabpanel" aria-labelledby="tab-usage" className="animate-in fade-in duration-500">
            <UsageAnalytics />
          </section>
        )}
        {activeTab === 'topics' && (
          <section id="panel-topics" role="tabpanel" aria-labelledby="tab-topics" className="space-y-10 animate-in fade-in duration-500">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-zinc-100 pb-8 dark:border-zinc-800">
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Research Landscape</h3>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-2">Interactive Treemap of Domains & Fields</span>
                </div>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="topic-domain-select" className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      Filter by Domain
                    </label>
                    <select
                      id="topic-domain-select"
                      value={topicDomainFilter}
                      onChange={(e) => setTopicDomainFilter(e.target.value)}
                      className="min-w-[220px] rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 outline-none"
                    >
                      <option value="all">All Domains</option>
                      {topicDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-12 h-[500px] min-h-[500px] w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <TopicTreeMap
                  data={filteredData.filter(p => topicDomainFilter === 'all' || p.primary_topic?.domain === topicDomainFilter)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {topicData.map((topic, idx) => (
                  <div
                    key={topic.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-50/50 p-5 ring-1 ring-zinc-200 transition-all hover:bg-white hover:shadow-xl hover:ring-indigo-200 dark:bg-zinc-800/30 dark:ring-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:ring-indigo-900"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-500 transition-colors">#{idx + 1}</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700">
                        {formatNum(topic.count)} <span className="text-zinc-400 font-bold ml-0.5">pub.</span>
                      </span>
                    </div>
                    <h4 className="mb-3 text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                      {topic.name}
                    </h4>
                    <div className="space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
                      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        {topic.field}
                      </p>
                      <p className="text-[9px] font-medium text-zinc-400 italic truncate">{topic.domain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'funder' && (
          <section id="panel-funder" role="tabpanel" aria-labelledby="tab-funder" className="flex flex-col gap-10 animate-in fade-in duration-500">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">SDG Impact Profile</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Alignment with UN Sustainable Development Goals</p>
                </div>
                <div className="w-full border border-zinc-100 rounded-3xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                  <SdgRadar data={filteredData.flatMap(p => p.sdgs)} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">SDG Distribution</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Total matching records per goal</p>
                </div>
                <div className="h-[500px] w-full border border-zinc-100 rounded-3xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sdgData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={220}
                        tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
                        labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
                        itemStyle={{ color: '#0D9488', fontWeight: '700' }}
                        cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                      />
                      <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <FunderSynergy data={filteredData} />

            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-heading">Volume by Research Funder</h3>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                  <button onClick={() => setFunderLimit(50)} aria-label="Show top 50 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-l-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${funderLimit === 50 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 50</button>
                  <button onClick={() => setFunderLimit(100)} aria-label="Show top 100 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-600 transition-all ${funderLimit === 100 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 100</button>
                  <button onClick={() => setFunderLimit(500)} aria-label="Show top 500 funders" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-r-lg transition-all ${funderLimit === 500 ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 500</button>
                </div>
              </div>
              <div className="overflow-y-auto overflow-x-hidden pr-2 border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30" style={{ height: '600px' }}>
                <div style={{ height: `${Math.max(400, funderData.length * 40)}px`, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funderData} layout="vertical" margin={{ left: 20, right: 40, top: 20, bottom: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={260}
                        tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 600, className: 'text-zinc-700 dark:text-zinc-300' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: '#ffffff' }}
                        labelStyle={{ color: '#111827', fontWeight: '800', marginBottom: '8px', fontSize: '14px' }}
                        itemStyle={{ color: '#0D9488', fontWeight: '700' }}
                        cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                      />
                      <Bar dataKey="value" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'journal' && (
          <section id="panel-journal" role="tabpanel" aria-labelledby="tab-journal" className="space-y-12 animate-in fade-in duration-500">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
              <h3 className="mb-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Global Reach: Author Affiliations</h3>
              <div className="h-[600px] w-full border border-zinc-100 rounded-xl dark:border-zinc-800 p-4 bg-zinc-50/30 dark:bg-zinc-950/30 mb-8">
                <WorldMap data={countryData} />
              </div>
              <div className="w-full border border-zinc-100 rounded-xl dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 overflow-hidden">
                <CollaborationWeb data={filteredData} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Top Contributing Institutions</h3>
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">Deduplicated by ROR identifier</span>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
                  <button onClick={() => setInstitutionLimit(100)} aria-label="Show top 100 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-l-lg border-r border-zinc-200 dark:border-zinc-600 transition-all ${institutionLimit === 100 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 100</button>
                  <button onClick={() => setInstitutionLimit(500)} aria-label="Show top 500 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-600 transition-all ${institutionLimit === 500 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 500</button>
                  <button onClick={() => setInstitutionLimit(1000)} aria-label="Show top 1000 institutions" className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-r-lg transition-all ${institutionLimit === 1000 ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Top 1000</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
                {institutionData.map((inst, idx) => (
                  <div key={inst.ror || inst.name} className="flex items-center justify-between border-b border-zinc-50 py-3 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors px-2 rounded-lg">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-sans">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans" title={inst.name}>{inst.name}</p>
                        {inst.ror ? (
                          <a
                            href={inst.ror.startsWith('http') ? inst.ror : `https://ror.org/${inst.ror}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase truncate hover:underline flex items-center gap-1"
                          >
                            {inst.ror.split('/').pop()}
                          </a>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">No ROR available</span>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs font-black text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md font-sans">{formatNum(inst.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'lineage' && (
          <section id="panel-lineage" role="tabpanel" aria-labelledby="tab-lineage" className="space-y-10 animate-in fade-in duration-500">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <h3 className="mb-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">Research Lineage</h3>
              <ResearchLineage data={filteredData} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
