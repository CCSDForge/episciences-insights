import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Client for the OpenAlex `/funders/{id}` endpoint — separate from
 * OpenAlexClient (keyed by DOI) since it owns its own cache subdirectory
 * and id space (OpenAlex funder ids, not DOIs).
 *
 * The funder entity already carries `country_code` and `ids.ror` directly
 * (verified live: GET /funders/F4320306076 -> country_code "US",
 * ids.ror "https://ror.org/021nxhr62") — no separate geocoding step is
 * needed for country, only for lat/lng (see ror-client.mjs).
 */
export class OpenAlexFundersClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENALEX_API_KEY || '';
    this.cacheDir = path.resolve(options.cacheDir || './.cache/openalex-funders');
    this.cacheDurationMs = (Number(options.cacheDays) || 30) * 24 * 60 * 60 * 1000;
    this.delayMs = Number(options.delayMs) || 150;

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _cacheFilePath(cleanId) {
    return path.join(this.cacheDir, `${cleanId.replace(/[^a-z0-9]/gi, '_')}.json`);
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

  _writeCache(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  /**
   * Returns `{ display_name, country_code, ror }` for an OpenAlex funder id
   * (short form like "F4320306076" or a full https://openalex.org/... URL;
   * `ror` is normalized to its short form too), `null` on a confirmed 404
   * (cached, never retried), or `undefined` on a transient failure (never
   * cached).
   */
  async fetchById(funderId) {
    const cleanId = funderId.replace(/^https?:\/\/openalex\.org\//i, '').trim();
    const filePath = this._cacheFilePath(cleanId);

    const cached = this._readCache(filePath);
    if (cached !== undefined) return cached;

    const url = `https://api.openalex.org/funders/${cleanId}${this.apiKey ? `?api_key=${this.apiKey}` : ''}`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await delay(this.delayMs);

      let response;
      try {
        response = await fetch(url);
      } catch (err) {
        console.error(`[OpenAlex Funders] Fetch error for ${cleanId} (attempt ${attempt}):`, err.message);
        if (attempt === maxRetries) return undefined;
        await delay(attempt * 1000);
        continue;
      }

      if (response.status === 404) {
        this._writeCache(filePath, JSON.stringify(null));
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get('Retry-After')) || attempt * 3;
        console.warn(`[OpenAlex Funders] HTTP ${response.status} for ${cleanId}, retrying in ${retryAfter}s...`);
        if (attempt === maxRetries) return undefined;
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`[OpenAlex Funders] HTTP ${response.status} for ${cleanId}`);
        return undefined;
      }

      const data = await response.json();
      const result = {
        display_name: data.display_name,
        country_code: data.country_code || null,
        ror: data.ids?.ror ? data.ids.ror.replace(/^https?:\/\/ror\.org\//i, '') : null,
      };
      this._writeCache(filePath, JSON.stringify(result, null, 2));
      return result;
    }

    return undefined;
  }
}
