import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { EpisciencesClient } from './episciences-client.mjs';

dotenv.config({ path: '.env.local' });

// Maximum share of existing DOIs a sync may drop before it refuses to
// overwrite the CSV (override with SYNC_MAX_REMOVED_RATIO).
const DEFAULT_MAX_REMOVED_RATIO = 0.02;

/**
 * Normalizes a DOI string: trims whitespace and strips leading URL prefixes.
 *
 * @param {string} doi
 * @returns {string}
 */
export function cleanDoi(doi) {
  if (!doi || typeof doi !== 'string') return '';
  return doi
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .trim();
}

/**
 * Synchronizes the list of DOIs from the Episciences platform API
 * into the target CSV file.
 *
 * @param {object} [options]
 * @param {string} [options.csvPath] Path to output CSV file
 * @param {string} [options.cacheDir] Local cache directory
 * @param {number} [options.indexCacheDays] Cache duration in days for journals/papers index
 * @param {EpisciencesClient} [options.episciencesClient] Pre-instantiated client
 * @param {boolean} [options.allowShrink] Overwrite even if many existing DOIs would be removed
 * @param {number} [options.maxRemovedRatio] Share of existing DOIs that may be removed (default 0.02)
 * @returns {Promise<{ totalDois: number, newCount: number, csvPath: string, dois: string[] }>}
 */
export async function syncDois(options = {}) {
  const csvPath = path.resolve(options.csvPath || process.env.DOI_CSV_PATH || './publications.csv');
  const cacheDir = path.resolve(options.cacheDir || process.env.CACHE_DIRECTORY || './.cache');
  const client = options.episciencesClient || new EpisciencesClient({
    cacheDir: path.join(cacheDir, 'episciences'),
    indexCacheDays: options.indexCacheDays ?? 1,
  });

  console.log('[Sync DOIs] Harvesting journals and papers from the Episciences API...');
  const journals = await client.fetchJournals();
  console.log(`[Sync DOIs] Found ${journals.length} journals.`);

  // Map lowercase DOI -> original canonical DOI
  const doiMap = new Map();
  let totalPapers = 0;

  for (const journal of journals) {
    const papers = await client.fetchJournalPapers(journal.code);
    if (!Array.isArray(papers)) continue;
    totalPapers += papers.length;
    for (const paper of papers) {
      const doi = cleanDoi(paper.doi);
      if (doi) {
        const lower = doi.toLowerCase();
        if (!doiMap.has(lower)) {
          doiMap.set(lower, doi);
        }
      }
    }
  }

  // Check existing DOIs in CSV to count additions
  const existingDois = new Set();
  if (fs.existsSync(csvPath)) {
    const existingContent = fs.readFileSync(csvPath, 'utf-8');
    for (const line of existingContent.split('\n')) {
      const cleaned = cleanDoi(line);
      if (cleaned) {
        existingDois.add(cleaned.toLowerCase());
      }
    }
  }

  let newCount = 0;
  for (const lower of doiMap.keys()) {
    if (!existingDois.has(lower)) {
      newCount++;
    }
  }

  // The CSV is rewritten wholesale from the API listing, so a truncated
  // listing (e.g. the 1000-item cap that once dropped 1954 DMTCS/LMCS DOIs)
  // would silently shrink the corpus. Count the DOIs that would disappear,
  // not the net total, so new papers cannot mask a loss, and refuse to write
  // above the threshold. A legitimate large removal can be forced.
  const removedDois = [...existingDois].filter((lower) => !doiMap.has(lower));
  if (removedDois.length > 0) {
    const maxRemovedRatio = Number(options.maxRemovedRatio ?? process.env.SYNC_MAX_REMOVED_RATIO ?? DEFAULT_MAX_REMOVED_RATIO);
    const allowShrink = options.allowShrink
      ?? (process.env.SYNC_ALLOW_SHRINK === 'true' || process.argv.includes('--allow-shrink'));
    const removedRatio = removedDois.length / existingDois.size;
    const sample = removedDois.slice(0, 5).join(', ');
    if (removedRatio > maxRemovedRatio && !allowShrink) {
      throw new Error(
        `Refusing to overwrite ${csvPath}: ${removedDois.length}/${existingDois.size} existing DOIs ` +
        `(${(removedRatio * 100).toFixed(1)}%) are missing from the API listing, above the ` +
        `${(maxRemovedRatio * 100).toFixed(1)}% threshold (e.g. ${sample}). ` +
        'If this removal is legitimate, rerun with --allow-shrink or SYNC_ALLOW_SHRINK=true.'
      );
    }
    console.warn(`[Sync DOIs] ${removedDois.length} DOIs no longer listed by the API will be removed (e.g. ${sample}).`);
  }

  // Sort alphabetically for clean and deterministic diffs
  const sortedDois = Array.from(doiMap.values()).sort((a, b) => a.localeCompare(b));

  const csvDir = path.dirname(csvPath);
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  fs.writeFileSync(csvPath, sortedDois.join('\n') + '\n', 'utf-8');

  console.log(`[Sync DOIs] Total papers scanned: ${totalPapers}`);
  console.log(`[Sync DOIs] Unique DOIs extracted: ${sortedDois.length}`);
  if (existingDois.size > 0) {
    console.log(`[Sync DOIs] New DOIs added: ${newCount} (previously ${existingDois.size})`);
  } else {
    console.log(`[Sync DOIs] File created with ${sortedDois.length} DOIs`);
  }
  console.log(`[Sync DOIs] File saved: ${csvPath}`);

  return {
    totalDois: sortedDois.length,
    newCount,
    csvPath,
    dois: sortedDois,
  };
}

const isMain = process.argv[1] && (
  process.argv[1] === import.meta.filename ||
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
);

if (isMain) {
  syncDois().catch((err) => {
    console.error('[Sync DOIs] Synchronization error:', err);
    process.exitCode = 1;
  });
}
