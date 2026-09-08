# Episciences Insights

A modern visualization platform for scientific research impact, focusing on Diamond Open Access publications for Episciences Journals. This dashboard aggregates and analyzes data from the **OpenAlex API** and the **OpenAIRE Graph API (v3)** to track funding, Sustainable Development Goals (SDG) contributions, global author distribution, research topics, open science indicators, and scholarly lineage.

## ✨ Key Features

- **🎯 Funder Impact**: Visualize alignment with the 17 UN Sustainable Development Goals (SDG) and track funding volume.
- **🤝 Funder Synergy Web**: Discover co-funding patterns and collaborative networks between funding agencies, enriched with official OpenAIRE project codes/acronyms.
- **🔓 Open Science Signals**: Archival footprint (hosting repositories), license openness, and linked datasets/software, sourced from OpenAIRE Graph.
- **🌍 Global Reach**: Explore the international footprint of publications via an interactive world map and institutional collaboration networks.
- **🌳 Research Landscape**: Navigate research thierarchies through an interactive Treemap of domains and fields.
- **🧬 Research Lineage**: Trace the "Scientific DNA" of publications, mapping the foundations they build upon and the new frontiers they open.
- **📊 Data Explorer**: A comprehensive, searchable table of all publications and their associated metadata.

## 📈 Methodology: SDG Impact Score

The **SDG Impact Score** visualized in the Radar chart is calculated using a two-step process:

1.  **OpenAlex Confidence**: For every publication, the OpenAlex API provides a confidence score (from 0.0 to 1.0) for each of the 17 UN Sustainable Development Goals, based on automated classification algorithms.
2.  **Peak Impact Aggregation**: When filtering multiple publications (e.g., by year or journal), the dashboard displays the **maximum (peak) score** found across the selection for each goal. This approach highlights the strongest scientific alignment and specific areas of excellence within the research corpus, rather than diluting impact through averaging.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://reactjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Visualization**: [Recharts](https://recharts.org/), [react-simple-maps](https://www.react-simple-maps.io/), [d3-scale](https://d3js.org/d3-scale)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: Node.js (via the OpenAlex API and the OpenAIRE Graph v3 API)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏗 Project Structure

- `app/`: Next.js App Router and main page layout.
- `components/`: Core UI components and specialized visualizations.
- `lib/`: Shared TypeScript interfaces and utility types.
- `public/data/`: Location for the processed `publications.json` dataset.
- `scripts/`: Data collection and transformation scripts.
- `.cache/`: Local filesystem cache for API responses (ignored by git).

## 🚀 Getting Started

### 1. Configuration
Create a `.env.local` file in the root directory:
```bash
# Required
OPENALEX_API_KEY=your_openalex_key_if_any

# Optional — OpenAIRE Graph v3 enrichment (funding codes, open science indicators).
# Leave blank to run in anonymous mode; the client falls back gracefully.
OPENAIRE_CLIENT_ID=
OPENAIRE_CLIENT_SECRET=
```
Registered-service OpenAIRE credentials raise the API rate budget but are not required — the pipeline works, just slower, without them.

### 2. Data Ingestion
1. Add DOIs (one per line) to `publications.csv`.
2. Run the collection script:
   ```bash
   npm run collect
   ```
   This fetches metadata from OpenAlex, enriches it with OpenAIRE Graph v3 (funding codes/acronyms, hosting repositories, licenses, citation impact indicators, Diamond OA recognition), and saves the result to `public/data/publications.json`.
3. (Optional) Fetch linked datasets/software — a separate, slower pass kept out of the main run because coverage is low (~10% of publications):
   ```bash
   npm run collect:links
   ```
   Writes `public/data/linked-outputs.json`, picked up automatically by the dashboard if present.

### 3. Development
Start the local development server:
```bash
npm run dev
```

### 4. Build
```bash
npm run build
```
This runs `prebuild` (generating pre-compressed `.gz` and `.br` data files) and outputs the fully-rendered static site ready for deployment in the `out/` directory.

## 🌐 Production Deployment & Web Server Configuration

To deploy, synchronize the `out/` directory to your web server (e.g. using `rsync -avz --delete out/ user@server:/var/www/episciences-insights/out`).

To serve pre-compressed Brotli (`.br`, ~1.3 MB) and Gzip (`.gz`, ~2.4 MB) data files with zero CPU overhead while ensuring instant cache revalidation when new data is deployed, use the following virtual host configurations:

### Apache VirtualHost

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

        # 1. Serve pre-compressed static files directly (.br and .gz)
        <IfModule mod_rewrite.c>
            RewriteEngine On

            # Brotli priority if supported by client
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

            # Next.js immutable assets (_next/static/) : cache for 1 year
            <FilesMatch "\.(js|css)$">
                Header set Cache-Control "public, max-age=31536000, immutable"
            </FilesMatch>

            # JSON data : always revalidate so new data is visible immediately
            <FilesMatch "\.json(\.gz|\.br)?$">
                Header set Cache-Control "no-cache, must-revalidate"
            </FilesMatch>

            # HTML pages : revalidate
            <FilesMatch "\.html$">
                Header set Cache-Control "public, max-age=0, must-revalidate"
            </FilesMatch>
        </IfModule>

        # 2. Dynamic compression fallback for other files
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

    # 1. Serve pre-compressed files directly (.gz and .br)
    gzip_static on;       # http_gzip_static_module
    # brotli_static on;   # requires ngx_brotli (optional)

    # 2. Dynamic compression for HTML, CSS, JS, SVG
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

    # 3. Next.js hashed assets: immutable cache 1 year
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 4. JSON data: revalidate on each request for instant update visibility
    location ~* \.json(\.gz|\.br)?$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # 5. HTML: revalidate
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 📝 License

This project is licensed under the GPL v3 License.
Data is automatically aggregated from the [OpenAlex API](https://openalex.org).
