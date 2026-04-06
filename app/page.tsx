import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { Publication, KpiFile, PaperKpi } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import { Globe, Wallet, BookOpen, Download, MousePointerClick } from 'lucide-react';

async function getPublications(): Promise<Publication[]> {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Failed to parse publications.json", e);
    return [];
  }
}

async function getCitation(doi: string): Promise<string> {
  const cacheDir = path.join(process.cwd(), '.cache', 'citations');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  
  const cacheFile = path.join(cacheDir, `${Buffer.from(doi).toString('base64').substring(0, 50)}.txt`);
  
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf8');
  }

  try {
    const response = await fetch(`https://citation.doi.org/format?doi=${encodeURIComponent(doi)}&style=apa&lang=en-US`, {
      headers: { 'Accept': 'text/plain' }
    });
    if (!response.ok) throw new Error('Citation not found');
    const text = await response.text();
    const citation = text.trim();
    if (citation) {
      fs.writeFileSync(cacheFile, citation);
      return citation;
    }
  } catch (e) {
    // Fallback if API fails
  }
  return doi;
}

const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Angola": "AO", "Argentina": "AR",
  "Armenia": "AM", "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahrain": "BH",
  "Bangladesh": "BD", "Belarus": "BY", "Belgium": "BE", "Benin": "BJ", "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA", "Brazil": "BR", "Bulgaria": "BG", "Burkina Faso": "BF",
  "Burundi": "BI", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", "Chile": "CL",
  "China": "CN", "Colombia": "CO", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR",
  "Cuba": "CU", "Cyprus": "CY", "Czech Republic": "CZ", "Czechia": "CZ", "Denmark": "DK",
  "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV",
  "Estonia": "EE", "Ethiopia": "ET", "Finland": "FI", "France": "FR", "Gabon": "GA",
  "Georgia": "GE", "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Guatemala": "GT",
  "Guinea": "GN", "Honduras": "HN", "Hong Kong": "HK", "Hungary": "HU", "Iceland": "IS",
  "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iran, Islamic Republic of": "IR",
  "Iraq": "IQ", "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Jamaica": "JM",
  "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Korea": "KR",
  "Korea, Republic of": "KR", "Kuwait": "KW", "Latvia": "LV", "Lebanon": "LB",
  "Libya": "LY", "Lithuania": "LT", "Luxembourg": "LU", "Macao": "MO", "Madagascar": "MG",
  "Malaysia": "MY", "Mali": "ML", "Malta": "MT", "Mauritania": "MR", "Mauritius": "MU",
  "Mexico": "MX", "Moldova": "MD", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM",
  "Namibia": "NA", "Nepal": "NP", "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI",
  "Niger": "NE", "Nigeria": "NG", "North Macedonia": "MK", "Norway": "NO", "Oman": "OM",
  "Pakistan": "PK", "Palestine": "PS", "Panama": "PA", "Paraguay": "PY", "Peru": "PE",
  "Philippines": "PH", "Poland": "PL", "Portugal": "PT", "Qatar": "QA", "Romania": "RO",
  "Russia": "RU", "Russian Federation": "RU", "Rwanda": "RW", "Saudi Arabia": "SA",
  "Senegal": "SN", "Serbia": "RS", "Singapore": "SG", "Slovakia": "SK", "Slovenia": "SI",
  "Somalia": "SO", "South Africa": "ZA", "South Sudan": "SS", "Spain": "ES", "Sri Lanka": "LK",
  "Sudan": "SD", "Sweden": "SE", "Switzerland": "CH", "Syria": "SY",
  "Syrian Arab Republic": "SY", "Taiwan": "TW", "Tanzania": "TZ",
  "Tanzania, United Republic of": "TZ", "Thailand": "TH", "Togo": "TG", "Tunisia": "TN",
  "Turkey": "TR", "Turkiye": "TR", "Uganda": "UG", "Ukraine": "UA",
  "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US",
  "Uruguay": "UY", "Uzbekistan": "UZ", "Venezuela": "VE", "Vietnam": "VN",
  "Viet Nam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW",
};

function normalizeCountryKey(country: string): string | null {
  if (!country) return null;
  const upper = country.toUpperCase();
  if (upper.length === 2) return upper;
  return COUNTRY_NAME_TO_ISO2[country] ?? null;
}

async function getKpiSummary(publications: Publication[]) {
  const filePath = path.join(process.cwd(), 'kpi_downloads.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const kpi: KpiFile = JSON.parse(fileContent);
    
    const currentYear = new Date().getFullYear().toString();
    
    // Aggregates
    const yearlySummary: Record<string, { downloads: number, views: number }> = {};
    const journalYearlySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const countryYearlySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const journalCountrySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const paperCounts: Record<string, number> = {};
    const journalTopPapers: Record<string, any[]> = {};

    // Build ISSN → rvcode mapping via journal name matching
    const journalIssnToRvcode: Record<string, string> = {};
    const normalizeName = (name: string) =>
      name
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // strip C0/C1 control chars
        .replace(/\s*[-–:]\s*.+$/, '')          // remove subtitles after - : –
        .replace(/\s+a\s+[A-Z]{2}.+$/, '')     // remove subtitles like " a DARIAH Journal"
        .toLowerCase()
        .replace(/^the\s+/i, '')                // remove leading "The"
        .replace(/^journal of\s+/i, '')         // remove leading "Journal of"
        .replace(/['\u2019]/g, ' ')             // normalize apostrophes to space
        .replace(/[,;.]/g, '')                  // remove commas, semicolons, periods
        .replace(/\b(the|la)\b/g, '')           // remove common articles mid-name
        .replace(/\s+/g, ' ')
        .trim();

    for (const [rvcode, journal] of Object.entries(kpi.journals)) {
      const kpiName = normalizeName(journal.name);
      // Also try matching the long form after " - " (e.g. "JIPS - Journal d'Interaction..." → try the subtitle too)
      const dashIdx = journal.name.indexOf(' - ');
      const kpiSubtitle = dashIdx !== -1 ? normalizeName(journal.name.slice(dashIdx + 3)) : null;
      for (const pub of publications) {
        if (!pub.journal.name || !pub.journal.issn) continue;
        const pubName = normalizeName(pub.journal.name);
        if (pubName === kpiName || (kpiSubtitle && pubName === kpiSubtitle)) {
          journalIssnToRvcode[pub.journal.issn] = rvcode;
          break;
        }
      }
    }

    for (const [rvcode, journal] of Object.entries(kpi.journals)) {
      journalYearlySummary[rvcode] = {};
      journalCountrySummary[rvcode] = {};
      paperCounts[rvcode] = journal.papers_count;
      
      // Get top 20 for this journal
      const top20 = journal.papers
        .sort((a, b) => b.downloads.total - a.downloads.total)
        .slice(0, 20);
      
      const enrichedTop20 = [];
      for (const p of top20) {
        let title = publications.find(pub => pub.doi === p.doi)?.title;
        if (!title || title === "Unknown Title") {
          title = await getCitation(p.doi);
        }
        enrichedTop20.push({
          doi: p.doi,
          downloads: p.downloads.total,
          views: p.page_views.total,
          title
        });
      }
      journalTopPapers[rvcode] = enrichedTop20;

      journal.papers.forEach(paper => {
        // Yearly
        Object.keys(paper.downloads.by_year).forEach(year => {
          if (year === currentYear) return;
          if (!yearlySummary[year]) yearlySummary[year] = { downloads: 0, views: 0 };
          if (!journalYearlySummary[rvcode][year]) journalYearlySummary[rvcode][year] = { downloads: 0, views: 0 };
          const dl = paper.downloads.by_year[year] || 0;
          yearlySummary[year].downloads += dl;
          journalYearlySummary[rvcode][year].downloads += dl;
        });

        Object.keys(paper.page_views.by_year).forEach(year => {
          if (year === currentYear) return;
          if (!yearlySummary[year]) yearlySummary[year] = { downloads: 0, views: 0 };
          if (!journalYearlySummary[rvcode][year]) journalYearlySummary[rvcode][year] = { downloads: 0, views: 0 };
          const pv = paper.page_views.by_year[year] || 0;
          yearlySummary[year].views += pv;
          journalYearlySummary[rvcode][year].views += pv;
        });

        // Geo
        Object.entries(paper.geo).forEach(([country, stats]) => {
          const iso2 = normalizeCountryKey(country);
          if (!iso2) return;
          if (!countryYearlySummary[iso2]) countryYearlySummary[iso2] = {};
          if (!countryYearlySummary[iso2]['all']) countryYearlySummary[iso2]['all'] = { downloads: 0, views: 0 };
          countryYearlySummary[iso2]['all'].downloads += stats.downloads;
          countryYearlySummary[iso2]['all'].views += stats.page_views;
          if (!journalCountrySummary[rvcode][iso2]) journalCountrySummary[rvcode][iso2] = { downloads: 0, views: 0 };
          journalCountrySummary[rvcode][iso2].downloads += stats.downloads;
          journalCountrySummary[rvcode][iso2].views += stats.page_views;
        });
      });
    }

    return {
      yearlySummary,
      journalYearlySummary,
      journalCountrySummary,
      countryYearlySummary,
      paperCounts,
      journalTopPapers,
      journalIssnToRvcode,
      generatedAt: kpi.generated_at,
      currentYear
    };
  } catch (e) {
    console.error("Failed to parse kpi_downloads.json", e);
    return null;
  }
}

export default async function Page() {
  const publications = await getPublications();
  const kpiSummary = await getKpiSummary(publications);

  const formatNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const initialUsageStats = kpiSummary ? {
    downloads: Object.values(kpiSummary.yearlySummary).reduce((s, v) => s + v.downloads, 0),
    views: Object.values(kpiSummary.yearlySummary).reduce((s, v) => s + v.views, 0),
    countries: Object.keys(kpiSummary.countryYearlySummary).length
  } : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 lg:p-12">
          {/* Background Decorative Elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
          
          <div className="relative flex flex-col items-center gap-10 lg:flex-row-reverse lg:gap-16">
            {/* Spotlight wrapper */}
            <div className="relative shrink-0 flex items-end justify-center" style={{ width: '160px', height: '200px' }}>
              {/* Spotlight cone from above */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'conic-gradient(from 250deg at 50% 0%, transparent 0deg, rgba(200,215,255,0.18) 25deg, rgba(220,230,255,0.32) 40deg, rgba(200,215,255,0.18) 55deg, transparent 80deg)',
                  filter: 'blur(6px)',
                }}
              />
              {/* Logo circle */}
              <div
                className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2 ring-1 ring-white/60 transition-transform hover:scale-110 lg:h-40 lg:w-40"
                style={{
                  background: 'radial-gradient(ellipse at 50% 15%, #ffffff 0%, #f4f7ff 55%, #eaefff 100%)',
                  boxShadow: '0 -6px 24px 2px rgba(180,200,255,0.45), 0 12px 40px -8px rgba(0,0,0,0.22), 0 0 0 1px rgba(220,230,255,0.5)',
                }}
              >
                {/* Inner highlight — bright cap at top */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 45%, transparent 65%)',
                  }}
                />
                <Image
                  src="/episciences.svg"
                  alt="Episciences - Open Access Publishing Platform"
                  width={140}
                  height={140}
                  className="relative z-10 h-auto w-[85%]"
                  priority
                />
              </div>
            </div>
            
            <div className="text-center lg:text-left flex-1">
              <h1 className="font-heading text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
                Episciences <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Insights</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium text-zinc-600 dark:text-zinc-400 sm:text-xl font-sans">
                Global impact analysis of Episciences journals
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400">
                  Overlay journals
                </span>
                <span className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-500/10 dark:text-teal-400">
                  Diamond Open Access Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* New Usage KPIs Summary */}
          {kpiSummary && initialUsageStats && (
            <div className="mt-12 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Downloads</span>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {formatNum(initialUsageStats.downloads)}
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Abstract Views</span>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {formatNum(initialUsageStats.views)}
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Coverage</span>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {formatNum(initialUsageStats.countries)} <span className="text-sm font-bold text-zinc-400 uppercase">Countries</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center lg:text-left pl-2">
                * Usage statistics aggregated through Dec 31, {parseInt(kpiSummary.currentYear) - 1} (excludes ongoing year)
              </p>
            </div>
          )}
        </header>

        <main id="main-content">
          <Dashboard initialData={publications} usageSummary={kpiSummary} />
          
          {/* Data Disclaimer */}
          <section className="mt-16 rounded-3xl bg-zinc-100/50 p-8 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="rounded-2xl bg-white dark:bg-zinc-800 p-3 shadow-sm shrink-0">
                <Globe className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Data Accuracy & Source Disclaimer</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                    The scientific metrics and connections visualized in this dashboard are powered by the <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">OpenAlex API</a>.
                    Please note that this dataset may not represent the exhaustive catalog of Episciences publications, and indexing latencies may occur.
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                    Certain metadata—including research topics, SDG alignment, and related works—are generated using OpenAlex automated algorithms.
                    Episciences is engaged in a permanent effort to refine, verify, and enrich these datasets to provide an increasingly accurate representation of our research impact.
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-700/50 pt-4 mt-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Download statistics</span> are sourced exclusively from the Episciences platform and reflect downloads occurring directly on journal websites. They do not account for downloads from open repositories (e.g. HAL, arXiv, Zenodo), where the same articles may also be freely available. Actual readership figures are therefore likely higher than those reported here.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p className="font-semibold">CC-BY 2026 Episciences Insights - Open Source (GPL v3)</p>
          <p className="mt-2">Data automatically aggregated from OpenAlex API</p>
        </footer>
      </div>
    </div>
  );
}
