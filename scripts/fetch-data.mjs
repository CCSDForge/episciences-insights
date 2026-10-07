import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { OpenAlexClient } from './openalex-client.mjs';
import { OpenAlexFundersClient } from './openalex-funders-client.mjs';
import { RorClient } from './ror-client.mjs';
import { OpenAireTokenManager } from './openaire-token.mjs';
import { OpenAireClient } from './openaire-client.mjs';
import { EpisciencesClient } from './episciences-client.mjs';
import { mergePublication } from './data-merger.mjs';
import { enrichFunders } from './funder-enrichment.mjs';
import { compressData } from './compress-data.mjs';
import { syncDois } from './sync-dois.mjs';

dotenv.config({ path: '.env.local' });

const CSV_PATH = path.resolve(process.env.DOI_CSV_PATH || './publications.csv');
const OUTPUT_PATH = path.resolve(process.env.DATA_OUTPUT_PATH || './public/data/publications.json');
const FUNDERS_OUTPUT_PATH = path.resolve(path.dirname(OUTPUT_PATH), 'funders.json');
const CACHE_DIR = path.resolve(process.env.CACHE_DIRECTORY || './.cache');
const LOG_DIR = path.resolve('./logs');
const CACHE_DURATION_DAYS = Number(process.env.CACHE_DURATION_DAYS) || 30;
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY) || 8);

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const NOT_FOUND_LOG = path.join(LOG_DIR, 'not-found.log');

function logNotFound(source, doi) {
  fs.appendFileSync(NOT_FOUND_LOG, `${new Date().toISOString()} - [${source}] Not Found - ${doi}\n`);
}

async function pMap(items, mapper, concurrency = 8) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  const episciencesClient = new EpisciencesClient({
    cacheDir: path.join(CACHE_DIR, 'episciences'),
    exportCacheDays: CACHE_DURATION_DAYS,
  });

  if (process.env.SKIP_DOI_SYNC !== 'true' && !process.argv.includes('--no-sync')) {
    try {
      await syncDois({ csvPath: CSV_PATH, episciencesClient, cacheDir: CACHE_DIR });
    } catch (err) {
      console.warn('[Sync DOIs] Warning: Failed to sync DOIs with Episciences API, continuing with existing CSV:', err.message);
    }
  }

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[ERROR] CSV file not found: ${CSV_PATH}`);
    process.exitCode = 1;
    return;
  }

  const openAlexClient = new OpenAlexClient({
    cacheDir: path.join(CACHE_DIR, 'openalex'),
    cacheDays: CACHE_DURATION_DAYS,
    onNotFound: (doi) => logNotFound('OpenAlex', doi),
  });
  const tokenManager = new OpenAireTokenManager({ cacheDir: CACHE_DIR });
  const openAireClient = new OpenAireClient(tokenManager, {
    cacheDir: path.join(CACHE_DIR, 'openaire'),
    cacheDays: CACHE_DURATION_DAYS,
    onNotFound: (doi) => logNotFound('OpenAIRE', doi),
  });
  const openAlexFundersClient = new OpenAlexFundersClient({
    cacheDir: path.join(CACHE_DIR, 'openalex-funders'),
    cacheDays: CACHE_DURATION_DAYS,
  });
  const rorClient = new RorClient({
    cacheDir: path.join(CACHE_DIR, 'ror'),
    cacheDays: CACHE_DURATION_DAYS,
  });

  if (tokenManager.isConfigured()) {
    console.log('[OpenAIRE] Authenticated mode (registered service credentials found).');
  } else {
    console.log('[OpenAIRE] Anonymous mode (no OPENAIRE_CLIENT_ID/SECRET set).');
  }

  console.log('[Episciences] Resolving DOI -> docid map across all journals...');
  let doiToDocid;
  try {
    doiToDocid = await episciencesClient.buildDoiToDocidMap();
    console.log(`[Episciences] Resolved ${doiToDocid.size} DOIs across the platform.`);
  } catch (err) {
    console.error('[Episciences] Failed to build the DOI -> docid map, continuing without it:', err.message);
    doiToDocid = new Map();
  }

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const dois = content.split('\n').map((l) => l.trim()).filter(Boolean);
  console.log(`Starting collection for ${dois.length} DOIs (concurrency: ${CONCURRENCY})...`);

  let notFoundInOpenAlex = 0;
  let foundInOpenAire = 0;
  let foundInEpisciences = 0;
  let transientFailures = 0;
  let processedCount = 0;

  const rawResults = await pMap(dois, async (doi, i) => {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '').trim().toLowerCase();
    const docid = doiToDocid.get(cleanDoi);

    // Fetch from OpenAlex, OpenAIRE and Episciences concurrently for this DOI
    const [openAlexData, openAireResult, episciencesExport] = await Promise.all([
      openAlexClient.fetchByDoi(doi),
      openAireClient.fetchByDoi(doi),
      docid !== undefined ? episciencesClient.fetchExport(docid) : Promise.resolve(undefined),
    ]);

    let itemResult = null;

    if (openAlexData === null) {
      notFoundInOpenAlex++;
    } else if (openAlexData === undefined) {
      transientFailures++;
      console.error(`[${i + 1}/${dois.length}] [SKIP] Transient failure for ${doi}`);
    } else {
      if (openAireResult) {
        foundInOpenAire++;
      }

      if (episciencesExport) {
        foundInEpisciences++;
      } else if (docid === undefined || episciencesExport === null) {
        logNotFound('Episciences', doi);
      }

      itemResult = mergePublication(openAlexData, openAireResult, episciencesExport);
    }

    processedCount++;
    if (processedCount % 100 === 0 || processedCount === dois.length) {
      const mergedCount = processedCount - notFoundInOpenAlex - transientFailures;
      console.log(`[${processedCount}/${dois.length}] processed — ${mergedCount} merged, ${notFoundInOpenAlex} not found (OpenAlex), ${foundInOpenAire} enriched (OpenAIRE), ${foundInEpisciences} enriched (Episciences)`);
    }

    return itemResult;
  }, CONCURRENCY);

  const results = rawResults.filter(Boolean);

  const funders = await enrichFunders(results, { openAlexFundersClient, rorClient });
  fs.writeFileSync(FUNDERS_OUTPUT_PATH, JSON.stringify(funders, null, 2));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results));
  console.log('---');
  console.log(`Done. ${results.length} records written to ${OUTPUT_PATH} (minified)`);
  compressData();
  console.log(`  Not found in OpenAlex  : ${notFoundInOpenAlex}`);
  console.log(`  Enriched by OpenAIRE   : ${foundInOpenAire} (${((100 * foundInOpenAire) / results.length).toFixed(1)}%)`);
  console.log(`  Enriched by Episciences: ${foundInEpisciences} (${((100 * foundInEpisciences) / results.length).toFixed(1)}%)`);
  console.log(`  Transient failures     : ${transientFailures}`);
  console.log(`  Funders resolved       : ${Object.keys(funders).length} written to ${FUNDERS_OUTPUT_PATH}`);
}

run();
