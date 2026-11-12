# Data Ingestion & Processing Pipeline

Episciences Insights aggregates metadata across open science infrastructures, harmonizes identifiers, enriches funding and affiliation records, and outputs minified, pre-compressed datasets for static deployment.

## Pipeline Architecture

```
                  ┌──────────────────────┐
                  │ Episciences REST API │ (sync DOIs, rvcode, review timelines)
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼──────────────────────┐
     │                       │                      │
┌────┴────────────┐  ┌───────┴─────────┐  ┌─────────┴─────────┐
│  OpenAlex API   │  │ OpenAIRE Graph  │  │ zbMATH Open (via  │
│  (works, topics)│  │ (grants, repos) │  │ Episciences exp.) │
└────┬────────────┘  └───────┬─────────┘  └─────────┬─────────┘
     │                       │                      │
     └───────────────────────┼──────────────────────┘
                             ▼
                 scripts/data-merger.mjs
                             ▼
              scripts/affiliation-enrichment.mjs (ROR)
                             ▼
                scripts/funder-enrichment.mjs (ROR)
                             ▼
               public/data/publications.json
               public/data/funders.json
                             ▼
                scripts/compress-data.mjs (.br, .gz)
```

---

## Execution Commands

### 1. Synchronize DOIs from Platform
```bash
npm run sync:dois
```
Harvests published DOIs directly from `api.episciences.org` into `publications.csv`.

### 2. Run Main Data Collection
```bash
npm run collect
```
Orchestrated by `scripts/fetch-data.mjs`:
- Resolves DOI to Episciences `docid`.
- Concurrently queries OpenAlex, OpenAIRE Graph v3, and the Episciences export.
- Leverages local caching in `.cache/` (30-day TTL for positive responses, 24-hour TTL for 404s).
- Merges all sources into canonical `Publication` records (`lib/types.ts`).
- Appends Episciences-declared affiliations with ROR disambiguation.
- Enriches funders with ROR coordinates and canonical names.
- Compresses outputs into `.json.gz` and `.json.br`.

### 3. (Optional) Harvest Linked Scholix Artifacts
```bash
npm run collect:links
```
Fetches research data and software links from the OpenAIRE Graph into `public/data/linked-outputs.json`.

### 4. Standalone Compression Pass
```bash
npm run compress
```
Pre-compresses datasets using Brotli and Gzip for production web server hosting.

---

## Environment Configuration

Create a `.env.local` file in the project root:

```bash
# OpenAlex API (polite pool / authenticated)
OPENALEX_API_KEY=your_key_here

# OpenAIRE Graph v3 API (Optional client credentials)
OPENAIRE_CLIENT_ID=
OPENAIRE_CLIENT_SECRET=
OPENAIRE_AUTH_URL=https://aai.openaire.eu/auth/realms/openaire/protocol/openid-connect/token
OPENAIRE_API_URL=https://api.openaire.eu/graph/v3/research-products
OPENAIRE_LINKS_URL=https://api.openaire.eu/graph/v3/research-products/links

# Episciences API
EPISCIENCES_API_URL=https://api.episciences.org/api

# Concurrency and Cache Settings
CONCURRENCY=8
SKIP_DOI_SYNC=false
DOI_CSV_PATH=./publications.csv
DATA_OUTPUT_PATH=./public/data/publications.json
CACHE_DIRECTORY=./.cache
CACHE_DURATION_DAYS=30
```

---

## Data Normalization Specifics

- **Journal Canonical Resolution**: OpenAlex often resolves repository aggregators (HAL, arXiv, DOAJ) instead of the hosting journal. The pipeline unconditionally enforces the canonical journal name and rvcode from the Episciences platform export.
- **Mathematics Subject Classification (MSC 2020)**: Extracted directly from zbMATH Open records embedded in the Episciences export.
- **JEL Economics Classification**: Extracted from OpenAIRE Graph `subjects[].subject` when scheme matches `'jel'`.
- **Institution Disambiguation**: Affiliations declared on Episciences with a ROR ID are merged with OpenAlex affiliations and geocoded via ROR.
