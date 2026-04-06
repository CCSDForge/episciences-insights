'use client';

import React, { createContext, use, useState, useMemo, useRef, useEffect } from 'react';
import { Publication } from '@/lib/types';

type ActiveTab = 'funder' | 'journal' | 'raw' | 'topics' | 'lineage' | 'usage';

interface DashboardState {
  activeTab: ActiveTab;
  yearFilter: string;
  funderFilter: string;
  journalFilter: string;
  funderLimit: 50 | 100 | 500;
  institutionLimit: 100 | 500 | 1000;
  topicLimit: 100 | 500;
  topicDomainFilter: string;
  isFunderOpen: boolean;
  funderSearch: string;
}

interface DashboardActions {
  setActiveTab: (tab: ActiveTab) => void;
  setYearFilter: (year: string) => void;
  setFunderFilter: (funder: string) => void;
  setJournalFilter: (journal: string) => void;
  setFunderLimit: (limit: 50 | 100 | 500) => void;
  setInstitutionLimit: (limit: 100 | 500 | 1000) => void;
  setTopicLimit: (limit: 100 | 500) => void;
  setTopicDomainFilter: (domain: string) => void;
  setIsFunderOpen: (open: boolean) => void;
  setFunderSearch: (search: string) => void;
}

interface DashboardData {
  filteredData: Publication[];
  usageSummary: any | null;
  stats: { totalPubs: number; totalSdgs: number; totalFunders: number };
  sdgData: { name: string; value: number }[];
  funderData: { name: string; value: number }[];
  institutionData: { name: string; count: number; ror: string | null }[];
  countryData: { name: string; value: number }[];
  topicData: { name: string; count: number; domain: string; field: string; id: string }[];
  topicDomains: string[];
  years: string[];
  groupedFunders: Record<string, string[]>;
  journals: [string, string][];
}

interface DashboardMeta {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

interface DashboardContextValue {
  state: DashboardState;
  actions: DashboardActions;
  data: DashboardData;
  meta: DashboardMeta;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = use(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

interface DashboardProviderProps {
  initialData: Publication[];
  usageSummary: any | null;
  children: React.ReactNode;
}

export function DashboardProvider({ initialData, usageSummary, children }: DashboardProviderProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('usage');
  const [yearFilter, setYearFilter] = useState('all');
  const [funderFilter, setFunderFilter] = useState('all');
  const [journalFilter, setJournalFilter] = useState('all');
  const [funderLimit, setFunderLimit] = useState<50 | 100 | 500>(50);
  const [institutionLimit, setInstitutionLimit] = useState<100 | 500 | 1000>(100);
  const [topicLimit, setTopicLimit] = useState<100 | 500>(100);
  const [topicDomainFilter, setTopicDomainFilter] = useState('all');
  const [isFunderOpen, setIsFunderOpen] = useState(false);
  const [funderSearch, setFunderSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFunderOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = useMemo(() => initialData.filter(p => {
    const yearMatch = yearFilter === 'all' || p.year.toString() === yearFilter;
    const funderMatch = funderFilter === 'all' || p.awards.some(a => a.funder === funderFilter);
    const journalMatch = journalFilter === 'all' || p.journal.issn === journalFilter || p.journal.name === journalFilter;
    return yearMatch && funderMatch && journalMatch;
  }), [initialData, yearFilter, funderFilter, journalFilter]);

  const stats = useMemo(() => ({
    totalPubs: filteredData.length,
    totalSdgs: new Set(filteredData.flatMap(p => p.sdgs.map(s => s.id))).size,
    totalFunders: new Set(filteredData.flatMap(p => p.awards.map(a => a.funder))).size,
  }), [filteredData]);

  const sdgData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(p => p.sdgs.forEach(s => { counts[s.label] = (counts[s.label] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const funderData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(p => p.awards.forEach(a => { counts[a.funder] = (counts[a.funder] || 0) + 1; }));
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, funderLimit);
  }, [filteredData, funderLimit]);

  const institutionData = useMemo(() => {
    const counts: Record<string, { name: string; count: number; ror: string | null }> = {};
    filteredData.forEach(p => {
      p.authors.forEach(a => {
        a.institutions.forEach(inst => {
          const key = inst.ror || inst.name;
          if (!counts[key]) counts[key] = { name: inst.name, count: 0, ror: inst.ror };
          counts[key].count += 1;
        });
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, institutionLimit);
  }, [filteredData, institutionLimit]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(p => {
      const countriesInPub = new Set<string>();
      p.authors.forEach(a => a.institutions.forEach(inst => {
        if (inst.country) countriesInPub.add(inst.country.toUpperCase());
      }));
      countriesInPub.forEach(country => { counts[country] = (counts[country] || 0) + 1; });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const topicData = useMemo(() => {
    const counts: Record<string, { name: string; count: number; domain: string; field: string; id: string }> = {};
    filteredData.forEach(p => {
      if (!p.primary_topic) return;
      const domain = p.primary_topic.domain || 'Unknown';
      if (topicDomainFilter !== 'all' && domain !== topicDomainFilter) return;
      const key = p.primary_topic.id;
      if (!counts[key]) counts[key] = { name: p.primary_topic.name, count: 0, domain, field: p.primary_topic.field || 'Unknown', id: p.primary_topic.id };
      counts[key].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, topicLimit);
  }, [filteredData, topicLimit, topicDomainFilter]);

  const topicDomains = useMemo(() => {
    const domains = new Set<string>();
    initialData.forEach(p => { if (p.primary_topic?.domain) domains.add(p.primary_topic.domain); });
    return Array.from(domains).sort();
  }, [initialData]);

  const years = useMemo(
    () => Array.from(new Set(initialData.map(p => p.year.toString()))).sort().reverse(),
    [initialData]
  );

  const groupedFunders = useMemo(() => {
    const uniqueFunders = Array.from(new Set(initialData.flatMap(p => p.awards.map(a => a.funder))))
      .filter(Boolean)
      .filter(f => f.toLowerCase().includes(funderSearch.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    const groups: Record<string, string[]> = {};
    uniqueFunders.forEach(f => {
      const letter = /^[A-Z]/.test(f[0].toUpperCase()) ? f[0].toUpperCase() : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(f);
    });
    return groups;
  }, [initialData, funderSearch]);

  const journals = useMemo(() => {
    const unique = new Map<string, string>();
    initialData.forEach(p => {
      const name = p.journal.name?.replace(/\s+/g, ' ').trim();
      if (name) unique.set(p.journal.issn || name, name);
    });
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [initialData]);

  return (
    <DashboardContext value={{
      state: { activeTab, yearFilter, funderFilter, journalFilter, funderLimit, institutionLimit, topicLimit, topicDomainFilter, isFunderOpen, funderSearch },
      actions: { setActiveTab, setYearFilter, setFunderFilter, setJournalFilter, setFunderLimit, setInstitutionLimit, setTopicLimit, setTopicDomainFilter, setIsFunderOpen, setFunderSearch },
      data: { filteredData, usageSummary, stats, sdgData, funderData, institutionData, countryData, topicData, topicDomains, years, groupedFunders, journals },
      meta: { dropdownRef },
    }}>
      {children}
    </DashboardContext>
  );
}
