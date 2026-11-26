import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCorpusStats, getFunders, getLastUpdated, getPublications } from '@/lib/data';
import { getKpiSummary } from '@/lib/dashboardData';
import type { Publication } from '@/lib/types';

function resetGlobalCaches() {
  const g = globalThis as Record<string, unknown>;
  delete g.__epiPubsCache;
  delete g.__epiFundersCache;
  delete g.__epiKpiCache;
}

describe('lib/data.ts loaders', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'epi-data-test-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    resetGlobalCaches();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    resetGlobalCaches();
  });

  it('returns safe fallbacks when data files do not exist', async () => {
    expect(await getPublications()).toEqual([]);
    expect(await getFunders()).toEqual({});
    expect(getLastUpdated()).toBeNull();
    expect(getCorpusStats()).toEqual({
      totalPublications: 8062,
      totalHostedJournals: 47,
      activeJournals: 41,
    });
  });

  it('loads publications, attaches linked-outputs, caches by mtime, and loads funders/stats', async () => {
    const dataDir = path.join(tmpDir, 'public', 'data');
    fs.mkdirSync(dataDir, { recursive: true });

    const samplePubs = [
      {
        doi: 'https://doi.org/10.46298/dmtcs.1',
        title: 'Graph Coloring',
        year: 2024,
        journal: { name: 'DMTCS', code: 'dmtcs', issn: '1365-8050' },
        authors: [],
        sdgs: [],
        awards: [],
        primary_topic: null,
        topics: [],
        referenced_works_count: 5,
        related_works: [],
        open_science: { found_in_openaire: true },
      },
    ];
    fs.writeFileSync(path.join(dataDir, 'publications.json'), JSON.stringify(samplePubs));
    fs.writeFileSync(
      path.join(dataDir, 'linked-outputs.json'),
      JSON.stringify({
        '10.46298/dmtcs.1': {
          datasets: [{ pid: '10.5281/zenodo.1', url: 'https://zenodo.org/record/1' }],
          software: [],
        },
      })
    );
    fs.writeFileSync(
      path.join(dataDir, 'funders.json'),
      JSON.stringify({ F1: { name: 'ANR', ror: null, country_code: 'FR', country_name: 'France', lat: 48.8, lng: 2.3 } })
    );
    fs.writeFileSync(
      path.join(dataDir, 'corpus-stats.json'),
      JSON.stringify({ totalPublications: 9000, totalHostedJournals: 50, activeJournals: 45 })
    );

    const pubs = await getPublications();
    expect(pubs).toHaveLength(1);
    expect(pubs[0].open_science?.linked_outputs).toEqual({
      datasets: [{ pid: '10.5281/zenodo.1', url: 'https://zenodo.org/record/1' }],
      software: [],
    });

    // Second call hits mtime cache
    const pubsCached = await getPublications();
    expect(pubsCached).toBe(pubs);

    const funders = await getFunders();
    expect(funders.F1.name).toBe('ANR');
    expect(await getFunders()).toBe(funders);

    expect(getLastUpdated()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(getCorpusStats()).toEqual({
      totalPublications: 9000,
      totalHostedJournals: 50,
      activeJournals: 45,
    });
  });

  it('handles malformed JSON gracefully without throwing', async () => {
    const dataDir = path.join(tmpDir, 'public', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'publications.json'), '{bad json');
    fs.writeFileSync(path.join(dataDir, 'funders.json'), '{bad json');
    fs.writeFileSync(path.join(dataDir, 'corpus-stats.json'), '{bad json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await getPublications()).toEqual([]);
    expect(await getFunders()).toEqual({});
    expect(getCorpusStats().totalPublications).toBe(8062);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe('lib/dashboardData.ts getKpiSummary', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'epi-kpi-test-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    resetGlobalCaches();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    resetGlobalCaches();
  });

  it('returns null when kpi_downloads.json is missing or invalid', async () => {
    expect(await getKpiSummary([])).toBeNull();

    fs.writeFileSync(path.join(tmpDir, 'kpi_downloads.json'), '{broken');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await getKpiSummary([])).toBeNull();
  });

  it('aggregates yearly/country usage, resolves journal ISSNs, backfills missing journal names, and fetches fallback citations', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => 'Doe, J. (2024). Fallback Citation Title.',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const kpiPayload = {
      generated_at: '2026-01-15T10:00:00Z',
      journals: {
        dmtcs: {
          name: 'Discrete Mathematics & Theoretical Computer Science',
          papers_count: 2,
          papers: [
            {
              doi: '10.46298/dmtcs.1',
              downloads: { total: 50, by_year: { '2024': 30, '2025': 20 } },
              page_views: { total: 100, by_year: { '2024': 60, '2025': 40 } },
              geo: {
                France: { downloads: 25, page_views: 50 },
                DE: { downloads: 15, page_views: 30 },
                UnknownLand: { downloads: 10, page_views: 20 },
              },
            },
            {
              doi: '10.46298/dmtcs.2',
              downloads: { total: 10, by_year: { '2025': 10 } },
              page_views: { total: 20, by_year: { '2025': 20 } },
              geo: {
                'United States': { downloads: 10, page_views: 20 },
              },
            },
          ],
        },
      },
    };
    fs.writeFileSync(path.join(tmpDir, 'kpi_downloads.json'), JSON.stringify(kpiPayload));

    const publications: Publication[] = [
      {
        doi: 'https://doi.org/10.46298/dmtcs.1',
        title: 'Matched Paper Title',
        year: 2024,
        journal: { name: 'Discrete Mathematics & Theoretical Computer Science', issn: '1365-8050', id: 'S1' },
        authors: [],
        sdgs: [],
        awards: [],
        primary_topic: null,
        topics: [],
        referenced_works_count: 0,
        related_works: [],
      },
      {
        doi: 'https://doi.org/10.46298/dmtcs.2',
        title: 'Unknown Title',
        year: 2025,
        journal: { name: '', issn: '', id: '' },
        authors: [],
        sdgs: [],
        awards: [],
        primary_topic: null,
        topics: [],
        referenced_works_count: 0,
        related_works: [],
      },
    ];

    const summary = await getKpiSummary(publications);
    expect(summary).not.toBeNull();
    expect(summary!.generatedAt).toBe('2026-01-15T10:00:00Z');
    expect(summary!.paperCounts).toEqual({ dmtcs: 2 });
    expect(summary!.yearlySummary).toEqual({
      '2024': { downloads: 30, views: 60 },
      '2025': { downloads: 30, views: 60 },
    });
    expect(summary!.countryYearlySummary.FR.all).toEqual({ downloads: 25, views: 50 });
    expect(summary!.countryYearlySummary.DE.all).toEqual({ downloads: 15, views: 30 });
    expect(summary!.countryYearlySummary.US.all).toEqual({ downloads: 10, views: 20 });
    expect(summary!.countryYearlySummary.UnknownLand).toBeUndefined();

    expect(summary!.journalIssnToRvcode['1365-8050']).toBe('dmtcs');
    expect(summary!.journalIssnToRvcode['3099-5299']).toBe('dc');
    expect(publications[1].journal.name).toBe('Discrete Mathematics & Theoretical Computer Science');

    expect(summary!.journalTopPapers.dmtcs).toEqual([
      { doi: '10.46298/dmtcs.1', downloads: 50, views: 100, title: 'Matched Paper Title' },
      { doi: '10.46298/dmtcs.2', downloads: 10, views: 20, title: 'Doe, J. (2024). Fallback Citation Title.' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call hits mtime cache
    const cached = await getKpiSummary(publications);
    expect(cached).toBe(summary);
  });
});

describe('lib/publications-client.ts getPublicationsClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('fetches once, deduplicates concurrent calls, caches in memory, and recovers after failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ doi: '10.46298/dmtcs.1', title: 'Test' }],
      });
    vi.stubGlobal('fetch', fetchMock);

    const { getPublicationsClient } = await import('@/lib/publications-client');

    await expect(getPublicationsClient()).rejects.toThrow('HTTP 503');

    const [p1, p2] = await Promise.all([getPublicationsClient(), getPublicationsClient()]);
    expect(p1).toEqual([{ doi: '10.46298/dmtcs.1', title: 'Test' }]);
    expect(p2).toBe(p1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Subsequent call uses cached array without fetching
    const p3 = await getPublicationsClient();
    expect(p3).toBe(p1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
