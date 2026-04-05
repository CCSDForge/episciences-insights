# Episciences Insights

A modern visualization platform for scientific research impact, focusing on Diamond Open Access publications for Episciences Journals. This dashboard aggregates and analyzes data from the **OpenAlex API** to track funding, Sustainable Development Goals (SDG) contributions, global author distribution, research topics, and scholarly lineage.

## ✨ Key Features

- **🎯 Funder Impact**: Visualize alignment with the 17 UN Sustainable Development Goals (SDG) and track funding volume.
- **🤝 Funder Synergy Web**: Discover co-funding patterns and collaborative networks between funding agencies.
- **🌍 Global Reach**: Explore the international footprint of publications via an interactive world map and institutional collaboration networks.
- **🌳 Research Landscape**: Navigate research thierarchies through an interactive Treemap of domains and fields.
- **🧬 Research Lineage**: Trace the "Scientific DNA" of publications, mapping the foundations they build upon and the new frontiers they open.
- **📊 Data Explorer**: A comprehensive, searchable table of all publications and their associated metadata.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://reactjs.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Visualization**: [Recharts](https://recharts.org/), [react-simple-maps](https://www.react-simple-maps.io/), [d3-scale](https://d3js.org/d3-scale)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: Node.js (via OpenAlex API)
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
Create a `.env.local` file in the root directory and add your OpenAlex API key:
```bash
OPENALEX_API_KEY=your_key_here
```

### 2. Data Ingestion
1. Add DOIs (one per line) to `publications.csv`.
2. Run the collection script:
   ```bash
   npm run collect
   ```
   This script fetches metadata from OpenAlex, applies cleaning (trimming, space normalization), and saves the result to `public/data/publications.json`.

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
