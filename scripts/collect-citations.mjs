import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { OpenCitationsClient } from './opencitations-client.mjs';

dotenv.config({ path: '.env.local' });

const PUBLICATIONS_PATH = path.resolve(process.env.DATA_OUTPUT_PATH || './public/data/publications.json');
const OPENCITATIONS_OUTPUT_PATH = path.resolve('./public/data/opencitations.json');
const VENUES_OUTPUT_PATH = path.resolve('./public/data/venue-citations.json');
const CACHE_DIR = path.resolve(process.env.CACHE_DIRECTORY || './.cache', 'opencitations');

function cleanDoi(doi) {
  return (doi || '').replace(/^https?:\/\/doi\.org\//i, '').toLowerCase().trim();
}

async function run() {
  if (!fs.existsSync(PUBLICATIONS_PATH)) {
    console.error(`Publications file not found: ${PUBLICATIONS_PATH}`);
    process.exit(1);
  }

  const publications = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf-8'));
  console.log(`Loaded ${publications.length} publications.`);

  const client = new OpenCitationsClient({
    apiKey: process.env.OPENCITATION_API_KEY,
    cacheDir: CACHE_DIR,
  });

  // 1. Process venue citation counts using authoritative Episciences journals
  console.log('\n--- Step 1: Collecting Venue Citation Counts ---');
  const journalsMap = new Map();
  const episciencesJournalsPath = path.resolve(CACHE_DIR, '../episciences/journals.json');

  if (fs.existsSync(episciencesJournalsPath)) {
    try {
      const canonicalJournals = JSON.parse(fs.readFileSync(episciencesJournalsPath, 'utf-8'));
      for (const j of canonicalJournals) {
        const issnSetting = j.settings?.find((s) => s.setting === 'ISSN' || s.setting === 'eISSN');
        if (issnSetting?.value) {
          journalsMap.set(j.code, {
            issn: issnSetting.value.trim(),
            journal_code: j.code,
            journal_name: j.name,
          });
        }
      }
      console.log(`Loaded ${journalsMap.size} canonical journals with official ISSN from Episciences index.`);
    } catch (e) {
      console.warn('Could not parse canonical journals, falling back to publications list:', e.message);
    }
  }

  // Fallback if cache/episciences/journals.json was absent: gather distinct codes
  if (journalsMap.size === 0) {
    for (const pub of publications) {
      const journal = pub.journal;
      if (journal && journal.issn && journal.code && !journalsMap.has(journal.code)) {
        journalsMap.set(journal.code, {
          issn: journal.issn,
          journal_code: journal.code,
          journal_name: journal.name,
        });
      }
    }
  }

  console.log(`Found ${journalsMap.size} official journals to query on OpenCitations.`);
  const venueCitations = {};

  for (const [code, info] of journalsMap.entries()) {
    try {
      const count = await client.fetchVenueCitationCount(info.issn);
      const record = {
        ...info,
        count,
      };
      venueCitations[code] = record;
      venueCitations[info.issn] = record;
      console.log(`[Venue] ${info.journal_name} (${info.issn}): ${count} citations`);
    } catch (err) {
      console.error(`Failed to fetch venue citations for ${info.issn}:`, err.message);
    }
  }

  fs.writeFileSync(VENUES_OUTPUT_PATH, JSON.stringify(venueCitations, null, 2));
  console.log(`Saved venue citations to ${VENUES_OUTPUT_PATH}`);

  // 2. Process article citations
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const sampleArg = process.argv.includes('--sample');

  let targetPubs = publications;
  if (limit) {
    targetPubs = publications.slice(0, limit);
    console.log(`\n--- Step 2: Collecting Article Citations (Limited to first ${limit}) ---`);
  } else if (sampleArg) {
    targetPubs = publications.slice(0, 50);
    console.log(`\n--- Step 2: Collecting Article Citations (Sample of 50) ---`);
  } else {
    console.log(`\n--- Step 2: Collecting Article Citations for all ${publications.length} DOIs ---`);
  }

  let opencitationsData = {};
  if (fs.existsSync(OPENCITATIONS_OUTPUT_PATH)) {
    try {
      opencitationsData = JSON.parse(fs.readFileSync(OPENCITATIONS_OUTPUT_PATH, 'utf-8'));
    } catch {
      opencitationsData = {};
    }
  }

  let processed = 0;
  let citationsFound = 0;
  for (const pub of targetPubs) {
    const doiKey = cleanDoi(pub.doi);
    if (!doiKey) continue;

    try {
      const impact = await client.fetchEnrichedImpact(doiKey);
      if (impact && impact.citation_count > 0) {
        opencitationsData[doiKey] = impact;
        citationsFound++;
      } else {
        opencitationsData[doiKey] = { citation_count: 0 };
      }
    } catch (err) {
      console.error(`Error processing DOI ${doiKey}:`, err.message);
    }

    processed++;
    if (processed % 25 === 0 || processed === targetPubs.length) {
      console.log(`[OpenCitations] Processed ${processed}/${targetPubs.length} (${citationsFound} with citations)`);
    }
  }

  fs.writeFileSync(OPENCITATIONS_OUTPUT_PATH, JSON.stringify(opencitationsData, null, 2));
  console.log(`\nSaved OpenCitations data to ${OPENCITATIONS_OUTPUT_PATH}`);

  // 3. Attach opencitations data directly into publications.json if requested or when running full collect
  let enrichedCount = 0;
  for (const pub of publications) {
    const doiKey = cleanDoi(pub.doi);
    if (opencitationsData[doiKey]) {
      pub.opencitations = opencitationsData[doiKey];
      if (pub.opencitations.citation_count > 0) enrichedCount++;
    }
  }

  fs.writeFileSync(PUBLICATIONS_PATH, JSON.stringify(publications, null, 2));
  console.log(`Updated ${PUBLICATIONS_PATH} with OpenCitations metrics (${enrichedCount} cited articles).`);
}

run().catch((err) => {
  console.error('Fatal error in collect-citations:', err);
  process.exit(1);
});
