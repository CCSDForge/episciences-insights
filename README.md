# Episciences Insights

[![Next.js 16](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)
[![Data: CC-BY 4.0](https://img.shields.io/badge/Data-CC--BY_4.0-lightgrey.svg?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)
[![Episciences](https://img.shields.io/badge/Platform-Episciences-0aa0be?style=flat-square)](https://www.episciences.org)
[![CCSD](https://img.shields.io/badge/Developed_by-CCSD-00005f?style=flat-square)](https://www.ccsd.cnrs.fr)

A visualization and analytics platform dedicated to Diamond Open Access scientific research published on the [Episciences](https://www.episciences.org) platform.

Developed by the **CCSD** (Centre pour la Communication Scientifique Directe, UAR 3668), Episciences Insights aggregates and cross-analyzes data from open research infrastructures—including **OpenAlex**, **OpenAIRE Graph**, **Episciences Platform API**, **zbMATH Open**, and **ROR**—to provide transparent indicators on scientific impact, open science practices, international readership, and research funding without proprietary bibliometric indices.

---

## Overview & Persona Dashboards

The application organizes indicators around tailored stakeholder views:

- **Journal Editorial Teams (`/journals`)**: Readership metrics (downloads and page views), author geographical diversity, preprint repository footprint (HAL, arXiv, Zenodo), disciplinary landscapes, and project funders.
- **Institutions & Universities (`/institutions`)**: Footprint of academic institutions across Episciences overlay journals, international co-authorship networks, and supporting research funding bodies.
- **Platform Trajectory (`/platform`)**: Platform-level overview covering publication growth, peer-review turnaround durations, journal dynamics, and United Nations Sustainable Development Goals (SDG) contributions.
- **Interactive Network Explorer (`/network`)**: Interactive force-directed network graph exploring co-funding synergies, global affiliation relationships, MSC classifications, and research topics.

---

## Technical Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Core** | Next.js 16 (App Router, Static Export), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS 4, Lucide React, WAI-ARIA accessible patterns |
| **Visualizations** | Recharts, `react-simple-maps`, `d3-geo`, `d3-force`, `d3-sankey`, `graphology` |
| **Internationalization** | Native localized routes (`/fr`, `/en`, `/es`) with dynamic language context |
| **Data Ingestion** | Node.js, REST API clients (Episciences, OpenAlex, OpenAIRE Graph, ROR), Brotli & Gzip compression |

---

## Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/CCSDForge/episciences-insights.git
cd episciences-insights

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Static Compilation
```bash
# Pre-compress data and build the static site into out/
npm run build
```

---

## Documentation

Detailed architectural and operational documentation is available in the [`docs/`](./docs/) directory:

- [**Architecture & Frontend Design**](./docs/architecture.md): Static site generation (SSG), client-side hydration, i18n routing, accessibility standards, and zero third-party calls design.
- [**Data Ingestion & Processing Pipeline**](./docs/pipeline.md): DOI synchronization, open APIs harvesting (OpenAlex, OpenAIRE, Episciences, ROR), local caching, affiliation matching, and data compression.
- [**Production Web Server Configuration**](./docs/web-server.md): Production VirtualHost templates for Apache and Nginx to serve pre-compressed Brotli (`.br`) and Gzip (`.gz`) files with optimal caching headers.

For scientific methodology, indicators computation, and open datasets downloads, visit the in-app documentation at `/help` (e.g. [Methodological Note](https://insights.episciences.org/fr/help/)).

---

## License

- **Source Code**: [GNU General Public License v3.0 (GPL v3)](https://www.gnu.org/licenses/gpl-3.0)
- **Consolidated Datasets**: [Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
- **Scientific Metadata**: Aggregated from [Episciences](https://www.episciences.org), [OpenAlex](https://openalex.org), [OpenAIRE](https://explore.openaire.eu), [zbMATH Open](https://zbmath.org), and [ROR](https://ror.org).
