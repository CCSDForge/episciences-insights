import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load .env.local for development
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENALEX_API_KEY;
const CSV_PATH = path.resolve(process.env.DOI_CSV_PATH || './publications.csv');
const OUTPUT_PATH = path.resolve(process.env.DATA_OUTPUT_PATH || './public/data/publications.json');
const CACHE_DIR = path.resolve(process.env.CACHE_DIRECTORY || './.cache');
const CACHE_DURATION_MS = (parseInt(process.env.CACHE_DURATION_DAYS) || 30) * 24 * 60 * 60 * 1000;

// Ensure directories exist
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function transform(data) {
  return {
    doi: data.doi,
    title: data.title,
    year: data.publication_year,
    journal: {
      name: data.primary_location?.source?.display_name?.replace(/\s+/g, ' ').trim(),
      issn: data.primary_location?.source?.issn?.[0],
      id: data.primary_location?.source?.id
    },
    authors: data.authorships?.map(a => ({
      name: a.author?.display_name,
      orcid: a.author?.orcid || null,
      institutions: a.institutions?.map(i => ({
        name: i.display_name,
        ror: i.ror || null,
        country: i.country_code
      })) || []
    })) || [],
    sdgs: data.sustainable_development_goals?.map(s => ({
      label: s.display_name,
      id: s.id,
      score: s.score || 0
    })) || [],
    awards: (data.grants || data.awards || []).map(g => ({
      name: g.funder_display_name || g.display_name,
      id: g.award_id || g.funder_award_id,
      funder: g.funder_display_name || g.funder
    })),
    primary_topic: data.primary_topic ? {
      name: data.primary_topic.display_name,
      id: data.primary_topic.id,
      subfield: data.primary_topic.subfield?.display_name,
      field: data.primary_topic.field?.display_name,
      domain: data.primary_topic.domain?.display_name
    } : null,
    topics: data.topics?.map(t => ({
      name: t.display_name,
      id: t.id,
      score: t.score || 0
    })) || [],
    referenced_works_count: data.referenced_works_count || 0,
    referenced_works: data.referenced_works || [],
    related_works: data.related_works || []
  };
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWorkData(doi) {
  // Ensure DOI doesn't have double https://doi.org/ prefix if already present in CSV
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '');
  const fileName = `${cleanDoi.replace(/[^a-z0-9]/gi, '_')}.json`;
  const filePath = path.join(CACHE_DIR, fileName);

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (Date.now() - stats.mtimeMs < CACHE_DURATION_MS) {
      console.log(`[CACHE] ${cleanDoi}`);
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error(`[ERROR] Failed to parse cache for ${cleanDoi}`);
      }
    }
  }

  // OpenAlex works URL format: https://api.openalex.org/works/https://doi.org/{doi}
  // The API key can be passed via header or query param. Let's stick to query param as in user's example.
  const url = `https://api.openalex.org/works/https://doi.org/${cleanDoi}${API_KEY ? `?api_key=${API_KEY}` : ''}`;
  
  console.log(`[API] Fetching ${cleanDoi}...`);
  await delay(200); // 200ms delay between requests

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[ERROR] API response not OK (${response.status}) for ${cleanDoi}`);
      // Do not cache errors
      return null;
    }
    const data = await response.json();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`[ERROR] Fetch failed for ${cleanDoi}:`, error.message);
    return null;
  }
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[ERROR] CSV file not found: ${CSV_PATH}`);
    return;
  }
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const dois = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log(`Starting collection for ${dois.length} DOIs...`);
  
  const results = [];
  for (const doi of dois) {
    const raw = await getWorkData(doi);
    if (raw) {
      results.push(transform(raw));
    }
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Success! ${results.length} records written to ${OUTPUT_PATH}`);
}

run();
