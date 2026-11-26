import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('scripts/compress-data.mjs', () => {
  let tmpDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compress-data-test-'));
    process.chdir(tmpDir);
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('warns and returns without throwing when publications.json does not exist', async () => {
    const { compressData } = await import('../scripts/compress-data.mjs');
    compressData();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Data file not found'));
  });

  it('creates valid .gz and .br compressed copies of publications.json', async () => {
    const dataDir = path.join(tmpDir, 'public', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    const payload = JSON.stringify([{ doi: '10.46298/dmtcs.1', title: 'Compression Test' }]);
    const dataFile = path.join(dataDir, 'publications.json');
    fs.writeFileSync(dataFile, payload, 'utf-8');

    const { compressData } = await import('../scripts/compress-data.mjs');
    compressData();

    const gzPath = `${dataFile}.gz`;
    const brPath = `${dataFile}.br`;
    expect(fs.existsSync(gzPath)).toBe(true);
    expect(fs.existsSync(brPath)).toBe(true);

    expect(zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf-8')).toBe(payload);
    expect(zlib.brotliDecompressSync(fs.readFileSync(brPath)).toString('utf-8')).toBe(payload);
  });
});
