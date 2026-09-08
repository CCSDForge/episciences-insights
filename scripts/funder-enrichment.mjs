/**
 * Post-processing pass, run once per collection after every publication
 * has been merged: resolves every distinct `Award.funder_id` referenced
 * in the corpus through the OpenAlex Funders API (canonical name +
 * country) and, when available, the ROR API (lat/lng — OpenAlex funders
 * don't carry coordinates), then normalizes `Award.funder` in place to
 * that canonical name across every publication.
 *
 * The normalization matters beyond cosmetics: mergeAwards() in
 * data-merger.mjs can leave the *same* funder under two different labels
 * depending on whether a given award matched an OpenAIRE project or not
 * (e.g. OpenAlex's "Agence Nationale de la Recherche" vs OpenAIRE's
 * "French National Research Agency (ANR)" for the same funder_id) — any
 * funder-keyed visualization (network, hive plot, storyline) would
 * otherwise silently split one funder into two nodes.
 *
 * A second class of award has no `funder_id` at all: it was pushed
 * straight from an OpenAIRE `projects[]` entry that never matched any
 * OpenAlex `grants[]` (mergeAwards()'s `else` branch), so there was never
 * an OpenAlex funder id to resolve. These "orphan" awards are handled by
 * a second pass below: ROR's affiliation-matching endpoint
 * (`matchAffiliation`) is queried on the raw `award.funder` string, and a
 * confident match (`chosen: true`, ROR's own top pick) is fused into an
 * existing registry entry when its ROR id is already known (this is what
 * actually collapses "French National Research Agency (ANR)" back into
 * "Agence Nationale de la Recherche"), or registered as a new funder
 * (keyed `ror:{id}`, since there's no OpenAlex funder id for it)
 * otherwise. Unmatched names are logged and left untouched.
 */
export async function enrichFunders(publications, { openAlexFundersClient, rorClient, log = console.log }) {
  const registry = {};
  const rorToFunderId = {};

  // Pass 1 — awards that already carry an OpenAlex funder_id.
  const funderIds = new Set();
  for (const pub of publications) {
    for (const award of pub.awards || []) {
      if (award.funder_id) funderIds.add(award.funder_id);
    }
  }

  log(`[Funders] Resolving ${funderIds.size} distinct funders via OpenAlex + ROR...`);

  let resolved = 0;
  let geocoded = 0;

  for (const funderId of funderIds) {
    const funder = await openAlexFundersClient.fetchById(funderId);
    if (!funder) continue;
    resolved += 1;

    const geo = funder.ror ? await rorClient.fetchById(funder.ror) : undefined;
    if (geo) geocoded += 1;

    registry[funderId] = {
      name: funder.display_name,
      ror: funder.ror || null,
      country_code: geo?.country_code || funder.country_code || null,
      country_name: geo?.country_name || null,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
    };
    if (funder.ror) rorToFunderId[funder.ror] = funderId;
  }

  log(`[Funders] Resolved ${resolved}/${funderIds.size} via OpenAlex, geocoded ${geocoded} via ROR.`);

  // Pass 2 — awards with no funder_id: try to resolve the raw funder name
  // straight through ROR's affiliation matcher.
  const orphanNames = new Set();
  for (const pub of publications) {
    for (const award of pub.awards || []) {
      if (!award.funder_id && award.funder) orphanNames.add(award.funder);
    }
  }

  log(`[Funders] Resolving ${orphanNames.size} orphan funder names via ROR affiliation matching...`);

  const nameToFunderId = {};
  let fused = 0;
  let newlyRegistered = 0;
  let unmatched = 0;

  for (const name of orphanNames) {
    const match = await rorClient.matchAffiliation(name);
    if (!match) {
      unmatched += 1;
      log(`[Funders]   no ROR match for orphan funder "${name}"`);
      continue;
    }

    log(`[Funders]   "${name}" -> ${match.name} (ror:${match.ror}, score ${match.score})`);

    const existingFunderId = rorToFunderId[match.ror];
    if (existingFunderId) {
      nameToFunderId[name] = existingFunderId;
      fused += 1;
    } else {
      const syntheticId = `ror:${match.ror}`;
      if (!registry[syntheticId]) {
        registry[syntheticId] = {
          name: match.name,
          ror: match.ror,
          country_code: match.country_code,
          country_name: match.country_name,
          lat: match.lat,
          lng: match.lng,
        };
        rorToFunderId[match.ror] = syntheticId;
        newlyRegistered += 1;
      }
      nameToFunderId[name] = syntheticId;
    }
  }

  log(`[Funders] Orphan resolution: ${fused} fused into an existing funder, ${newlyRegistered} newly registered, ${unmatched} unmatched.`);

  for (const pub of publications) {
    for (const award of pub.awards || []) {
      if (!award.funder_id && award.funder && nameToFunderId[award.funder]) {
        award.funder_id = nameToFunderId[award.funder];
      }
    }
  }

  // Final pass — normalize every award's display name to its funder's
  // canonical name, now that pass 2 may have assigned new funder_ids.
  for (const pub of publications) {
    for (const award of pub.awards || []) {
      const canonical = award.funder_id && registry[award.funder_id];
      if (canonical) award.funder = canonical.name;
    }
  }

  return registry;
}
