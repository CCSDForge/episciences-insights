import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Opt-in pass: fetches OpenAIRE Scholix links (linked datasets / software)
 * for each publication already collected in publications.json.
 *
 * Kept separate from `npm run collect` on purpose — a live sample of 30
 * Episciences DOIs found links on ~10% of them (0.1 link/article), so
 * folding this into the main run would roughly double the request budget
 * for a field that stays sparse. Run explicitly with `npm run collect:links`.
 *
 * Output: public/data/linked-outputs.json, keyed by bare DOI (no
 * https://doi.org/ prefix), read by app/page.tsx if present.
 */

dotenv.config({ path: '.env.local' });

const PUBLICATIONS_PATH = path.resolve(process.env.DATA_OUTPUT_PATH || './public/data/publications.json');
const OUTPUT_PATH = path.resolve('./public/data/linked-outputs.json');
const CACHE_DIR = path.resolve(process.env.CACHE_DIRECTORY || './.cache', 'openaire-links');
const LINKS_URL = process.env.OPENAIRE_LINKS_URL || 'https://api.openaire.eu/graph/v3/research-products/links';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cacheFilePath(doi, targetType) {
  return path.join(CACHE_DIR, `${doi.replace(/[^a-z0-9]/gi, '_')}_${targetType}.json`);
}

// This sub-resource (research-products/links) appears to carry a tighter
// quota than the main research-products endpoint used elsewhere in the
// pipeline — a live run hit HTTP 429 well within the budget that's fine for
// openaire-client.mjs. Same backoff shape as that client (Retry-After header
// with an attempt-scaled fallback, up to 4 tries), plus a base delay that
// ratchets up once a 429 is seen and only relaxes after a sustained run of
// clean responses, so the rest of a long collection run doesn't keep
// slamming into the same limit every request.
const MIN_DELAY_MS = 600;
const MAX_DELAY_MS = 10000;
let currentDelayMs = MIN_DELAY_MS;
let cleanResponsesSinceBackoff = 0;

async function fetchLinks(doi, targetType) {
  const filePath = cacheFilePath(doi, targetType);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      // fall through to refetch
    }
  }

  const url = `${LINKS_URL}?sourcePid=${encodeURIComponent(doi)}&targetType=${targetType}&pageSize=100`;
  const maxRetries = 4;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await delay(currentDelayMs);

    let res;
    try {
      res = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch (err) {
      console.error(`[Links] Fetch error for ${doi} (${targetType}, attempt ${attempt}):`, err.message);
      if (attempt === maxRetries) return undefined;
      await delay(attempt * 2000);
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get('Retry-After')) || attempt * 5;
      currentDelayMs = Math.min(MAX_DELAY_MS, Math.max(currentDelayMs * 2, 3000));
      cleanResponsesSinceBackoff = 0;
      console.warn(`[Links] HTTP ${res.status} for ${doi} (${targetType}), waiting ${retryAfter}s (base delay now ${currentDelayMs}ms)...`);
      if (attempt === maxRetries) return undefined;
      await delay(retryAfter * 1000);
      continue;
    }

    if (!res.ok) {
      console.error(`[Links] HTTP ${res.status} for ${doi} (${targetType})`);
      return undefined;
    }

    cleanResponsesSinceBackoff++;
    if (currentDelayMs > MIN_DELAY_MS && cleanResponsesSinceBackoff >= 50) {
      currentDelayMs = Math.max(MIN_DELAY_MS, Math.round(currentDelayMs / 2));
      cleanResponsesSinceBackoff = 0;
    }

    const data = await res.json();
    const items = (data.results || []).map((r) => {
      const doiId = (r.target?.identifiers || []).find((id) => id.idScheme === 'doi');
      const anyId = doiId || r.target?.identifiers?.[0];
      return { pid: anyId?.id, url: anyId?.idUrl };
    }).filter((x) => x.pid);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    return items;
  }

  return undefined;
}

async function run() {
  if (!fs.existsSync(PUBLICATIONS_PATH)) {
    console.error(`[ERROR] ${PUBLICATIONS_PATH} not found — run "npm run collect" first.`);
    process.exitCode = 1;
    return;
  }

  const publications = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf-8'));
  console.log(`Checking Scholix links for ${publications.length} publications...`);

  const output = {};
  let withLinks = 0;
  let failed = 0;

  for (let i = 0; i < publications.length; i++) {
    const doi = String(publications[i].doi || '').replace(/^https?:\/\/doi\.org\//, '');
    if (!doi) continue;

    // Sequential, not Promise.all: the two calls would otherwise both read
    // the same currentDelayMs and fire together, doubling the burst rate
    // the backoff above is trying to avoid.
    const datasets = await fetchLinks(doi, 'dataset');
    const software = await fetchLinks(doi, 'software');

    if (datasets === undefined || software === undefined) {
      // Persistent failure after retries — nothing was cached for this DOI,
      // so a future run will pick it back up. Not counted as "no links".
      failed++;
    } else if (datasets.length || software.length) {
      output[doi] = { datasets, software };
      withLinks++;
    }

    if ((i + 1) % 200 === 0 || i === publications.length - 1) {
      console.log(`[${i + 1}/${publications.length}] ${withLinks} with linked outputs, ${failed} failed so far`);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Done. ${withLinks} publications with linked datasets/software written to ${OUTPUT_PATH}`);
  if (failed > 0) {
    console.warn(`${failed} publications could not be checked after retries (nothing cached for them) — re-run "npm run collect:links" to pick them back up.`);
  }
}

run();
