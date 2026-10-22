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

/**
 * Authoritative list of Episciences hosted journals (from api.episciences.org/api/journals/).
 * Used to ensure external aggregator misattributions (e.g. Wiley's "Journal of Graph Theory")
 * are detected and repaired into their legitimate Episciences journal.
 */
const EPISCIENCES_CANONICAL_JOURNALS = [
  { code: 'afm', name: 'Annals of Formalized Mathematics' },
  { code: 'arcs', name: 'Analyse de réseaux pour les sciences sociales' },
  { code: 'arima', name: 'Revue Africaine de Recherche en Informatique et Mathématiques Appliquées' },
  { code: 'asrm', name: 'Archéologies. Sociétés, réseaux, matériaux' },
  { code: 'cm', name: 'Communications in Mathematics' },
  { code: 'compositionality', name: 'Compositionality' },
  { code: 'cst', name: 'Les Cahiers Scientifiques du Transport - Scientific Papers in Transportation' },
  { code: 'dc', name: 'Data & Corpus' },
  { code: 'detours', name: 'Détours' },
  { code: 'dmtcs', name: 'Discrete Mathematics & Theoretical Computer Science' },
  { code: 'eid', name: 'Environnement, Ingénierie & Développement' },
  { code: 'elpub', name: 'ElPub - ELectronic PUBlishing' },
  { code: 'entics', name: 'Electronic Notes in Theoretical Informatics and Computer Science' },
  { code: 'epidemes', name: 'epiDEMES' },
  { code: 'epiga', name: 'Épijournal de Géométrie Algébrique' },
  { code: 'fajpc', name: 'French Academic Journal of Primary Care' },
  { code: 'fi', name: 'Fundamenta Informaticae' },
  { code: 'gcc', name: 'journal of Groups, complexity, cryptology' },
  { code: 'hrj', name: 'Hardy-Ramanujan Journal' },
  { code: 'jdmdh', name: 'Journal of Data Mining & Digital Humanities' },
  { code: 'jfp', name: 'Journal of Functional Programming' },
  { code: 'jft', name: 'Journal francophone de tribologie' },
  { code: 'jimis', name: 'Journal of Interdisciplinary Methodologies and Issues in Sciences' },
  { code: 'jips', name: "JIPS - Journal d'Interaction Personne-Système" },
  { code: 'jnsao', name: 'Journal of Nonsmooth Analysis and Optimization' },
  { code: 'jodakiss', name: 'JoDaKISS - Journal of Data- and Knowledge-integrated Simulation Science' },
  { code: 'jonas', name: 'JoNAS - Journal of Non-Associative Structures' },
  { code: 'jpe', name: 'Journal of Philosophical Economics' },
  { code: 'jsat', name: 'Journal on Satisfiability, Boolean Modeling and Computation' },
  { code: 'jsedi', name: 'Journal of Studies of Earth’s Deep Interior' },
  { code: 'jtcam', name: 'Journal of Theoretical, Computational and Applied Mechanics' },
  { code: 'lmcs', name: 'Logical Methods in Computer Science' },
  { code: 'mbj', name: 'Multidisciplinary Biomechanics Journal' },
  { code: 'mna', name: 'Mathematical Neuroscience and Applications' },
  { code: 'mos', name: 'Management et Organisations du Sport' },
  { code: 'mscs', name: 'Mathematical Structures in Computer Science' },
  { code: 'mss', name: 'Movement & Sport Sciences - Science & Motricité' },
  { code: 'ocnmp', name: 'Open Communications in Nonlinear Mathematical Physics' },
  { code: 'ops', name: 'Open Plasma Science' },
  { code: 'pspa', name: 'Le Partenariat de soin avec le patient' },
  { code: 'raspa', name: '[RASPA] Revue africaine de santé et de productions animales' },
  { code: 'rdm', name: 'Recherches en Didactique des Mathématiques' },
  { code: 'slovo', name: 'Slovo' },
  { code: 'societes-plurielles', name: 'Sociétés plurielles' },
  { code: 'theoretics', name: 'TheoretiCS' },
  { code: 'toc', name: 'Theory of Computing' },
  { code: 'transformations', name: 'Transformations' },
];

const EPISCIENCES_BY_CODE = new Map(EPISCIENCES_CANONICAL_JOURNALS.map((j) => [j.code.toLowerCase(), j]));
const EPISCIENCES_BY_NAME = new Map();
for (const j of EPISCIENCES_CANONICAL_JOURNALS) {
  EPISCIENCES_BY_NAME.set(stripAccentsLower(j.name), j);
}

const KNOWN_CODES_BY_JOURNAL_NAME = {
  'logical methods in computer science': 'lmcs',
};

function cleanText(str) {
  return str?.replace(/\s+/g, ' ').trim();
}

/**
 * Repairs `journal.{name,issn,code}` when OpenAlex's source resolution
 * produced a repository name instead of the actual journal, or produced
 * nothing at all, or resolved to an external third-party publisher.
 *
 * Episciences' own `database.current.journal` (the platform of record) is
 * preferred *unconditionally* whenever it's available — not just when the
 * OpenAlex name "looks wrong".
 */
function repairJournal(journal, openAireResult, episciencesExport, sourceDoi) {
  const episciencesJournal = episciencesExport?.database?.current?.journal;
  const container = openAireResult?.container;
  const containerIssn = container?.issnOnline || container?.issnPrinted || container?.issnLinking;

  if (episciencesJournal?.name) {
    const isDifferentJournal = journal.name && stripAccentsLower(journal.name) !== stripAccentsLower(episciencesJournal.name);
    return {
      name: cleanText(episciencesJournal.name),
      code: episciencesJournal.code,
      issn: isDifferentJournal ? (containerIssn || journal.issn) : (journal.issn || containerIssn),
      id: isDifferentJournal ? undefined : journal.id,
    };
  }

  // Check if current journal is an actual Episciences journal
  const knownByCode = journal.code ? EPISCIENCES_BY_CODE.get(journal.code.toLowerCase()) : undefined;
  const knownByName = journal.name ? EPISCIENCES_BY_NAME.get(stripAccentsLower(journal.name)) : undefined;
  const isKnownEpisciencesJournal = Boolean(knownByCode || knownByName);

  const looksWrong = !isKnownEpisciencesJournal || !journal.name || NON_JOURNAL_NAME_PATTERN.test(journal.name);

  let candidateName = journal.name;
  let candidateCode = journal.code;

  if (looksWrong) {
    const containerClean = container?.name ? cleanText(container.name.replace(/&amp;/g, '&')) : undefined;
    const containerMatch = containerClean ? EPISCIENCES_BY_NAME.get(stripAccentsLower(containerClean)) : undefined;

    if (containerMatch) {
      candidateName = containerMatch.name;
      candidateCode = containerMatch.code;
    } else {
      // Try resolving from DOI prefix (e.g. 10.46298/dmtcs.3444 -> dmtcs)
      const cleanDoi = (sourceDoi || '').replace(/^https?:\/\/doi\.org\//i, '').trim();
      const doiCodeMatch = cleanDoi.match(/^10\.46298\/([a-z0-9_-]+)[.-]/i);
      if (doiCodeMatch) {
        const doiCode = doiCodeMatch[1].toLowerCase();
        const journalFromDoi = EPISCIENCES_BY_CODE.get(doiCode);
        if (journalFromDoi) {
          candidateName = journalFromDoi.name;
          candidateCode = journalFromDoi.code;
        }
      }
    }

    if (!candidateCode && containerClean) {
      candidateName = containerClean;
      candidateCode = KNOWN_CODES_BY_JOURNAL_NAME[containerClean.toLowerCase().trim()];
    }
  }

  const finalCode = candidateCode || (candidateName ? KNOWN_CODES_BY_JOURNAL_NAME[candidateName.toLowerCase().trim()] : undefined);
  const isDifferentJournal = journal.name && candidateName && stripAccentsLower(journal.name) !== stripAccentsLower(candidateName);

  return {
    name: candidateName ? cleanText(candidateName) : journal.name,
    code: finalCode,
    issn: isDifferentJournal ? (containerIssn || journal.issn) : (journal.issn || containerIssn),
    id: isDifferentJournal ? undefined : journal.id,
  };
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
    related_works: (data.related_works || []).slice(0, 20),
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

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

const ROR_ID_PATTERN = /^(?:https?:\/\/ror\.org\/)?(0[a-z0-9]{6}[0-9]{2})$/i;

function normalizeRor(value) {
  const match = ROR_ID_PATTERN.exec((value || '').trim());
  return match ? `https://ror.org/${match[1].toLowerCase()}` : null;
}

function nameTokens(str) {
  return stripAccentsLower(str).split(/\s+/).filter(Boolean);
}

/**
 * Finds the OpenAlex author an Episciences contributor refers to: exact
 * accent/case-insensitive full-name match first, then surname + first
 * initial (OpenAlex often abbreviates given names or adds a middle
 * initial / particle: "T. N. Shorey", "Bhalchandra D. Thatte", "Pierre Le
 * Roux" for Episciences' "Tarlok Nath Shorey", "Bhalchandra Thatte",
 * "Pierre Roux"). The fallback only accepts a single unambiguous
 * candidate within the paper.
 */
function findOpenAlexAuthor(authors, person) {
  const given = nameTokens(person.given_name);
  const surname = nameTokens(person.surname);
  if (!surname.length) return undefined;

  const full = [...given, ...surname].join(' ');
  const exact = authors.find((a) => nameTokens(a.name).join(' ') === full);
  if (exact) return exact;

  const candidates = authors.filter((a) => {
    const tokens = nameTokens(a.name);
    if (!surname.every((t) => tokens.includes(t))) return false;
    return !given.length || tokens[0]?.[0] === given[0][0];
  });
  return candidates.length === 1 ? candidates[0] : undefined;
}

/**
 * Adds the author affiliations declared on Episciences (Crossref-style
 * `journal.journal_article.contributors.person_name[].affiliations` in the
 * export) to the OpenAlex authors. Only affiliations carrying a ROR id are
 * used: the ones without (~60%) are free text, often a lab team or a job
 * title ("Assistant Professor"), and can't be placed on a map. OpenAlex
 * institutions are kept; Episciences ones are appended when their ROR id
 * isn't already there. `country` is left null here and resolved by
 * `enrichInstitutionCountries()` (affiliation-enrichment.mjs), which needs
 * network access.
 *
 * Each added institution carries a temporary `declared_names` list (every
 * name the author's affiliation list gives for that ROR id), checked then
 * removed by `enrichInstitutionCountries()`: the export's ROR ids are not
 * always right (see that function). Several names per ROR id happen
 * because the export sometimes copies an institution's ROR id onto the
 * entry just before it ("Université de Strasbourg" and "Linguistique,
 * Langues et Parole" both carrying LiLPa's id).
 */
export function mergeEpisciencesAffiliations(authors, episciencesExport) {
  const persons = asArray(episciencesExport?.journal?.journal_article?.contributors?.person_name);
  if (!persons.length || !authors.length) return authors;

  const additions = new Map();
  for (const person of persons) {
    const institutions = asArray(person.affiliations?.institution)
      .map((inst) => {
        const rorId = asArray(inst.institution_id).find((id) => id['@type'] === 'ror');
        const ror = normalizeRor(rorId?.value);
        const name = cleanText(inst.institution_name);
        return ror ? { name: name || ror, ror, country: null, declared_names: name ? [name] : [] } : null;
      })
      .filter(Boolean);
    if (!institutions.length) continue;

    const author = findOpenAlexAuthor(authors, person);
    if (!author) continue;
    additions.set(author, [...(additions.get(author) || []), ...institutions]);
  }
  if (!additions.size) return authors;

  return authors.map((author) => {
    const extra = additions.get(author);
    if (!extra) return author;
    const known = new Set(author.institutions.map((i) => i.ror).filter(Boolean));
    const added = new Map();
    for (const inst of extra) {
      if (known.has(inst.ror)) continue;
      const existing = added.get(inst.ror);
      if (existing) existing.declared_names.push(...inst.declared_names);
      else added.set(inst.ror, inst);
    }
    return added.size ? { ...author, institutions: [...author.institutions, ...added.values()] } : author;
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
 *
 * @param {object} openAlexData
 * @param {object} [openAireResult]
 * @param {object} [episciencesExport]
 * @param {string} [sourceDoi] The canonical Episciences DOI being collected
 */
export function mergePublication(openAlexData, openAireResult, episciencesExport, sourceDoi) {
  const base = transformOpenAlex(openAlexData);

  // Preserve the requested canonical Episciences DOI if provided,
  // preventing OpenAlex from replacing it with an external publisher's DOI (e.g. Wiley).
  if (sourceDoi) {
    const cleanDoi = sourceDoi.replace(/^https?:\/\/doi\.org\//i, '').trim();
    base.doi = `https://doi.org/${cleanDoi}`;
  }

  base.journal = repairJournal(base.journal, openAireResult, episciencesExport, sourceDoi);
  base.awards = mergeAwards(base.awards, openAireResult?.projects);
  base.authors = enrichOrcids(base.authors, openAireResult?.authors);
  base.authors = mergeEpisciencesAffiliations(base.authors, episciencesExport);
  base.open_science = extractOpenScience(openAireResult);
  base.episciences = extractEpisciencesData(episciencesExport);

  return base;
}
