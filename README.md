# Episciences Insights

A modern visualization and analytics platform for scientific research impact, focusing on Diamond Open Access publications hosted on the [Episciences](https://www.episciences.org) platform.

The dashboard aggregates and synthesizes data from the **OpenAlex API**, the **OpenAIRE Graph API (v3)**, the **Episciences Platform API**, the **ROR API**, and **Episciences usage analytics (Matomo KPIs)** to provide comprehensive insights into funding, Sustainable Development Goals (SDG) contributions, global author footprint, research topics, open science indicators, readership, and editorial timelines.

---

## ✨ Key Features

- **👥 Persona-Driven Dashboards**: Tailored views designed for specific stakeholder needs:
  - **Platform Overview (`/platform`)**: Platform-wide KPIs, journal portfolio distribution, peer-review acceptance durations, and top funding bodies.
  - **Journal Editorial View (`/journals`)**: Deep dive for editorial boards covering readership analytics, author geographic reach, preprint repository footprint, and disciplinary landscapes.
  - **Institution Impact (`/institutions`)**: Dedicated indicators for universities and research bodies to measure their contribution, co-authorship networks, and research grants.
- **🌐 Full Internationalization (i18n)**: Native multilingual support in **French**, **English**, and **Spanish** with localized App Router paths (`/fr`, `/en`, `/es`).
- **📖 Readership & Usage Analytics (`/usage`)**: Longitudinal trends of article downloads, abstract page views, and geographic distribution of readers worldwide.
- **🎯 Funder Impact & UN SDGs (`/funders`)**: Radar visualization of alignment with the 17 UN Sustainable Development Goals, funder synergy networks, geographic funding flows, and co-funding matrices.
- **🌍 Global Reach & International Collaboration (`/reach`)**: Interactive world map of contributing authors, top country rankings, institutional explorer disambiguated via ROR IDs, and collaboration networks.
- **🌳 Topics & MSC 2020 Classifications (`/topics`)**: Multi-level domain/field treemaps, topic co-occurrence graphs, and zbMATH Open **MSC 2020** (Mathematics Subject Classification) co-occurrence matrices.
- **🔓 Open Science & Diamond Model (`/open-science`)**: Preprint repository footprint (HAL, arXiv, bioRxiv, etc.), license openness, Diamond Open Access recognition, and linked outputs (datasets & software via Scholix).
- **💾 Universal Data & Chart Export**: Integrated export menus on all visualizations:
  - **Vector & Image**: SVG and high-resolution PNG (Retina 2× with theme-aware background).
  - **Structured Data**: CSV (Excel-compatible with UTF-8 BOM) and formatted JSON, including full 2D co-occurrence matrices.
- **🎨 Accessible & Branded Theming**: Light, dark, and system themes built in strict compliance with the **Episciences (Cyan)** and **CCSD (Bleu)** institutional brand identities, fully accessible via WAI-ARIA standards.

---

## 📈 Methodology & Data Sources

| Source | Role & Extracted Metrics |
| :--- | :--- |
| **Episciences API** (`api.episciences.org`) | Automated DOI harvesting, canonical journal metadata, peer-review review-to-publication timelines, zbMATH Open MSC 2020 codes, and declared author affiliations with ROR IDs. |
| **OpenAlex API** | Publication metadata, citation counts, topic modeling (fields, subfields, concepts), author affiliations, and UN Sustainable Development Goals (SDG) confidence scores. |
| **OpenAIRE Graph v3** | Research grant codes, funder acronyms, open access hosting repositories, licenses, and Scholix links to research data and software. |
| **ROR API** | Disambiguation of academic institutions and funder geographic coordinates (latitude/longitude). |
| **zbMATH Open** | Mathematics Subject Classification 2020 (MSC 2020) official taxonomy codes. |
| **Natural Earth & world-atlas** | Self-hosted TopoJSON world basemap (`countries-110m.json`, ISC license / Public Domain) ensuring zero third-party tracking calls. |
| **Episciences KPI Logs** | Article downloads, page views, and geographic readership metrics (Matomo-derived). |

### SDG Impact Score Calculation
The **SDG Impact Score** in the radar chart uses a two-step aggregation:
1. **OpenAlex Confidence**: Each publication receives a confidence score (0.0 to 1.0) for each of the 17 UN SDGs via automated classification models.
2. **Peak Impact Aggregation**: Across filtered sets (by year, journal, or discipline), the dashboard displays the **maximum (peak) score** found across the selection for each goal, highlighting specific areas of scientific excellence rather than diluting impact through averaging.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Static Site Generation / SSG)
- **UI Library**: [React 19](https://reactjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Visualizations**:
  - [Recharts](https://recharts.org/) (Bar charts, Line charts, Area charts, Treemaps)
  - [react-simple-maps](https://www.react-simple-maps.io/) & [d3-geo](https://d3js.org/d3-geo) (Geospatial world maps)
  - [d3-force](https://d3js.org/d3-force) & [d3-sankey](https://d3js.org/d3-sankey) (Force-directed networks, flow diagrams)
  - [graphology](https://graphology.github.io/) & [graphology-communities-louvain](https://github.com/graphology/graphology-communities-louvain) (Graph clustering and community detection)
- **Icons & Tooltips**: [Lucide React](https://lucide.dev/), [React Tooltip](https://react-tooltip.com/)
- **Data Ingestion**: Node.js scripts orchestrating concurrent API fetching, retry backoff, normalization, and Brotli/Gzip compression.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type safety)

---

## 🏗 Project Structure

```
├── app/
│   ├── page.tsx                     # Root entry with automatic locale redirect
│   └── [locale]/                    # Localized routes (/fr, /en, /es)
│       ├── layout.tsx               # Shell (Header, Language/Theme Providers, GlobalFilterBar)
│       ├── page.tsx                 # Home portal & persona selection
│       ├── platform/page.tsx        # Platform Governance view
│       ├── journals/page.tsx        # Journal Editorial dashboard
│       ├── institutions/page.tsx    # Academic & Research Institutions view
│       ├── funders/page.tsx         # Funding impact, SDG radar, and co-funding
│       ├── reach/page.tsx           # Global reach, world map, and affiliations
│       ├── topics/page.tsx          # Topic landscapes and MSC 2020 matrix
│       ├── open-science/page.tsx    # Preprint repositories, licenses, linked data
│       ├── usage/page.tsx           # Article downloads, views, and readership
│       ├── network/page.tsx         # Interactive network explorer
│       └── help/page.tsx            # Documentation and methodology
├── components/                      # Reusable UI, charts, and section views
│   ├── sections/                    # Page section implementations
│   ├── ChartExportMenu.tsx          # Accessible chart/data export dropdown
│   ├── CoOccurrenceMatrix.tsx       # Vector SVG co-occurrence heatmap
│   ├── WorldMap.tsx                 # Interactive Choropleth map
│   └── ...
├── lib/
│   ├── types.ts                     # TypeScript data models (Publication, Funder, etc.)
│   ├── exportUtils.ts               # SVG/PNG rasterization (2x Retina) and CSV/JSON engine
│   ├── data.ts                      # Server-side data loaders
│   └── i18n/                        # Dictionaries (fr, en, es) and context
├── public/data/
│   ├── publications.json            # Main processed publications corpus (+ .gz, .br)
│   ├── funders.json                 # Normalized funder directory
│   └── linked-outputs.json          # Optional OpenAIRE Scholix links (data/software)
├── kpi_downloads.json               # Readership and download KPI metrics
├── scripts/                         # ETL, API clients, and compression scripts
└── .cache/                          # Local cache directory for API queries
```

---

## 🚀 Getting Started

### 1. Configuration
Create a `.env.local` file in the root directory:
```bash
# OpenAlex API Key (recommended for higher rate limits)
OPENALEX_API_KEY=your_openalex_key_here

# OpenAIRE Graph v3 (Optional — anonymous mode supported with lower rate limits)
OPENAIRE_CLIENT_ID=
OPENAIRE_CLIENT_SECRET=
OPENAIRE_AUTH_URL=https://aai.openaire.eu/oidc/token
OPENAIRE_API_URL=https://api.openaire.eu/graph/v3/research-products
OPENAIRE_LINKS_URL=https://api.openaire.eu/graph/v3/research-products/links

# Episciences API
EPISCIENCES_API_URL=https://api.episciences.org/api

# Execution Settings (Optional)
CONCURRENCY=8
SKIP_DOI_SYNC=false
DOI_CSV_PATH=./publications.csv
DATA_OUTPUT_PATH=./public/data/publications.json
```

### 2. Data Ingestion Pipeline

1. **Synchronize DOIs from the platform API**:
   ```bash
   npm run sync:dois
   ```
   Synchronizes all published DOIs directly from the Episciences platform into `publications.csv`.

2. **Collect and enrich metadata**:
   ```bash
   npm run collect
   ```
   This orchestrates:
   - Automated DOI synchronization (if not skipped).
   - Concurrent metadata retrieval from OpenAlex, OpenAIRE Graph v3, and the Episciences platform export.
   - Intelligent local file-system caching (`.cache/`) with negative caching for 404s.
   - Affiliation enrichment and country resolution via ROR (`scripts/affiliation-enrichment.mjs`).
   - Funder geolocation and canonical name normalization (`scripts/funder-enrichment.mjs`).
   - Output minification to `public/data/publications.json` and automatic pre-compression into `.gz` and `.br`.

3. **(Optional) Fetch linked research data & software (Scholix)**:
   ```bash
   npm run collect:links
   ```
   Retrieves Scholix relation links from the OpenAIRE Graph (`/research-products/links`) into `public/data/linked-outputs.json`. Scholix is an RDA/WDS standard framework for exchanging links between scholarly literature, research data, and software.

4. **Pre-compress datasets**:
   ```bash
   npm run compress
   ```

### 3. Development
Start the local development server with Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build & Static Export
```bash
npm run build
```
This runs `prebuild` (data compression) and compiles the static site into the `out/` directory ready for deployment on any web server or CDN.

---

## 🌐 Production Web Server Configuration

To serve pre-compressed Brotli (`.br`) and Gzip (`.gz`) files with zero runtime CPU compression overhead and instant cache revalidation:

### Apache VirtualHost (`.htaccess` / `vhost.conf`)

```apache
<VirtualHost *:80>
    ServerName insights.episciences.org
    DocumentRoot /var/www/episciences-insights/out

    <Directory /var/www/episciences-insights/out>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html

        ErrorDocument 404 /404.html

        # 1. Serve pre-compressed static assets (.br and .gz)
        <IfModule mod_rewrite.c>
            RewriteEngine On

            # Brotli priority if accepted by client
            RewriteCond %{HTTP:Accept-Encoding} br
            RewriteCond %{REQUEST_FILENAME}.br -f
            RewriteRule ^(.*)$ $1.br [L]

            # Gzip fallback
            RewriteCond %{HTTP:Accept-Encoding} gzip
            RewriteCond %{REQUEST_FILENAME}.gz -f
            RewriteRule ^(.*)$ $1.gz [L]
        </IfModule>

        <IfModule mod_headers.c>
            <Files *.json.br>
                ForceType application/json
                Header set Content-Encoding br
                Header append Vary Accept-Encoding
            </Files>

            <Files *.json.gz>
                ForceType application/json
                Header set Content-Encoding gzip
                Header append Vary Accept-Encoding
            </Files>

            # Next.js immutable assets (_next/static/) : 1 year cache
            <FilesMatch "\.(js|css)$">
                Header set Cache-Control "public, max-age=31536000, immutable"
            </FilesMatch>

            # JSON datasets: revalidate on deployment
            <FilesMatch "\.json(\.gz|\.br)?$">
                Header set Cache-Control "no-cache, must-revalidate"
            </FilesMatch>

            # HTML pages: immediate revalidation
            <FilesMatch "\.html$">
                Header set Cache-Control "public, max-age=0, must-revalidate"
            </FilesMatch>
        </IfModule>

        # 2. Dynamic compression fallback for uncompressed resources
        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
            AddOutputFilterByType DEFLATE text/javascript application/javascript application/json image/svg+xml
        </IfModule>
    </Directory>
</VirtualHost>
```

### Nginx

```nginx
server {
    listen 80;
    server_name insights.episciences.org;
    root /var/www/episciences-insights/out;
    index index.html;

    error_page 404 /404.html;

    # 1. Serve pre-compressed static assets directly
    gzip_static on;       # ngx_http_gzip_static_module
    # brotli_static on;   # requires ngx_brotli module

    # 2. Dynamic compression fallback
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # 3. Next.js static assets: cache 1 year
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 4. JSON datasets: revalidate on each request
    location ~* \.json(\.gz|\.br)?$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # 5. HTML pages: revalidate
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## 📝 License

This project is licensed under the **GPL v3 License**.  
Scientific metadata is aggregated from [Episciences](https://www.episciences.org), [OpenAlex](https://openalex.org), [OpenAIRE](https://explore.openaire.eu), and [ROR](https://ror.org).
