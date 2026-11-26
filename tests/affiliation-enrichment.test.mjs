import { describe, expect, it, vi } from 'vitest';
import { enrichInstitutionCountries } from '../scripts/affiliation-enrichment.mjs';

const noop = () => {};

describe('enrichInstitutionCountries', () => {
  it('reuses country and canonical name from another publication in the corpus without calling ROR', async () => {
    const rorClient = { fetchById: vi.fn() };
    const publications = [
      {
        authors: [
          {
            institutions: [
              { name: 'Centre National de la Recherche Scientifique', ror: 'https://ror.org/02feahw73', country: 'FR' },
            ],
          },
        ],
      },
      {
        authors: [
          {
            institutions: [
              {
                name: 'CNRS',
                ror: 'https://ror.org/02feahw73',
                country: null,
                declared_names: ['Centre National de la Recherche Scientifique'],
              },
            ],
          },
        ],
      },
    ];

    await enrichInstitutionCountries(publications, { rorClient, log: noop });

    expect(rorClient.fetchById).not.toHaveBeenCalled();
    expect(publications[1].authors[0].institutions[0]).toEqual({
      name: 'Centre National de la Recherche Scientifique',
      ror: 'https://ror.org/02feahw73',
      country: 'FR',
    });
  });

  it('fetches missing ROR records via rorClient and keeps unresolved ones with country null', async () => {
    const rorClient = {
      fetchById: vi.fn(async (ror) => {
        if (ror === 'https://ror.org/00pg6eq24') {
          return { name: 'University of Strasbourg', country_code: 'FR' };
        }
        return null;
      }),
    };
    const publications = [
      {
        authors: [
          {
            institutions: [
              {
                name: 'Université de Strasbourg',
                ror: 'https://ror.org/00pg6eq24',
                country: null,
                declared_names: ['Université de Strasbourg'],
              },
              {
                name: 'Unknown Lab',
                ror: 'https://ror.org/099999999',
                country: null,
                declared_names: ['Unknown Lab'],
              },
            ],
          },
        ],
      },
    ];

    await enrichInstitutionCountries(publications, { rorClient, log: noop });

    expect(rorClient.fetchById).toHaveBeenCalledTimes(2);
    expect(publications[0].authors[0].institutions).toEqual([
      { name: 'University of Strasbourg', ror: 'https://ror.org/00pg6eq24', country: 'FR' },
      { name: 'Unknown Lab', ror: 'https://ror.org/099999999', country: null },
    ]);
  });

  it('rejects Episciences-declared affiliations whose name disagrees with the canonical ROR record', async () => {
    const rorClient = {
      fetchById: vi.fn(async () => ({ name: 'University of Toronto', country_code: 'CA' })),
    };
    const publications = [
      {
        authors: [
          {
            institutions: [
              {
                name: 'York University [Toronto]',
                ror: 'https://ror.org/03dbr7087',
                country: null,
                declared_names: ['York University [Toronto]'],
              },
            ],
          },
        ],
      },
    ];

    await enrichInstitutionCountries(publications, { rorClient, log: noop });

    expect(publications[0].authors[0].institutions).toEqual([]);
  });
});
