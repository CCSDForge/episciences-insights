import fs from 'node:fs';
import path from 'node:path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Client for the ROR REST API (https://ror.readme.io/docs/rest-api),
 * used solely to geolocate funders — OpenAlex's funder entity already
 * gives a `country_code` (see openalex-funders-client.mjs) but no
 * coordinates. Institutions don't need this client: `Institution.country`
 * is already populated from OpenAlex's `authorships[].institutions[].country_code`.
 *
 * No auth required today. Documented rate limit: 2000 req/5min per IP,
 * generous enough for the few hundred distinct funders in this corpus.
 * A client ID becomes mandatory from Q3 2026 (anonymous limit drops to
 * 50 req/5min) — not wired up yet since it isn't required.
 */
export class RorClient {
  constructor(options = {}) {
    this.cacheDir = path.resolve(options.cacheDir || './.cache/ror');
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
   * Shared GET + cache + retry/backoff plumbing for both endpoints below.
   * `parse(data)` turns the raw JSON into whatever should be cached and
   * returned; `label` is only used in log lines.
   */
  async _get(url, cacheKey, parse, label) {
    const filePath = this._cacheFilePath(cacheKey);

    const cached = this._readCache(filePath);
    if (cached !== undefined) return cached;

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await delay(this.delayMs);

      let response;
      try {
        response = await fetch(url);
      } catch (err) {
        console.error(`[ROR] Fetch error for ${label} (attempt ${attempt}):`, err.message);
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
        console.warn(`[ROR] HTTP ${response.status} for ${label}, retrying in ${retryAfter}s...`);
        if (attempt === maxRetries) return undefined;
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`[ROR] HTTP ${response.status} for ${label}`);
        return undefined;
      }

      const data = await response.json();
      const result = parse(data);
      this._writeCache(filePath, JSON.stringify(result, null, 2));
      return result;
    }

    return undefined;
  }

  /**
   * Returns `{ country_code, country_name, lat, lng }` read from the
   * first `locations[]` entry of a ROR organization (short id, e.g.
   * "04hrrh248", or a full https://ror.org/... URL) — organizations with
   * several sites (e.g. the European Commission) only expose one point
   * this way, which is an accepted simplification for a corpus-level map.
   * Returns `null` on a confirmed 404 or an organization with no
   * `locations[]` (both cached, never retried), or `undefined` on a
   * transient failure (never cached).
   */
  async fetchById(rorId) {
    const cleanId = rorId.replace(/^https?:\/\/ror\.org\//i, '').trim();
    const url = `https://api.ror.org/v2/organizations/${cleanId}`;
    return this._get(url, cleanId, (data) => {
      const details = data.locations?.[0]?.geonames_details;
      return details ? {
        country_code: details.country_code || null,
        country_name: details.country_name || null,
        lat: typeof details.lat === 'number' ? details.lat : null,
        lng: typeof details.lng === 'number' ? details.lng : null,
      } : null;
    }, cleanId);
  }

  /**
   * Matches a free-text organization name (e.g. a funder name pulled
   * straight from OpenAIRE, never seen by OpenAlex) against ROR's
   * affiliation-matching endpoint. Only ROR's own top pick (`chosen: true`)
   * is returned — never a lower-ranked candidate — to keep the false-positive
   * rate down; `score` (0-1, ROR's own confidence) is returned alongside so
   * callers can log/audit low-confidence matches instead of trusting them
   * blindly. Returns `null` when nothing is chosen, `undefined` on a
   * transient failure (never cached).
   */
  async matchAffiliation(name) {
    const cacheKey = `affil_${name.toLowerCase().trim()}`;
    const url = `https://api.ror.org/v2/organizations?affiliation=${encodeURIComponent(name)}`;
    return this._get(url, cacheKey, (data) => {
      const match = (data.items || []).find((item) => item.chosen);
      if (!match) return null;
      const org = match.organization;
      const displayName = org.names?.find((n) => n.types?.includes('ror_display'))?.value || org.names?.[0]?.value;
      const details = org.locations?.[0]?.geonames_details;
      return {
        ror: org.id.replace(/^https?:\/\/ror\.org\//i, ''),
        name: displayName,
        score: match.score,
        country_code: details?.country_code || null,
        country_name: details?.country_name || null,
        lat: typeof details?.lat === 'number' ? details.lat : null,
        lng: typeof details?.lng === 'number' ? details.lng : null,
      };
    }, `affiliation:${name}`);
  }
}
