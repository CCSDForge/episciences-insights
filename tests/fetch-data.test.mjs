import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('scripts/fetch-data.mjs', () => {
  let tmpDir;
  let originalCwd;
  let originalSkipSync;

  beforeEach(() => {
    originalCwd = process.cwd();
    originalSkipSync = process.env.SKIP_DOI_SYNC;
    process.env.SKIP_DOI_SYNC = 'true';
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-data-test-'));
    process.chdir(tmpDir);
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalSkipSync === undefined) delete process.env.SKIP_DOI_SYNC;
    else process.env.SKIP_DOI_SYNC = originalSkipSync;
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exitCode = undefined;
  });

  it('pMap preserves item order while bounding concurrency', async () => {
    const { pMap } = await import('../scripts/fetch-data.mjs');
    let active = 0;
    let maxActive = 0;
    const out = await pMap(
      [1, 2, 3, 4, 5],
      async (n) => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 2));
        active--;
        return n * 10;
      },
      2
    );
    expect(out).toEqual([10, 20, 30, 40, 50]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it('sets exitCode=1 when publications.csv is missing', async () => {
    const { run } = await import('../scripts/fetch-data.mjs');
    await run();
    expect(process.exitCode).toBe(1);
  });

  it('orchestrates full collection, enrichment, stats, and compression from mocked APIs', async () => {
    vi.useFakeTimers();
    fs.writeFileSync(path.join(tmpDir, 'publications.csv'), '10.46298/dmtcs.42\n10.46298/missing.99\n');

    const headers = { get: () => null };
    const fetchMock = vi.fn(async (url) => {
      if (url.includes('/journals/')) {
        return { ok: true, status: 200, headers, json: async () => [{ code: 'dmtcs' }] };
      }
      if (url.includes('/papers/?rvcode=dmtcs')) {
        return {
          ok: true,
          status: 200,
          headers,
          json: async () => ({
            'hydra:member': [{ docid: 42, doi: '10.46298/dmtcs.42' }],
            'hydra:totalItems': 1,
          }),
        };
      }
      if (url.includes('/papers/export/42/json')) {
        return {
          ok: true,
          status: 200,
          headers,
          json: async () => ({
            database: {
              current: {
                journal: { name: 'Discrete Mathematics & Theoretical Computer Science', code: 'dmtcs' },
                classifications: { msc2020: [{ code: '68Q10' }] },
              },
            },
          }),
        };
      }
      if (url.includes('api.openalex.org/works/') && url.includes('dmtcs.42')) {
        return {
          ok: true,
          status: 200,
          headers,
          json: async () => ({
            doi: 'https://doi.org/10.46298/dmtcs.42',
            title: 'Orchestrated Paper',
            publication_year: 2024,
            primary_location: { source: { display_name: 'DMTCS', issn: ['1365-8050'], id: 'S1' } },
            authorships: [],
            grants: [],
          }),
        };
      }
      if (url.includes('api.openaire.eu/')) {
        return { ok: true, status: 200, headers, json: async () => ({ results: [] }) };
      }
      return { ok: false, status: 404, headers };
    });
    vi.stubGlobal('fetch', fetchMock);

    const { run } = await import('../scripts/fetch-data.mjs');
    const runPromise = run();
    await vi.runAllTimersAsync();
    await runPromise;

    const pubs = JSON.parse(fs.readFileSync(path.join(tmpDir, 'public', 'data', 'publications.json'), 'utf-8'));
    expect(pubs).toHaveLength(1);
    expect(pubs[0].title).toBe('Orchestrated Paper');
    expect(pubs[0].journal.code).toBe('dmtcs');
    expect(pubs[0].episciences.msc_codes).toEqual(['68Q10']);

    const stats = JSON.parse(fs.readFileSync(path.join(tmpDir, 'public', 'data', 'corpus-stats.json'), 'utf-8'));
    expect(stats.totalPublications).toBe(1);
    expect(stats.activeJournals).toBe(1);

    expect(fs.existsSync(path.join(tmpDir, 'public', 'data', 'funders.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'public', 'data', 'publications.json.gz'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'public', 'data', 'publications.json.br'))).toBe(true);
    expect(fs.readFileSync(path.join(tmpDir, 'logs', 'not-found.log'), 'utf-8')).toContain('10.46298/missing.99');
  });
});
