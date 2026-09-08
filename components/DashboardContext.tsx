'use client';

import React, { createContext, use, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Publication, UsageSummary } from '@/lib/types';
import { normalizeLicense } from '@/lib/licenses';
import { getCountryName } from '@/lib/countryNames';

type ActiveTab = 'funder' | 'journal' | 'raw' | 'topics' | 'lineage' | 'usage';

// Near-universal on this corpus (Episciences itself, plus OpenAIRE's catch-all
// for an instance with no resolvable host) — excluded from the repository
// count so it reflects actual archival diversity, not a constant offset.
const TRIVIAL_REPOSITORIES = new Set(['Episciences', 'Unknown Repository']);

export interface TopCountryEntry {
  code: string;
  name: string;
  value: number;
  percentage: number;
}

export interface GlobalReachStats {
  totalCountries: number;
  totalInstitutions: number;
  intlCollabCount: number;
  intlCollabRate: number;
  singleCountryCount: number;
}

interface DashboardState {
  activeTab: ActiveTab;
  yearFilter: string;
  funderFilter: string;
  journalFilter: string;
  funderLimit: 50 | 100 | 500;
  institutionLimit: 100 | 500 | 1000;
  countryLimit: 10 | 25 | 50;
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
  resetFilters: () => void;
  setFunderLimit: (limit: 50 | 100 | 500) => void;
  setInstitutionLimit: (limit: 100 | 500 | 1000) => void;
  setCountryLimit: (limit: 10 | 25 | 50) => void;
  setTopicLimit: (limit: 100 | 500) => void;
  setTopicDomainFilter: (domain: string) => void;
  setIsFunderOpen: (open: boolean) => void;
  setFunderSearch: (search: string) => void;
}

interface DashboardData {
  filteredData: Publication[];
  usageSummary: UsageSummary | null;
  stats: { totalPubs: number; totalSdgs: number; totalFunders: number };
  sdgData: { name: string; value: number }[];
  funderData: { name: string; value: number }[];
  institutionData: { name: string; count: number; ror: string | null }[];
  countryData: { name: string; value: number }[];
  topCountriesData: TopCountryEntry[];
  globalReachStats: GlobalReachStats;
  topicData: { name: string; count: number; domain: string; field: string; id: string }[];
  topicDomains: string[];
  years: string[];
  groupedFunders: Record<string, string[]>;
  journals: [string, string][];
  openScienceStats: {
    totalLicenseMentions: number;
    topLicenses: { name: string; count: number }[];
    totalRepositories: number;
  };
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
  usageSummary: UsageSummary | null;
  children: React.ReactNode;
}

export function DashboardProvider({ initialData, usageSummary, children }: DashboardProviderProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('usage');
  const [yearFilter, setYearFilter] = useState('all');
  const [funderFilter, setFunderFilter] = useState('all');
  const [journalFilter, setJournalFilter] = useState('all');
  const [funderLimit, setFunderLimit] = useState<50 | 100 | 500>(50);
  const [institutionLimit, setInstitutionLimit] = useState<100 | 500 | 1000>(100);
  const [countryLimit, setCountryLimit] = useState<10 | 25 | 50>(10);
  const [topicLimit, setTopicLimit] = useState<100 | 500>(100);
  const [topicDomainFilter, setTopicDomainFilter] = useState('all');
  const [isFunderOpen, setIsFunderOpen] = useState(false);
  const [funderSearch, setFunderSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resetFilters = useCallback(() => {
    setYearFilter('all');
    setJournalFilter('all');
    setFunderFilter('all');
  }, []);

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
    const journalMatch = journalFilter === 'all' || p.journal.code === journalFilter || p.journal.issn === journalFilter || p.journal.name === journalFilter;
    return yearMatch && journalMatch;
  }), [initialData, yearFilter, journalFilter]);

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

  const { countryData, topCountriesData, globalReachStats } = useMemo(() => {
    const counts: Record<string, number> = {};
    const institutionKeys = new Set<string>();
    let intlCollabCount = 0;
    let singleCountryCount = 0;

    filteredData.forEach(p => {
      const countriesInPub = new Set<string>();
      p.authors.forEach(a => {
        a.institutions.forEach(inst => {
          const key = inst.ror || inst.name;
          if (key) institutionKeys.add(key);
          if (inst.country) {
            countriesInPub.add(inst.country.toUpperCase());
          }
        });
      });

      if (countriesInPub.size >= 2) {
        intlCollabCount++;
      } else if (countriesInPub.size === 1) {
        singleCountryCount++;
      }

      countriesInPub.forEach(country => {
        counts[country] = (counts[country] || 0) + 1;
      });
    });

    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const totalPubs = filteredData.length || 1;

    const countryData = sortedEntries.map(([name, value]) => ({ name, value }));

    const topCountriesData: TopCountryEntry[] = sortedEntries.map(([code, value]) => ({
      code,
      name: getCountryName(code),
      value,
      percentage: Math.round((value / totalPubs) * 1000) / 10,
    }));

    const globalReachStats: GlobalReachStats = {
      totalCountries: sortedEntries.length,
      totalInstitutions: institutionKeys.size,
      intlCollabCount,
      intlCollabRate: Math.round((intlCollabCount / totalPubs) * 1000) / 10,
      singleCountryCount,
    };

    return { countryData, topCountriesData, globalReachStats };
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
      if (name) unique.set(p.journal.code || p.journal.issn || name, name);
    });
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [initialData]);

  const openScienceStats = useMemo(() => {
    const licenseCounts: Record<string, number> = {};
    const repositories = new Set<string>();

    filteredData.forEach(p => {
      const os = p.open_science;
      if (!os?.found_in_openaire) return;
      (os.licenses || []).forEach(l => {
        const name = normalizeLicense(l);
        licenseCounts[name] = (licenseCounts[name] || 0) + 1;
      });
      (os.hosted_repositories || []).forEach(r => {
        if (r && !TRIVIAL_REPOSITORIES.has(r)) repositories.add(r);
      });
    });

    const sorted = Object.entries(licenseCounts).sort((a, b) => b[1] - a[1]);
    const totalLicenseMentions = sorted.reduce((sum, [, count]) => sum + count, 0);

    // Cap at 7 named segments + a folded remainder — the token ceiling for
    // a categorical/ordinal chart before it stops being readable at a glance.
    const TOP_N = 7;
    const topLicenses = sorted.slice(0, TOP_N).map(([name, count]) => ({ name, count }));
    const tailCount = sorted.slice(TOP_N).reduce((sum, [, count]) => sum + count, 0);
    if (tailCount > 0) {
      topLicenses.push({ name: `+${sorted.length - TOP_N} more licenses`, count: tailCount });
    }

    return { totalLicenseMentions, topLicenses, totalRepositories: repositories.size };
  }, [filteredData]);

  return (
    <DashboardContext value={{
      state: { activeTab, yearFilter, funderFilter, journalFilter, funderLimit, institutionLimit, countryLimit, topicLimit, topicDomainFilter, isFunderOpen, funderSearch },
      actions: { setActiveTab, setYearFilter, setFunderFilter, setJournalFilter, resetFilters, setFunderLimit, setInstitutionLimit, setCountryLimit, setTopicLimit, setTopicDomainFilter, setIsFunderOpen, setFunderSearch },
      data: { filteredData, usageSummary, stats, sdgData, funderData, institutionData, countryData, topCountriesData, globalReachStats, topicData, topicDomains, years, groupedFunders, journals, openScienceStats },
      meta: { dropdownRef },
    }}>
      {children}
    </DashboardContext>
  );
}
