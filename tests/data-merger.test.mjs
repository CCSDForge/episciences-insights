import { describe, expect, it } from 'vitest';
import { mergeEpisciencesAffiliations, mergePublication } from '../scripts/data-merger.mjs';

function makeOpenAlexWork(overrides = {}) {
  return {
    doi: 'https://doi.org/10.46298/dmtcs.1234',
    title: 'Sample Paper',
    publication_year: 2024,
    primary_location: {
      source: {
        display_name: 'Discrete Mathematics & Theoretical Computer Science',
        issn: ['1365-8050'],
        id: 'https://openalex.org/S123456',
      },
    },
    authorships: [
      {
        author: { display_name: 'Jean-Luc Évrard', orcid: null },
        institutions: [
          {
            display_name: 'CNRS',
            ror: 'https://ror.org/02feahw73',
            country_code: 'FR',
          },
        ],
      },
    ],
    sustainable_development_goals: [],
    grants: [],
    primary_topic: null,
    topics: [],
    referenced_works_count: 12,
    related_works: [],
    ...overrides,
  };
}

describe('mergePublication', () => {
  it('preserves canonical sourceDoi over an external OpenAlex DOI', () => {
    const work = makeOpenAlexWork({ doi: 'https://doi.org/10.1002/jgt.99999' });
    const pub = mergePublication(work, null, null, '10.46298/dmtcs.3444');
    expect(pub.doi).toBe('https://doi.org/10.46298/dmtcs.3444');
  });

  it('prefers Episciences canonical journal unconditionally and clears mismatched OpenAlex id', () => {
    const work = makeOpenAlexWork({
      primary_location: {
        source: {
          display_name: 'HAL (Le Centre pour la Communication Scientifique Directe)',
          issn: ['0000-0000'],
          id: 'https://openalex.org/S999',
        },
      },
    });
    const openAire = {
      container: {
        name: 'Discrete Mathematics & Theoretical Computer Science',
        issnOnline: '1365-8050',
      },
    };
    const epiExport = {
      database: {
        current: {
          journal: {
            name: 'Discrete Mathematics & Theoretical Computer Science',
            code: 'dmtcs',
          },
        },
      },
    };

    const pub = mergePublication(work, openAire, epiExport, '10.46298/dmtcs.1234');
    expect(pub.journal).toEqual({
      name: 'Discrete Mathematics & Theoretical Computer Science',
      code: 'dmtcs',
      issn: '1365-8050',
      id: undefined,
    });
  });

  it('repairs repository journal name via OpenAIRE container when Episciences export is missing', () => {
    const work = makeOpenAlexWork({
      primary_location: {
        source: {
          display_name: 'arXiv (Cornell University)',
          issn: undefined,
          id: 'https://openalex.org/S4306400194',
        },
      },
    });
    const openAire = {
      container: {
        name: 'Logical Methods in Computer Science',
        issnOnline: '1860-5974',
      },
    };

    const pub = mergePublication(work, openAire, null, '10.46298/lmcs-20(1:5)2024');
    expect(pub.journal.name).toBe('Logical Methods in Computer Science');
    expect(pub.journal.code).toBe('lmcs');
    expect(pub.journal.issn).toBe('1860-5974');
    expect(pub.journal.id).toBeUndefined();
  });

  it('falls back to DOI prefix to resolve journal when OpenAlex and OpenAIRE fail', () => {
    const work = makeOpenAlexWork({
      primary_location: {
        source: {
          display_name: 'Journal of Graph Theory',
          issn: ['1097-0118'],
          id: 'https://openalex.org/S888',
        },
      },
    });

    const pub = mergePublication(work, null, null, '10.46298/dmtcs.3444');
    expect(pub.journal.name).toBe('Discrete Mathematics & Theoretical Computer Science');
    expect(pub.journal.code).toBe('dmtcs');
  });

  it('reconciles ANR award variants between OpenAlex and OpenAIRE and dedupes OpenAlex duplicates', () => {
    const work = makeOpenAlexWork({
      grants: [
        {
          funder_display_name: 'Agence Nationale de la Recherche',
          award_id: '20-CE91-0006',
          funder_id: 'https://openalex.org/F4320320883',
        },
        {
          funder_display_name: 'Agence Nationale de la Recherche',
          award_id: 'ANR-20-CE91-0006',
          funder_id: 'https://openalex.org/F4320320883',
        },
      ],
    });
    const openAire = {
      projects: [
        {
          code: 'ANR-20-CE91-0006',
          acronym: 'ALGO',
          title: 'Algorithmic Foundations',
          funder: 'ANR',
        },
        {
          code: '101000001',
          acronym: 'HORIZONX',
          title: 'Horizon Grant',
          funder: 'European Commission',
        },
      ],
    };

    const pub = mergePublication(work, openAire, null);
    expect(pub.awards).toHaveLength(2);

    const anr = pub.awards.find((a) => a.code === 'ANR-20-CE91-0006');
    expect(anr).toMatchObject({
      code: 'ANR-20-CE91-0006',
      acronym: 'ALGO',
      name: 'Algorithmic Foundations',
      funder: 'ANR',
      funder_id: 'F4320320883',
      source: 'both',
    });

    const ec = pub.awards.find((a) => a.code === '101000001');
    expect(ec).toMatchObject({
      acronym: 'HORIZONX',
      funder: 'European Commission',
      source: 'openaire',
    });
  });

  it('enriches missing ORCIDs from OpenAIRE using accent-insensitive name matching without overwriting existing ones', () => {
    const work = makeOpenAlexWork({
      authorships: [
        { author: { display_name: 'Jean-Luc Évrard', orcid: null }, institutions: [] },
        { author: { display_name: 'Marie Curie', orcid: 'https://orcid.org/0000-0001-1111-1111' }, institutions: [] },
      ],
    });
    const openAire = {
      authors: [
        {
          fullName: 'Jean-Luc Evrard',
          pid: { id: { scheme: 'orcid', value: '0000-0002-2222-2222' } },
        },
        {
          fullName: 'Marie Curie',
          pid: { id: { scheme: 'orcid', value: '0000-0009-9999-9999' } },
        },
      ],
    };

    const pub = mergePublication(work, openAire, null);
    expect(pub.authors[0].orcid).toBe('https://orcid.org/0000-0002-2222-2222');
    expect(pub.authors[1].orcid).toBe('https://orcid.org/0000-0001-1111-1111');
  });

  it('extracts OpenAIRE open_science fields including JEL codes and ignores keyword prose', () => {
    const work = makeOpenAlexWork();
    const openAire = {
      isGreen: true,
      isInDiamondJournal: true,
      instances: [
        { hostedBy: { value: 'HAL' }, license: 'CC BY 4.0' },
        { hostedBy: { value: 'HAL' }, license: 'CC BY 4.0' },
        { hostedBy: { value: 'arXiv' }, license: 'arXiv' },
      ],
      subjects: [
        { subject: { scheme: 'FOS', value: '0102 computer and information sciences' } },
        { subject: { scheme: 'jel', value: 'jel:N01' } },
        { subject: { scheme: 'keyword', value: 'JEL classification: N01 Economic History' } },
      ],
      pids: [{ scheme: 'arXiv', value: '2401.00001' }],
      communities: [{ label: 'EOSC' }, { code: 'DARIAH' }],
      indicators: {
        citationImpact: {
          influence: 1.5,
          influenceClass: 'C3',
          popularity: 2.1,
          popularityClass: 'C2',
          impulse: 0.8,
          impulseClass: 'C4',
          citationCount: 7,
          citationClass: 'C3',
        },
      },
    };

    const pub = mergePublication(work, openAire, null);
    expect(pub.open_science).toEqual({
      found_in_openaire: true,
      hosted_repositories: ['HAL', 'arXiv'],
      instance_count: 3,
      licenses: ['CC BY 4.0', 'arXiv'],
      is_green: true,
      is_in_diamond_journal: true,
      arxiv_id: '2401.00001',
      fos_fields: ['0102 computer and information sciences'],
      jel_codes: ['N01'],
      research_communities: ['EOSC', 'DARIAH'],
      impact: {
        influence: 1.5,
        influence_class: 'C3',
        popularity: 2.1,
        popularity_class: 'C2',
        impulse: 0.8,
        impulse_class: 'C4',
        citation_count: 7,
        citation_class: 'C3',
      },
    });
  });

  it('marks found_in_openaire as false when OpenAIRE payload is missing', () => {
    const pub = mergePublication(makeOpenAlexWork(), null, null);
    expect(pub.open_science).toEqual({ found_in_openaire: false });
  });

  it('extracts MSC 2020 codes and peer-review timeline from Episciences export', () => {
    const epiExport = {
      database: {
        current: {
          journal: { name: 'Discrete Mathematics & Theoretical Computer Science', code: 'dmtcs' },
          classifications: {
            msc2020: [{ code: '68Q10' }, { code: '05C15' }, { code: '' }],
          },
          dates: {
            first_submission_date: '2023-06-01',
            publication_date: '2024-02-15',
          },
          repository: { name: 'HAL' },
        },
      },
    };

    const pub = mergePublication(makeOpenAlexWork(), null, epiExport);
    expect(pub.episciences).toEqual({
      msc_codes: ['68Q10', '05C15'],
      first_submission_date: '2023-06-01',
      publication_date: '2024-02-15',
      overlay_repository: 'HAL',
    });
  });
});

describe('mergeEpisciencesAffiliations', () => {
  it('appends ROR-identified affiliations, skips existing RORs and free-text entries, and matches abbreviated names', () => {
    const authors = [
      {
        name: 'T. N. Shorey',
        orcid: null,
        institutions: [{ name: 'CNRS', ror: 'https://ror.org/02feahw73', country: 'FR' }],
      },
    ];
    const epiExport = {
      journal: {
        journal_article: {
          contributors: {
            person_name: {
              given_name: 'Tarlok Nath',
              surname: 'Shorey',
              affiliations: {
                institution: [
                  {
                    institution_name: 'CNRS',
                    institution_id: { '@type': 'ror', value: 'https://ror.org/02feahw73' },
                  },
                  {
                    institution_name: 'Université de Strasbourg',
                    institution_id: { '@type': 'ror', value: '00pg6eq24' },
                  },
                  {
                    institution_name: 'LiLPa',
                    institution_id: { '@type': 'ror', value: 'https://ror.org/00pg6eq24' },
                  },
                  {
                    institution_name: 'Assistant Professor (no ROR)',
                  },
                ],
              },
            },
          },
        },
      },
    };

    const merged = mergeEpisciencesAffiliations(authors, epiExport);
    expect(merged[0].institutions).toHaveLength(2);
    expect(merged[0].institutions[1]).toEqual({
      name: 'Université de Strasbourg',
      ror: 'https://ror.org/00pg6eq24',
      country: null,
      declared_names: ['Université de Strasbourg', 'LiLPa'],
    });
  });

  it('skips ambiguous surname + initial matches', () => {
    const authors = [
      { name: 'J. Martin', orcid: null, institutions: [] },
      { name: 'Jean-Paul Martin', orcid: null, institutions: [] },
    ];
    const epiExport = {
      journal: {
        journal_article: {
          contributors: {
            person_name: [
              {
                given_name: 'Jacques',
                surname: 'Martin',
                affiliations: {
                  institution: {
                    institution_name: 'Inria',
                    institution_id: { '@type': 'ror', value: 'https://ror.org/02kvxyf05' },
                  },
                },
              },
            ],
          },
        },
      },
    };

    const merged = mergeEpisciencesAffiliations(authors, epiExport);
    expect(merged[0].institutions).toEqual([]);
    expect(merged[1].institutions).toEqual([]);
  });
});
