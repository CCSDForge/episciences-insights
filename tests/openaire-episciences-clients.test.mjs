import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAireClient } from '../scripts/openaire-client.mjs';
import { EpisciencesClient } from '../scripts/episciences-client.mjs';

function makeHeaders(record = {}) {
  const lower = Object.fromEntries(Object.entries(record).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { get: (k) => lower[k.toLowerCase()] ?? null };
}

describe('OpenAireClient', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openaire-client-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fetches by DOI with Bearer token, adjusts delay from ratelimit headers, and caches results', async () => {
    const tokenManager = {
      getAccessToken: vi.fn(async () => 'token-abc'),
      clearTokenCache: vi.fn(),
    };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: makeHeaders({ 'x-ratelimit-limit': 100, 'x-ratelimit-used': 96 }),
      json: async () => ({ results: [{ id: 'oa-1', mainTitle: 'Paper' }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new OpenAireClient(tokenManager, { cacheDir: tmpDir });
    client.minDelayMs = 0;
    client.currentDelayMs = 0;

    const result = await client.fetchByDoi('https://doi.org/10.46298/dmtcs.1');
    expect(result).toEqual({ id: 'oa-1', mainTitle: 'Paper' });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-abc');
    // <5% remaining triggers 5000ms backoff
    expect(client.currentDelayMs).toBe(5000);

    // Second call hits disk cache
    expect(await client.fetchByDoi('10.46298/dmtcs.1')).toEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes token once on 401 Unauthorized and caches empty/404 results negatively', async () => {
    const tokenManager = {
      getAccessToken: vi.fn().mockResolvedValueOnce('expired-tok').mockResolvedValueOnce('fresh-tok'),
      clearTokenCache: vi.fn(),
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, headers: makeHeaders() })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: makeHeaders({ 'x-ratelimit-limit': 100, 'x-ratelimit-used': 85 }),
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404, headers: makeHeaders() });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const onNotFound = vi.fn();
    const client = new OpenAireClient(tokenManager, { cacheDir: tmpDir, onNotFound });
    client.minDelayMs = 0;
    client.currentDelayMs = 0;

    expect(await client.fetchByDoi('10.46298/empty')).toBeNull();
    expect(tokenManager.clearTokenCache).toHaveBeenCalledTimes(1);
    expect(onNotFound).toHaveBeenCalledWith('10.46298/empty');
    // <20% remaining sets 1500ms delay
    expect(client.currentDelayMs).toBe(1500);

    // 404 is also negative-cached
    client.currentDelayMs = 0;
    expect(await client.fetchByDoi('10.46298/notfound')).toBeNull();
    expect(onNotFound).toHaveBeenCalledWith('10.46298/notfound');
    expect(await client.fetchByDoi('10.46298/notfound')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('EpisciencesClient', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'epi-client-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('builds DOI->docid map across journals, caches responses, and skips failing journals', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.includes('/journals/')) {
        return {
          ok: true,
          json: async () => [{ code: 'dmtcs' }, { code: 'broken' }],
        };
      }
      if (url.includes('rvcode=dmtcs')) {
        return {
          ok: true,
          json: async () => ({
            'hydra:member': [{ docid: 42, doi: '10.46298/DMTCS.42' }],
            'hydra:totalItems': 1,
          }),
        };
      }
      return { ok: false, status: 500 };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const client = new EpisciencesClient({ cacheDir: tmpDir, delayMs: 1 });
    const map = await client.buildDoiToDocidMap();
    expect(map.get('10.46298/dmtcs.42')).toBe(42);
    expect(map.size).toBe(1);
  });

  it('throws if API returns fewer papers than hydra:totalItems', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          'hydra:member': [{ docid: 1, doi: '10.46298/dmtcs.1' }],
          'hydra:totalItems': 5,
        }),
      }))
    );

    const client = new EpisciencesClient({ cacheDir: tmpDir, delayMs: 1 });
    await expect(client.fetchJournalPapers('dmtcs')).rejects.toThrow('got 1 papers, API announced 5');
  });

  it('resolves docid via direct DOI pattern first, then falls back to API', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ 'hydra:member': [{ docid: 9876 }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new EpisciencesClient({ cacheDir: tmpDir, delayMs: 1 });
    expect(await client.resolveDocid('')).toBeUndefined();
    expect(await client.resolveDocid('https://doi.org/10.46298/dmtcs.3444')).toBe(3444);
    expect(fetchMock).not.toHaveBeenCalled();

    expect(await client.resolveDocid('10.46298/lmcs-20(1:5)2024')).toBe(9876);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetches per-article export, caches hits and 404s, and returns undefined on 500', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith('/42/json')) {
        return { ok: true, status: 200, json: async () => ({ database: { current: { journal: { code: 'dmtcs' } } } }) };
      }
      if (url.endsWith('/404/json')) {
        return { ok: false, status: 404 };
      }
      return { ok: false, status: 500 };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const client = new EpisciencesClient({ cacheDir: tmpDir, delayMs: 1 });
    const exp = await client.fetchExport(42);
    expect(exp.database.current.journal.code).toBe('dmtcs');
    expect(await client.fetchExport(42)).toEqual(exp);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(await client.fetchExport(404)).toBeNull();
    expect(await client.fetchExport(404)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(await client.fetchExport(500)).toBeUndefined();
  });
});
