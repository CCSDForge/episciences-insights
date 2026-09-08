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

## 📝 License

This project is licensed under the GPL v3 License.
Data is automatically aggregated from the [OpenAlex API](https://openalex.org).
