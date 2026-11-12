# Architecture & Frontend Design

Episciences Insights is designed as a high-performance, statically exported web application with zero server-side runtime dependency and zero third-party tracking calls.

## Core Architectural Principles

### 1. Static Site Generation (SSG)
- **Framework**: Next.js 16 (App Router) with static HTML export (`output: 'export'` in production builds).
- **Hosting Portability**: Compiles entirely into the `out/` directory, compatible with any static file server, CDN, Apache VirtualHost, or Nginx server.
- **Client-Side Data Hydration**: Core publication datasets (`publications.json`, `funders.json`, `kpi_downloads.json`) are decoupled from static page bundles and loaded dynamically on the client, keeping initial page load payloads minimal.

### 2. Zero Third-Party Runtime Dependencies
- **Self-Hosted Geometries**: Map layers (`countries-110m.json`) are served locally in TopoJSON format (ISC License / Public Domain), preventing third-party map tiles or telemetry requests.
- **Local Typography**: Fonts are self-hosted via `@next/font/google` (Manrope and Noto Sans) and embedded at build time.
- **Privacy & Compliance**: Consultations generate no external telemetry, adhering to GDPR standards.

### 3. Internationalization (i18n)
- **Local App Routing**: Supported locales (`/fr`, `/en`, `/es`) route through dynamic localized layouts (`app/[locale]/layout.tsx`).
- **Context & Translations**: Shared dictionary-based translations (`lib/i18n/translations.ts`) provided through `LanguageProvider` and `useTranslation()` hook.
- **SEO & Canonical Alternates**: Every page automatically includes `hreflang` alternates (`fr`, `en`, `es`, `x-default`) and canonical URLs.

### 4. Accessibility (a11y)
- **WAI-ARIA Compliance**: Interactive elements provide explicit roles (`tab`, `dialog`, `listbox`, `combobox`), `aria-expanded`, and live region announcements.
- **Contrast & Theming**: Strict compliance with CCSD institutional colors (Bleu 00 `#00005f`) and Episciences brand palette (Cyan 00 `#57bec3`), thoroughly audited across light and dark themes.

---

## Component Hierarchy

```
app/[locale]/
├── layout.tsx             # Root layout: AppHeader, providers, PageFooter
├── page.tsx               # Home overview (KPI cards, persona entry points)
├── journals/page.tsx      # Journal dashboard (readership, authorship, topics, funders)
├── institutions/page.tsx  # Institution dashboard (co-authorship networks, impact)
├── platform/page.tsx      # Platform overview (publication growth, turnaround, SDGs)
├── network/page.tsx       # Global interactive network explorer
└── help/page.tsx          # Methodological note & documentation

components/
├── sections/              # Page view sections (JournalSection, InstitutionSection, etc.)
├── AppHeader.tsx          # Top sticky navigation bar
├── GlobalFilterBar.tsx    # Context-aware corpus filters (Year, Journal, Institution)
├── PageFooter.tsx         # Institutional footer and repository links
└── [visualizations]       # Domain charts (WorldMap, TopicTreeMap, SdgRadar, etc.)
```

---

## Visualization Stack

- **Charts**: [Recharts](https://recharts.org/) for responsive area, bar, and timeline charts.
- **Geospatial Maps**: `react-simple-maps` and `d3-geo` with projected coordinates.
- **Force & Flow Networks**: `d3-force`, `d3-sankey`, and `graphology` with Louvain community detection (`graphology-communities-louvain`).
- **Icons**: [Lucide React](https://lucide.dev/).
