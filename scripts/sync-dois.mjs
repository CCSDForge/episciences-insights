import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { EpisciencesClient } from './episciences-client.mjs';

dotenv.config({ path: '.env.local' });

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
 * @returns {Promise<{ totalDois: number, newCount: number, csvPath: string, dois: string[] }>}
 */
export async function syncDois(options = {}) {
  const csvPath = path.resolve(options.csvPath || process.env.DOI_CSV_PATH || './publications.csv');
  const cacheDir = path.resolve(options.cacheDir || process.env.CACHE_DIRECTORY || './.cache');
  const client = options.episciencesClient || new EpisciencesClient({
    cacheDir: path.join(cacheDir, 'episciences'),
    indexCacheDays: options.indexCacheDays ?? 1,
  });

  console.log('[Sync DOIs] Moissonnage des revues et articles depuis l\'API Episciences...');
  const journals = await client.fetchJournals();
  console.log(`[Sync DOIs] ${journals.length} revues trouvées.`);

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

  // Sort alphabetically for clean and deterministic diffs
  const sortedDois = Array.from(doiMap.values()).sort((a, b) => a.localeCompare(b));

  const csvDir = path.dirname(csvPath);
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  fs.writeFileSync(csvPath, sortedDois.join('\n') + '\n', 'utf-8');

  console.log(`[Sync DOIs] Total d'articles examinés : ${totalPapers}`);
  console.log(`[Sync DOIs] DOIs uniques extraits : ${sortedDois.length}`);
  if (existingDois.size > 0) {
    console.log(`[Sync DOIs] Nouveaux DOIs ajoutés : ${newCount} (précédemment ${existingDois.size})`);
  } else {
    console.log(`[Sync DOIs] Fichier créé avec ${sortedDois.length} DOIs`);
  }
  console.log(`[Sync DOIs] Fichier sauvegardé : ${csvPath}`);

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
    console.error('[Sync DOIs] Erreur lors de la synchronisation :', err);
    process.exitCode = 1;
  });
}
