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
  funder: string;
};

export type Publication = {
  doi: string;
  title: string;
  year: number;
  journal: {
    name: string;
    issn: string;
    id: string;
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
};
