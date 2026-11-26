import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('scripts/collect-links.mjs', () => {
  let tmpDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collect-links-test-'));
    process.chdir(tmpDir);
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exitCode = undefined;
  });

  it('sets exitCode=1 when publications.json does not exist', async () => {
    const { run } = await import('../scripts/collect-links.mjs');
    await run();
    expect(process.exitCode).toBe(1);
  });

  it('collects datasets/software links with lowercase DOI keys, retries on 429, and caches results', async () => {
    vi.useFakeTimers();
    const dataDir = path.join(tmpDir, 'public', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, 'publications.json'),
      JSON.stringify([
        { doi: 'https://DOI.ORG/10.46298/DMTCS.1' },
        { doi: '10.46298/dmtcs.fail' },
      ])
    );

    const fetchMock = vi.fn(async (url) => {
      if (url.includes('dmtcs.fail')) {
        return { ok: false, status: 400 };
      }
      if (url.includes('targetType=dataset')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              { target: { identifiers: [{ idScheme: 'doi', id: '10.5281/zenodo.1', idUrl: 'https://doi.org/10.5281/zenodo.1' }] } },
            ],
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ results: [] }) };
    });
    // First call hits 429 then succeeds on retry
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429, headers: { get: () => '1' } });
    vi.stubGlobal('fetch', fetchMock);

    const { run } = await import('../scripts/collect-links.mjs');
    const runPromise = run();
    await vi.runAllTimersAsync();
    await runPromise;

    const output = JSON.parse(fs.readFileSync(path.join(dataDir, 'linked-outputs.json'), 'utf-8'));
    expect(output).toEqual({
      '10.46298/dmtcs.1': {
        datasets: [{ pid: '10.5281/zenodo.1', url: 'https://doi.org/10.5281/zenodo.1' }],
        software: [],
      },
    });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('1 publications could not be checked'));

    // Second run uses cached files for dmtcs.1 without re-fetching it
    const callsBefore = fetchMock.mock.calls.length;
    const secondPromise = run();
    await vi.runAllTimersAsync();
    await secondPromise;
    // Only the failed DOI (2 calls: dataset + software) should have been fetched again
    expect(fetchMock.mock.calls.length - callsBefore).toBe(2);
  });
});
