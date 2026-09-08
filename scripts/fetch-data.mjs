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

dotenv.config({ path: '.env.local' });

const CSV_PATH = path.resolve(process.env.DOI_CSV_PATH || './publications.csv');
const OUTPUT_PATH = path.resolve(process.env.DATA_OUTPUT_PATH || './public/data/publications.json');
const FUNDERS_OUTPUT_PATH = path.resolve(path.dirname(OUTPUT_PATH), 'funders.json');
const CACHE_DIR = path.resolve(process.env.CACHE_DIRECTORY || './.cache');
const LOG_DIR = path.resolve('./logs');
const CACHE_DURATION_DAYS = Number(process.env.CACHE_DURATION_DAYS) || 30;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const NOT_FOUND_LOG = path.join(LOG_DIR, 'not-found.log');

function logNotFound(doi) {
  fs.appendFileSync(NOT_FOUND_LOG, `${new Date().toISOString()} - 404 Not Found - ${doi}\n`);
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[ERROR] CSV file not found: ${CSV_PATH}`);
    process.exitCode = 1;
    return;
  }

  const openAlexClient = new OpenAlexClient({
    cacheDir: path.join(CACHE_DIR, 'openalex'),
    cacheDays: CACHE_DURATION_DAYS,
    onNotFound: logNotFound,
  });
  const tokenManager = new OpenAireTokenManager({ cacheDir: CACHE_DIR });
  const openAireClient = new OpenAireClient(tokenManager, {
    cacheDir: path.join(CACHE_DIR, 'openaire'),
    cacheDays: CACHE_DURATION_DAYS,
  });
  const episciencesClient = new EpisciencesClient({
    cacheDir: path.join(CACHE_DIR, 'episciences'),
    exportCacheDays: CACHE_DURATION_DAYS,
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
  console.log(`Starting collection for ${dois.length} DOIs...`);

  const results = [];
  let notFoundInOpenAlex = 0;
  let foundInOpenAire = 0;
  let foundInEpisciences = 0;
  let transientFailures = 0;

  for (let i = 0; i < dois.length; i++) {
    const doi = dois[i];
    const progress = `[${i + 1}/${dois.length}]`;

    const openAlexData = await openAlexClient.fetchByDoi(doi);
    if (openAlexData === null) {
      notFoundInOpenAlex++;
      continue;
    }
    if (openAlexData === undefined) {
      console.error(`${progress} [SKIP] Transient failure for ${doi}`);
      transientFailures++;
      continue;
    }

    const openAireResult = await openAireClient.fetchByDoi(doi);
    if (openAireResult) foundInOpenAire++;

    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '').trim().toLowerCase();
    const docid = doiToDocid.get(cleanDoi);
    const episciencesExport = docid !== undefined ? await episciencesClient.fetchExport(docid) : undefined;
    if (episciencesExport) foundInEpisciences++;

    results.push(mergePublication(openAlexData, openAireResult, episciencesExport));

    if ((i + 1) % 100 === 0 || i === dois.length - 1) {
      console.log(`${progress} processed — ${results.length} merged, ${notFoundInOpenAlex} not found (OpenAlex), ${foundInOpenAire} enriched (OpenAIRE), ${foundInEpisciences} enriched (Episciences)`);
    }
  }

  const funders = await enrichFunders(results, { openAlexFundersClient, rorClient });
  fs.writeFileSync(FUNDERS_OUTPUT_PATH, JSON.stringify(funders, null, 2));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log('---');
  console.log(`Done. ${results.length} records written to ${OUTPUT_PATH}`);
  console.log(`  Not found in OpenAlex  : ${notFoundInOpenAlex}`);
  console.log(`  Enriched by OpenAIRE   : ${foundInOpenAire} (${((100 * foundInOpenAire) / results.length).toFixed(1)}%)`);
  console.log(`  Enriched by Episciences: ${foundInEpisciences} (${((100 * foundInEpisciences) / results.length).toFixed(1)}%)`);
  console.log(`  Transient failures     : ${transientFailures}`);
  console.log(`  Funders resolved       : ${Object.keys(funders).length} written to ${FUNDERS_OUTPUT_PATH}`);
}

run();
