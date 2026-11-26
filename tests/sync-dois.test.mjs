import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanDoi, syncDois } from '../scripts/sync-dois.mjs';

describe('sync-dois cleanDoi', () => {
  it('strips doi.org and dx.doi.org prefixes case-insensitively and trims whitespace', () => {
    expect(cleanDoi('  https://DOI.ORG/10.46298/dmtcs.1  ')).toBe('10.46298/dmtcs.1');
    expect(cleanDoi('http://dx.doi.org/10.46298/lmcs.2')).toBe('10.46298/lmcs.2');
    expect(cleanDoi('')).toBe('');
    expect(cleanDoi(null)).toBe('');
  });
});

describe('syncDois', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-dois-test-'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes sorted, deduplicated DOIs and reports new additions', async () => {
    const csvPath = path.join(tmpDir, 'publications.csv');
    fs.writeFileSync(csvPath, '10.46298/dmtcs.1\n', 'utf-8');

    const episciencesClient = {
      fetchJournals: vi.fn(async () => [{ code: 'lmcs' }, { code: 'dmtcs' }]),
      fetchJournalPapers: vi.fn(async (code) => {
        if (code === 'dmtcs') {
          return [
            { doi: 'https://doi.org/10.46298/dmtcs.1' },
            { doi: '10.46298/DMTCS.1' }, // duplicate case variant
            { doi: '' },
          ];
        }
        return [{ doi: '10.46298/lmcs.2' }];
      }),
    };

    const result = await syncDois({ csvPath, episciencesClient });
    expect(result.totalDois).toBe(2);
    expect(result.newCount).toBe(1);
    expect(result.dois).toEqual(['10.46298/dmtcs.1', '10.46298/lmcs.2']);
    expect(fs.readFileSync(csvPath, 'utf-8')).toBe('10.46298/dmtcs.1\n10.46298/lmcs.2\n');
  });

  it('refuses to overwrite CSV when removed DOIs exceed maxRemovedRatio unless allowShrink is true', async () => {
    const csvPath = path.join(tmpDir, 'publications.csv');
    fs.writeFileSync(csvPath, '10.46298/dmtcs.1\n10.46298/dmtcs.2\n10.46298/dmtcs.3\n', 'utf-8');

    const episciencesClient = {
      fetchJournals: vi.fn(async () => [{ code: 'dmtcs' }]),
      fetchJournalPapers: vi.fn(async () => [{ doi: '10.46298/dmtcs.1' }]),
    };

    await expect(syncDois({ csvPath, episciencesClient, maxRemovedRatio: 0.02 })).rejects.toThrow(
      /Refusing to overwrite/
    );
    // Original CSV must remain intact
    expect(fs.readFileSync(csvPath, 'utf-8').trim().split('\n')).toHaveLength(3);

    // Explicitly allowing shrink succeeds
    const forced = await syncDois({ csvPath, episciencesClient, allowShrink: true });
    expect(forced.totalDois).toBe(1);
    expect(fs.readFileSync(csvPath, 'utf-8')).toBe('10.46298/dmtcs.1\n');
  });
});
