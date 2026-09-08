export type Metric = {
  total: number;
  by_year: Record<string, number>;
};

export type GeoEntry = {
  continent: string;
  downloads: number;
  page_views: number;
};

export type GeoMap = Record<string, GeoEntry>;

export type PaperKpi = {
  doi: string;
  paperid: number;
  publication_date: string | null;
  downloads: Metric;
  page_views: Metric;
  geo: GeoMap;
};

export type JournalKpi = {
  rvid: number;
  name: string;
  papers_count: number;
  papers: PaperKpi[];
};

export type KpiFile = {
  generated_at: string;
  total_papers: number;
  total_journals: number;
  journals: Record<string, JournalKpi>;
};

export type Institution = {
  name: string;
  ror: string | null;
  country: string;
};

export type Author = {
  name: string;
  orcid: string | null;
  institutions: Institution[];
};

export type SDG = {
  label: string;
  id: string;
  score?: number;
};

export type Award = {
  name: string;
  id: string;
  code?: string;      // Official project code from OpenAIRE (e.g. ANR-20-CE91-0006, 2200873)
  acronym?: string;   // Official project acronym, when OpenAIRE provides one
  funder: string;
  // Join key into funders.json — either an OpenAlex funder id (short form,
  // e.g. F4320306076) or, for an award that only ever matched an OpenAIRE
  // project (no OpenAlex grants[] counterpart), a synthetic `ror:{id}` key
  // assigned via ROR affiliation matching on the raw funder name.
  funder_id?: string;
  source?: 'openalex' | 'openaire' | 'both';
};

// One entry per Award.funder_id (an OpenAlex funder id, or a synthetic
// `ror:{id}` key for a funder only ever seen via OpenAIRE — see above),
// written to public/data/funders.json by scripts/funder-enrichment.mjs.
// `name` is the canonical display name — always prefer it over
// Award.funder for display, since mergeAwards() can leave the same
// funder under two different labels (OpenAlex's vs OpenAIRE's) on
// individual awards.
export type FunderInfo = {
  name: string;
  ror: string | null;
  country_code: string | null;
  country_name: string | null;
  lat: number | null;
  lng: number | null;
};

export type FundersFile = Record<string, FunderInfo>;

export type OpenAireImpact = {
  influence?: number;
  influence_class?: string;
  popularity?: number;
  popularity_class?: string;
  impulse?: number;
  impulse_class?: string;
  citation_count?: number;
  citation_class?: string;
};

export type LinkedOutput = {
  pid: string;
  url?: string;
};

export type OpenScience = {
  found_in_openaire: boolean;
  hosted_repositories?: string[];  // Deduplicated instances[].hostedBy.value (HAL, arXiv, Zenodo...)
  instance_count?: number;         // Number of independent copies/instances known to OpenAIRE
  licenses?: string[];             // Deduplicated instances[].license values
  is_green?: boolean;
  is_in_diamond_journal?: boolean; // Recognition by DOAJ/OpenAIRE as a Diamond OA venue
  arxiv_id?: string;
  fos_fields?: string[];           // OECD Fields of Science, subjects[] scheme 'FOS'
  jel_codes?: string[];            // JEL classification codes (economics), subjects[] scheme 'jel'
  research_communities?: string[]; // Research infrastructures/communities (EOSC, DARIAH EU, INRAE, UArctic...)
  impact?: OpenAireImpact;
  linked_outputs?: {
    datasets: LinkedOutput[];
    software: LinkedOutput[];
  };
};

export type EpisciencesMeta = {
  msc_codes?: string[];            // Mathematics Subject Classification 2020 codes, sourced from zbMATH Open
  first_submission_date?: string;  // Actual peer-review timeline, from the Episciences platform itself
  publication_date?: string;
  overlay_repository?: string;     // Preprint repository this journal overlays (arXiv, HAL...)
};

export type Publication = {
  doi: string;
  title: string;
  year: number;
  journal: {
    name: string;
    issn: string;
    id: string;
    code?: string; // Episciences rvcode (e.g. "dmtcs") — stable per-journal key, unlike issn/name which OpenAlex can mis-resolve; see repairJournal() in data-merger.mjs
  };
  authors: Author[];
  sdgs: SDG[];
  awards: Award[];
  primary_topic: {
    name: string;
    id: string;
    subfield?: string;
    field?: string;
    domain?: string;
  } | null;
  topics: {
    name: string;
    id: string;
    score?: number;
  }[];
  referenced_works_count?: number;
  referenced_works?: string[];
  related_works?: string[];
  episciences?: EpisciencesMeta;
  open_science?: OpenScience;
};

export type UsageStats = {
  downloads: number;
  views: number;
};

export type TopPaper = {
  doi: string;
  downloads: number;
  views: number;
  title: string;
};

export type UsageSummary = {
  yearlySummary: Record<string, UsageStats>;
  journalYearlySummary: Record<string, Record<string, UsageStats>>;
  journalCountrySummary: Record<string, Record<string, UsageStats>>;
  countryYearlySummary: Record<string, Record<string, UsageStats>>;
  paperCounts: Record<string, number>;
  journalTopPapers: Record<string, TopPaper[]>;
  journalIssnToRvcode: Record<string, string>;
  generatedAt: string;
  currentYear: string;
};
