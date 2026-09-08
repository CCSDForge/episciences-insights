/**
 * Fusion & normalization of the OpenAlex work object with the OpenAIRE
 * Graph v3 research-product object into the `Publication` shape defined
 * in lib/types.ts.
 *
 * Field paths below were verified against live API responses. Notably:
 *  - OpenAIRE `fundingStream` does not exist on research-product.projects
 *    (documented in some third-party guides, absent from the real payload).
 *  - `subjects[].subject.{scheme,value}` is double-nested.
 *  - `instances[].hostedBy.value` (not `.name`).
 *  - `publiclyFunded` lives at the entity root, not on each instance.
 *  - `communities` (not `contexts`).
 *  - impact metrics live under `indicators.citationImpact.*`.
 *
 * `publiclyFunded` is deliberately NOT extracted: measured at 0% (always
 * false) on a live sample of Episciences DOIs, so wiring it up would only
 * add a dead code path.
 *
 * JEL codes ARE extracted (scheme `'jel'`, value prefixed `jel:XXX`) —
 * an initial random 60-DOI sample across the whole corpus found none and
 * this file used to skip them, but that sample happened to miss "The
 * Journal of Philosophical Economics" (257 publications, ~3.4% of the
 * corpus), which alone carries JEL codes on ~49% of its OpenAIRE-indexed
 * articles. Always check coverage per-journal for a field that is only
 * meaningful to one discipline, not on a corpus-wide random sample.
 */

function normalizeAwardCode(code) {
  if (!code) return null;
  return code.replace(/^ANR-/i, '').replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Fallback heuristic for the rare case `repairJournal()` has no Episciences
 * journal to fall back on (measured: 3/7826 publications — a docid never
 * resolved) and has to judge OpenAIRE's `container` name instead. Only
 * catches the obviously-wrong cases (HAL, DOAJ, arXiv, RePEc, various
 * institutional repositories); not meant to be exhaustive.
 */
const NON_JOURNAL_NAME_PATTERN = /\b(HAL|DOAJ|arXiv|RePEc|Repository|Archiv|Portal|IRIS|Orbit|Scholar|Bibliography|Explorer|institutional research information system)\b/i;

function cleanText(str) {
  return str?.replace(/\s+/g, ' ').trim();
}

/**
 * Repairs `journal.{name,issn,code}` when OpenAlex's source resolution
 * produced a repository name instead of the actual journal, or produced
 * nothing at all.
 *
 * Episciences' own `database.current.journal` (the platform of record) is
 * preferred *unconditionally* whenever it's available — not just when the
 * OpenAlex name "looks wrong". A first version of this function only
 * repaired names matching NON_JOURNAL_NAME_PATTERN below, on the assumption
 * that was the bulk of the damage; measured on the real corpus it missed
 * 1746/7826 publications (22.3%) whose OpenAlex name was still wrong but
 * didn't match the pattern — either a subtler mismatch with the real
 * Episciences name (missing accent/subtitle/apostrophe, wrong
 * capitalization: "journal of Groups complexity cryptology" vs "Groups
 * Complexity Cryptology") or a genuine repository name the pattern didn't
 * anticipate (e.g. "Padua Research Archive (University of Padova)",
 * "Centrum Wiskunde & Informatica (CWI)..."). OpenAIRE's `container` is
 * only used as a fallback when no Episciences export exists at all.
 *
 * `code` (the Episciences rvcode, e.g. "dmtcs") is a much more stable
 * per-journal identity than `issn` for the frontend to key on: OpenAlex's
 * source misresolution routinely drags along a *wrong* ISSN too (e.g.
 * DMTCS's own articles have been observed carrying 5 different ISSNs
 * across the corpus, one of them a completely unrelated journal's), so
 * `issn` cannot be trusted to dedupe by journal on its own.
 */
function repairJournal(journal, openAireResult, episciencesExport) {
  const episciencesJournal = episciencesExport?.database?.current?.journal;
  const container = openAireResult?.container;
  const issn = journal.issn || container?.issnOnline || container?.issnPrinted || container?.issnLinking;

  if (episciencesJournal?.name) {
    return { ...journal, name: cleanText(episciencesJournal.name), code: episciencesJournal.code, issn };
  }

  if (!container) return { ...journal, issn };

  const looksWrong = !journal.name || NON_JOURNAL_NAME_PATTERN.test(journal.name);
  const name = looksWrong && container.name ? cleanText(container.name) : journal.name;

  return { ...journal, name, issn };
}

/**
 * Extracts fields only available from the Episciences platform's own
 * per-article export: MSC 2020 classification (zbMATH Open) and the
 * actual peer-review timeline dates, both absent from OpenAlex/OpenAIRE.
 */
function extractEpisciencesData(episciencesExport) {
  const current = episciencesExport?.database?.current;
  if (!current) return undefined;

  const mscCodes = (current.classifications?.msc2020 || [])
    .map((c) => c.code)
    .filter(Boolean);

  return {
    msc_codes: mscCodes.length ? mscCodes : undefined,
    first_submission_date: current.dates?.first_submission_date,
    publication_date: current.dates?.publication_date,
    overlay_repository: current.repository?.name,
  };
}

function transformOpenAlex(data) {
  return {
    doi: data.doi,
    title: data.title,
    year: data.publication_year,
    journal: {
      name: data.primary_location?.source?.display_name
        ?.replace(/[\x98\x9C]/g, '')
        .replace(/\xA0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      issn: data.primary_location?.source?.issn?.[0],
      id: data.primary_location?.source?.id,
    },
    authors: data.authorships?.map((a) => ({
      name: a.author?.display_name,
      orcid: a.author?.orcid || null,
      institutions: a.institutions?.map((i) => ({
        name: i.display_name,
        ror: i.ror || null,
        country: i.country_code,
      })) || [],
    })) || [],
    sdgs: data.sustainable_development_goals?.map((s) => ({
      label: s.display_name,
      id: s.id,
      score: s.score || 0,
    })) || [],
    awards: (data.grants || data.awards || []).map((g) => ({
      name: g.funder_display_name || g.display_name,
      id: g.award_id || g.funder_award_id,
      funder: g.funder_display_name || g.funder,
      funder_id: g.funder_id ? g.funder_id.replace(/^https?:\/\/openalex\.org\//i, '') : undefined,
      source: 'openalex',
    })),
    primary_topic: data.primary_topic ? {
      name: data.primary_topic.display_name,
      id: data.primary_topic.id,
      subfield: data.primary_topic.subfield?.display_name,
      field: data.primary_topic.field?.display_name,
      domain: data.primary_topic.domain?.display_name,
    } : null,
    topics: data.topics?.map((t) => ({
      name: t.display_name,
      id: t.id,
      score: t.score || 0,
    })) || [],
    referenced_works_count: data.referenced_works_count || 0,
    referenced_works: data.referenced_works || [],
    related_works: data.related_works || [],
  };
}

/**
 * Reconciles OpenAlex `awards` against OpenAIRE `projects`: dedupes
 * ANR-code variants (e.g. "20-CE91-0006" vs "ANR-20-CE91-0006") that
 * OpenAlex sometimes lists as separate grants, and enriches matches with
 * the official `code`/`acronym` and OpenAIRE's cleaner funder name.
 */
function mergeAwards(openAlexAwards, openAireProjects) {
  const awards = openAlexAwards.map((a) => ({ ...a }));

  for (const project of openAireProjects || []) {
    const normalizedCode = normalizeAwardCode(project.code);
    const match = awards.find((a) => {
      if (a.id && normalizedCode && normalizeAwardCode(a.id) === normalizedCode) return true;
      return false;
    });

    if (match) {
      match.code = project.code;
      match.acronym = project.acronym || match.acronym;
      match.funder = project.funder || match.funder;
      match.name = project.title || match.name;
      match.source = 'both';
    } else {
      awards.push({
        name: project.title || project.funder,
        id: project.code,
        code: project.code,
        acronym: project.acronym || undefined,
        funder: project.funder,
        source: 'openaire',
      });
    }
  }

  // Collapse remaining ANR-code duplicates left over from OpenAlex alone.
  const seen = new Map();
  for (const award of awards) {
    const key = normalizeAwardCode(award.id) || `${award.funder}::${award.name}`;
    if (!seen.has(key)) {
      seen.set(key, award);
    } else {
      const existing = seen.get(key);
      if (!existing.code && award.code) Object.assign(existing, award);
    }
  }

  return Array.from(seen.values());
}

function stripAccentsLower(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Fills in missing ORCIDs from OpenAIRE author records, matched to
 * OpenAlex authors by accent/case-insensitive name comparison.
 *
 * Per the OpenAIRE data model, an ORCID must only ever be read from
 * `author.pid.id.value` when `author.pid.id.scheme` is `orcid` or
 * `orcid_pending` — `author.id` is an internal OpenAIRE MD5 hash, not
 * an identifier of any kind.
 */
function enrichOrcids(authors, openAireAuthors) {
  if (!openAireAuthors?.length) return authors;

  const orcidByName = new Map();
  for (const a of openAireAuthors) {
    const scheme = a.pid?.id?.scheme;
    const value = a.pid?.id?.value;
    if ((scheme === 'orcid' || scheme === 'orcid_pending') && value && a.fullName) {
      orcidByName.set(stripAccentsLower(a.fullName), value);
    }
  }
  if (orcidByName.size === 0) return authors;

  return authors.map((author) => {
    if (author.orcid) return author;
    const match = orcidByName.get(stripAccentsLower(author.name));
    return match ? { ...author, orcid: `https://orcid.org/${match}` } : author;
  });
}

function extractOpenScience(openAireResult) {
  if (!openAireResult) return { found_in_openaire: false };

  const instances = openAireResult.instances || [];
  const hostedRepositories = Array.from(
    new Set(instances.map((i) => i.hostedBy?.value).filter(Boolean))
  );
  const licenses = Array.from(new Set(instances.map((i) => i.license).filter(Boolean)));

  const fosFields = Array.from(
    new Set(
      (openAireResult.subjects || [])
        .filter((s) => s.subject?.scheme === 'FOS')
        .map((s) => s.subject.value)
        .filter(Boolean)
    )
  );

  // Only the dedicated 'jel' scheme yields clean codes (e.g. "jel:N01" ->
  // "N01"). Free-text keyword subjects that merely mention a JEL section
  // title (scheme 'keyword') are excluded on purpose: they're prose, not
  // a code, and would pollute this field.
  const jelCodes = Array.from(
    new Set(
      (openAireResult.subjects || [])
        .filter((s) => (s.subject?.scheme || '').toLowerCase() === 'jel')
        .map((s) => (s.subject.value || '').replace(/^jel:/i, '').trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const arxivPid = (openAireResult.pids || []).find((p) => /arxiv/i.test(p.scheme || ''));

  // 'EOSC' dominates this field (~85% of records on a stratified sample)
  // and carries little discriminating power on its own; kept alongside
  // more specific infrastructures (DARIAH EU, INRAE, UArctic, EUTOPIA...)
  // rather than filtered out, since that's a presentation choice, not an
  // extraction one.
  const researchCommunities = Array.from(
    new Set((openAireResult.communities || []).map((c) => c.label || c.code).filter(Boolean))
  );

  const citationImpact = openAireResult.indicators?.citationImpact;
  const impact = citationImpact ? {
    influence: citationImpact.influence,
    influence_class: citationImpact.influenceClass,
    popularity: citationImpact.popularity,
    popularity_class: citationImpact.popularityClass,
    impulse: citationImpact.impulse,
    impulse_class: citationImpact.impulseClass,
    citation_count: citationImpact.citationCount,
    citation_class: citationImpact.citationClass,
  } : undefined;

  return {
    found_in_openaire: true,
    hosted_repositories: hostedRepositories.length ? hostedRepositories : undefined,
    instance_count: instances.length || undefined,
    licenses: licenses.length ? licenses : undefined,
    is_green: typeof openAireResult.isGreen === 'boolean' ? openAireResult.isGreen : undefined,
    is_in_diamond_journal: typeof openAireResult.isInDiamondJournal === 'boolean' ? openAireResult.isInDiamondJournal : undefined,
    arxiv_id: arxivPid?.value,
    fos_fields: fosFields.length ? fosFields : undefined,
    jel_codes: jelCodes.length ? jelCodes : undefined,
    research_communities: researchCommunities.length ? researchCommunities : undefined,
    impact,
  };
}

/**
 * Combines a raw OpenAlex work, an (optional) raw OpenAIRE
 * research-product, and the (optional) Episciences platform export into
 * the final Publication record.
 */
export function mergePublication(openAlexData, openAireResult, episciencesExport) {
  const base = transformOpenAlex(openAlexData);

  base.journal = repairJournal(base.journal, openAireResult, episciencesExport);
  base.awards = mergeAwards(base.awards, openAireResult?.projects);
  base.authors = enrichOrcids(base.authors, openAireResult?.authors);
  base.open_science = extractOpenScience(openAireResult);
  base.episciences = extractEpisciencesData(episciencesExport);

  return base;
}
