import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Client for the OpenAlex `/works` endpoint, isolated out of
 * fetch-data.mjs so it owns its own cache subdirectory and can be
 * combined with the OpenAIRE client in the orchestrator.
 */
export class OpenAlexClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENALEX_API_KEY || '';
    this.cacheDir = path.resolve(options.cacheDir || './.cache/openalex');
    this.cacheDurationMs = (Number(options.cacheDays) || 30) * 24 * 60 * 60 * 1000;
    this.delayMs = Number(options.delayMs) || 200;
    this.onNotFound = options.onNotFound || (() => {});

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _cacheFilePath(cleanDoi) {
    const fileName = `${cleanDoi.replace(/[^a-z0-9]/gi, '_')}.json`;
    return path.join(this.cacheDir, fileName);
  }

  _readCache(filePath) {
    if (!fs.existsSync(filePath)) return undefined;
    const stats = fs.statSync(filePath);
    if (Date.now() - stats.mtimeMs >= this.cacheDurationMs) return undefined;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return undefined;
    }
  }

  // Recreates the cache directory if it disappeared mid-run (e.g. an
  // external `rm -rf` or cleanup script) instead of letting a multi-hour
  // collection run crash on a single ENOENT.
  _writeCache(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  /**
   * Returns the raw OpenAlex work object for a DOI, `null` if the DOI is
   * a confirmed 404 (cached, so it isn't retried every run), or
   * `undefined` on a transient failure (never cached).
   */
  async fetchByDoi(doi) {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    const filePath = this._cacheFilePath(cleanDoi);

    const cached = this._readCache(filePath);
    if (cached !== undefined) {
      return cached === null ? null : cached;
    }

    const url = `https://api.openalex.org/works/https://doi.org/${cleanDoi}${this.apiKey ? `?api_key=${this.apiKey}` : ''}`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await delay(this.delayMs);

      let response;
      try {
        response = await fetch(url);
      } catch (err) {
        console.error(`[OpenAlex] Fetch error for ${cleanDoi} (attempt ${attempt}):`, err.message);
        if (attempt === maxRetries) return undefined;
        await delay(attempt * 1000);
        continue;
      }

      if (response.status === 404) {
        console.warn(`[OpenAlex] 404 Not Found: ${cleanDoi}`);
        this.onNotFound(cleanDoi);
        this._writeCache(filePath, JSON.stringify(null));
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get('Retry-After')) || attempt * 3;
        console.warn(`[OpenAlex] HTTP ${response.status} for ${cleanDoi}, retrying in ${retryAfter}s...`);
        if (attempt === maxRetries) return undefined;
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`[OpenAlex] HTTP ${response.status} for ${cleanDoi}`);
        return undefined;
      }

      const data = await response.json();
      this._writeCache(filePath, JSON.stringify(data, null, 2));
      return data;
    }

    return undefined;
  }
}
