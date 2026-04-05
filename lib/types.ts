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
