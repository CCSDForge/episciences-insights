import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('scripts/setup-geo.mjs', () => {
  let tmpDir;
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-geo-test-'));
    process.chdir(tmpDir);
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('copies countries-110m.json and LICENSE from node_modules/world-atlas into public/geo/', async () => {
    const srcDir = path.join(tmpDir, 'node_modules', 'world-atlas');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'countries-110m.json'), '{"type":"Topology"}');
    fs.writeFileSync(path.join(srcDir, 'LICENSE'), 'ISC License');

    await import('../scripts/setup-geo.mjs');

    expect(fs.readFileSync(path.join(tmpDir, 'public', 'geo', 'countries-110m.json'), 'utf-8')).toBe('{"type":"Topology"}');
    expect(fs.readFileSync(path.join(tmpDir, 'public', 'geo', 'LICENSE-world-atlas'), 'utf-8')).toBe('ISC License');
  });
});
