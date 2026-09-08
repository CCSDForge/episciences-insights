import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Client for the OpenAIRE Graph v3 API (`/graph/v3/research-products`).
 *
 * Rate limiting is driven by the `x-ratelimit-limit` / `x-ratelimit-used`
 * response headers rather than a hardcoded "60 req/h anonymous" constant:
 * live testing against the API showed anonymous requests carry the same
 * ~7200/h budget as authenticated ones (`x-ratelimit-limit: 7199` observed
 * with no Authorization header). The documented 60 req/h anonymous limit
 * applies to the legacy Search API, not this endpoint. We still throttle
 * proactively and back off hard if the measured budget looks smaller.
 */
export class OpenAireClient {
  constructor(tokenManager, options = {}) {
    this.tokenManager = tokenManager;
    this.baseUrl = options.apiUrl || process.env.OPENAIRE_API_URL || 'https://api.openaire.eu/graph/v3/research-products';
    this.cacheDir = path.resolve(options.cacheDir || './.cache/openaire');
    this.cacheDurationMs = (Number(options.cacheDays) || 30) * 24 * 60 * 60 * 1000;

    // Safe floor even at the full 7200/h budget (2 req/s); tightened
    // dynamically if the ratelimit headers reveal a smaller budget.
    this.minDelayMs = 600;
    this.currentDelayMs = this.minDelayMs;

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

  _adjustDelayFromHeaders(headers) {
    const limit = Number(headers.get('x-ratelimit-limit'));
    const used = Number(headers.get('x-ratelimit-used'));
    if (!limit || Number.isNaN(used)) return;
    const remaining = limit - used;
    const remainingRatio = remaining / limit;
    if (remainingRatio < 0.05) {
      // Budget nearly exhausted: slow way down instead of racing to a 429.
      this.currentDelayMs = 5000;
    } else if (remainingRatio < 0.2) {
      this.currentDelayMs = 1500;
    } else {
      this.currentDelayMs = this.minDelayMs;
    }
  }

  /**
   * Returns the raw OpenAIRE Graph v3 result object for a DOI, or `null`
   * if the DOI is not indexed by OpenAIRE / the request ultimately failed.
   */
  async fetchByDoi(doi) {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    const filePath = this._cacheFilePath(cleanDoi);

    const cached = this._readCache(filePath);
    if (cached !== undefined) {
      return cached.results?.[0] || null;
    }

    const token = await this.tokenManager.getAccessToken();
    let headers = {
      Accept: 'application/json',
      'User-Agent': 'CCSD Episciences support@episciences.org',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    await delay(this.currentDelayMs);

    const url = `${this.baseUrl}?pid=${encodeURIComponent(cleanDoi)}`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let response;
      try {
        response = await fetch(url, { headers });
      } catch (err) {
        console.error(`[OpenAIRE] Fetch error for ${cleanDoi}:`, err.message);
        return null;
      }

      this._adjustDelayFromHeaders(response.headers);

      if (response.status === 401 && token && attempt === 1) {
        console.warn('[OpenAIRE] 401 Unauthorized, refreshing token...');
        this.tokenManager.clearTokenCache();
        const newToken = await this.tokenManager.getAccessToken();
        if (newToken) {
          headers = { ...headers, Authorization: `Bearer ${newToken}` };
          continue;
        }
      }

      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = Number(response.headers.get('Retry-After')) || attempt * 5;
        console.warn(`[OpenAIRE] 429 Too Many Requests. Waiting ${retryAfter}s...`);
        await delay(retryAfter * 1000);
        continue;
      }

      if (response.status === 404) {
        const emptyPayload = { header: { numFound: 0 }, results: [] };
        this._writeCache(filePath, JSON.stringify(emptyPayload, null, 2));
        return null;
      }

      if (!response.ok) {
        console.error(`[OpenAIRE] HTTP ${response.status} for ${cleanDoi}`);
        return null;
      }

      const data = await response.json();
      // Negative caching: an empty result set is cached too, so a DOI
      // absent from OpenAIRE isn't re-queried on every subsequent run.
      this._writeCache(filePath, JSON.stringify(data, null, 2));
      return data.results?.[0] || null;
    }

    return null;
  }
}
