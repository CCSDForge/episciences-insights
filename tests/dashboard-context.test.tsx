// @vitest-environment happy-dom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '@/components/DashboardContext';
import type { Publication } from '@/lib/types';

function makePub(overrides: Partial<Publication> = {}): Publication {
  return {
    doi: 'https://doi.org/10.46298/dmtcs.1',
    title: 'Sample Paper',
    year: 2024,
    journal: { name: 'Discrete Mathematics & Theoretical Computer Science', code: 'dmtcs', issn: '1365-8050', id: 'S1' },
    authors: [
      {
        name: 'Alice',
        orcid: null,
        institutions: [{ name: 'CNRS', ror: 'https://ror.org/02feahw73', country: 'FR' }],
      },
      {
        name: 'Bob',
        orcid: null,
        institutions: [
          { name: 'CNRS', ror: 'https://ror.org/02feahw73', country: 'FR' },
          { name: 'MIT', ror: 'https://ror.org/042nb2s44', country: 'US' },
        ],
      },
    ],
    sdgs: [{ id: 'SDG4', label: 'Quality Education', score: 0.9 }],
    awards: [{ name: 'Grant A', id: 'ANR-1', funder: 'ANR', source: 'both' }],
    primary_topic: { id: 'T1', name: 'Graph Theory', subfield: 'Discrete Math', field: 'Mathematics', domain: 'Physical Sciences' },
    topics: [],
    referenced_works_count: 10,
    related_works: [],
    open_science: {
      found_in_openaire: true,
      hosted_repositories: ['Episciences', 'Unknown Repository', 'HAL', 'arXiv'],
      licenses: ['CC BY 4.0', 'https://arxiv.org/licenses/nonexclusive-distrib/1.0'],
      linked_outputs: {
        datasets: [{ pid: '10.5281/zenodo.1' }, { pid: '10.5281/zenodo.2' }],
        software: [{ pid: '10.5281/zenodo.3' }],
      },
    },
    episciences: {
      first_submission_date: '2024-01-01',
      publication_date: '2024-05-01', // ~121 days -> range3to6m
    },
    ...overrides,
  };
}

const sampleDataset: Publication[] = [
  makePub(),
  makePub({
    doi: 'https://doi.org/10.46298/lmcs.2',
    title: 'Logic Paper',
    year: 2023,
    journal: { name: 'Logical Methods in Computer Science', code: 'lmcs', issn: '1860-5974', id: 'S2' },
    authors: [
      {
        name: 'Claire',
        orcid: null,
        institutions: [{ name: 'Inria', ror: 'https://ror.org/02kvxyf05', country: 'FR' }],
      },
    ],
    sdgs: [],
    awards: [{ name: 'Grant B', id: 'ERC-1', funder: 'ERC', source: 'openaire' }],
    primary_topic: { id: 'T2', name: 'Type Theory', subfield: 'Logic', field: 'Computer Science', domain: 'Computer Science' },
    open_science: {
      found_in_openaire: true,
      hosted_repositories: ['HAL'],
      licenses: ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0', 'MIT', 'Apache 2.0', 'GPL-3.0', 'BSD-3-Clause', 'LGPL-3.0'],
    },
    episciences: {
      first_submission_date: '2023-06-01',
      publication_date: '2023-05-01', // inverted -> must be ignored
    },
  }),
];

function createWrapper(initialData?: Publication[]) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DashboardProvider initialData={initialData} usageSummary={null}>
        {children}
      </DashboardProvider>
    );
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('DashboardContext', () => {
  it('throws when useDashboard is called outside DashboardProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() {
      useDashboard();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow('useDashboard must be used within DashboardProvider');
  });

  it('computes stats, reach, institutions deduplication, peer review delays, and open science stats', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(sampleDataset),
    });

    const { data } = result.current;
    expect(data.isLoading).toBe(false);
    expect(data.stats).toEqual({ totalPubs: 2, totalSdgs: 1, totalFunders: 2 });
    expect(data.years).toEqual(['2024', '2023']);
    expect(data.journals).toEqual([
      ['dmtcs', 'Discrete Mathematics & Theoretical Computer Science'],
      ['lmcs', 'Logical Methods in Computer Science'],
    ]);
    expect(data.allFunders).toEqual(['ANR', 'ERC']);
    expect(data.topicDomains).toEqual(['Computer Science', 'Physical Sciences']);

    // CNRS appears on 2 authors in the same pub: count=1 pub, affiliationsCount=2
    const cnrs = data.institutionsList.find((i) => i.ror === 'https://ror.org/02feahw73');
    expect(cnrs).toMatchObject({ count: 1, affiliationsCount: 2, country: 'FR' });

    // Reach: pub1 has FR+US (intlCollab), pub2 has FR only (singleCountry)
    expect(data.globalReachStats).toEqual({
      totalCountries: 2,
      totalInstitutions: 3,
      intlCollabCount: 1,
      intlCollabRate: 50,
      singleCountryCount: 1,
    });
    expect(data.topCountriesData[0]).toMatchObject({ code: 'FR', name: 'France', value: 2, percentage: 100 });

    // Peer review: pub2 inverted date is ignored, only pub1 (121 days) is valid
    expect(data.peerReviewStats.validCount).toBe(1);
    expect(data.peerReviewStats.medianDays).toBe(121);
    expect(data.peerReviewStats.byRange.find((r) => r.range === 'range3to6m')).toEqual({
      range: 'range3to6m',
      count: 1,
      percentage: 100,
    });

    // Open science: excludes Episciences & Unknown Repository, folds >7 licenses
    expect(data.openScienceStats.totalRepositories).toBe(2); // HAL, arXiv
    expect(data.openScienceStats.totalWithDatasets).toBe(1);
    expect(data.openScienceStats.totalDatasets).toBe(2);
    expect(data.openScienceStats.totalWithSoftware).toBe(1);
    expect(data.openScienceStats.totalWithArtifacts).toBe(1);
    expect(data.openScienceStats.topLicenses).toHaveLength(8); // top 7 + remainder
    expect(data.openScienceStats.topLicenses[7].name).toMatch(/^\+\d+ more licenses$/);
  });

  it('filters by year, journal, institution, topic domain and resets filters cleanly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(sampleDataset),
    });

    act(() => {
      result.current.actions.setJournalFilter('dmtcs');
    });
    expect(result.current.data.filteredData).toHaveLength(1);
    expect(result.current.data.filteredData[0].journal.code).toBe('dmtcs');
    // platformFilteredData ignores journal filter
    expect(result.current.data.platformFilteredData).toHaveLength(2);

    act(() => {
      result.current.actions.setYearFilter('2023');
    });
    expect(result.current.data.filteredData).toHaveLength(0);
    expect(result.current.data.platformFilteredData).toHaveLength(1);

    act(() => {
      result.current.actions.resetFilters();
    });
    expect(result.current.data.filteredData).toHaveLength(2);

    act(() => {
      result.current.actions.setInstitutionFilter('https://ror.org/02kvxyf05');
    });
    expect(result.current.data.filteredData).toHaveLength(1);
    expect(result.current.data.filteredData[0].doi).toBe('https://doi.org/10.46298/lmcs.2');

    act(() => {
      result.current.actions.resetFilters();
      result.current.actions.setTopicDomainFilter('Physical Sciences');
    });
    expect(result.current.data.topicData).toHaveLength(1);
    expect(result.current.data.topicData[0].name).toBe('Graph Theory');
  });

  it('loads publications client-side when initialData is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [makePub()],
      }))
    );

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper([]),
    });

    expect(result.current.data.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.data.isLoading).toBe(false);
    });
    expect(result.current.data.filteredData).toHaveLength(1);
  });
});

describe('usePublications hook', () => {
  it('returns initialData immediately without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { usePublications } = await import('@/lib/publications-client');

    const { result } = renderHook(() => usePublications([makePub()]));
    expect(result.current.loading).toBe(false);
    expect(result.current.publications).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches publications on mount and exposes error state on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })));
    const { usePublications } = await import('@/lib/publications-client');

    const { result } = renderHook(() => usePublications());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('HTTP 500');
  });
});
