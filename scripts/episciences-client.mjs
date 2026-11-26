import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Server-side maximum for /papers/ (larger values are clamped to 1000).
const PAPERS_PAGE_SIZE = 1000;
// Lower bound of the `year[]` slicing (oldest Episciences-hosted back
// catalogue starts in the late 1990s; the totalItems check flags any gap).
const PAPERS_FIRST_YEAR = 1990;

/**
 * Client for the Episciences platform's own API (api.episciences.org),
 * fully public, no authentication required.
 *
 * Used for two things neither OpenAlex nor OpenAIRE can provide:
 *  - resolving a DOI to its internal `docid` (needed to call the export
 *    endpoint below), by listing every paper of every journal;
 *  - `GET /papers/export/{docid}/json`, the platform's own per-article
 *    metadata export. Notably `database.current.classifications.msc2020`
 *    carries the Mathematics Subject Classification 2020 codes (sourced
 *    from zbMATH Open) that neither external API exposes, and
 *    `database.current.journal.{name,code}` is the authoritative journal
 *    identity — more reliable than OpenAlex's source resolution or
 *    OpenAIRE's `container`.
 */
export class EpisciencesClient {
  constructor(options = {}) {
    this.baseUrl = options.apiUrl || process.env.EPISCIENCES_API_URL || 'https://api.episciences.org/api';
    this.cacheDir = path.resolve(options.cacheDir || './.cache/episciences');
    // The papers-per-journal index changes often (new submissions) so it
    // gets a short TTL by default; the per-article export is effectively
    // immutable once published, so it keeps the same long TTL as the
    // other API caches.
    this.indexCacheDurationMs = (Number(options.indexCacheDays) || 1) * 24 * 60 * 60 * 1000;
    this.exportCacheDurationMs = (Number(options.exportCacheDays) || 30) * 24 * 60 * 60 * 1000;
    this.notFoundCacheDurationMs = (Number(options.notFoundCacheHours) || 24) * 60 * 60 * 1000;
    this.delayMs = options.delayMs !== undefined ? Number(options.delayMs) : 300;
    this.lastRequestTime = 0;
    this.rateLimitQueue = Promise.resolve();

    this.exportDir = path.join(this.cacheDir, 'export');
    if (!fs.existsSync(this.exportDir)) fs.mkdirSync(this.exportDir, { recursive: true });
  }

  _readCache(filePath, maxAgeMs) {
    if (!fs.existsSync(filePath)) return undefined;
    const stats = fs.statSync(filePath);
    const ageMs = Date.now() - stats.mtimeMs;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const effectiveMaxAge = data === null ? this.notFoundCacheDurationMs : maxAgeMs;
      if (ageMs >= effectiveMaxAge) return undefined;
      return data;
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

  async fetchJournals() {
    const filePath = path.join(this.cacheDir, 'journals.json');
    const cached = this._readCache(filePath, this.indexCacheDurationMs);
    if (cached) return cached;

    const res = await fetch(`${this.baseUrl}/journals/?pagination=false`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Episciences /journals/ HTTP ${res.status}`);
    const data = await res.json();
    this._writeCache(filePath, JSON.stringify(data, null, 2));
    return data;
  }

  async fetchJournalPapers(rvcode) {
    const filePath = path.join(this.cacheDir, `papers-${rvcode}.json`);
    const cached = this._readCache(filePath, this.indexCacheDurationMs);
    if (cached) return cached;

    // The API silently caps every response at 1000 items, even with
    // `pagination=false` (DMTCS and LMCS both exceed that). Plain Hydra
    // paging is not a fix either: /papers/ has no `order` parameter and its
    // server-side ordering is unstable, so consecutive pages overlap (LMCS:
    // 7 rows repeated, 7 papers never returned). Journals that don't fit in
    // one page are therefore sliced by `year[]` (largest slice today: 181),
    // deduplicated by docid and checked against `hydra:totalItems`. Any
    // failure throws instead of returning a partial list: a truncated index
    // would silently drop DOIs from publications.csv.
    const first = await this._fetchPapersPage(rvcode, 1);
    let papers = first.members;
    const totalItems = first.totalItems;

    if (first.hasNext) {
      const byDocid = new Map();
      const lastYear = new Date().getFullYear() + 1;
      for (let year = PAPERS_FIRST_YEAR; year <= lastYear; year++) {
        for (const p of await this._fetchAllPages(rvcode, `&year[]=${year}`)) byDocid.set(p.docid, p);
      }
      papers = [...byDocid.values()];
    }

    if (typeof totalItems === 'number' && papers.length !== totalItems) {
      throw new Error(`Episciences /papers/?rvcode=${rvcode}: got ${papers.length} papers, API announced ${totalItems}`);
    }

    this._writeCache(filePath, JSON.stringify(papers, null, 2));
    return papers;
  }

  async _fetchPapersPage(rvcode, page, extraQuery = '') {
    await this._waitForRateLimit();
    const query = `rvcode=${encodeURIComponent(rvcode)}${extraQuery}&itemsPerPage=${PAPERS_PAGE_SIZE}&page=${page}`;
    const res = await fetch(`${this.baseUrl}/papers/?${query}`, { headers: { Accept: 'application/ld+json' } });
    if (!res.ok) throw new Error(`Episciences /papers/?${query} HTTP ${res.status}`);
    const data = await res.json();
    const members = data['hydra:member'];
    if (!Array.isArray(members)) throw new Error(`Episciences /papers/?${query}: unexpected response shape`);
    return {
      members,
      totalItems: data['hydra:totalItems'],
      hasNext: Boolean(data['hydra:view']?.['hydra:next']) && members.length > 0,
    };
  }

  // Only used for year slices, which stay far below one page; the loop is
  // a safety net, and the caller's totalItems check catches any overlap.
  async _fetchAllPages(rvcode, extraQuery) {
    const all = [];
    for (let page = 1; ; page++) {
      const { members, hasNext } = await this._fetchPapersPage(rvcode, page, extraQuery);
      all.push(...members);
      if (!hasNext) return all;
    }
  }

  /**
   * Builds a lowercased-DOI -> docid map across every journal listed by
   * the platform. Cheap: one request per journal (~46 today), each
   * cached for `indexCacheDays`.
   */
  async buildDoiToDocidMap() {
    const journals = await this.fetchJournals();
    const map = new Map();
    for (const journal of journals) {
      let papers;
      try {
        papers = await this.fetchJournalPapers(journal.code);
      } catch (err) {
        // One failing journal should not empty the whole map: its DOIs
        // fall back to `resolveDocid()` at collection time.
        console.error(`[Episciences] Skipping ${journal.code} in DOI -> docid map: ${err.message}`);
        continue;
      }
      for (const p of papers) {
        if (p.doi) map.set(p.doi.toLowerCase(), p.docid);
      }
    }
    return map;
  }

  /**
   * Resolves a DOI to a docid when it was not found in the pre-indexed map
   * (e.g. newly published, or edge-case missing from papers index).
   * Checks direct 10.46298/{code}.{docid} pattern first, then queries the API.
   */
  async resolveDocid(doi) {
    if (!doi) return undefined;
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '').trim().toLowerCase();

    // 1. Direct pattern match for 10.46298/{code}.{docid}
    const match = cleanDoi.match(/^10\.46298\/[a-z0-9_-]+\.([0-9]+)$/i);
    if (match) {
      return Number(match[1]);
    }

    // 2. Query Episciences API by DOI
    await this._waitForRateLimit();
    try {
      const res = await fetch(`${this.baseUrl}/papers/?doi=${encodeURIComponent(cleanDoi)}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const member = data['hydra:member']?.[0];
        if (member?.docid) return member.docid;
      }
    } catch {
      // transient network failure; caller handles undefined
    }
    return undefined;
  }

  /**
   * Returns the platform's own export/json metadata for a docid, or
   * `undefined` on a transient failure (never cached, so it's retried on
   * the next run).
   */
  async fetchExport(docid) {
    const filePath = path.join(this.exportDir, `${docid}.json`);
    const cached = this._readCache(filePath, this.exportCacheDurationMs);
    if (cached !== undefined) return cached === null ? null : cached;

    await this._waitForRateLimit();
    try {
      const res = await fetch(`${this.baseUrl}/papers/export/${docid}/json`, { headers: { Accept: 'application/json' } });
      if (res.status === 404) {
        this._writeCache(filePath, JSON.stringify(null));
        return null;
      }
      if (!res.ok) {
        console.error(`[Episciences] export/${docid} HTTP ${res.status}`);
        return undefined;
      }
      const data = await res.json();
      this._writeCache(filePath, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error(`[Episciences] export/${docid} fetch error:`, err.message);
      return undefined;
    }
  }
}
