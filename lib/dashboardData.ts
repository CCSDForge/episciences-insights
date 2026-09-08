import fs from 'node:fs';
import path from 'node:path';
import { Publication, KpiFile, UsageSummary, TopPaper } from '@/lib/types';
import { cleanDoi } from '@/lib/data';

async function getCitation(doi: string): Promise<string> {
  const clean = cleanDoi(doi);
  if (!clean) return doi;
  const cacheDir = path.join(process.cwd(), '.cache', 'citations');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch {
      // Ignore directory creation failure
    }
  }

  const safeDoi = Buffer.from(clean).toString('base64url').substring(0, 50);
  const cacheFile = path.join(cacheDir, `${safeDoi}.txt`);

  if (fs.existsSync(cacheFile)) {
    try {
      return fs.readFileSync(cacheFile, 'utf8');
    } catch {
      // Fallback on read error
    }
  }

  try {
    const response = await fetch(`https://citation.doi.org/format?doi=${encodeURIComponent(clean)}&style=apa&lang=en-US`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Citation not found');
    const text = await response.text();
    const citation = text.trim();
    if (citation) {
      try {
        fs.writeFileSync(cacheFile, citation);
      } catch {
        // Ignore cache write error
      }
      return citation;
    }
  } catch {
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

export async function getKpiSummary(publications: Publication[]): Promise<UsageSummary | null> {
  const filePath = path.join(process.cwd(), 'kpi_downloads.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const kpi: KpiFile = JSON.parse(fileContent);

    const currentYear = new Date().getFullYear().toString();

    const yearlySummary: Record<string, { downloads: number, views: number }> = {};
    const journalYearlySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const countryYearlySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const journalCountrySummary: Record<string, Record<string, { downloads: number, views: number }>> = {};
    const paperCounts: Record<string, number> = {};
    const journalTopPapers: Record<string, TopPaper[]> = {};

    const journalIssnToRvcode: Record<string, string> = {};
    const normalizeName = (name: string) =>
      name
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        .replace(/\s*[-–:]\s*.+$/, '')
        .replace(/\s+a\s+[A-Z]{2}.+$/, '')
        .toLowerCase()
        .replace(/^the\s+/i, '')
        .replace(/^journal of\s+/i, '')
        .replace(/['\u2019]/g, ' ')
        .replace(/[,;.]/g, '')
        .replace(/\b(the|la)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const knownIssnToRvcode: Record<string, string> = {
      '3099-5299': 'dc',
    };

    const doiToRvcode: Record<string, string> = {};
    for (const [rvcode, journal] of Object.entries(kpi.journals)) {
      for (const paper of journal.papers) {
        doiToRvcode[cleanDoi(paper.doi)] = rvcode;
      }
    }
    for (const pub of publications) {
      if (!pub.journal.name && pub.doi) {
        const rv = doiToRvcode[cleanDoi(pub.doi)];
        if (rv && kpi.journals[rv]) {
          const issn = Object.entries(knownIssnToRvcode).find(([, v]) => v === rv)?.[0];
          pub.journal.name = kpi.journals[rv].name;
          if (issn) pub.journal.issn = issn;
        }
      }
    }

    const pubTitleByDoi = new Map<string, string>();
    for (const pub of publications) {
      if (pub.doi && pub.title && pub.title !== 'Unknown Title') {
        pubTitleByDoi.set(cleanDoi(pub.doi), pub.title);
      }
    }

    for (const [rvcode, journal] of Object.entries(kpi.journals)) {
      const kpiName = normalizeName(journal.name);
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

    for (const [issn, rv] of Object.entries(knownIssnToRvcode)) {
      if (!journalIssnToRvcode[issn]) journalIssnToRvcode[issn] = rv;
    }

    for (const [rvcode, journal] of Object.entries(kpi.journals)) {
      journalYearlySummary[rvcode] = {};
      journalCountrySummary[rvcode] = {};
      paperCounts[rvcode] = journal.papers_count;

      const top20 = journal.papers
        .sort((a, b) => b.downloads.total - a.downloads.total)
        .slice(0, 20);

      const enrichedTop20: TopPaper[] = [];
      for (const p of top20) {
        const clean = cleanDoi(p.doi);
        let title = pubTitleByDoi.get(clean);
        if (!title) {
          title = await getCitation(p.doi);
        }
        enrichedTop20.push({
          doi: p.doi,
          downloads: p.downloads.total,
          views: p.page_views.total,
          title: title || p.doi
        });
      }
      journalTopPapers[rvcode] = enrichedTop20;

      journal.papers.forEach(paper => {
        Object.keys(paper.downloads.by_year).forEach(year => {
          if (!yearlySummary[year]) yearlySummary[year] = { downloads: 0, views: 0 };
          if (!journalYearlySummary[rvcode][year]) journalYearlySummary[rvcode][year] = { downloads: 0, views: 0 };
          const dl = paper.downloads.by_year[year] || 0;
          yearlySummary[year].downloads += dl;
          journalYearlySummary[rvcode][year].downloads += dl;
        });

        Object.keys(paper.page_views.by_year).forEach(year => {
          if (!yearlySummary[year]) yearlySummary[year] = { downloads: 0, views: 0 };
          if (!journalYearlySummary[rvcode][year]) journalYearlySummary[rvcode][year] = { downloads: 0, views: 0 };
          const pv = paper.page_views.by_year[year] || 0;
          yearlySummary[year].views += pv;
          journalYearlySummary[rvcode][year].views += pv;
        });

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
