import { describe, expect, it, vi } from 'vitest';
import { enrichFunders } from '../scripts/funder-enrichment.mjs';

const noop = () => {};

describe('enrichFunders', () => {
  it('resolves OpenAlex funder_ids, geocodes via ROR, fuses matching orphan funders, and registers new synthetic ones', async () => {
    const openAlexFundersClient = {
      fetchById: vi.fn(async (id) => {
        if (id === 'F4320320883') {
          return {
            display_name: 'Agence Nationale de la Recherche',
            ror: 'https://ror.org/00rbzpz17',
            country_code: 'FR',
          };
        }
        return null;
      }),
    };

    const rorClient = {
      fetchById: vi.fn(async (ror) => {
        if (ror === 'https://ror.org/00rbzpz17') {
          return {
            country_code: 'FR',
            country_name: 'France',
            lat: 48.8566,
            lng: 2.3522,
          };
        }
        return undefined;
      }),
      matchAffiliation: vi.fn(async (name) => {
        if (name === 'French National Research Agency (ANR)') {
          return {
            name: 'Agence Nationale de la Recherche',
            ror: 'https://ror.org/00rbzpz17',
            country_code: 'FR',
            country_name: 'France',
            lat: 48.8566,
            lng: 2.3522,
            score: 1,
          };
        }
        if (name === 'Swiss National Science Foundation') {
          return {
            name: 'Swiss National Science Foundation',
            ror: 'https://ror.org/00yjd3n13',
            country_code: 'CH',
            country_name: 'Switzerland',
            lat: 46.948,
            lng: 7.4474,
            score: 0.98,
          };
        }
        return null;
      }),
    };

    const publications = [
      {
        awards: [
          { funder: 'ANR', funder_id: 'F4320320883', source: 'both' },
          { funder: 'French National Research Agency (ANR)', source: 'openaire' },
        ],
      },
      {
        awards: [
          { funder: 'Swiss National Science Foundation', source: 'openaire' },
          { funder: 'Unmatched Local Grant', source: 'openaire' },
        ],
      },
    ];

    const registry = await enrichFunders(publications, {
      openAlexFundersClient,
      rorClient,
      log: noop,
    });

    // Registry contains both the OpenAlex funder and the newly registered ROR funder
    expect(registry['F4320320883']).toEqual({
      name: 'Agence Nationale de la Recherche',
      ror: 'https://ror.org/00rbzpz17',
      country_code: 'FR',
      country_name: 'France',
      lat: 48.8566,
      lng: 2.3522,
    });
    expect(registry['ror:https://ror.org/00yjd3n13']).toEqual({
      name: 'Swiss National Science Foundation',
      ror: 'https://ror.org/00yjd3n13',
      country_code: 'CH',
      country_name: 'Switzerland',
      lat: 46.948,
      lng: 7.4474,
    });

    // Both ANR awards share the same canonical funder_id and canonical name
    expect(publications[0].awards[0]).toMatchObject({
      funder_id: 'F4320320883',
      funder: 'Agence Nationale de la Recherche',
    });
    expect(publications[0].awards[1]).toMatchObject({
      funder_id: 'F4320320883',
      funder: 'Agence Nationale de la Recherche',
    });

    // Orphan SNSF gets synthetic ror: id; unmatched stays untouched
    expect(publications[1].awards[0]).toMatchObject({
      funder_id: 'ror:https://ror.org/00yjd3n13',
      funder: 'Swiss National Science Foundation',
    });
    expect(publications[1].awards[1]).toEqual({
      funder: 'Unmatched Local Grant',
      source: 'openaire',
    });
  });
});
