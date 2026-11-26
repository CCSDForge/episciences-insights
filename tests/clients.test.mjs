import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RorClient } from '../scripts/ror-client.mjs';
import { OpenAlexClient } from '../scripts/openalex-client.mjs';
import { OpenAlexFundersClient } from '../scripts/openalex-funders-client.mjs';
import { OpenAireTokenManager } from '../scripts/openaire-token.mjs';

describe('RorClient', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ror-client-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fetches organization by ROR id, caches result, and caches 404 as null', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith('/02feahw73')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            names: [{ value: 'CNRS', types: ['ror_display'] }],
            locations: [{ geonames_details: { country_code: 'FR', country_name: 'France', lat: 48.85, lng: 2.35 } }],
          }),
        };
      }
      if (url.endsWith('/000000000')) {
        return { ok: false, status: 404 };
      }
      return { ok: false, status: 400 };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const client = new RorClient({ cacheDir: tmpDir, delayMs: 1 });

    const org = await client.fetchById('https://ror.org/02feahw73');
    expect(org).toEqual({
      name: 'CNRS',
      country_code: 'FR',
      country_name: 'France',
      lat: 48.85,
      lng: 2.35,
    });

    // Cached second call does not hit fetch
    expect(await client.fetchById('02feahw73')).toEqual(org);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 404 is cached as null
    expect(await client.fetchById('000000000')).toBeNull();
    expect(await client.fetchById('000000000')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // 400 returns undefined and is not cached
    expect(await client.fetchById('bad-id')).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('matches affiliations when chosen=true and returns null otherwise', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            { chosen: false, score: 0.4, organization: { id: 'https://ror.org/000000001' } },
            {
              chosen: true,
              score: 0.99,
              organization: {
                id: 'https://ror.org/00rbzpz17',
                names: [{ value: 'Agence Nationale de la Recherche', types: ['ror_display'] }],
                locations: [{ geonames_details: { country_code: 'FR', country_name: 'France', lat: 48.8, lng: 2.3 } }],
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [{ chosen: false, score: 0.5 }] }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const client = new RorClient({ cacheDir: tmpDir, delayMs: 1 });
    expect(await client.matchAffiliation('ANR')).toEqual({
      ror: '00rbzpz17',
      name: 'Agence Nationale de la Recherche',
      score: 0.99,
      country_code: 'FR',
      country_name: 'France',
      lat: 48.8,
      lng: 2.3,
    });
    expect(await client.matchAffiliation('Unknown Org')).toBeNull();
  });
});

describe('OpenAlexClient', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oa-client-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fetches work by DOI, caches hit, negative-caches 404 with onNotFound, and handles HTTP 400', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.includes('10.46298/dmtcs.1')) {
        return { ok: true, status: 200, json: async () => ({ id: 'W1', title: 'Found' }) };
      }
      if (url.includes('10.46298/missing')) {
        return { ok: false, status: 404 };
      }
      return { ok: false, status: 400 };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onNotFound = vi.fn();
    const client = new OpenAlexClient({ apiKey: 'test-key', cacheDir: tmpDir, delayMs: 1, onNotFound });

    const work = await client.fetchByDoi('https://doi.org/10.46298/dmtcs.1');
    expect(work).toEqual({ id: 'W1', title: 'Found' });
    expect(fetchMock.mock.calls[0][0]).toContain('?api_key=test-key');

    // Second call uses cache
    expect(await client.fetchByDoi('10.46298/dmtcs.1')).toEqual(work);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 404 triggers onNotFound and is cached as null
    expect(await client.fetchByDoi('10.46298/missing')).toBeNull();
    expect(onNotFound).toHaveBeenCalledWith('10.46298/missing');
    expect(await client.fetchByDoi('10.46298/missing')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // 400 returns undefined
    expect(await client.fetchByDoi('10.46298/bad')).toBeUndefined();
  });

  it('retries on 429/500 and network errors before succeeding or giving up', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => '1' } })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 'W-OK' }) });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const client = new OpenAlexClient({ cacheDir: tmpDir, delayMs: 0 });
    const promise = client.fetchByDoi('10.46298/flaky');
    await vi.runAllTimersAsync();
    expect(await promise).toEqual({ id: 'W-OK' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});

describe('OpenAlexFundersClient', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oaf-client-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('normalizes funder response, caches it, and negative-caches 404', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url.includes('/F4320320883')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            display_name: 'Agence Nationale de la Recherche',
            country_code: 'FR',
            ids: { ror: 'https://ror.org/00rbzpz17' },
          }),
        };
      }
      return { ok: false, status: 404 };
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new OpenAlexFundersClient({ cacheDir: tmpDir, delayMs: 1 });
    const funder = await client.fetchById('https://openalex.org/F4320320883');
    expect(funder).toEqual({
      display_name: 'Agence Nationale de la Recherche',
      country_code: 'FR',
      ror: '00rbzpz17',
    });

    expect(await client.fetchById('F4320320883')).toEqual(funder);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(await client.fetchById('F000')).toBeNull();
    expect(await client.fetchById('F000')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('OpenAireTokenManager', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openaire-token-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when credentials are missing', async () => {
    const mgr = new OpenAireTokenManager({ clientId: '', clientSecret: '', cacheDir: tmpDir });
    expect(mgr.isConfigured()).toBe(false);
    expect(await mgr.getAccessToken()).toBeNull();
  });

  it('negotiates, caches, reuses, and clears OAuth2 access tokens', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ access_token: 'tok-123', expires_in: 3600 }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const mgr = new OpenAireTokenManager({
      clientId: 'cid',
      clientSecret: 'csec',
      cacheDir: tmpDir,
    });

    expect(mgr.isConfigured()).toBe(true);
    expect(await mgr.getAccessToken()).toBe('tok-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Cached token reused without network call
    expect(await mgr.getAccessToken()).toBe('tok-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Clearing cache forces a fresh negotiation
    mgr.clearTokenCache();
    expect(await mgr.getAccessToken()).toBe('tok-123');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('creates missing cache directory before writing the token', async () => {
    const nestedDir = path.join(tmpDir, 'nested', 'cache');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ access_token: 'tok-nested', expires_in: 3600 }),
      }))
    );
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const mgr = new OpenAireTokenManager({ clientId: 'cid', clientSecret: 'csec', cacheDir: nestedDir });
    expect(await mgr.getAccessToken()).toBe('tok-nested');
    expect(fs.existsSync(path.join(nestedDir, 'openaire_token.json'))).toBe(true);
  });

  it('returns null on failed token negotiation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401, statusText: 'Unauthorized' })));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const mgr = new OpenAireTokenManager({ clientId: 'cid', clientSecret: 'bad', cacheDir: tmpDir });
    expect(await mgr.getAccessToken()).toBeNull();
  });
});
