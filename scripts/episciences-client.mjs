import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    this.delayMs = Number(options.delayMs) || 300;

    this.exportDir = path.join(this.cacheDir, 'export');
    if (!fs.existsSync(this.exportDir)) fs.mkdirSync(this.exportDir, { recursive: true });
  }

  _readCache(filePath, maxAgeMs) {
    if (!fs.existsSync(filePath)) return undefined;
    const stats = fs.statSync(filePath);
    if (Date.now() - stats.mtimeMs >= maxAgeMs) return undefined;
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

    await delay(this.delayMs);
    const res = await fetch(`${this.baseUrl}/papers/?rvcode=${encodeURIComponent(rvcode)}&pagination=false`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.error(`[Episciences] /papers/?rvcode=${rvcode} HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    this._writeCache(filePath, JSON.stringify(data, null, 2));
    return data;
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
      const papers = await this.fetchJournalPapers(journal.code);
      for (const p of papers) {
        if (p.doi) map.set(p.doi.toLowerCase(), p.docid);
      }
    }
    return map;
  }

  /**
   * Returns the platform's own export/json metadata for a docid, or
   * `undefined` on a transient failure (never cached, so it's retried on
   * the next run).
   */
  async fetchExport(docid) {
    const filePath = path.join(this.exportDir, `${docid}.json`);
    const cached = this._readCache(filePath, this.exportCacheDurationMs);
    if (cached !== undefined) return cached;

    await delay(this.delayMs);
    try {
      const res = await fetch(`${this.baseUrl}/papers/export/${docid}/json`, { headers: { Accept: 'application/json' } });
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
