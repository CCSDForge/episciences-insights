import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseXsdDurationDays(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const match = durationStr.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?/);
  if (!match) return 0;
  const years = parseInt(match[1] || '0', 10);
  const months = parseInt(match[2] || '0', 10);
  const days = parseInt(match[3] || '0', 10);
  return Math.round(years * 365.25 + months * 30.4375 + days);
}

/**
 * Client for the OpenCitations Index REST API v2 (`https://api.opencitations.net/index/v2`).
 *
 * Implements rate limiting respecting the 180 req/min quota (~350ms delay floor),
 * file-based caching with TTL and negative-caching, exponential backoff on errors,
 * and retrieval of citation counts, venue counts, and detailed citation metadata.
 */
export class OpenCitationsClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENCITATION_API_KEY || '';
    this.baseUrl = options.baseUrl || 'https://api.opencitations.net/index/v2';
    this.cacheDir = path.resolve(options.cacheDir || './.cache/opencitations');
    this.cacheDurationMs = (Number(options.cacheDays) || 30) * 24 * 60 * 60 * 1000;
    this.notFoundCacheDurationMs = (Number(options.notFoundCacheHours) || 24) * 60 * 60 * 1000;
    // 180 req/min = 1 req / 333ms. Using 350ms ensures safety margin.
    this.delayMs = Number(options.delayMs) || 350;
    this.onNotFound = options.onNotFound || (() => {});
    this.lastRequestTime = 0;
    this.rateLimitQueue = Promise.resolve();

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _cacheFilePath(category, key) {
    const cleanKey = key.replace(/[^a-z0-9]/gi, '_');
    return path.join(this.cacheDir, `${category}_${cleanKey}.json`);
  }

  _readCache(filePath) {
    if (!fs.existsSync(filePath)) return undefined;
    const stats = fs.statSync(filePath);
    const ageMs = Date.now() - stats.mtimeMs;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const isNotFound = data === null;
      const ttl = isNotFound ? this.notFoundCacheDurationMs : this.cacheDurationMs;
      if (ageMs >= ttl) return undefined;
      return data;
    } catch {
      return undefined;
    }
  }

  _writeCache(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  async _waitForRateLimit() {
    return new Promise((resolve) => {
      this.rateLimitQueue = this.rateLimitQueue.then(async () => {
        const now = Date.now();
        const wait = Math.max(0, this.delayMs - (now - this.lastRequestTime));
        if (wait > 0) await delay(wait);
        this.lastRequestTime = Date.now();
        resolve();
      });
    });
  }

  async _fetch(endpointPath, cacheFilePath, label = '') {
    const cached = this._readCache(cacheFilePath);
    if (cached !== undefined) {
      return cached;
    }

    const url = `${this.baseUrl}${endpointPath}`;
    const headers = {
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers.authorization = this.apiKey;
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await this._waitForRateLimit();

      let response;
      try {
        response = await fetch(url, { headers });
      } catch (err) {
        console.error(`[OpenCitations] Fetch error ${label} (attempt ${attempt}):`, err.message);
        if (attempt === maxRetries) return undefined;
        await delay(attempt * 1000);
        continue;
      }

      if (response.status === 404) {
        this.onNotFound(label);
        this._writeCache(cacheFilePath, JSON.stringify(null));
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get('Retry-After')) || attempt * 2;
        console.warn(`[OpenCitations] HTTP ${response.status} for ${label}, retrying in ${retryAfter}s...`);
        if (attempt === maxRetries) return undefined;
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`[OpenCitations] HTTP ${response.status} for ${label}`);
        return undefined;
      }

      try {
        const data = await response.json();
        this._writeCache(cacheFilePath, JSON.stringify(data, null, 2));
        return data;
      } catch (err) {
        console.error(`[OpenCitations] JSON parse error for ${label}:`, err.message);
        return undefined;
      }
    }

    return undefined;
  }

  /**
   * Retrieves the number of incoming citations for a DOI.
   * Returns a number or null if not found.
   */
  async fetchCitationCount(doi) {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    const cachePath = this._cacheFilePath('citation_count', cleanDoi);
    const data = await this._fetch(
      `/citation-count/doi:${encodeURIComponent(cleanDoi)}`,
      cachePath,
      `citation-count ${cleanDoi}`
    );

    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const countStr = data[0]?.count;
    return countStr ? parseInt(countStr, 10) : 0;
  }

  /**
   * Retrieves the number of outgoing references for a DOI.
   */
  async fetchReferenceCount(doi) {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    const cachePath = this._cacheFilePath('ref_count', cleanDoi);
    const data = await this._fetch(
      `/reference-count/doi:${encodeURIComponent(cleanDoi)}`,
      cachePath,
      `ref-count ${cleanDoi}`
    );

    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const countStr = data[0]?.count;
    return countStr ? parseInt(countStr, 10) : 0;
  }

  /**
   * Retrieves the incoming citation details for a DOI.
   * Array of objects: { oci, citing, cited, creation, timespan, journal_sc, author_sc }
   */
  async fetchCitations(doi) {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    const cachePath = this._cacheFilePath('citations', cleanDoi);
    const data = await this._fetch(
      `/citations/doi:${encodeURIComponent(cleanDoi)}`,
      cachePath,
      `citations ${cleanDoi}`
    );

    if (!data || !Array.isArray(data)) return [];
    return data;
  }

  /**
   * Retrieves total citations for a venue/journal by its ISSN.
   */
  async fetchVenueCitationCount(issn) {
    if (!issn || typeof issn !== 'string') return 0;
    const cleanIssn = issn.trim();
    const cachePath = this._cacheFilePath('venue_count', cleanIssn);
    const data = await this._fetch(
      `/venue-citation-count/issn:${encodeURIComponent(cleanIssn)}`,
      cachePath,
      `venue-citation-count ${cleanIssn}`
    );

    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const countStr = data[0]?.count;
    return countStr ? parseInt(countStr, 10) : 0;
  }

  /**
   * Builds an enriched OpenCitationsImpact object from `/citations/doi:...`.
   */
  async fetchEnrichedImpact(doi) {
    const citations = await this.fetchCitations(doi);
    if (!citations || citations.length === 0) {
      return {
        citation_count: 0,
      };
    }

    let journalCount = 0;
    let authorCount = 0;
    let externalCount = 0;
    const citationsByYear = {};
    const timespanDaysList = [];
    let earliestDate = null;

    for (const c of citations) {
      const isJournalSc = c.journal_sc === 'yes';
      const isAuthorSc = c.author_sc === 'yes';

      if (isJournalSc) journalCount++;
      if (isAuthorSc) authorCount++;
      if (!isJournalSc && !isAuthorSc) externalCount++;

      if (c.creation) {
        const year = c.creation.slice(0, 4);
        if (/^\d{4}$/.test(year)) {
          citationsByYear[year] = (citationsByYear[year] || 0) + 1;
        }
        if (!earliestDate || c.creation < earliestDate) {
          earliestDate = c.creation;
        }
      }

      if (c.timespan) {
        const days = parseXsdDurationDays(c.timespan);
        if (days > 0) timespanDaysList.push(days);
      }
    }

    let medianTimespanDays;
    if (timespanDaysList.length > 0) {
      timespanDaysList.sort((a, b) => a - b);
      const mid = Math.floor(timespanDaysList.length / 2);
      medianTimespanDays =
        timespanDaysList.length % 2 !== 0
          ? timespanDaysList[mid]
          : Math.round((timespanDaysList[mid - 1] + timespanDaysList[mid]) / 2);
    }

    return {
      citation_count: citations.length,
      self_citations: {
        journal_count: journalCount,
        author_count: authorCount,
        external_count: externalCount,
      },
      citations_by_year: Object.keys(citationsByYear).length > 0 ? citationsByYear : undefined,
      earliest_citation_date: earliestDate || undefined,
      median_citation_timespan_days: medianTimespanDays,
    };
  }
}
