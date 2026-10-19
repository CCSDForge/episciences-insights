// Words too generic to tell two institutions apart.
const GENERIC_WORDS = new Set([
  'universite', 'university', 'universidad', 'universidade', 'universita', 'universitat', 'universiteit',
  'institut', 'institute', 'instituto', 'istituto', 'laboratoire', 'laboratory', 'centre', 'center', 'centro',
  'ecole', 'school', 'college', 'faculte', 'faculty', 'departement', 'department', 'recherche', 'research',
  'national', 'nationale', 'sciences', 'science', 'technology', 'technologie', 'superieure', 'superieur',
  'the', 'and', 'for', 'des', 'del', 'der', 'und', 'umr', 'cnrs',
]);

function significantWords(name) {
  return (name || '')
    .replace(/\[[^\]]*\]/g, ' ') // "[Toronto]": a city, shared by different institutions
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !GENERIC_WORDS.has(w));
}

function namesAgree(declaredNames, canonicalName) {
  const canonical = new Set(significantWords(canonicalName));
  return declaredNames.some((name) => significantWords(name).some((w) => canonical.has(w)));
}

/**
 * Post-processing pass filling in `country` (and a canonical `name`) for
 * author institutions that carry a ROR id but no country — mostly the
 * affiliations declared on Episciences and appended by
 * `mergeEpisciencesAffiliations()` in data-merger.mjs, which only give a
 * ROR id and a free-text name.
 *
 * Resolution order, per ROR id:
 *  1. the same ROR id seen elsewhere in the corpus with a country, as
 *     returned by OpenAlex — no request, and keeps the institution's name
 *     identical to the one OpenAlex uses, so the frontend (which keys
 *     institutions by ROR id but displays the first name it sees) doesn't
 *     show two spellings of the same institution;
 *  2. the ROR API (`rorClient.fetchById`, cached in `.cache/ror/`).
 *
 * Institutions still unresolved (ROR 404 or transient failure) are kept
 * with `country: null`, like OpenAlex institutions without a country code.
 *
 * Episciences-declared institutions (those with `declared_names`, see
 * `mergeEpisciencesAffiliations()`) are dropped when none of their declared
 * names shares a significant word with the ROR record's name. This catches
 * the export pairing a "University [City]" name with another university of
 * the same city ("York University [Toronto]" -> University of Toronto,
 * "Cornell University [New York]" -> New York University). It also drops a
 * few correct ones (acronyms, translations, renamed institutions: "Sciences
 * Po" vs "Institut d'Etudes Politiques de Paris"), an accepted loss since
 * OpenAlex usually has them already.
 * Mutates `publications` in place.
 */
export async function enrichInstitutionCountries(publications, { rorClient, log = console.log }) {
  const known = new Map();
  const pending = new Set();

  for (const pub of publications) {
    for (const author of pub.authors || []) {
      for (const inst of author.institutions || []) {
        if (!inst.ror) continue;
        if (inst.country) {
          if (!known.has(inst.ror)) known.set(inst.ror, { name: inst.name, country: inst.country });
        } else {
          pending.add(inst.ror);
        }
      }
    }
  }

  const toFetch = [...pending].filter((ror) => !known.has(ror));
  log(`[Affiliations] ${pending.size} institutions without country, ${toFetch.length} to resolve via ROR...`);

  let fetched = 0;
  for (const ror of toFetch) {
    const org = await rorClient.fetchById(ror);
    if (org?.country_code) {
      known.set(ror, { name: org.name, country: org.country_code });
      fetched++;
    }
  }

  let updated = 0;
  let unresolved = 0;
  let rejected = 0;
  for (const pub of publications) {
    for (const author of pub.authors || []) {
      author.institutions = (author.institutions || []).filter((inst) => {
        const declared = inst.declared_names;
        if (!declared) return true;
        delete inst.declared_names;
        const name = known.get(inst.ror)?.name;
        if (!name || !declared.length || namesAgree(declared, name)) return true;
        rejected++;
        return false;
      });
      for (const inst of author.institutions) {
        if (!inst.ror || inst.country) continue;
        const info = known.get(inst.ror);
        if (!info) {
          unresolved++;
          continue;
        }
        inst.country = info.country;
        if (info.name) inst.name = info.name;
        updated++;
      }
    }
  }

  log(`[Affiliations] Resolved ${fetched}/${toFetch.length} via ROR; ${updated} institutions completed, ${unresolved} left without country, ${rejected} Episciences affiliations rejected (name doesn't match ROR record).`);
}
