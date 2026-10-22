'use client';

import React, { createContext, use, useState, useMemo, useCallback } from 'react';
import { Publication, UsageSummary, FundersFile } from '@/lib/types';
import { normalizeLicense } from '@/lib/licenses';
import { getCountryName } from '@/lib/countryNames';

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

export interface InstitutionItem {
  id: string;
  name: string;
  ror: string | null;
  country: string | null;
  count: number;
  affiliationsCount: number;
}

export interface PeerReviewDelayStats {
  validCount: number;
  medianDays: number;
  medianMonths: number;
  averageMonths: number;
  byRange: { range: string; count: number; percentage: number }[];
  byYear: { year: string; count: number; medianMonths: number }[];
}

interface DashboardState {
  yearFilter: string;
  funderFilter: string;
  journalFilter: string;
  institutionFilter: string;
  funderLimit: 50 | 100 | 500;
  institutionLimit: 100 | 500 | 1000;
  countryLimit: 10 | 25 | 50;
  topicLimit: 100 | 500;
  topicDomainFilter: string;
}

interface DashboardActions {
  setYearFilter: (year: string) => void;
  setFunderFilter: (funder: string) => void;
  setJournalFilter: (journal: string) => void;
  setInstitutionFilter: (institution: string) => void;
  resetFilters: () => void;
  setFunderLimit: (limit: 50 | 100 | 500) => void;
  setInstitutionLimit: (limit: 100 | 500 | 1000) => void;
  setCountryLimit: (limit: 10 | 25 | 50) => void;
  setTopicLimit: (limit: 100 | 500) => void;
  setTopicDomainFilter: (domain: string) => void;
}

interface DashboardData {
  filteredData: Publication[];
  usageSummary: UsageSummary | null;
  funders: FundersFile;
  stats: { totalPubs: number; totalSdgs: number; totalFunders: number };
  sdgData: { name: string; value: number }[];
  funderData: { name: string; value: number }[];
  institutionData: { name: string; count: number; ror: string | null }[];
  institutionsList: InstitutionItem[];
  peerReviewStats: PeerReviewDelayStats;
  countryData: { name: string; value: number }[];
  topCountriesData: TopCountryEntry[];
  globalReachStats: GlobalReachStats;
  topicData: { name: string; count: number; domain: string; field: string; id: string }[];
  topicDomains: string[];
  years: string[];
  allFunders: string[];
  journals: [string, string][];
  initialData: Publication[];
  platformFilteredData: Publication[];
  platformPeerReviewStats: PeerReviewDelayStats;
  openScienceStats: {
    totalLicenseMentions: number;
    topLicenses: { name: string; count: number }[];
    totalRepositories: number;
    totalWithDatasets: number;
    totalDatasets: number;
    totalWithSoftware: number;
    totalSoftware: number;
    totalWithArtifacts: number;
  };
}

interface DashboardContextValue {
  state: DashboardState;
  actions: DashboardActions;
  data: DashboardData;
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
  funders?: FundersFile;
  children: React.ReactNode;
}

function computePeerReviewStats(dataset: Publication[]): PeerReviewDelayStats {
  const valid: { days: number; months: number; year: number }[] = [];
  dataset.forEach(p => {
    const s = p.episciences?.first_submission_date;
    const pub = p.episciences?.publication_date;
    if (!s || !pub) return;
    const ds = new Date(s).getTime();
    const dp = new Date(pub).getTime();
    if (isNaN(ds) || isNaN(dp) || ds > dp) return;
    const days = Math.round((dp - ds) / (1000 * 60 * 60 * 24));
    valid.push({ days, months: Math.round((days / 30.4375) * 10) / 10, year: p.year });
  });

  if (valid.length === 0) {
    return {
      validCount: 0,
      medianDays: 0,
      medianMonths: 0,
      averageMonths: 0,
      byRange: [],
      byYear: [],
    };
  }

  valid.sort((a, b) => a.days - b.days);
  const medianDays = valid[Math.floor(valid.length / 2)].days;
  const medianMonths = Math.round((medianDays / 30.4375) * 10) / 10;
  const totalDays = valid.reduce((acc, v) => acc + v.days, 0);
  const averageMonths = Math.round((totalDays / valid.length / 30.4375) * 10) / 10;

  const rangeBins = [
    { range: '< 3 mois', min: 0, max: 90 },
    { range: '3-6 mois', min: 90, max: 180 },
    { range: '6-12 mois', min: 180, max: 365 },
    { range: '1-2 ans', min: 365, max: 730 },
    { range: '> 2 ans', min: 730, max: Infinity },
  ];

  const byRange = rangeBins.map(bin => {
    const count = valid.filter(v => v.days >= bin.min && v.days < bin.max).length;
    const percentage = Math.round((count / valid.length) * 1000) / 10;
    return { range: bin.range, count, percentage };
  });

  const yearGroups: Record<string, number[]> = {};
  valid.forEach(v => {
    const y = v.year.toString();
    if (!yearGroups[y]) yearGroups[y] = [];
    yearGroups[y].push(v.days);
  });

  const byYear = Object.entries(yearGroups)
    .map(([year, daysList]) => {
      daysList.sort((a, b) => a - b);
      const mDays = daysList[Math.floor(daysList.length / 2)];
      return {
        year,
        count: daysList.length,
        medianMonths: Math.round((mDays / 30.4375) * 10) / 10,
      };
    })
    .sort((a, b) => a.year.localeCompare(b.year));

  return {
    validCount: valid.length,
    medianDays,
    medianMonths,
    averageMonths,
    byRange,
    byYear,
  };
}

export function DashboardProvider({ initialData, usageSummary, funders = {}, children }: DashboardProviderProps) {
  const [yearFilter, setYearFilter] = useState('all');
  const [funderFilter, setFunderFilter] = useState('all');
  const [journalFilter, setJournalFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [funderLimit, setFunderLimit] = useState<50 | 100 | 500>(50);
  const [institutionLimit, setInstitutionLimit] = useState<100 | 500 | 1000>(100);
  const [countryLimit, setCountryLimit] = useState<10 | 25 | 50>(10);
  const [topicLimit, setTopicLimit] = useState<100 | 500>(100);
  const [topicDomainFilter, setTopicDomainFilter] = useState('all');

  const resetFilters = useCallback(() => {
    setYearFilter('all');
    setJournalFilter('all');
    setFunderFilter('all');
    setInstitutionFilter('all');
  }, []);

  // Map of journal code/issn to canonical name
  const journalIdToName = useMemo(() => {
    const map = new Map<string, string>();
    initialData.forEach(p => {
      const name = p.journal.name?.replace(/\s+/g, ' ').trim();
      if (!name) return;
      if (p.journal.code) map.set(p.journal.code, name);
      if (p.journal.issn) map.set(p.journal.issn, name);
    });
    return map;
  }, [initialData]);

  const filteredData = useMemo(() => {
    const selectedJournalName = journalFilter !== 'all' ? journalIdToName.get(journalFilter) : null;
    return initialData.filter(p => {
      const yearMatch = yearFilter === 'all' || p.year.toString() === yearFilter;
      const journalMatch =
        journalFilter === 'all' ||
        p.journal.code === journalFilter ||
        p.journal.issn === journalFilter ||
        p.journal.name === journalFilter ||
        (selectedJournalName && p.journal.name?.replace(/\s+/g, ' ').trim() === selectedJournalName);
      const institutionMatch = institutionFilter === 'all' || p.authors.some(a =>
        a.institutions.some(inst => (inst.ror && inst.ror === institutionFilter) || inst.name === institutionFilter)
      );
      return yearMatch && journalMatch && institutionMatch;
    });
  }, [initialData, yearFilter, journalFilter, institutionFilter, journalIdToName]);

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

  const allFunders = useMemo(() => {
    return Array.from(new Set(initialData.flatMap(p => p.awards.map(a => a.funder))))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [initialData]);

  const journals = useMemo(() => {
    const idToNames = new Map<string, Map<string, number>>();

    initialData.forEach((p) => {
      const name = p.journal.name?.replace(/\s+/g, ' ').trim();
      if (!name) return;
      const id = p.journal.code || p.journal.issn || name;
      if (!idToNames.has(id)) {
        idToNames.set(id, new Map());
      }
      const counts = idToNames.get(id)!;
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    return Array.from(idToNames.entries())
      .map(([id, counts]) => {
        const bestName = Array.from(counts.entries()).sort(
          (a, b) => b[1] - a[1] || b[0].length - a[0].length
        )[0][0];
        return [id, bestName] as [string, string];
      })
      .sort((a, b) => a[1].localeCompare(b[1]));
  }, [initialData]);

  const openScienceStats = useMemo(() => {
    const licenseCounts: Record<string, number> = {};
    const repositories = new Set<string>();
    let totalWithDatasets = 0;
    let totalDatasets = 0;
    let totalWithSoftware = 0;
    let totalSoftware = 0;
    let totalWithArtifacts = 0;

    filteredData.forEach(p => {
      const os = p.open_science;
      if (os?.linked_outputs) {
        const dsCount = os.linked_outputs.datasets?.length || 0;
        const swCount = os.linked_outputs.software?.length || 0;
        if (dsCount > 0) {
          totalWithDatasets++;
          totalDatasets += dsCount;
        }
        if (swCount > 0) {
          totalWithSoftware++;
          totalSoftware += swCount;
        }
        if (dsCount > 0 || swCount > 0) {
          totalWithArtifacts++;
        }
      }

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

    return {
      totalLicenseMentions,
      topLicenses,
      totalRepositories: repositories.size,
      totalWithDatasets,
      totalDatasets,
      totalWithSoftware,
      totalSoftware,
      totalWithArtifacts,
    };
  }, [filteredData]);

  const institutionsList = useMemo(() => {
    const map = new Map<string, InstitutionItem>();
    initialData.forEach(p => {
      const seenInPub = new Set<string>();
      p.authors.forEach(a => {
        a.institutions.forEach(inst => {
          const id = inst.ror || inst.name;
          if (!id) return;
          let entry = map.get(id);
          if (!entry) {
            entry = {
              id,
              name: inst.name,
              ror: inst.ror,
              country: inst.country,
              count: 0,
              affiliationsCount: 0,
            };
            map.set(id, entry);
          }
          entry.affiliationsCount += 1;
          if (!seenInPub.has(id)) {
            seenInPub.add(id);
            entry.count += 1;
          }
        });
      });
    });
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || b.affiliationsCount - a.affiliationsCount || a.name.localeCompare(b.name)
    );
  }, [initialData]);

  const platformFilteredData = useMemo(() => initialData.filter(p => {
    return yearFilter === 'all' || p.year.toString() === yearFilter;
  }), [initialData, yearFilter]);

  const platformPeerReviewStats = useMemo(() => computePeerReviewStats(platformFilteredData), [platformFilteredData]);
  const peerReviewStats = useMemo(() => computePeerReviewStats(filteredData), [filteredData]);

  return (
    <DashboardContext value={{
      state: { yearFilter, funderFilter, journalFilter, institutionFilter, funderLimit, institutionLimit, countryLimit, topicLimit, topicDomainFilter },
      actions: { setYearFilter, setFunderFilter, setJournalFilter, setInstitutionFilter, resetFilters, setFunderLimit, setInstitutionLimit, setCountryLimit, setTopicLimit, setTopicDomainFilter },
      data: { initialData, filteredData, platformFilteredData, platformPeerReviewStats, usageSummary, funders, stats, sdgData, funderData, institutionData, institutionsList, peerReviewStats, countryData, topCountriesData, globalReachStats, topicData, topicDomains, years, allFunders, journals, openScienceStats },
    }}>
      {children}
    </DashboardContext>
  );
}
