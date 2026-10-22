export type Locale = 'en' | 'fr' | 'es';

export interface Translations {
  common: {
    language: string;
    selectLanguage: string;
    languageAnnouncement: string;
    loading: string;
    publications: string;
    journals: string;
    citations: string;
    countries: string;
    funders: string;
    downloads: string;
    resetFilters: string;
    allJournals: string;
    allYears: string;
    allRepositories: string;
    allCountries: string;
    allFunders: string;
    allDomains: string;
    searchPlaceholder: string;
    fullscreen: string;
    exitFullscreen: string;
    close: string;
    reset: string;
    pubs: string;
    year: string;
    journal: string;
    funder: string;
    country: string;
    network: string;
    matrix: string;
    cluster: string;
    flowMap: string;
    flows: string;
    overview: string;
    fewer: string;
    more: string;
    min: string;
    max: string;
    partnerA: string;
    partnerB: string;
    sharedConnection: string;
    jointPublications: string;
    profile: string;
    impact: string;
    hoverHint: string;
    escToClose: string;
    openNetworkExplorer: string;
    skipToContent: string;
    views: string;
    showing: string;
    of: string;
    backToDashboard: string;
  };
  header: {
    tag: string;
    title: string;
    subtitle: string;
    networkExplorerBtn: string;
    overlayJournals: string;
    diamondDashboard: string;
    sdgTitle: string;
    of17: string;
    abstractViews: string;
    globalCoverage: string;
    countriesMetric: string;
  };
  tabs: {
    overview: string;
    reach: string;
    topics: string;
    funders: string;
    lineage: string;
    usage: string;
    journals: string;
    institutions: string;
    platform: string;
  };
  kpi: {
    publicationsDesc: string;
    journalsDesc: string;
    citationsDesc: string;
    countriesDesc: string;
    fundersDesc: string;
    downloadsDesc: string;
  };
  disclaimer: {
    title: string;
    metricsP1: string;
    metricsP2: string;
    downloadsNoteTitle: string;
    downloadsNote: string;
  };
  footer: {
    license: string;
    source: string;
    lastUpdated: string;
    methodologyLink: string;
  };
  lineage: {
    title: string;
    subtitle: string;
    description: string;
    source: string;
    heritage: string;
    theResearchLineage: string;
    intro: string;
    foundationalRefs: string;
    scientificNeighbors: string;
    mostInterconnected: string;
    scientificFoundations: string;
    scientificHorizons: string;
    morePapersReferenced: string;
    buildsUpon: string;
    noFoundational: string;
    worksMapped: string;
    noRelated: string;
    selectPaperPrompt: string;
    selectedPublication: string;
    searchPlaceholder: string;
    clearSearch: string;
    noResults: string;
    articlesMatching: string;
    viewArticle: string;
    exploreOpenAlex: string;
    relatedWorkIndex: string;
    consultOnOpenAlex: string;
    authors: string;
    discipline: string;
    openAccessDiamond: string;
    bibliographicDepth: string;
    deepCorpus: string;
    standardCorpus: string;
    targetedCorpus: string;
    referencesHint: string;
    citationsReceived: string;
    citationsCount: string;
    semanticAffinity: string;
    semanticAffinityDesc: string;
    loadMore: string;
    showingCount: string;
    openAlexLimitExplanation: string;
    artifactsFilterOnly: string;
    artifactsFilterAll: string;
    artifactsTitle: string;
    artifactsSubtitle: string;
    datasetsCountLabel: string;
    softwareCountLabel: string;
    noArtifactsFound: string;
    viewArtifact: string;
    openAireRecord: string;
  };
  network: {
    title: string;
    backBtn: string;
    description: string;
  };
  dashboard: {
    usageTitle: string;
    usageDesc: string;
    usageSource: string;
    topicsTitle: string;
    topicsDesc: string;
    topicsSource: string;
    funderTitle: string;
    funderDesc: string;
    funderSource: string;
    reachTitle: string;
    reachDesc: string;
    reachSource: string;
    topicsOverview: string;
    networksAndCoOccurrences: string;
    funderOverview: string;
    funderNetworks: string;
    reachOverview: string;
    reachNetworks: string;
    allFunders: string;
    filterByFunder: string;
    funderSearchPlaceholder: string;
    noFundersFound: string;
    filterByDomain: string;
    allDomains: string;
    researchLandscape: string;
    interactiveTreemap: string;
    treemapExplanation: string;
    sdgTitle: string;
    sdgSubtitle: string;
    whatAreSdgs: string;
    sdgExplanation1: string;
    sdgExplanation2: string;
    sdgDistTitle: string;
    sdgDistSubtitle: string;
    sdgDistDesc: string;
    licensingTitle: string;
    licensingSubtitle: string;
    licensingDesc: string;
    licenseDeclarations: string;
    noLicenseData: string;
    kpiDatasetsTitle: string;
    kpiDatasetsDesc: string;
    kpiSoftwareTitle: string;
    kpiSoftwareDesc: string;
    kpiRepositoriesTitle: string;
    kpiRepositoriesDesc: string;
    funderVolumeTitle: string;
    funderVolumeDesc: string;
    affiliatedCountries: string;
    representedWorldwide: string;
    affiliatedInstitutions: string;
    distinctOrganizations: string;
    authorAffiliationsTitle: string;
    authorAffiliationsSubtitle: string;
    topContributingCountries: string;
    rankedByPubs: string;
    topContributingInstitutions: string;
    deduplicatedRor: string;
    noRor: string;
    clickToExplore: string;
    clickToViewAffiliations: string;
    relationalViews: string;
    topicsNetwork: string;
    topicsMatrix: string;
    mscNetwork: string;
    mscMatrix: string;
    countryNetwork: string;
    institutionNetwork: string;
    collaborationMatrix: string;
    geographicFlows: string;
    topicsNetworkTitle: string;
    topicsNetworkDesc: string;
    topicsMatrixTitle: string;
    topicsMatrixDesc: string;
    mscNetworkTitle: string;
    mscNetworkDesc: string;
    mscMatrixTitle: string;
    mscMatrixDesc: string;
    funderNetworkTitle: string;
    funderNetworkDesc: string;
    funderMatrixTitle: string;
    funderMatrixDesc: string;
    funderClusterTitle: string;
    funderClusterDesc: string;
    funderSankeyTitle: string;
    funderSankeyDesc: string;
    funderFlowsTitle: string;
    funderFlowsDesc: string;
    geoFlowsTitle: string;
    geoFlowsDesc: string;
    countryNetworkTitle: string;
    countryNetworkDesc: string;
    institutionNetworkTitle: string;
    institutionNetworkDesc: string;
    collabMatrixTitle: string;
    collabMatrixDesc: string;
    fullscreenSubtitle: string;
  };
  usage: {
    pulseTitle: string;
    pulseSubtitle: string;
    downloads: string;
    views: string;
    estimate: string;
    usageImpact: string;
    isolatedMetrics: string;
    cumulative: string;
    archiveVolume: string;
    journalVolume: string;
    aggregatedKpis: string;
    globalReadership: string;
    downloadsByCountry: string;
    activeCountries: string;
    mapLegend: string;
    mostDownloaded: string;
    top20Trending: string;
    readOnline: string;
    filteredAnalytics: string;
    showingStats: string;
    papersTracked: string;
    allJournals: string;
    globalPulse: string;
    journalPulse: string;
  };
  countryInstitutions: {
    title: string;
    subtitle: string;
    treemap: string;
    barChart: string;
    quickSelect: string;
    publications: string;
    identifiedInstitutions: string;
    limit: string;
    noAffiliation: string;
  };
  funderSankey: {
    title: string;
    subtitle: string;
    noDataTitle: string;
    noDataDesc: string;
    showingTop: string;
  };
  funderStoryline: {
    title: string;
    subtitle: string;
    noDataTitle: string;
    noDataDesc: string;
    topShown: string;
    other: string;
  };
  flowMap: {
    countryTitle: string;
    countrySubtitle: string;
    funderTitle: string;
    funderSubtitle: string;
    countriesShown: string;
    fundersShown: string;
    coAuthorshipTies: string;
    fundingTies: string;
    loading: string;
    sliderLabelCountries: string;
    sliderLabelFunders: string;
    nodeExplanationCountry: string;
    nodeExplanationFunder: string;
    sliderNoteCountry: string;
    sliderNoteFunder: string;
    tooltipLinkCountry: string;
    tooltipLinkFunder: string;
    tooltipNodeCountry: string;
    tooltipNodeFunder: string;
  };
  coOccurrence: {
    sortedByVolume: string;
    maxIntensity: string;
    topLimitNotice: string;
    totalEntities: string;
    totalConnections: string;
    clusters: string;
    louvainLegend: string;
    clusterPrefix: string;
    fewerShared: string;
    moreShared: string;
  };
  matrix: {
    subtitleDiagonal: string;
    showTop: string;
    diagonalTooltip: string;
    crossTooltip: string;
    maxIntensityShared: string;
    noDataTitle: string;
    noDataDesc: string;
  };
  treemap: {
    noData: string;
    unknownDomain: string;
    ariaLabel: string;
  };
  radar: {
    ariaLabel: string;
    impactScore: string;
    sdgImpact: string;
    legendTitle: string;
  };
  networkExplorer: {
    subtitle: string;
    funderHeading: string;
    funderGeoHeading: string;
    reachHeading: string;
    countryCollabHeading: string;
    mscHeading: string;
    topicsHeading: string;
    showingPubsCount: string;
    reachScopedNotice: string;
    countryScopedNotice: string;
  };
  methodology: {
    backToDashboard: string;
    badge: string;
    title: string;
    subtitle: string;
    institution: string;
    author: string;
    date: string;
    tocTitle: string;
    tocContext: string;
    tocSources: string;
    tocPipeline: string;
    tocModels: string;
    tocLimits: string;
    tocFair: string;
    tocReferences: string;
    sec1Title: string;
    sec1P1: string;
    sec1P2: string;
    sec1CalloutTitle: string;
    sec1CalloutDesc: string;
    sec2Title: string;
    sec2P1: string;
    sourceThName: string;
    sourceThAccess: string;
    sourceThScope: string;
    sourceThPivot: string;
    sec3Title: string;
    sec3P1: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    sec4Title: string;
    sdgTitle: string;
    sdgP1: string;
    sdgFormulaExplanation: string;
    networkTitle: string;
    networkP1: string;
    usageTitle: string;
    usageP1: string;
    usageWarning: string;
    lineageTitle: string;
    lineageP1: string;
    topicsTitle?: string;
    topicsP1?: string;
    reachMethodTitle?: string;
    reachMethodP1?: string;
    sec5Title: string;
    sec5P1: string;
    limit1Title: string;
    limit1Desc: string;
    limit2Title: string;
    limit2Desc: string;
    limit3Title: string;
    limit3Desc: string;
    sec6Title: string;
    sec6P1: string;
    ssgTitle: string;
    ssgDesc: string;
    compressionTitle: string;
    compressionDesc: string;
    licenseTitle: string;
    licenseDesc: string;
    reproTitle: string;
    reproDesc: string;
    reproCommands: string;
    downloadPubs: string;
    downloadFunders: string;
    sec7Title: string;
    references: string[];
  };
  export: {
    exportButton: string;
    exportMenu: string;
    exportVisualization: string;
    exportData: string;
    png: string;
    pngDesc: string;
    svg: string;
    svgDesc: string;
    csv: string;
    csvDesc: string;
    json: string;
    jsonDesc: string;
    downloading: string;
    success: string;
    error: string;
    noSvgFound: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
      "common": {
          "language": "Language",
          "selectLanguage": "Select language",
          "languageAnnouncement": "Language switched to English",
          "loading": "Loading...",
          "publications": "Publications",
          "journals": "Active Journals",
          "citations": "Known Citations",
          "countries": "Co-Author Countries",
          "funders": "Identified Funders",
          "downloads": "Total Downloads",
          "resetFilters": "Reset filters",
          "allJournals": "All Journals",
          "allYears": "All Years",
          "allRepositories": "All Repositories",
          "allCountries": "All Countries",
          "allFunders": "All Funders",
          "allDomains": "All Domains",
          "searchPlaceholder": "Search publication, author, keyword...",
          "fullscreen": "Open in fullscreen",
          "exitFullscreen": "Close fullscreen",
          "close": "Close",
          "reset": "Reset",
          "pubs": "pubs",
          "year": "Year",
          "journal": "Journal",
          "funder": "Funder",
          "country": "Country",
          "network": "Network",
          "matrix": "Matrix",
          "cluster": "Cluster",
          "flowMap": "Flow Map",
          "flows": "Flows",
          "overview": "Overview",
          "fewer": "Fewer",
          "more": "More",
          "min": "Min.",
          "max": "Max.",
          "partnerA": "Partner A",
          "partnerB": "Partner B",
          "sharedConnection": "Shared Connection",
          "jointPublications": "Joint Publications",
          "profile": "Profile",
          "impact": "Impact",
          "hoverHint": "Hover over nodes or lines to reveal the network",
          "escToClose": "ESC to close",
          "openNetworkExplorer": "Open Network Explorer",
          "skipToContent": "Skip to main content",
          "views": "views",
          "showing": "Showing",
          "of": "of",
          "backToDashboard": "Back to Dashboard"
      },
      "header": {
          "tag": "Scientific Impact Platform",
          "title": "Episciences Insights",
          "subtitle": "Visualizing Open Access scientific impact and cross-disciplinary networks",
          "networkExplorerBtn": "Network Explorer",
          "overlayJournals": "Overlay journals",
          "diamondDashboard": "Diamond Open Access Dashboard",
          "sdgTitle": "SDGs (Sustainable Development)",
          "of17": "of 17",
          "abstractViews": "Abstract Views",
          "globalCoverage": "Global Coverage",
          "countriesMetric": "Countries & territories"
      },
      "tabs": {
          "overview": "Overview",
          "reach": "Global Reach",
          "topics": "Research Landscape",
          "funders": "Funder Impact",
          "lineage": "Research Lineage & Open Science",
          "usage": "Usage Analytics",
          "journals": "Journal Statistics",
          "institutions": "Institution Statistics",
          "platform": "Platform Data"
      },
      "kpi": {
          "publicationsDesc": "Open access peer-reviewed papers",
          "journalsDesc": "Diamond open access overlay titles",
          "citationsDesc": "Cross-referenced impact tracked across sources",
          "countriesDesc": "Worldwide research collaboration scope",
          "fundersDesc": "Public and philanthropic funding bodies",
          "downloadsDesc": "Platform readership on journal websites"
      },
      "disclaimer": {
          "title": "Data Accuracy & Source Disclaimer",
          "metricsP1": "The scientific metrics and connections visualized in this dashboard are powered by the [OpenAlex API](https://openalex.org), the [OpenAIRE Graph API](https://graph.openaire.eu), the [Episciences API](https://www.episciences.org), the [zbMATH Open API](https://zbmath.org), and the [ROR API](https://ror.org). Please note that these datasets may not represent the exhaustive catalog of Episciences publications, indexing latencies may occur, and external source coverage of a given publication is not guaranteed: open science indicators and subject classifications are only available where matching records exist.",
          "metricsP2": "Certain metadata (including research topics, SDG alignment, and related works) are generated using [OpenAlex](https://openalex.org) automated algorithms. Funding codes and acronyms, hosting repositories, license information, citation impact indicators, and research infrastructure affiliations are sourced from [OpenAIRE Graph](https://graph.openaire.eu). Mathematics Subject Classifications (MSC 2020) are sourced from [zbMATH Open](https://zbmath.org). Research institution and funder identification, geocoding, and disambiguation are powered by the [ROR (Research Organization Registry) API](https://ror.org). [Episciences](https://www.episciences.org) is engaged in a permanent effort to refine, verify, and enrich these datasets to provide an increasingly accurate representation of our research impact.",
          "downloadsNoteTitle": "Download statistics",
          "downloadsNote": "are sourced exclusively from the Episciences platform and reflect downloads occurring directly on journal websites. They do not account for downloads from open repositories, where the same articles may also be freely available. Actual readership figures are therefore likely higher than those reported here."
      },
      "footer": {
          "license": "CC-BY 2026 CCSD - Episciences - Open Source (GPL v3)",
          "source": "Data automatically aggregated from the OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open, and ROR APIs",
          "lastUpdated": "Data last updated: {date}",
          "methodologyLink": "Methodology & Scholarly Framework"
      },
      "lineage": {
          "title": "Research Lineage",
          "subtitle": "Research Lineage & Open Science Provenance",
          "description": "Provides article-level inspection connecting persistent identifiers (DOIs, RORs, ORCIDs). Verifies open repository hosting, linked open research artifacts (datasets and software via OpenAIRE Scholix), license validity, and citation impact.",
          "source": "Source: Episciences, OpenAlex, OpenAIRE, zbMATH Open & ROR",
          "heritage": "Scientific Heritage",
          "theResearchLineage": "The Research Lineage",
          "intro": "Every publication in Episciences is part of a global scientific lineage. We track the Lineage of these works by mapping the foundations they build upon (References) and the new frontiers they open (Related Works).",
          "foundationalRefs": "Foundational Refs",
          "scientificNeighbors": "Scientific Neighbors",
          "mostInterconnected": "Most Interconnected Works",
          "scientificFoundations": "Scientific Foundations (Past)",
          "scientificHorizons": "Scientific Horizons (Future/Related)",
          "morePapersReferenced": "more papers referenced",
          "buildsUpon": "This work builds upon {count} established scientific sources.",
          "noFoundational": "Foundational sources for this work have not been identified by OpenAlex yet.",
          "worksMapped": "works mapped",
          "noRelated": "No related works mapped yet in OpenAlex for this recent paper.",
          "selectPaperPrompt": "Select a paper from the list to view its lineage",
          "selectedPublication": "Selected Publication",
          "searchPlaceholder": "Search by title, author, or keyword...",
          "clearSearch": "Clear search",
          "noResults": "No publications match your search.",
          "articlesMatching": "publications",
          "viewArticle": "View publication (DOI)",
          "exploreOpenAlex": "Explore related network on OpenAlex",
          "relatedWorkIndex": "Related work",
          "consultOnOpenAlex": "View on OpenAlex",
          "authors": "Authors",
          "discipline": "Discipline",
          "openAccessDiamond": "Diamond Open Access",
          "bibliographicDepth": "Bibliographic Depth",
          "deepCorpus": "Extensive scientific corpus (> 50 sources)",
          "standardCorpus": "Standard scientific corpus (20–50 sources)",
          "targetedCorpus": "Focused scientific study (< 20 sources)",
          "referencesHint": "Full references are listed in the full-text publication on Episciences.",
          "citationsReceived": "Recorded Citations",
          "citationsCount": "citation(s) detected in OpenAIRE / OpenAlex",
          "semanticAffinity": "Thematic Neighborhood & Related Works",
          "semanticAffinityDesc": "Publications sharing co-citations and high semantic affinity in the global scientific graph.",
          "loadMore": "Load 50 more publications",
          "showingCount": "Showing {visible} of {total} publications",
          "openAlexLimitExplanation": "OpenAlex computes up to 10 nearest scientific neighbors per work based on co-citation and text embeddings similarity.",
          "artifactsFilterOnly": "With data or code",
          "artifactsFilterAll": "All publications",
          "artifactsTitle": "Associated Research Artifacts",
          "artifactsSubtitle": "Research datasets and software indexed via OpenAIRE Scholix",
          "datasetsCountLabel": "Dataset(s)",
          "softwareCountLabel": "Software & Code",
          "noArtifactsFound": "No associated research datasets or software detected for this publication in OpenAIRE Scholix.",
          "viewArtifact": "View artifact",
          "openAireRecord": "OpenAIRE record"
      },
      "network": {
          "title": "Network Explorer - Episciences Insights",
          "backBtn": "Back to Dashboard",
          "description": "Relational views of the full corpus, given more room than the main dashboard tabs allow."
      },
      "dashboard": {
          "usageTitle": "Usage Analytics & Global Readership",
          "usageDesc": "Tracks worldwide reader engagement across Episciences diamond open access publications. Quantifies how research is disseminated, downloaded, and read internationally over time, without paywalls or subscription barriers.",
          "usageSource": "Source: Episciences Platform KPI API",
          "topicsTitle": "Research Landscape & Thematic Cartography",
          "topicsDesc": "Cartography of scientific domains, research subfields, and specialized mathematical disciplines across journals. Combines OpenAlex topic modeling with the Mathematics Subject Classification (MSC 2020 sourced from zbMATH Open).",
          "topicsSource": "Source: OpenAlex & zbMATH Open",
          "funderTitle": "Funder Impact & Societal Relevance",
          "funderDesc": "Evaluates research funding agencies acknowledging publications, institutional co-sponsorship syndicates, open license compliance (Creative Commons), and alignment with the United Nations Sustainable Development Goals (SDGs).",
          "funderSource": "Source: OpenAlex, OpenAIRE Graph v3 & ROR",
          "reachTitle": "Global Reach & International Collaboration",
          "reachDesc": "Analyzes the global footprint of author affiliations and cross-border research partnerships. Highlights single-country versus international collaboration rates, bilateral co-publication hubs, and academic institutions mapped via ROR identifiers.",
          "reachSource": "Source: OpenAlex & ROR API",
          "topicsOverview": "Topics Overview",
          "networksAndCoOccurrences": "Networks & Co-occurrences",
          "funderOverview": "Overview & Funders",
          "funderNetworks": "Co-funding Networks",
          "reachOverview": "Overview",
          "reachNetworks": "Networks & Collaborations",
          "allFunders": "All Funders",
          "filterByFunder": "Filter by funding agency",
          "funderSearchPlaceholder": "Type to filter list...",
          "noFundersFound": "No funders found matching your search",
          "filterByDomain": "Filter by Domain",
          "allDomains": "All Domains",
          "researchLandscape": "Research Landscape",
          "interactiveTreemap": "Interactive Treemap of Domains & Fields",
          "treemapExplanation": "Hierarchical visualization of research topics classified by OpenAlex. The surface area of each tile represents relative publication volume across major scientific domains and their underlying subfields.",
          "sdgTitle": "UN Sustainable Development Goals (SDGs)",
          "sdgSubtitle": "Societal challenge alignment & policy relevance",
          "whatAreSdgs": "What are SDGs and why are they analyzed here?",
          "sdgExplanation1": "The United Nations Sustainable Development Goals (SDGs) are 17 global objectives adopted in 2015 to guide action toward ending poverty, promoting public health, ensuring quality education, tackling climate change, and protecting ecosystems.",
          "sdgExplanation2": "In this platform, publications are mapped to corresponding SDGs using OpenAlex AI/NLP models trained on official UN indicator frameworks. This reveals the tangible societal and policy impact of diamond open access research, moving beyond purely academic citations to highlight contributions to global challenges.",
          "sdgDistTitle": "SDG Distribution",
          "sdgDistSubtitle": "Total matching records per United Nations goal",
          "sdgDistDesc": "Compares publication volume across the 17 UN goals to identify which societal themes dominate in this corpus.",
          "licensingTitle": "Licensing Landscape",
          "licensingSubtitle": "Open Access Rights Retention & Reusability (OpenAIRE Graph v3)",
          "licensingDesc": "Examines Creative Commons open licenses declared on published articles. Standard licenses (like CC-BY) allow authors to retain copyright while authorizing unrestricted worldwide reading, text/data mining, redistribution, and permanent archival.",
          "licenseDeclarations": "license declarations across the selected publications.",
          "noLicenseData": "No license data in this selection",
          "kpiDatasetsTitle": "Linked Datasets",
          "kpiDatasetsDesc": "Publications linked to research datasets (Dryad, Zenodo, etc.)",
          "kpiSoftwareTitle": "Linked Software & Code",
          "kpiSoftwareDesc": "Publications linked to source code and software repositories",
          "kpiRepositoriesTitle": "Open Repositories",
          "kpiRepositoriesDesc": "Distinct open platforms and archives hosting copies (HAL, arXiv...)",
          "funderVolumeTitle": "Volume by Research Funder",
          "funderVolumeDesc": "Ranked volume of acknowledgments for national, European, and international research grant sponsors.",
          "affiliatedCountries": "Affiliated Countries & Territories",
          "representedWorldwide": "represented worldwide",
          "affiliatedInstitutions": "Affiliated Institutions",
          "distinctOrganizations": "distinct research organizations",
          "authorAffiliationsTitle": "Global Reach: Author Affiliations",
          "authorAffiliationsSubtitle": "Geographic distribution across {count} countries & territories (log scale)",
          "topContributingCountries": "Top Contributing Countries & Territories",
          "rankedByPubs": "Ranked by number of affiliated publications",
          "topContributingInstitutions": "Top Contributing Institutions",
          "deduplicatedRor": "Deduplicated by ROR identifier",
          "noRor": "No ROR available",
          "clickToExplore": "Click to explore affiliations in {country}",
          "clickToViewAffiliations": "click to view affiliations",
          "relationalViews": "Relational Views & Flows",
          "topicsNetwork": "Topics Network",
          "topicsMatrix": "Topics Matrix",
          "mscNetwork": "MSC Network",
          "mscMatrix": "MSC Matrix",
          "countryNetwork": "Country Network",
          "institutionNetwork": "Institution Network",
          "collaborationMatrix": "Collaboration Matrix",
          "geographicFlows": "Geographic Flows",
          "topicsNetworkTitle": "Topics Co-occurrence Network",
          "topicsNetworkDesc": "Force-directed graph connecting OpenAlex research topics appearing together on the same article, highlighting interdisciplinary bridges between fields.",
          "topicsMatrixTitle": "Topics Co-occurrence Matrix",
          "topicsMatrixDesc": "Symmetric pairwise heat matrix quantifying the exact frequency of thematic overlap between top research topics.",
          "mscNetworkTitle": "MSC 2020 Classification Network",
          "mscNetworkDesc": "Maps connections between Mathematics Subject Classification 2020 codes (from zbMATH Open via Episciences export), showing intersections between mathematical subfields (e.g. combinatorics, logic, algebra, probability).",
          "mscMatrixTitle": "MSC 2020 Co-occurrence Matrix",
          "mscMatrixDesc": "Heatmap measuring shared MSC 2020 classification codes across mathematical research articles.",
          "funderNetworkTitle": "Co-funding Network",
          "funderNetworkDesc": "Nodes represent research funding agencies. Links indicate co-sponsorship of the same research publication; thicker links denote frequent joint grants.",
          "funderMatrixTitle": "Co-funding Matrix",
          "funderMatrixDesc": "Pairwise heat matrix quantifying bilateral grant co-sponsorship frequencies between major funders.",
          "funderClusterTitle": "Co-funding Clusters",
          "funderClusterDesc": "Topological community detection revealing recurring consortia and syndicates of research sponsors.",
          "funderSankeyTitle": "Funder Flow Sankey",
          "funderSankeyDesc": "Bipartite flow diagram tracing funding grants to publication volumes across major sponsoring bodies.",
          "funderFlowsTitle": "Funder Geographic Flow Map",
          "funderFlowsDesc": "Maps origin countries of funding bodies to the recipient research institutions worldwide.",
          "geoFlowsTitle": "Geographic Flow Map",
          "geoFlowsDesc": "Traces collaborative connection arcs between country coordinates, illustrating international co-authorship corridors across continents.",
          "countryNetworkTitle": "Country Collaboration Network",
          "countryNetworkDesc": "Force-directed graph where nodes represent countries (sized by publication count) and undirected edges represent co-authorship partnerships.",
          "institutionNetworkTitle": "Institution Collaboration Network",
          "institutionNetworkDesc": "Visualizes co-authorship ties between academic institutions and research centers disambiguated via ROR (Research Organization Registry) IDs.",
          "collabMatrixTitle": "Pairwise Collaboration Matrix",
          "collabMatrixDesc": "Symmetric heatmap measuring the exact co-publication counts between pairs of countries to identify the strongest bilateral axes.",
          "fullscreenSubtitle": "High-definition fullscreen exploration - Active filters applied"
      },
      "usage": {
          "pulseTitle": "Usage Pulse",
          "pulseSubtitle": "Growth trends through {year} - dashed line is a {year} year-end estimate",
          "downloads": "Downloads",
          "views": "Views",
          "estimate": "Estimate",
          "usageImpact": "Usage Impact",
          "isolatedMetrics": "Isolated Metrics",
          "cumulative": "Cumulative",
          "archiveVolume": "Archive Volume",
          "journalVolume": "Journal Volume",
          "aggregatedKpis": "Aggregated KPIs",
          "globalReadership": "Global Readership",
          "downloadsByCountry": "Total downloads by country & territory (log scale)",
          "activeCountries": "Countries & territories",
          "mapLegend": "Full Archive PDF Downloads by Country & Territory",
          "mostDownloaded": "Most Downloaded Articles",
          "top20Trending": "Top 20 Trending Papers",
          "readOnline": "Read Online",
          "filteredAnalytics": "Filtered Analytics",
          "showingStats": "Showing {year} stats for {journal}",
          "papersTracked": "papers tracked",
          "allJournals": "all journals",
          "globalPulse": "Global Usage Pulse",
          "journalPulse": "Journal Usage Pulse"
      },
      "countryInstitutions": {
          "title": "Top Affiliations by Country",
          "subtitle": "Explore the dominant research institutions and universities within each country",
          "treemap": "Treemap",
          "barChart": "Bar Chart",
          "quickSelect": "Quick Select:",
          "publications": "Publications:",
          "identifiedInstitutions": "Identified Institutions:",
          "limit": "Limit:",
          "noAffiliation": "No affiliation data available for {country} with current filters"
      },
      "funderSankey": {
          "title": "Funder Flow Sankey",
          "subtitle": "Country -> Funder -> Research Domain",
          "noDataTitle": "No Geolocated Funder Data Available",
          "noDataDesc": "No publications in this selection carry a funder resolved to a known country.",
          "showingTop": "Showing the top {top} of {total} geolocated funders (by publication volume), grouped by HQ country and linked to research domain."
      },
      "funderStoryline": {
          "title": "Funder Storyline",
          "subtitle": "Publication Volume by Funder Over Time",
          "noDataTitle": "No Funding Timeline Available",
          "noDataDesc": "No publications in this selection carry funder information.",
          "topShown": "Top {shown} of {total} funders shown",
          "other": "Other"
      },
      "flowMap": {
          "countryTitle": "Country Flow Map",
          "countrySubtitle": "Geographic Co-Authorship Ties",
          "funderTitle": "Funder Geographic Flow Map",
          "funderSubtitle": "Funding Origin Countries -> Recipient Institutions",
          "countriesShown": "Countries Shown",
          "fundersShown": "Funders Shown",
          "coAuthorshipTies": "Co-Authorship Ties",
          "fundingTies": "Funding Ties",
          "loading": "Loading map...",
          "sliderLabelCountries": "Countries shown",
          "sliderLabelFunders": "Funders shown",
          "nodeExplanationCountry": "Node size = publication volume with an author affiliated in that country. Line color/weight = number of publications co-authored by that pair of countries.",
          "nodeExplanationFunder": "Maps origin countries of funding bodies to the recipient research institutions worldwide.",
          "sliderNoteCountry": "Map displays the top {max} countries by publication volume - use the slider above to show more or fewer.",
          "sliderNoteFunder": "Map displays the top {max} funders by publication volume.",
          "tooltipLinkCountry": "{nameA} ↔ {nameB}: {count} co-authored publications",
          "tooltipLinkFunder": "{funder} ({country}) → {institution}: {count} publications",
          "tooltipNodeCountry": "{name}: {count} publications",
          "tooltipNodeFunder": "{name}: {count} funded publications"
      },
      "coOccurrence": {
          "sortedByVolume": "Sorted by total publication volume. Showing {count} {label} - max intensity: {max} shared publications.",
          "maxIntensity": "max intensity: {max} shared publications",
          "topLimitNotice": "Graph displays the Top {max} {label} by publication volume for clarity.",
          "totalEntities": "Total {label}",
          "totalConnections": "Connections",
          "clusters": "Clusters",
          "louvainLegend": "Node size = publication volume · node color = detected community (Louvain)",
          "clusterPrefix": "Cluster",
          "fewerShared": "Fewer shared pubs",
          "moreShared": "More shared pubs"
      },
      "matrix": {
          "subtitleDiagonal": "Diagonal = total publications · off-diagonal = co-occurrences",
          "showTop": "Top {n}",
          "diagonalTooltip": "{name}: {count} publications",
          "crossTooltip": "{nameA} × {nameB}: {count} shared publications",
          "maxIntensityShared": "max intensity: {max} shared publications",
          "noDataTitle": "No Co-occurrence Data Available",
          "noDataDesc": "No publications in this selection carry matching records."
      },
      "treemap": {
          "noData": "No topic data available for the current selection",
          "unknownDomain": "Unknown Domain",
          "ariaLabel": "Scientific Landscape Treemap"
      },
      "radar": {
          "ariaLabel": "SDG Impact Radar Chart",
          "impactScore": "Impact Score",
          "sdgImpact": "SDG Impact",
          "legendTitle": "Legend & Full Titles"
      },
      "networkExplorer": {
          "subtitle": "Relational views of the full corpus ({count} publications), given more room than the main dashboard tabs allow.",
          "funderHeading": "Funder Co-funding",
          "funderGeoHeading": "Funder Geography",
          "reachHeading": "Global Reach",
          "countryCollabHeading": "Country Collaboration",
          "mscHeading": "MSC 2020 Classification Co-occurrence",
          "topicsHeading": "Research Topics Co-occurrence",
          "showingPubsCount": "{shown} of {total} publications",
          "reachScopedNotice": "Showing institutions with a co-author in {country} - {shown} of {total} publications.",
          "countryScopedNotice": "Showing collaboration ties involving {country} - {shown} of {total} publications."
      },
      "methodology": {
          "backToDashboard": "Back to dashboard",
          "badge": "Methodological note",
          "title": "Methodology and Data Sources",
          "subtitle": "This page explains how the corpus is built, where the data comes from, how it is processed, and its limitations.",
          "institution": "CCSD (CNRS, Inria, INRAE) — Episciences Platform",
          "author": "Episciences Team, CCSD",
          "date": "October 2026",
          "tocTitle": "Table of Contents",
          "tocContext": "1. Context",
          "tocSources": "2. Data Sources",
          "tocPipeline": "3. Ingestion and Processing",
          "tocModels": "4. Calculation Methods",
          "tocLimits": "5. Limitations",
          "tocFair": "6. Architecture, Licenses and Reproducibility",
          "tocReferences": "7. Links and Documentation",
          "sec1Title": "1. Context",
          "sec1P1": "Episciences Insights is developed by the CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). It presents indicators on publications hosted on the Episciences platform: authors, affiliations and countries, research topics, funding, open science practices, and readership metrics. The corpus gathers over {publicationsCount} publications across the platform ({journalsCount} hosted journals); updates are scheduled monthly or alongside updates to source datasets and data models.",
          "sec1P2": "All indicators originate exclusively from open infrastructures and their calculation methodology is documented below. In accordance with DORA and CoARA principles, the dashboard excludes proprietary metrics such as journal impact factors.",
          "sec1CalloutTitle": "The overlay journal model (Diamond Open Access)",
          "sec1CalloutDesc": "Episciences journals operate on the [[en:overlay journals]] model: manuscripts are first deposited in an open repository (HAL, arXiv, Zenodo...), then peer-reviewed under the editorial board's authority. Both publication and reading are completely free: no fees are charged to authors (no APCs), and articles are immediately open access for all readers.",
          "sec2Title": "2. Data Sources",
          "sec2P1": "Data is collected from multiple sources interconnected through persistent identifiers (DOI, ROR, ORCID). The table below details what each source provides.",
          "sourceThName": "Source",
          "sourceThAccess": "Access",
          "sourceThScope": "Data scope",
          "sourceThPivot": "Link identifier",
          "sec3Title": "3. Ingestion and Processing",
          "sec3P1": "Data is gathered and processed upstream by a collection pipeline. The static site is then generated from these consolidated datasets.",
          "step1Title": "Step 1 — Publication List",
          "step1Desc": "The canonical list of publication DOIs is retrieved from the Episciences API and normalized (stripping URI prefixes, lowercase conversion).",
          "step2Title": "Step 2 — Metadata Harvesting",
          "step2Desc": "For each DOI, metadata is queried concurrently across OpenAlex, OpenAIRE Graph, and the Episciences export. Valid responses are cached locally for 30 days, while empty responses are cached for 24 hours to prevent redundant requests.",
          "step3Title": "Step 3 — Journals and Affiliations",
          "step3Desc": "Global aggregators like OpenAlex often misattribute the journal to the preprint repository (HAL, arXiv...) or report an inaccurate name. Canonical journal names and short codes (rvcode) are therefore sourced directly from Episciences. Author affiliations declared on Episciences enrich OpenAlex records when a ROR ID is available; countries are resolved via ROR.",
          "step4Title": "Step 4 — Funding Reconciliation",
          "step4Desc": "Grants reported by OpenAlex and OpenAIRE are merged and deduplicated. Funder names are standardized using OpenAlex. The ROR registry provides geographic coordinates and resolves orphan funders.",
          "step5Title": "Step 5 — Asset Preparation and Compression",
          "step5Desc": "Normalized datasets are stored in JSON and pre-compressed (Brotli and Gzip), reducing the publication payload size by more than 90%.",
          "sec4Title": "4. Calculation Methods",
          "sdgTitle": "Sustainable Development Goals (SDG)",
          "sdgP1": "OpenAlex associates publications with one or more of the 17 UN SDGs, with relevance scores between 0.4 and 1.0 (scores below 0.4 are discarded). Only a portion of the corpus is covered.",
          "sdgFormulaExplanation": "Across sets of publications, the dashboard retains the maximum score per SDG rather than the average. An average would dilute high-relevance contributions within large volumes of fundamental research.",
          "networkTitle": "Co-funding Network (Louvain)",
          "networkP1": "In the co-funding network, two funders are connected when they fund the same publications. Funder clusters are computed using the Louvain community detection algorithm via graphology.",
          "usageTitle": "Readership and Views",
          "usageP1": "Download and page view metrics originate from Episciences platform analytics, aggregated by journal, paper, and country.",
          "usageWarning": "These counts only track interactions on Episciences portals. Downloads occurring directly on open repositories (HAL, arXiv...) are not included. Total actual readership is therefore higher.",
          "lineageTitle": "References and Related Works",
          "lineageP1": "For each publication, the dashboard displays cited reference counts and related works suggested by OpenAlex. It also surfaces associated research datasets and software via OpenAIRE Scholix links.",
          "topicsTitle": "Research Topics and Classifications",
          "topicsP1": "Disciplinary distribution relies on the OpenAlex hierarchical taxonomy (domains, subfields, fields, and topics modeled through citation graph clustering). For mathematics journals, this view is enriched with official MSC 2020 codes from zbMATH Open, and JEL codes for economics.",
          "reachMethodTitle": "Geographic Reach and Co-authorship",
          "reachMethodP1": "A country is credited when at least one author declares an institutional affiliation located in that country. Maps and flow diagrams illustrate international research collaborations worldwide.",
          "sec5Title": "5. Limitations",
          "sec5P1": "Several limitations should be kept in mind when interpreting indicators:",
          "limit1Title": "Indexing Latency",
          "limit1Desc": "Recent publications may not yet be fully indexed by OpenAlex or OpenAIRE, or may have partial metadata.",
          "limit2Title": "Disciplinary Classifications",
          "limit2Desc": "MSC 2020 (mathematics) and JEL (economics) classification codes only apply to relevant journals. Their absence elsewhere is expected.",
          "limit3Title": "Author Affiliations",
          "limit3Desc": "Institutional affiliations come from OpenAlex, supplemented by Episciences declarations with a ROR ID. Automated affiliation parsing may contain gaps or inaccuracies.",
          "sec6Title": "6. Architecture, Licenses and Reproducibility",
          "sec6P1": "The website is built as a static application compiled from pre-processed datasets.",
          "ssgTitle": "Static Site Architecture",
          "ssgDesc": "Built with Next.js as static HTML and JSON files. All assets, including map geometries, are self-hosted: visiting the site triggers zero third-party API calls.",
          "compressionTitle": "Pre-compression",
          "compressionDesc": "Datasets are pre-compressed (Brotli and Gzip), ensuring sub-second delivery and minimal data usage.",
          "licenseTitle": "Open Licenses",
          "licenseDesc": "The source code is licensed under GNU GPL v3. Harmonized datasets are distributed under Creative Commons Attribution 4.0 International (CC-BY 4.0).",
          "reproTitle": "Reproduce the Collection Pipeline",
          "reproDesc": "The full data collection and build pipeline can be reproduced locally with Node.js:",
          "reproCommands": "# 1. Clone the repository (GPL v3)\ngit clone https://github.com/CCSDForge/episciences-insights.git\ncd episciences-insights && npm install\n\n# 2. Sync DOIs from the Episciences API\nnpm run sync:dois\n\n# 3. Fetch and merge metadata\nnpm run collect\n\n# Optional: fetch Scholix links (datasets and software)\nnpm run collect:links\n\n# 4. Generate the static site\nnpm run build",
          "downloadPubs": "Download publications dataset (JSON)",
          "downloadFunders": "Download funders dataset (JSON)",
          "sec7Title": "7. Links and Documentation",
          "references": [
              "DORA (2012) — [San Francisco Declaration on Research Assessment](https://sfdora.org)",
              "OpenAIRE (2024) — [OpenAIRE Graph v3 API Documentation](https://graph.openaire.eu/docs)",
              "OurResearch (2024) — [OpenAlex Documentation & Data Schema](https://docs.openalex.org)",
              "Plique, G. — [graphology-communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (Licence MIT)"
          ]
      },
      "export": {
          "exportButton": "Export",
          "exportMenu": "Export options",
          "exportVisualization": "Visualization",
          "exportData": "Data",
          "png": "PNG image",
          "pngDesc": "High resolution (2x retina)",
          "svg": "SVG vector",
          "svgDesc": "Vector publication quality",
          "csv": "CSV spreadsheet",
          "csvDesc": "Filtered data table for Excel / Calc",
          "json": "JSON raw data",
          "jsonDesc": "Structured data format",
          "downloading": "Generating export...",
          "success": "Export downloaded successfully",
          "error": "Export failed",
          "noSvgFound": "No visual chart found to export"
      }
  },
  fr: {
      "common": {
          "language": "Langue",
          "selectLanguage": "Choisir la langue",
          "languageAnnouncement": "Langue modifiée en français",
          "loading": "Chargement...",
          "publications": "Publications",
          "journals": "Revues actives",
          "citations": "Citations répertoriées",
          "countries": "Pays co-auteurs",
          "funders": "Financeurs identifiés",
          "downloads": "Téléchargements totaux",
          "resetFilters": "Réinitialiser les filtres",
          "allJournals": "Toutes les revues",
          "allYears": "Toutes les années",
          "allRepositories": "Tous les entrepôts",
          "allCountries": "Tous les pays",
          "allFunders": "Tous les financeurs",
          "allDomains": "Tous les domaines",
          "searchPlaceholder": "Rechercher une publication, un auteur, un mot-clé...",
          "fullscreen": "Ouvrir en plein écran",
          "exitFullscreen": "Fermer le plein écran",
          "close": "Fermer",
          "reset": "Réinitialiser",
          "pubs": "pub.",
          "year": "Année",
          "journal": "Revue",
          "funder": "Financeur",
          "country": "Pays",
          "network": "Réseau",
          "matrix": "Matrice",
          "cluster": "Clusters",
          "flowMap": "Carte des flux",
          "flows": "Flux",
          "overview": "Vue d'ensemble",
          "fewer": "Moins",
          "more": "Plus",
          "min": "Min.",
          "max": "Max.",
          "partnerA": "Partenaire A",
          "partnerB": "Partenaire B",
          "sharedConnection": "Connexion partagée",
          "jointPublications": "Co-publications",
          "profile": "Profil",
          "impact": "Impact",
          "hoverHint": "Survolez les nœuds ou les liens pour explorer le réseau",
          "escToClose": "ÉCHAP pour fermer",
          "openNetworkExplorer": "Ouvrir l'explorateur de réseau",
          "skipToContent": "Aller au contenu principal",
          "views": "vues",
          "showing": "Affichage de",
          "of": "sur",
          "backToDashboard": "Retour au tableau de bord"
      },
      "header": {
          "tag": "Plateforme d'impact scientifique",
          "title": "Episciences Insights",
          "subtitle": "Visualisation de l'impact scientifique en libre accès et des réseaux interdisciplinaires",
          "networkExplorerBtn": "Exploration Réseau",
          "overlayJournals": "Revues overlay",
          "diamondDashboard": "Tableau de bord libre accès diamant",
          "sdgTitle": "ODD (Développement durable)",
          "of17": "sur 17",
          "abstractViews": "Vues de résumés",
          "globalCoverage": "Couverture mondiale",
          "countriesMetric": "Pays & territoires"
      },
      "tabs": {
          "overview": "Vue d'ensemble",
          "reach": "Rayonnement mondial",
          "topics": "Paysage thématique",
          "funders": "Impact financeurs",
          "lineage": "Filiation & Science Ouverte",
          "usage": "Analytique d'usage",
          "journals": "Statistiques des revues",
          "institutions": "Statistiques par institution",
          "platform": "Données de la plateforme"
      },
      "kpi": {
          "publicationsDesc": "Articles évalués par les pairs en libre accès",
          "journalsDesc": "Revues overlay en libre accès diamant",
          "citationsDesc": "Impact bibliographique croisé multi-sources",
          "countriesDesc": "Étendue mondiale des collaborations de recherche",
          "fundersDesc": "Organismes de financement publics et philanthropiques",
          "downloadsDesc": "Consultations directement sur les sites des revues"
      },
      "disclaimer": {
          "title": "Précision des données & Sources",
          "metricsP1": "Les indicateurs scientifiques et relations visualisés dans ce tableau de bord sont alimentés par les API [OpenAlex](https://openalex.org), [OpenAIRE Graph](https://graph.openaire.eu), [Episciences](https://www.episciences.org), [zbMATH Open](https://zbmath.org) et [ROR](https://ror.org). Veuillez noter qu'aucun jeu de données ne constitue un catalogue exhaustif absolu des publications d'Episciences : des délais d'indexation peuvent survenir, et la couverture d'un article par les sources externes n'est pas garantie (les indicateurs de science ouverte et classifications thématiques ne sont disponibles que lorsqu'un enregistrement correspondant existe).",
          "metricsP2": "Certaines métadonnées (notamment les thématiques de recherche, l'alignement avec les ODD et les travaux connexes) sont générées par les modèles automatisés d'[OpenAlex](https://openalex.org). Les codes de financement, entrepôts d'hébergement, licences, indicateurs d'impact des citations et affiliations aux infrastructures de recherche proviennent d'[OpenAIRE Graph](https://graph.openaire.eu). Les classifications mathématiques (MSC 2020) proviennent de [zbMATH Open](https://zbmath.org). L'identification, la géolocalisation et la désambiguïsation des institutions de recherche et des financeurs s'appuient sur l'API [ROR (Research Organization Registry)](https://ror.org). [Episciences](https://www.episciences.org) s'investit continuellement pour affiner, vérifier et enrichir ces données afin d'offrir une vision toujours plus fidèle de son impact scientifique.",
          "downloadsNoteTitle": "Statistiques de téléchargement",
          "downloadsNote": "proviennent exclusivement de la plateforme Episciences et reflètent les consultations directes sur les sites des revues. Elles ne comptabilisent pas les téléchargements effectués sur les entrepôts ouverts où les mêmes articles peuvent être librement accessibles. Le lectorat effectif est donc très probablement supérieur aux chiffres présentés ici."
      },
      "footer": {
          "license": "CC-BY 2026 CCSD - Episciences - Open Source (GPL v3)",
          "source": "Données automatiquement agrégées depuis les API OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open et ROR",
          "lastUpdated": "Dernière mise à jour des données : {date}",
          "methodologyLink": "Méthodologie et sources de données"
      },
      "lineage": {
          "title": "Filiation de la recherche",
          "subtitle": "Filiation de la recherche & Provenance en science ouverte",
          "description": "Permet une inspection au niveau article reliant les identifiants pérennes (DOI, ROR, ORCID). Vérifie l'hébergement en entrepôt ouvert, les artefacts de recherche associés (jeux de données et logiciels via OpenAIRE Scholix), la validité des licences et l'impact des citations.",
          "source": "Source : Episciences, OpenAlex, OpenAIRE, zbMATH Open & ROR",
          "heritage": "Patrimoine scientifique",
          "theResearchLineage": "La filiation de la recherche",
          "intro": "Chaque publication dans Episciences s'inscrit dans une filiation scientifique mondiale. Nous traçons la filiation de ces travaux en cartographiant les fondations sur lesquelles ils s'appuient (Références) et les nouveaux horizons qu'ils ouvrent (Travaux connexes).",
          "foundationalRefs": "Références fondatrices",
          "scientificNeighbors": "Voisins scientifiques",
          "mostInterconnected": "Travaux les plus interconnectés",
          "scientificFoundations": "Fondations scientifiques (Passé)",
          "scientificHorizons": "Horizons scientifiques (Futur/Connexes)",
          "morePapersReferenced": "autres articles référencés",
          "buildsUpon": "Ce travail s'appuie sur {count} sources scientifiques établies.",
          "noFoundational": "Les sources fondatrices de cet article n'ont pas encore été identifiées par OpenAlex.",
          "worksMapped": "travaux cartographiés",
          "noRelated": "Aucun travail connexe cartographié pour l'instant dans OpenAlex pour cet article.",
          "selectPaperPrompt": "Sélectionnez un article dans la liste pour voir sa filiation",
          "selectedPublication": "Publication sélectionnée",
          "searchPlaceholder": "Rechercher par titre, auteur ou mot-clé...",
          "clearSearch": "Effacer la recherche",
          "noResults": "Aucune publication ne correspond à votre recherche.",
          "articlesMatching": "publications",
          "viewArticle": "Consulter la publication (DOI)",
          "exploreOpenAlex": "Explorer le réseau connexe sur OpenAlex",
          "relatedWorkIndex": "Publication liée",
          "consultOnOpenAlex": "Consulter sur OpenAlex",
          "authors": "Auteurs",
          "discipline": "Discipline",
          "openAccessDiamond": "Accès Ouvert Diamant",
          "bibliographicDepth": "Profondeur bibliographique",
          "deepCorpus": "Corpus scientifique approfondi (> 50 sources)",
          "standardCorpus": "Corpus scientifique standard (20–50 sources)",
          "targetedCorpus": "Étude scientifique ciblée (< 20 sources)",
          "referencesHint": "Les références complètes sont consultables dans le texte intégral de la publication sur Episciences.",
          "citationsReceived": "Citations reçues",
          "citationsCount": "citation(s) recensée(s) dans OpenAIRE / OpenAlex",
          "semanticAffinity": "Voisinage thématique & Travaux connexes",
          "semanticAffinityDesc": "Publications partageant des co-citations et une forte proximité thématique dans le graphe scientifique mondial.",
          "loadMore": "Afficher 50 publications de plus",
          "showingCount": "Affichage de {visible} sur {total} publications",
          "openAlexLimitExplanation": "OpenAlex identifie algorithmiquement jusqu'à 10 voisins scientifiques les plus proches (co-citations et similarité vectorielle).",
          "artifactsFilterOnly": "Avec données ou code",
          "artifactsFilterAll": "Toutes les publications",
          "artifactsTitle": "Artefacts de recherche associés",
          "artifactsSubtitle": "Jeux de données et logiciels répertoriés via OpenAIRE Scholix",
          "datasetsCountLabel": "Jeu(x) de données",
          "softwareCountLabel": "Logiciel(s) & Code",
          "noArtifactsFound": "Aucun jeu de données ou logiciel associé n'a été détecté pour cette publication dans OpenAIRE Scholix.",
          "viewArtifact": "Consulter l'artefact",
          "openAireRecord": "Fiche OpenAIRE"
      },
      "network": {
          "title": "Exploration Réseau - Episciences Insights",
          "backBtn": "Retour au tableau de bord",
          "description": "Vues relationnelles de l'ensemble du corpus, avec un espace de visualisation élargi."
      },
      "dashboard": {
          "usageTitle": "Analytique d'usage & Lectorat mondial",
          "usageDesc": "Suit l'engagement des lecteurs à l'échelle mondiale pour les publications en accès ouvert diamant d'Episciences. Quantifie la diffusion, le téléchargement et la lecture de la recherche à l'international, sans barrière financière ni abonnement.",
          "usageSource": "Source : API KPI de la plateforme Episciences",
          "topicsTitle": "Paysage de la recherche & Cartographie thématique",
          "topicsDesc": "Cartographie des domaines scientifiques, sous-disciplines de recherche et spécialités mathématiques à travers les revues. Associe la modélisation thématique d'OpenAlex à la classification mathématique (MSC 2020 issue de zbMATH Open).",
          "topicsSource": "Source : OpenAlex & zbMATH Open",
          "funderTitle": "Impact des financeurs & Pertinence sociétale",
          "funderDesc": "Évalue les organismes de financement cités dans les publications, les consortiums de co-financement institutionnels, la conformité des licences libres (Creative Commons) et l'alignement avec les Objectifs de développement durable (ODD) des Nations unies.",
          "funderSource": "Source : OpenAlex, OpenAIRE Graph v3 & ROR",
          "reachTitle": "Rayonnement mondial & Collaborations internationales",
          "reachDesc": "Analyse l'empreinte mondiale des affiliations d'auteurs et les partenariats de recherche transfrontaliers. Met en lumière les taux de collaboration nationale et internationale, les pôles bilatéraux de co-publication et les institutions académiques répertoriées via les identifiants ROR.",
          "reachSource": "Source : OpenAlex & API ROR",
          "topicsOverview": "Vue d'ensemble des thématiques",
          "networksAndCoOccurrences": "Classification & Co-occurrences",
          "funderOverview": "Vue d'ensemble & Financeurs",
          "funderNetworks": "Réseaux de co-financement",
          "reachOverview": "Vue d'ensemble",
          "reachNetworks": "Réseaux & Collaborations",
          "allFunders": "Tous les financeurs",
          "filterByFunder": "Filtrer par organisme de financement",
          "funderSearchPlaceholder": "Filtrer la liste...",
          "noFundersFound": "Aucun financeur ne correspond à votre recherche",
          "filterByDomain": "Filtrer par domaine",
          "allDomains": "Tous les domaines",
          "researchLandscape": "Paysage de la recherche",
          "interactiveTreemap": "Treemap interactif des domaines & disciplines",
          "treemapExplanation": "Visualisation hiérarchique des thématiques de recherche classifiées par OpenAlex. La surface de chaque tuile représente le volume relatif de publications à travers les grands domaines scientifiques et leurs sous-disciplines.",
          "sdgTitle": "Objectifs de développement durable (ODD) des Nations unies",
          "sdgSubtitle": "Alignement sur les défis sociétaux & portée politique",
          "whatAreSdgs": "Que sont les ODD et pourquoi sont-ils analysés ici ?",
          "sdgExplanation1": "Les Objectifs de développement durable (ODD) de l'Organisation des Nations unies sont 17 objectifs universels adoptés en 2015 pour orienter l'action mondiale vers l'élimination de la pauvreté, la santé publique, l'éducation de qualité, la lutte contre le réchauffement climatique et la préservation des écosystèmes.",
          "sdgExplanation2": "Sur cette plateforme, les publications sont associées aux ODD correspondants à l'aide des modèles NLP d'OpenAlex, entraînés sur les cadres d'indicateurs officiels des Nations unies. Cela met en lumière l'impact sociétal et politique concret de la recherche en accès ouvert diamant, au-delà des seules citations académiques.",
          "sdgDistTitle": "Distribution par ODD",
          "sdgDistSubtitle": "Nombre de publications par objectif des Nations unies",
          "sdgDistDesc": "Compare le volume de publications à travers les 17 objectifs des Nations unies afin d'identifier les thématiques sociétales prédominantes dans ce corpus.",
          "licensingTitle": "Paysage des licences",
          "licensingSubtitle": "Conservation des droits en accès ouvert & Réutilisation (OpenAIRE Graph v3)",
          "licensingDesc": "Examine les licences ouvertes Creative Commons déclarées sur les articles publiés. Les licences standard (telles que CC-BY) permettent aux auteurs de conserver leurs droits d'auteur tout en autorisant la lecture libre, la fouille de données (TDM), la redistribution et l'archivage pérenne.",
          "licenseDeclarations": "mentions de licences sur les publications sélectionnées.",
          "noLicenseData": "Aucune donnée de licence dans cette sélection",
          "kpiDatasetsTitle": "Données associées",
          "kpiDatasetsDesc": "Publications liées à des jeux de données de recherche (Dryad, Zenodo...)",
          "kpiSoftwareTitle": "Logiciels & Code source",
          "kpiSoftwareDesc": "Publications associées à des dépôts de code et logiciels",
          "kpiRepositoriesTitle": "Entrepôts ouverts",
          "kpiRepositoriesDesc": "Plateformes et archives ouvertes distinctes hébergeant des copies (HAL, arXiv...)",
          "funderVolumeTitle": "Volume par organisme de financement",
          "funderVolumeDesc": "Classement par volume de remerciements pour les organismes de subventions nationaux, européens et internationaux.",
          "affiliatedCountries": "Pays & territoires affiliés",
          "representedWorldwide": "représentés dans le monde",
          "affiliatedInstitutions": "Institutions affiliées",
          "distinctOrganizations": "organismes de recherche distincts",
          "authorAffiliationsTitle": "Rayonnement mondial : Affiliations des auteurs",
          "authorAffiliationsSubtitle": "Distribution géographique à travers {count} pays & territoires (échelle logarithmique)",
          "topContributingCountries": "Principaux pays & territoires contributeurs",
          "rankedByPubs": "Classés par nombre de publications affiliées",
          "topContributingInstitutions": "Principales institutions contributrices",
          "deduplicatedRor": "Dédoublonnées par identifiant ROR",
          "noRor": "Aucun ROR disponible",
          "clickToExplore": "Cliquer pour explorer les affiliations : {country}",
          "clickToViewAffiliations": "cliquer pour afficher les affiliations",
          "relationalViews": "Vues relationnelles & Flux",
          "topicsNetwork": "Réseau thématique",
          "topicsMatrix": "Matrice thématique",
          "mscNetwork": "Réseau MSC",
          "mscMatrix": "Matrice MSC",
          "countryNetwork": "Réseau pays",
          "institutionNetwork": "Réseau institutions",
          "collaborationMatrix": "Matrice de collaboration",
          "geographicFlows": "Flux géographiques",
          "topicsNetworkTitle": "Réseau de co-occurrences thématiques",
          "topicsNetworkDesc": "Graphe orienté par forces reliant les thématiques OpenAlex apparaissant ensemble sur un même article, mettant en valeur les passerelles interdisciplinaires.",
          "topicsMatrixTitle": "Matrice de co-occurrences thématiques",
          "topicsMatrixDesc": "Matrice de chaleur symétrique quantifiant la fréquence exacte des croisements thématiques entre les principaux sujets de recherche.",
          "mscNetworkTitle": "Réseau de classification MSC 2020",
          "mscNetworkDesc": "Cartographie les connexions entre les codes Mathematics Subject Classification 2020 (zbMATH Open via Episciences), illustrant les intersections entre branches des mathématiques (combinatoire, logique, algèbre, probabilités).",
          "mscMatrixTitle": "Matrice de co-occurrences MSC 2020",
          "mscMatrixDesc": "Carte thermique mesurant les codes de classification MSC 2020 partagés entre articles de recherche mathématique.",
          "funderNetworkTitle": "Réseau de co-financement",
          "funderNetworkDesc": "Les nœuds représentent les financeurs. Les liens indiquent le co-financement d'une même publication ; les liens plus épais reflètent des subventions conjointes fréquentes.",
          "funderMatrixTitle": "Matrice de co-financement",
          "funderMatrixDesc": "Matrice de chaleur par paires quantifiant les fréquences de co-financement bilatéral entre principaux financeurs.",
          "funderClusterTitle": "Clusters de co-financement",
          "funderClusterDesc": "Détection de communautés topologiques révélant les consortiums récurrents de financeurs de la recherche.",
          "funderSankeyTitle": "Diagramme Sankey des flux",
          "funderSankeyDesc": "Diagramme de flux traçant les subventions de recherche vers les volumes de publication par pays et domaines.",
          "funderFlowsTitle": "Carte des flux géographiques des financeurs",
          "funderFlowsDesc": "Relie les pays d'origine des financeurs aux institutions de recherche bénéficiaires dans le monde.",
          "geoFlowsTitle": "Carte des flux géographiques",
          "geoFlowsDesc": "Trace les arcs de collaboration entre coordonnées de pays, illustrant les couloirs de co-publication internationaux entre continents.",
          "countryNetworkTitle": "Réseau de collaboration par pays",
          "countryNetworkDesc": "Graphe orienté par forces où les nœuds représentent les pays (dimensionnés par nombre de publications) et les arêtes représentent les partenariats de co-publication.",
          "institutionNetworkTitle": "Réseau de collaboration par institution",
          "institutionNetworkDesc": "Visualise les liens de co-publication entre institutions académiques et centres de recherche désambiguïsés via les identifiants ROR (Research Organization Registry).",
          "collabMatrixTitle": "Matrice de collaboration bilatérale",
          "collabMatrixDesc": "Carte thermique symétrique mesurant le nombre exact de co-publications entre paires de pays pour identifier les axes bilatéraux les plus forts.",
          "fullscreenSubtitle": "Exploration plein écran haute définition - Filtres actifs appliqués"
      },
      "usage": {
          "pulseTitle": "Dynamique d'usage",
          "pulseSubtitle": "Tendances de croissance jusqu'en {year} - la ligne pointillée est une estimation de fin d'année {year}",
          "downloads": "Téléchargements",
          "views": "Consultations",
          "estimate": "Estimation",
          "usageImpact": "Impact d'usage",
          "isolatedMetrics": "Métriques isolées",
          "cumulative": "Cumulatif",
          "archiveVolume": "Volume de l'archive",
          "journalVolume": "Volume de la revue",
          "aggregatedKpis": "Indicateurs agrégés",
          "globalReadership": "Lectorat mondial",
          "downloadsByCountry": "Téléchargements totaux par pays & territoire (échelle logarithmique)",
          "activeCountries": "Pays & territoires",
          "mapLegend": "Téléchargements PDF de l'archive par pays & territoire",
          "mostDownloaded": "Articles les plus téléchargés",
          "top20Trending": "Top 20 des publications remarquées",
          "readOnline": "Consulter en ligne",
          "filteredAnalytics": "Analytique filtrée",
          "showingStats": "Affichage des statistiques {year} pour {journal}",
          "papersTracked": "articles suivis",
          "allJournals": "toutes les revues",
          "globalPulse": "Dynamique d'usage globale",
          "journalPulse": "Dynamique d'usage de la revue"
      },
      "countryInstitutions": {
          "title": "Principales affiliations par pays",
          "subtitle": "Explorez les institutions de recherche et universités dominantes par pays",
          "treemap": "Treemap",
          "barChart": "Histogramme",
          "quickSelect": "Sélection rapide :",
          "publications": "Publications :",
          "identifiedInstitutions": "Institutions identifiées :",
          "limit": "Limite :",
          "noAffiliation": "Aucune donnée d'affiliation disponible pour {country} avec les filtres actuels"
      },
      "funderSankey": {
          "title": "Diagramme Sankey des flux de financement",
          "subtitle": "Pays -> Financeur -> Domaine de recherche",
          "noDataTitle": "Aucune donnée de financeur géolocalisé disponible",
          "noDataDesc": "Aucune publication dans cette sélection ne comporte de financeur rattaché à un pays connu.",
          "showingTop": "Affichage des {top} principaux financeurs géolocalisés sur {total} (par volume de publications), regroupés par pays de siège et reliés au domaine de recherche."
      },
      "funderStoryline": {
          "title": "Évolution des financeurs",
          "subtitle": "Volume de publications par financeur au fil du temps",
          "noDataTitle": "Aucun historique de financement disponible",
          "noDataDesc": "Aucune publication dans cette sélection ne comporte d'information sur les financeurs.",
          "topShown": "{shown} premiers financeurs sur {total} affichés",
          "other": "Autres"
      },
      "flowMap": {
          "countryTitle": "Carte des flux par pays",
          "countrySubtitle": "Liens géographiques de co-autorat",
          "funderTitle": "Flux géographiques des financeurs",
          "funderSubtitle": "Pays d'origine des financeurs -> Institutions bénéficiaires",
          "countriesShown": "Pays affichés",
          "fundersShown": "Financeurs affichés",
          "coAuthorshipTies": "Liens de co-autorat",
          "fundingTies": "Liens de financement",
          "loading": "Chargement de la carte...",
          "sliderLabelCountries": "Pays affichés",
          "sliderLabelFunders": "Financeurs affichés",
          "nodeExplanationCountry": "Taille du nœud = volume de publications avec un auteur affilié dans ce pays. Couleur/épaisseur du trait = nombre de publications co-écrites par cette paire de pays.",
          "nodeExplanationFunder": "Relie les pays d'origine des financeurs aux institutions de recherche bénéficiaires dans le monde.",
          "sliderNoteCountry": "La carte affiche les {max} premiers pays par volume de publications - utilisez le curseur pour en afficher plus ou moins.",
          "sliderNoteFunder": "La carte affiche les {max} premiers financeurs par volume de publications.",
          "tooltipLinkCountry": "{nameA} ↔ {nameB} : {count} publications co-écrites",
          "tooltipLinkFunder": "{funder} ({country}) → {institution} : {count} publications",
          "tooltipNodeCountry": "{name} : {count} publications",
          "tooltipNodeFunder": "{name} : {count} publications financées"
      },
      "coOccurrence": {
          "sortedByVolume": "Trié par volume total de publications. Affichage de {count} {label} - intensité max : {max} publications partagées.",
          "maxIntensity": "intensité max : {max} publications partagées",
          "topLimitNotice": "Le graphe affiche les {max} premiers {label} par volume de publications pour une meilleure lisibilité.",
          "totalEntities": "Total {label}",
          "totalConnections": "Connexions",
          "clusters": "Clusters",
          "louvainLegend": "Taille du nœud = volume de publications · couleur du nœud = communauté détectée (Louvain)",
          "clusterPrefix": "Groupe",
          "fewerShared": "Moins de pub. partagées",
          "moreShared": "Plus de pub. partagées"
      },
      "matrix": {
          "subtitleDiagonal": "Diagonale = total des publications · hors-diagonale = co-occurrences",
          "showTop": "Top {n}",
          "diagonalTooltip": "{name} : {count} publications",
          "crossTooltip": "{nameA} × {nameB} : {count} publications partagées",
          "maxIntensityShared": "intensité max : {max} publications partagées",
          "noDataTitle": "Aucune donnée de co-occurrence disponible",
          "noDataDesc": "Aucune publication dans cette sélection ne comporte d'enregistrements correspondants."
      },
      "treemap": {
          "noData": "Aucune donnée thématique disponible pour la sélection actuelle",
          "unknownDomain": "Domaine inconnu",
          "ariaLabel": "Treemap du paysage scientifique"
      },
      "radar": {
          "ariaLabel": "Graphique radar d'impact des ODD",
          "impactScore": "Score d'impact",
          "sdgImpact": "Impact ODD",
          "legendTitle": "Légende & Intitulés complets"
      },
      "networkExplorer": {
          "subtitle": "Vues relationnelles du corpus complet ({count} publications), avec un espace de visualisation élargi.",
          "funderHeading": "Co-financement des financeurs",
          "funderGeoHeading": "Géographie des financeurs",
          "reachHeading": "Rayonnement mondial",
          "countryCollabHeading": "Collaboration par pays",
          "mscHeading": "Co-occurrences de classification MSC 2020",
          "topicsHeading": "Co-occurrences thématiques de recherche",
          "showingPubsCount": "{shown} sur {total} publications",
          "reachScopedNotice": "Affichage des institutions avec un co-auteur en {country} - {shown} sur {total} publications.",
          "countryScopedNotice": "Affichage des collaborations impliquant {country} - {shown} sur {total} publications."
      },
      "methodology": {
          "backToDashboard": "Retour au tableau de bord",
          "badge": "Note méthodologique",
          "title": "Méthodologie et sources de données",
          "subtitle": "Cette page décrit comment le corpus est constitué, d'où proviennent les données, comment elles sont traitées et quelles sont leurs limites.",
          "institution": "CCSD (CNRS, Inria, INRAE) - Plateforme Episciences",
          "author": "Équipe Episciences, CCSD",
          "date": "Octobre 2026",
          "tocTitle": "Sommaire",
          "tocContext": "1. Contexte",
          "tocSources": "2. Sources de données",
          "tocPipeline": "3. Collecte et traitement",
          "tocModels": "4. Méthodes de calcul",
          "tocLimits": "5. Limites",
          "tocFair": "6. Architecture, licences et reproductibilité",
          "tocReferences": "7. Liens et documentation",
          "sec1Title": "1. Contexte",
          "sec1P1": "Episciences Insights est développé par le CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). Il présente des indicateurs sur les articles publiés par les revues hébergées sur la plateforme Episciences : auteurs/autrices, affiliations et pays, thématiques de recherche, financements, pratiques de science ouverte et consultations. Le corpus rassemble plus de {publicationsCount} publications issues des revues de la plateforme ({journalsCount} revues hébergées) ; les mises à jour sont prévues mensuellement ou en fonction des évolutions des données ou modèles de données utilisés.",
          "sec1P2": "Les indicateurs proviennent uniquement d'infrastructures ouvertes et leur mode de calcul est documenté ci-dessous. Conformément aux principes de DORA et de CoARA, le tableau de bord n'utilise pas d'indicateurs propriétaires comme le facteur d'impact.",
          "sec1CalloutTitle": "Le modèle overlay journal (accès ouvert diamant)",
          "sec1CalloutDesc": "Les revues Episciences fonctionnent selon le modèle des [[en:overlay journals]] : les manuscrits sont déposés au préalable dans une archive ouverte (HAL, arXiv, Zenodo...), puis évalués par les pairs sous la responsabilité du comité éditorial de la revue. La publication et la lecture sont entièrement gratuites : aucun frais n'est demandé aux auteurs/autrices (sans APC), et les articles sont en accès libre et immédiat pour l'ensemble des lecteurs/lectrices.",
          "sec2Title": "2. Sources de données",
          "sec2P1": "Les données proviennent de plusieurs sources, reliées entre elles par des identifiants pérennes (DOI, ROR, ORCID). Le tableau ci-dessous précise ce que fournit chacune d'elles.",
          "sourceThName": "Source",
          "sourceThAccess": "Accès",
          "sourceThScope": "Données utilisées",
          "sourceThPivot": "Identifiant de liaison",
          "sec3Title": "3. Collecte et traitement",
          "sec3P1": "Les données sont collectées et traitées en amont par une suite de scripts. Le site est ensuite généré à partir de ces données.",
          "step1Title": "Étape 1 - Liste des articles",
          "step1Desc": "La liste des DOI des articles publiés est récupérée depuis l'API Episciences, puis normalisée (préfixes supprimés, passage en minuscules).",
          "step2Title": "Étape 2 - Collecte des métadonnées",
          "step2Desc": "Pour chaque DOI, les métadonnées sont demandées à OpenAlex, à OpenAIRE Graph et à l'export Episciences. Les réponses sont gardées en cache local pendant 30 jours. Les réponses vides sont gardées en cache 24 heures pour éviter des requêtes répétées.",
          "step3Title": "Étape 3 - Revues et affiliations",
          "step3Desc": "Il arrive fréquemment qu'OpenAlex rattache l'article à l'archive de dépôt (HAL, arXiv...) ou donne un nom de revue inexact. Le nom et le code de la revue (rvcode) sont donc pris dans les données Episciences. Les affiliations des auteurs déclarées sur Episciences complètent celles d'OpenAlex lorsqu'elles comportent un identifiant ROR ; leur pays est obtenu via ROR.",
          "step4Title": "Étape 4 - Financements",
          "step4Desc": "Les financements indiqués par OpenAlex et par OpenAIRE sont fusionnés et dédoublonnés. Les noms des financeurs sont normalisés à l'aide d'OpenAlex. Le registre ROR fournit leur localisation et permet d'identifier ceux qu'OpenAlex ne reconnaît pas.",
          "step5Title": "Étape 5 - Préparation des fichiers",
          "step5Desc": "Les données sont enregistrées en JSON puis compressées (Brotli et Gzip). La taille du fichier des publications est ainsi divisée par plus de dix.",
          "sec4Title": "4. Méthodes de calcul",
          "sdgTitle": "Objectifs de développement durable (ODD)",
          "sdgP1": "OpenAlex associe à certaines publications un ou plusieurs des 17 ODD de l'ONU, avec un score de pertinence compris entre 0,4 et 1 (les scores inférieurs à 0,4 ne sont pas conservés). Une partie seulement du corpus est concernée.",
          "sdgFormulaExplanation": "Pour un ensemble de publications, le tableau de bord retient le score maximal par ODD, et non la moyenne. Avec une moyenne, les quelques articles nettement liés à un ODD disparaîtraient parmi les nombreux articles de recherche fondamentale.",
          "networkTitle": "Réseau de cofinancement (Louvain)",
          "networkP1": "Dans le réseau de cofinancement, deux financeurs sont reliés lorsqu'ils financent les mêmes articles. Les groupes de financeurs sont calculés avec l'algorithme de Louvain, via la bibliothèque graphology.",
          "usageTitle": "Consultations",
          "usageP1": "Les téléchargements et les consultations de pages proviennent des statistiques de la plateforme Episciences, par revue, par article et par pays.",
          "usageWarning": "Ces chiffres ne comptent que les consultations sur Episciences. Les téléchargements effectués directement sur les archives ouvertes (HAL, arXiv...) ne sont pas inclus. La consultation réelle des articles est donc plus élevée.",
          "lineageTitle": "Références et travaux liés",
          "lineageP1": "Pour chaque article, le tableau de bord indique le nombre de références qu'il cite et liste les travaux liés proposés par OpenAlex. Il signale aussi les jeux de données et logiciels associés, à partir des liens Scholix d'OpenAIRE.",
          "topicsTitle": "Thématiques et classifications scientifiques",
          "topicsP1": "La répartition thématique s'appuie sur la taxonomie hiérarchique d'OpenAlex (domaines, sous-domaines, champs et thèmes de recherche modélisés par analyse de graphes de citations). Pour les revues de mathématiques, cette vue est enrichie des codes officiels MSC 2020 (Mathematics Subject Classification) issus de zbMATH Open, et des codes JEL pour l'économie.",
          "reachMethodTitle": "Portée géographique et co-publications",
          "reachMethodP1": "Un pays est associé à une publication dès lors qu'au moins un co-auteur déclare une affiliation institutionnelle rattachée à ce pays. Les cartes et visualisations de flux mettent ainsi en évidence la distribution des coopérations scientifiques internationales.",
          "sec5Title": "5. Limites",
          "sec5P1": "Plusieurs limites sont à garder à l'esprit pour interpréter les résultats :",
          "limit1Title": "Délai d'indexation",
          "limit1Desc": "Un article récent peut ne pas encore être indexé par OpenAlex ou OpenAIRE, ou ne l'être que partiellement.",
          "limit2Title": "Classifications disciplinaires",
          "limit2Desc": "Les codes MSC 2020 (mathématiques) et JEL (économie) ne concernent que certaines revues. Leur absence ailleurs est normale.",
          "limit3Title": "Affiliations",
          "limit3Desc": "Les établissements des auteurs proviennent d'OpenAlex, complétés par les affiliations déclarées sur Episciences avec un identifiant ROR. Le rattachement automatique d'OpenAlex peut contenir des erreurs, et une partie des auteurs reste sans établissement connu.",
          "sec6Title": "6. Architecture, licences et reproductibilité",
          "sec6P1": "Le site est un ensemble de fichiers statiques, générés à partir de données préparées à l'avance.",
          "ssgTitle": "Site statique",
          "ssgDesc": "Le site est généré avec Next.js sous forme de fichiers HTML et JSON. Toutes les ressources, y compris le fond de carte, sont servies par le site lui-même : la consultation ne déclenche aucun appel vers un service tiers.",
          "compressionTitle": "Compression",
          "compressionDesc": "Les données sont compressées à l'avance (Brotli et Gzip), ce qui réduit le volume à télécharger.",
          "licenseTitle": "Licences",
          "licenseDesc": "Le code source est publié sous licence GNU GPL v3. Les jeux de données consolidés sont diffusés sous licence CC-BY 4.0.",
          "reproTitle": "Reproduire la collecte",
          "reproDesc": "L'ensemble du traitement peut être relancé localement avec Node.js :",
          "reproCommands": "# 1. Cloner le dépôt (GPL v3)\ngit clone https://github.com/CCSDForge/episciences-insights.git\ncd episciences-insights && npm install\n\n# 2. Récupérer la liste des DOI depuis l'API Episciences\nnpm run sync:dois\n\n# 3. Collecter et fusionner les métadonnées\nnpm run collect\n\n# Optionnel : collecter les liens Scholix (données et logiciels)\nnpm run collect:links\n\n# 4. Générer le site statique\nnpm run build",
          "downloadPubs": "Télécharger les publications (JSON)",
          "downloadFunders": "Télécharger les financeurs (JSON)",
          "sec7Title": "7. Liens et documentation",
          "references": [
              "DORA (2012) — [San Francisco Declaration on Research Assessment](https://sfdora.org)",
              "OpenAIRE (2024) — [OpenAIRE Graph v3 API Documentation](https://graph.openaire.eu/docs)",
              "OurResearch (2024) — [OpenAlex Documentation & Data Schema](https://docs.openalex.org)",
              "Plique, G. — [graphology-communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (Licence MIT)"
          ]
      },
      "export": {
          "exportButton": "Exporter",
          "exportMenu": "Options d'export",
          "exportVisualization": "Visualisation",
          "exportData": "Données",
          "png": "Image PNG",
          "pngDesc": "Haute résolution (2x retina)",
          "svg": "Vecteur SVG",
          "svgDesc": "Qualité publication vectorielle",
          "csv": "Tableur CSV",
          "csvDesc": "Tableau de données filtrées pour Excel / Calc",
          "json": "Données brutes JSON",
          "jsonDesc": "Format de données structurées",
          "downloading": "Génération de l'export...",
          "success": "Export téléchargé avec succès",
          "error": "Échec de l'export",
          "noSvgFound": "Aucun graphique visuel détecté pour l'export"
      }
  },
  es: {
      "common": {
          "language": "Idioma",
          "selectLanguage": "Seleccionar idioma",
          "languageAnnouncement": "Idioma cambiado a español",
          "loading": "Cargando...",
          "publications": "Publicaciones",
          "journals": "Revistas activas",
          "citations": "Citas registradas",
          "countries": "Países coautores",
          "funders": "Financiadores identificados",
          "downloads": "Descargas totales",
          "resetFilters": "Restablecer filtros",
          "allJournals": "Todas las revistas",
          "allYears": "Todos los años",
          "allRepositories": "Todos los repositorios",
          "allCountries": "Todos los países",
          "allFunders": "Todos los financiadores",
          "allDomains": "Todos los dominios",
          "searchPlaceholder": "Buscar publicación, autor, palabra clave...",
          "fullscreen": "Abrir en pantalla completa",
          "exitFullscreen": "Salir de pantalla completa",
          "close": "Cerrar",
          "reset": "Restablecer",
          "pubs": "pub.",
          "year": "Año",
          "journal": "Revista",
          "funder": "Financiador",
          "country": "País",
          "network": "Red",
          "matrix": "Matriz",
          "cluster": "Clústeres",
          "flowMap": "Mapa de flujos",
          "flows": "Flujos",
          "overview": "Resumen",
          "fewer": "Menos",
          "more": "Más",
          "min": "Mín.",
          "max": "Máx.",
          "partnerA": "Socio A",
          "partnerB": "Socio B",
          "sharedConnection": "Conexión compartida",
          "jointPublications": "Publicaciones conjuntas",
          "profile": "Perfil",
          "impact": "Impacto",
          "hoverHint": "Pase el cursor sobre los nodos o líneas para explorar la red",
          "escToClose": "ESC para cerrar",
          "openNetworkExplorer": "Abrir el explorador de red",
          "skipToContent": "Saltar al contenido principal",
          "views": "vistas",
          "showing": "Mostrando",
          "of": "de",
          "backToDashboard": "Volver al panel"
      },
      "header": {
          "tag": "Plataforma de impacto científico",
          "title": "Episciences Insights",
          "subtitle": "Visualización del impacto científico en acceso abierto y redes interdisciplinarias",
          "networkExplorerBtn": "Explorador de Red",
          "overlayJournals": "Revistas overlay",
          "diamondDashboard": "Panel de control de acceso abierto diamante",
          "sdgTitle": "ODS (Desarrollo Sostenible)",
          "of17": "de 17",
          "abstractViews": "Vistas de resúmenes",
          "globalCoverage": "Cobertura global",
          "countriesMetric": "Países y territorios"
      },
      "tabs": {
          "overview": "Resumen",
          "reach": "Alcance global",
          "topics": "Panorama temático",
          "funders": "Impacto de financiadores",
          "lineage": "Linaje & Ciencia Abierta",
          "usage": "Analítica de uso",
          "journals": "Estadísticas de revistas",
          "institutions": "Estadísticas por institución",
          "platform": "Datos de la plataforma"
      },
      "kpi": {
          "publicationsDesc": "Artículos revisados por pares en acceso abierto",
          "journalsDesc": "Revistas overlay en acceso abierto diamante",
          "citationsDesc": "Impacto bibliográfico cruzado multifuente",
          "countriesDesc": "Alcance global de colaboraciones de investigación",
          "fundersDesc": "Organismos de financiación públicos y filantrópicos",
          "downloadsDesc": "Consultas directamente en los sitios de las revistas"
      },
      "disclaimer": {
          "title": "Precisión de datos y Fuentes",
          "metricsP1": "Los indicadores científicos y relaciones visualizados en este panel son proporcionados por las API de [OpenAlex](https://openalex.org), [OpenAIRE Graph](https://graph.openaire.eu), [Episciences](https://www.episciences.org), [zbMATH Open](https://zbmath.org) y [ROR](https://ror.org). Tenga en cuenta que ningún conjunto de datos representa un catálogo exhaustivo absoluto de las publicaciones de Episciences: pueden producirse retrasos en la indexación y no se garantiza la cobertura de una publicación por fuentes externas (los indicadores de ciencia abierta y clasificaciones solo están disponibles donde existen registros concordantes).",
          "metricsP2": "Ciertos metadatos (incluidos temas de investigación, alineación con ODS y obras relacionadas) son generados por modelos automatizados de [OpenAlex](https://openalex.org). Los códigos de financiación, repositorios de alojamiento, licencias, indicadores de impacto de citas y afiliaciones a infraestructuras de investigación provienen de [OpenAIRE Graph](https://graph.openaire.eu). Las clasificaciones matemáticas (MSC 2020) proceden de [zbMATH Open](https://zbmath.org). La identificación, geolocalización y desambiguación de instituciones y financiadores se basan en la API [ROR (Research Organization Registry)](https://ror.org). [Episciences](https://www.episciences.org) trabaja continuamente para afinar, verificar y enriquecer estos datos y ofrecer una representación cada vez más fiel de su impacto científico.",
          "downloadsNoteTitle": "Estadísticas de descarga",
          "downloadsNote": "proceden exclusivamente de la plataforma Episciences y reflejan las consultas directas en los sitios de las revistas. No contabilizan descargas realizadas en repositorios abiertos donde los mismos artículos también pueden estar disponibles libremente. El número real de lectores es, por tanto, muy probablemente superior al presentado aquí."
      },
      "footer": {
          "license": "CC-BY 2026 CCSD - Episciences - Código Abierto (GPL v3)",
          "source": "Datos agregados automáticamente desde las API de OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open y ROR",
          "lastUpdated": "Última actualización de los datos: {date}",
          "methodologyLink": "Metodología y Marco científico"
      },
      "lineage": {
          "title": "Linaje de la investigación",
          "subtitle": "Linaje de la investigación y procedencia en ciencia abierta",
          "description": "Permite la inspección a nivel de artículo conectando identificadores persistentes (DOI, ROR, ORCID). Verifica el alojamiento en repositorios abiertos, los artefactos de investigación vinculados (conjuntos de datos y software mediante OpenAIRE Scholix), la validez de licencias y el impacto de citas.",
          "source": "Fuente: Episciences, OpenAlex, OpenAIRE, zbMATH Open & ROR",
          "heritage": "Patrimonio científico",
          "theResearchLineage": "El linaje de la investigación",
          "intro": "Cada publicación en Episciences forma parte de un linaje científico global. Trazamos la filiación de estos trabajos mapeando los cimientos sobre los que se construyen (Referencias) y las nuevas fronteras que abren (Obras relacionadas).",
          "foundationalRefs": "Referencias fundamentales",
          "scientificNeighbors": "Vecinos científicos",
          "mostInterconnected": "Obras más interconectadas",
          "scientificFoundations": "Fundamentos científicos (Pasado)",
          "scientificHorizons": "Horizontes científicos (Futuro/Relacionadas)",
          "morePapersReferenced": "más artículos referenciados",
          "buildsUpon": "Este trabajo se basa en {count} fuentes científicas establecidas.",
          "noFoundational": "Las fuentes fundacionales de este artículo aún no han sido identificadas por OpenAlex.",
          "worksMapped": "obras mapeadas",
          "noRelated": "No hay obras relacionadas mapeadas todavía en OpenAlex para este artículo reciente.",
          "selectPaperPrompt": "Seleccione un artículo de la lista para ver su linaje",
          "selectedPublication": "Publicación seleccionada",
          "searchPlaceholder": "Buscar por título, autor o palabra clave...",
          "clearSearch": "Borrar búsqueda",
          "noResults": "Ninguna publicación coincide con su búsqueda.",
          "articlesMatching": "publicaciones",
          "viewArticle": "Ver publicación (DOI)",
          "exploreOpenAlex": "Explorar la red relacionada en OpenAlex",
          "relatedWorkIndex": "Publicación vinculada",
          "consultOnOpenAlex": "Ver en OpenAlex",
          "authors": "Autores",
          "discipline": "Disciplina",
          "openAccessDiamond": "Acceso Abierto Diamante",
          "bibliographicDepth": "Profundidad bibliográfica",
          "deepCorpus": "Cuerpo científico extenso (> 50 fuentes)",
          "standardCorpus": "Cuerpo científico estándar (20–50 fuentes)",
          "targetedCorpus": "Estudio científico focalizado (< 20 fuentes)",
          "referencesHint": "Las referencias completas se pueden consultar en el texto completo de la publicación en Episciences.",
          "citationsReceived": "Citas recibidas",
          "citationsCount": "cita(s) detectada(s) en OpenAIRE / OpenAlex",
          "semanticAffinity": "Vecindario temático y Obras afines",
          "semanticAffinityDesc": "Publicaciones que comparten cocitaciones y afinidad temática en el grafo científico global.",
          "loadMore": "Cargar 50 publicaciones más",
          "showingCount": "Mostrando {visible} de {total} publicaciones",
          "openAlexLimitExplanation": "OpenAlex identifica algorítmicamente hasta 10 vecinos científicos más cercanos (cocitaciones y similitud vectorial).",
          "artifactsFilterOnly": "Con datos o código",
          "artifactsFilterAll": "Todas las publicaciones",
          "artifactsTitle": "Artefactos de investigación vinculados",
          "artifactsSubtitle": "Conjuntos de datos y software indexados mediante OpenAIRE Scholix",
          "datasetsCountLabel": "Conjunto(s) de datos",
          "softwareCountLabel": "Software y Código",
          "noArtifactsFound": "No se han detectado conjuntos de datos ni software asociados para esta publicación en OpenAIRE Scholix.",
          "viewArtifact": "Ver artefacto",
          "openAireRecord": "Ficha OpenAIRE"
      },
      "network": {
          "title": "Explorador de Red - Episciences Insights",
          "backBtn": "Volver al panel principal",
          "description": "Vistas relacionales de todo el corpus, con un espacio de visualización ampliado."
      },
      "dashboard": {
          "usageTitle": "Analítica de uso y Lectores globales",
          "usageDesc": "Supervisa el compromiso de los lectores a escala mundial para las publicaciones de acceso abierto diamante de Episciences. Cuantifica cómo se difunde, descarga y lee la investigación a nivel internacional a lo largo del tiempo, sin barreras de pago ni suscripciones.",
          "usageSource": "Fuente: API KPI de la plataforma Episciences",
          "topicsTitle": "Panorama de investigación y Cartografía temática",
          "topicsDesc": "Cartografía de dominios científicos, subdisciplinas de investigación y especialidades matemáticas en las revistas. Combina el modelado de temas de OpenAlex con la Clasificación Temática de Matemáticas (MSC 2020 de zbMATH Open).",
          "topicsSource": "Fuente: OpenAlex y zbMATH Open",
          "funderTitle": "Impacto de financiadores y Relevancia social",
          "funderDesc": "Evalúa los organismos de financiación mencionados en las publicaciones, los consorcios institucionales de cofinanciación, el cumplimiento de licencias abiertas (Creative Commons) y la alineación con los Objetivos de Desarrollo Sostenible (ODS) de la ONU.",
          "funderSource": "Fuente: OpenAlex, OpenAIRE Graph v3 y ROR",
          "reachTitle": "Alcance global y Colaboración internacional",
          "reachDesc": "Analiza la huella mundial de las afiliaciones de autores y las alianzas de investigación transfronterizas. Destaca las tasas de colaboración nacional e internacional, los centros bilaterales de copublicación y las instituciones académicas identificadas mediante ROR.",
          "reachSource": "Fuente: OpenAlex y API ROR",
          "topicsOverview": "Resumen de temas",
          "networksAndCoOccurrences": "Clasificación y Coocurrencias",
          "funderOverview": "Resumen y Financiadores",
          "funderNetworks": "Redes de cofinanciación",
          "reachOverview": "Resumen",
          "reachNetworks": "Redes y Colaboraciones",
          "allFunders": "Todos los financiadores",
          "filterByFunder": "Filtrar por organismo de financiación",
          "funderSearchPlaceholder": "Filtrar la lista...",
          "noFundersFound": "No se encontraron financiadores que coincidan con la búsqueda",
          "filterByDomain": "Filtrar por dominio",
          "allDomains": "Todos los dominios",
          "researchLandscape": "Panorama de la investigación",
          "interactiveTreemap": "Treemap interactivo de dominios y campos",
          "treemapExplanation": "Visualización jerárquica de temas de investigación clasificados por OpenAlex. El área de cada mosaico representa el volumen relativo de publicaciones en los principales dominios científicos y sus subdisciplinas.",
          "sdgTitle": "Objetivos de Desarrollo Sostenible (ODS) de la ONU",
          "sdgSubtitle": "Alineación con desafíos sociales y relevancia política",
          "whatAreSdgs": "¿Qué son los ODS y por qué se analizan aquí?",
          "sdgExplanation1": "Los Objetivos de Desarrollo Sostenible (ODS) de las Naciones Unidas son 17 metas globales adoptadas en 2015 para erradicar la pobreza, promover la salud, garantizar educación de calidad, frenar el cambio climático y proteger los ecosistemas.",
          "sdgExplanation2": "En esta plataforma, las publicaciones se vinculan a los ODS mediante modelos de PLN de OpenAlex entrenados en marcos oficiales de la ONU. Esto visibiliza el impacto social y político tangible de la investigación en acceso abierto diamante más allá de las citas académicas.",
          "sdgDistTitle": "Distribución por ODS",
          "sdgDistSubtitle": "Número de publicaciones por objetivo de Naciones Unidas",
          "sdgDistDesc": "Compara el volumen de publicaciones entre los 17 objetivos de la ONU para identificar qué temáticas sociales predominan en el corpus.",
          "licensingTitle": "Panorama de licencias",
          "licensingSubtitle": "Retención de derechos en acceso abierto y Reutilización (OpenAIRE Graph v3)",
          "licensingDesc": "Examina las licencias abiertas Creative Commons declaradas en los artículos publicados. Las licencias estándar (como CC-BY) permiten conservar derechos de autor autorizando la lectura libre, minería de textos y datos (TDM), redistribución y archivo permanente.",
          "licenseDeclarations": "declaraciones de licencias en las publicaciones seleccionadas.",
          "noLicenseData": "No hay datos de licencias en esta selección",
          "kpiDatasetsTitle": "Datos vinculados",
          "kpiDatasetsDesc": "Publicaciones vinculadas a conjuntos de datos de investigación (Dryad, Zenodo...)",
          "kpiSoftwareTitle": "Software y código fuente",
          "kpiSoftwareDesc": "Publicaciones vinculadas a repositorios de código y software",
          "kpiRepositoriesTitle": "Repositorios abiertos",
          "kpiRepositoriesDesc": "Plataformas y archivos abiertos distintos que alojan copias (HAL, arXiv...)",
          "funderVolumeTitle": "Volumen por financiador de investigación",
          "funderVolumeDesc": "Clasificación por volumen de agradecimientos para patrocinadores nacionales, europeos e internacionales.",
          "affiliatedCountries": "Países y territorios afiliados",
          "representedWorldwide": "representados en el mundo",
          "affiliatedInstitutions": "Instituciones afiliadas",
          "distinctOrganizations": "organizaciones de investigación distintas",
          "authorAffiliationsTitle": "Alcance global: Afiliaciones de autores",
          "authorAffiliationsSubtitle": "Distribución geográfica en {count} países y territorios (escala logarítmica)",
          "topContributingCountries": "Principales países y territorios colaboradores",
          "rankedByPubs": "Ordenados por número de publicaciones afiliadas",
          "topContributingInstitutions": "Principales instituciones colaboradoras",
          "deduplicatedRor": "Desduplicadas mediante identificador ROR",
          "noRor": "Sin ROR disponible",
          "clickToExplore": "Haga clic para explorar las afiliaciones en {country}",
          "clickToViewAffiliations": "clic para ver las afiliaciones",
          "relationalViews": "Vistas relacionales y Flujos",
          "topicsNetwork": "Red temática",
          "topicsMatrix": "Matriz temática",
          "mscNetwork": "Red MSC",
          "mscMatrix": "Matriz MSC",
          "countryNetwork": "Red países",
          "institutionNetwork": "Red instituciones",
          "collaborationMatrix": "Matriz de colaboración",
          "geographicFlows": "Flujos geográficos",
          "topicsNetworkTitle": "Red de coocurrencia temática",
          "topicsNetworkDesc": "Grafo dirigido por fuerzas que conecta los temas de investigación de OpenAlex presentes conjuntamente en un mismo artículo, destacando puentes interdisciplinarios.",
          "topicsMatrixTitle": "Matriz de coocurrencia temática",
          "topicsMatrixDesc": "Matriz de calor simétrica que cuantifica la frecuencia exacta de solapamiento temático entre los principales temas de investigación.",
          "mscNetworkTitle": "Red de clasificación MSC 2020",
          "mscNetworkDesc": "Mapea conexiones entre códigos Mathematics Subject Classification 2020 (de zbMATH Open vía Episciences), mostrando intersecciones entre ramas matemáticas (combinatoria, lógica, álgebra, probabilidad).",
          "mscMatrixTitle": "Matriz de coocurrencia MSC 2020",
          "mscMatrixDesc": "Mapa de calor que mide códigos de clasificación MSC 2020 compartidos entre artículos de investigación matemática.",
          "funderNetworkTitle": "Red de cofinanciación",
          "funderNetworkDesc": "Los nodos representan agencias de financiación. Los enlaces indican cofinanciación de una misma publicación; los trazos más gruesos reflejan subvenciones conjuntas frecuentes.",
          "funderMatrixTitle": "Matriz de cofinanciación",
          "funderMatrixDesc": "Matriz de calor por pares que cuantifica frecuencias de cofinanciación bilateral entre los principales financiadores.",
          "funderClusterTitle": "Clústeres de cofinanciación",
          "funderClusterDesc": "Detección topológica de comunidades que revela consorcios recurrentes de patrocinadores de investigación.",
          "funderSankeyTitle": "Diagrama Sankey de flujos",
          "funderSankeyDesc": "Diagrama de flujo que traza las subvenciones de investigación hacia los volúmenes de publicación por países y dominios.",
          "funderFlowsTitle": "Mapa de flujos geográficos de financiadores",
          "funderFlowsDesc": "Vincula los países de origen de los financiadores con las instituciones de investigación beneficiarias en el mundo.",
          "geoFlowsTitle": "Mapa de flujos geográficos",
          "geoFlowsDesc": "Traza arcos de colaboración entre coordenadas de países, ilustrando corredores internacionales de coautoría entre continentes.",
          "countryNetworkTitle": "Red de colaboración por países",
          "countryNetworkDesc": "Grafo dirigido por fuerzas donde los nodos representan países (dimensionados por publicaciones) y las aristas representan asociaciones de coautoría.",
          "institutionNetworkTitle": "Red de colaboración por instituciones",
          "institutionNetworkDesc": "Visualiza vínculos de coautoría entre instituciones académicas y centros de investigación desambiguados mediante identificadores ROR.",
          "collabMatrixTitle": "Matriz de colaboración bilateral",
          "collabMatrixDesc": "Mapa de calor simétrico que mide el número exacto de copublicaciones entre pares de países para identificar los ejes bilaterales más fuertes.",
          "fullscreenSubtitle": "Exploración en pantalla completa de alta definición - Filtros activos aplicados"
      },
      "usage": {
          "pulseTitle": "Dinámica de uso",
          "pulseSubtitle": "Tendencias de crecimiento hasta {year} - la línea punteada es una estimación de fin de año {year}",
          "downloads": "Descargas",
          "views": "Vistas",
          "estimate": "Estimación",
          "usageImpact": "Impacto de uso",
          "isolatedMetrics": "Métricas aisladas",
          "cumulative": "Acumulado",
          "archiveVolume": "Volumen del archivo",
          "journalVolume": "Volumen de la revista",
          "aggregatedKpis": "KPI agregados",
          "globalReadership": "Lectores globales",
          "downloadsByCountry": "Descargas totales por país y territorio (escala logarítmica)",
          "activeCountries": "Países y territorios",
          "mapLegend": "Descargas de PDF del archivo por país y territorio",
          "mostDownloaded": "Artículos más descargados",
          "top20Trending": "Top 20 publicaciones destacadas",
          "readOnline": "Leer en línea",
          "filteredAnalytics": "Analítica filtrada",
          "showingStats": "Mostrando estadísticas de {year} para {journal}",
          "papersTracked": "artículos seguidos",
          "allJournals": "todas las revistas",
          "globalPulse": "Dinámica de uso global",
          "journalPulse": "Dinámica de uso de la revista"
      },
      "countryInstitutions": {
          "title": "Principales afiliaciones por país",
          "subtitle": "Explore las instituciones de investigación y universidades predominantes en cada país",
          "treemap": "Treemap",
          "barChart": "Gráfico de barras",
          "quickSelect": "Selección rápida:",
          "publications": "Publicaciones:",
          "identifiedInstitutions": "Instituciones identificadas:",
          "limit": "Límite:",
          "noAffiliation": "No hay datos de afiliación disponibles para {country} con los filtros actuales"
      },
      "funderSankey": {
          "title": "Diagrama Sankey de flujos de financiación",
          "subtitle": "País -> Financiador -> Dominio de investigación",
          "noDataTitle": "No hay datos de financiadores geolocalizados disponibles",
          "noDataDesc": "Ninguna publicación en esta selección incluye un financiador asociado a un país conocido.",
          "showingTop": "Mostrando los {top} principales financiadores geolocalizados de {total} (por volumen de publicaciones), agrupados por país de sede y vinculados al dominio de investigación."
      },
      "funderStoryline": {
          "title": "Evolución de financiadores",
          "subtitle": "Volumen de publicaciones por financiador a lo largo del tiempo",
          "noDataTitle": "No hay cronología de financiación disponible",
          "noDataDesc": "Ninguna publicación en esta selección incluye información sobre financiadores.",
          "topShown": "Mostrando los {shown} principales de {total} financiadores",
          "other": "Otros"
      },
      "flowMap": {
          "countryTitle": "Mapa de flujos por países",
          "countrySubtitle": "Vínculos geográficos de coautoría",
          "funderTitle": "Flujos geográficos de financiadores",
          "funderSubtitle": "Países de origen de financiadores -> Instituciones receptoras",
          "countriesShown": "Países mostrados",
          "fundersShown": "Financiadores mostrados",
          "coAuthorshipTies": "Vínculos de coautoría",
          "fundingTies": "Vínculos de financiación",
          "loading": "Cargando mapa...",
          "sliderLabelCountries": "Países mostrados",
          "sliderLabelFunders": "Financiadores mostrados",
          "nodeExplanationCountry": "Tamaño del nodo = volumen de publicaciones con un autor afiliado en ese país. Color/grosor de la línea = publicaciones en coautoría entre ese par de países.",
          "nodeExplanationFunder": "Vincula los países de origen de los financiadores con las instituciones de investigación beneficiarias en el mundo.",
          "sliderNoteCountry": "El mapa muestra los {max} principales países por volumen de publicaciones: use el control deslizante para ajustar.",
          "sliderNoteFunder": "El mapa muestra los {max} principales financiadores por volumen de publicaciones.",
          "tooltipLinkCountry": "{nameA} ↔ {nameB}: {count} publicaciones en coautoría",
          "tooltipLinkFunder": "{funder} ({country}) → {institution}: {count} publicaciones",
          "tooltipNodeCountry": "{name}: {count} publicaciones",
          "tooltipNodeFunder": "{name}: {count} publicaciones financiadas"
      },
      "coOccurrence": {
          "sortedByVolume": "Ordenado por volumen total de publicaciones. Mostrando {count} {label} - intensidad máxima: {max} publicaciones compartidas.",
          "maxIntensity": "intensidad máxima: {max} publicaciones compartidas",
          "topLimitNotice": "El gráfico muestra los {max} principales {label} por volumen de publicaciones para mayor claridad.",
          "totalEntities": "Total de {label}",
          "totalConnections": "Conexiones",
          "clusters": "Clústeres",
          "louvainLegend": "Tamaño del nodo = volumen de publicaciones · color del nodo = comunidad detectada (Louvain)",
          "clusterPrefix": "Clúster",
          "fewerShared": "Menos pub. compartidas",
          "moreShared": "Más pub. compartidas"
      },
      "matrix": {
          "subtitleDiagonal": "Diagonal = total de publicaciones · fuera de diagonal = coocurrencias",
          "showTop": "Top {n}",
          "diagonalTooltip": "{name}: {count} publicaciones",
          "crossTooltip": "{nameA} × {nameB}: {count} publicaciones compartidas",
          "maxIntensityShared": "intensidad máxima: {max} publicaciones compartidas",
          "noDataTitle": "No hay datos de coocurrencia disponibles",
          "noDataDesc": "Ninguna publicación en esta selección contiene registros correspondientes."
      },
      "treemap": {
          "noData": "No hay datos temáticos disponibles para la selección actual",
          "unknownDomain": "Dominio desconocido",
          "ariaLabel": "Treemap del panorama científico"
      },
      "radar": {
          "ariaLabel": "Gráfico radar de impacto en ODS",
          "impactScore": "Puntuación de impacto",
          "sdgImpact": "Impacto en ODS",
          "legendTitle": "Leyenda y Títulos completos"
      },
      "networkExplorer": {
          "subtitle": "Vistas relacionales de todo el corpus ({count} publicaciones), con un espacio de visualización ampliado.",
          "funderHeading": "Cofinanciación de patrocinadores",
          "funderGeoHeading": "Geografía de financiadores",
          "reachHeading": "Alcance global",
          "countryCollabHeading": "Colaboración entre países",
          "mscHeading": "Coocurrencia de clasificación MSC 2020",
          "topicsHeading": "Coocurrencia temática de investigación",
          "showingPubsCount": "{shown} de {total} publicaciones",
          "reachScopedNotice": "Mostrando instituciones con un coautor en {country} - {shown} de {total} publicaciones.",
          "countryScopedNotice": "Mostrando vínculos de colaboración que involucran a {country} - {shown} de {total} publicaciones."
      },
      "methodology": {
          "backToDashboard": "Volver al panel",
          "badge": "Nota metodológica",
          "title": "Metodología y fuentes de datos",
          "subtitle": "Esta página describe cómo se constituye el corpus, de dónde proceden los datos, cómo se procesan y cuáles son sus límites.",
          "institution": "CCSD (CNRS, Inria, INRAE) — Plataforma Episciences",
          "author": "Equipo Episciences, CCSD",
          "date": "Octubre de 2026",
          "tocTitle": "Sumario",
          "tocContext": "1. Contexto",
          "tocSources": "2. Fuentes de datos",
          "tocPipeline": "3. Recolección y procesamiento",
          "tocModels": "4. Métodos de cálculo",
          "tocLimits": "5. Límites",
          "tocFair": "6. Arquitectura, licencias y reproducibilidad",
          "tocReferences": "7. Enlaces y documentación",
          "sec1Title": "1. Contexto",
          "sec1P1": "Episciences Insights es desarrollado por el CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). Presenta indicadores sobre los artículos publicados en las revistas alojadas en la plataforma Episciences: autores/autoras, afiliaciones y países, temáticas de investigación, financiación, prácticas de ciencia abierta y estadísticas de consulta. El corpus reúne más de {publicationsCount} publicaciones procedentes de las revistas de la plataforma ({journalsCount} revistas alojadas); las actualizaciones están previstas mensualmente o según las evoluciones de los datos o modelos de datos utilizados.",
          "sec1P2": "Los indicadores proceden exclusivamente de infraestructuras abiertas y su método de cálculo está documentado a continuación. De conformidad con los principios de DORA y CoARA, el panel no utiliza métricas propietarias como el factor de impacto.",
          "sec1CalloutTitle": "El modelo overlay journal (acceso abierto diamante)",
          "sec1CalloutDesc": "Las revistas de Episciences funcionan según el modelo de overlay journals: los manuscritos se depositan previamente en un repositorio abierto (HAL, arXiv, Zenodo...), y luego son evaluados por pares bajo la responsabilidad del comité editorial de la revista. La publicación y la lectura son totalmente gratuitas: no se exige ningún coste a los autores/autoras (sin APC), y los artículos están en acceso libre e inmediato para todos los lectores/lectoras.",
          "sec2Title": "2. Fuentes de datos",
          "sec2P1": "Los datos proceden de varias fuentes, conectadas entre sí mediante identificadores persistentes (DOI, ROR, ORCID). La tabla siguiente detalla lo que aporta cada una de ellas.",
          "sourceThName": "Fuente",
          "sourceThAccess": "Acceso",
          "sourceThScope": "Datos utilizados",
          "sourceThPivot": "Identificador de enlace",
          "sec3Title": "3. Recolección y procesamiento",
          "sec3P1": "Los datos se recopilan y procesan previamente mediante una serie de scripts. A continuación, el sitio se genera a partir de estos datos consolidados.",
          "step1Title": "Paso 1 — Lista de artículos",
          "step1Desc": "La lista de DOI de los artículos publicados se obtiene desde la API de Episciences y se normaliza (eliminación de prefijos, paso a minúsculas).",
          "step2Title": "Paso 2 — Recolección de metadatos",
          "step2Desc": "Para cada DOI, se solicitan los metadatos a OpenAlex, OpenAIRE Graph y la exportación de Episciences. Las respuestas se conservan en caché local durante 30 días, y las respuestas vacías durante 24 horas para evitar peticiones repetitivas.",
          "step3Title": "Paso 3 — Revistas y afiliaciones",
          "step3Desc": "A menudo, OpenAlex asocia el artículo al repositorio de depósito (HAL, arXiv...) o indica un nombre de revista inexacto. El nombre y el código de la revista (rvcode) proceden directamente de Episciences. Las afiliaciones de autores declaradas en Episciences complementan las de OpenAlex cuando disponen de un identificador ROR; sus países se obtienen mediante ROR.",
          "step4Title": "Paso 4 — Financiación",
          "step4Desc": "Las ayudas y proyectos de OpenAlex y OpenAIRE se combinan y deduplican. Los nombres de los financiadores se normalizan con OpenAlex. El registro ROR proporciona su localización geográfica e identifica las entidades no reconocidas por OpenAlex.",
          "step5Title": "Paso 5 — Preparación de archivos",
          "step5Desc": "Los datos se guardan en JSON y se comprimen previamente (Brotli y Gzip). El tamaño del archivo de publicaciones se reduce así en más de un 90 %.",
          "sec4Title": "4. Métodos de cálculo",
          "sdgTitle": "Objetivos de Desarrollo Sostenible (ODS)",
          "sdgP1": "OpenAlex asocia a determinadas publicaciones uno o varios de los 17 ODS de la ONU, con una puntuación de pertinencia entre 0,4 y 1 (las puntuaciones inferiores a 0,4 se descartan). Solo una parte del corpus está cubierta.",
          "sdgFormulaExplanation": "Para un conjunto de publicaciones, el panel conserva la puntuación máxima por ODS, y no el promedio. Con un promedio, los artículos fuertemente vinculados a un ODS quedarían diluidos entre los numerosos artículos de investigación básica.",
          "networkTitle": "Red de cofinanciación (Louvain)",
          "networkP1": "En la red de cofinanciación, dos entidades están conectadas cuando financian los mismos artículos. Los grupos se calculan con el algoritmo de Louvain mediante la biblioteca graphology.",
          "usageTitle": "Consultas y lecturas",
          "usageP1": "Las descargas y visualizaciones proceden de las estadísticas de la plataforma Episciences, por revista, por artículo y por país.",
          "usageWarning": "Estas cifras solo contabilizan las consultas en Episciences. Las descargas realizadas directamente en los repositorios abiertos (HAL, arXiv...) no están incluidas. La consulta real de los artículos es, por tanto, más elevada.",
          "lineageTitle": "Referencias y trabajos relacionados",
          "lineageP1": "Para cada artículo, el panel indica el número de referencias citadas y enumera los trabajos relacionados sugeridos por OpenAlex. También señala los conjuntos de datos y software asociados a partir de los enlaces Scholix de OpenAIRE.",
          "topicsTitle": "Temáticas y clasificaciones científicas",
          "topicsP1": "La distribución temática se apoya en la taxonomía jerárquica de OpenAlex (dominios, subdominios, campos y temas modelados mediante análisis de grafos de citas). Para las revistas de matemáticas, esta vista se enriquece con los códigos oficiales MSC 2020 de zbMATH Open, y con códigos JEL en economía.",
          "reachMethodTitle": "Alcance geográfico y coautorías",
          "reachMethodP1": "Un país se asocia a una publicación cuando al menos un coautor declara una afiliación institucional ubicada en ese país. Los mapas y diagramas de flujo reflejan las colaboraciones científicas internacionales.",
          "sec5Title": "5. Límites",
          "sec5P1": "Conviene tener en cuenta varios límites metodológicos al interpretar los resultados:",
          "limit1Title": "Plazo de indexación",
          "limit1Desc": "Un artículo reciente puede no estar todavía indexado por OpenAlex o OpenAIRE, o solo de forma parcial.",
          "limit2Title": "Clasificaciones disciplinarias",
          "limit2Desc": "Los códigos MSC 2020 (matemáticas) y JEL (economía) solo corresponden a las revistas pertinentes. Su ausencia en otros campos es normal.",
          "limit3Title": "Afiliaciones institucionales",
          "limit3Desc": "Las afiliaciones de los autores proceden de OpenAlex, complementadas por las declaraciones en Episciences con identificador ROR. La asignación automática de OpenAlex puede contener imprecisiones.",
          "sec6Title": "6. Arquitectura, licencias y reproducibilidad",
          "sec6P1": "El sitio es un conjunto de archivos estáticos, generados a partir de datos procesados previamente.",
          "ssgTitle": "Sitio estático",
          "ssgDesc": "Generado con Next.js como archivos estáticos HTML y JSON. Todos los recursos, incluido el mapa base, se sirven localmente: la consulta no genera llamadas a servicios de terceros.",
          "compressionTitle": "Compresión",
          "compressionDesc": "Los datos se comprimen con antelación (Brotli y Gzip), lo que reduce el volumen de descarga.",
          "licenseTitle": "Licencias",
          "licenseDesc": "El código fuente se distribuye bajo licencia GNU GPL v3. Los conjuntos de datos consolidados se difunden bajo licencia Creative Commons Atribución 4.0 Internacional (CC-BY 4.0).",
          "reproTitle": "Reproducir la recolección",
          "reproDesc": "Todo el pipeline puede ejecutarse localmente con Node.js:",
          "reproCommands": "# 1. Clonar el repositorio (GPL v3)\ngit clone https://github.com/CCSDForge/episciences-insights.git\ncd episciences-insights && npm install\n\n# 2. Sincronizar los DOI desde la API de Episciences\nnpm run sync:dois\n\n# 3. Recolectar y fusionar los metadatos\nnpm run collect\n\n# Opcional: recolectar enlaces Scholix (datos y software)\nnpm run collect:links\n\n# 4. Generar el sitio estático\nnpm run build",
          "downloadPubs": "Descargar las publicaciones (JSON)",
          "downloadFunders": "Descargar los financiadores (JSON)",
          "sec7Title": "7. Enlaces y documentación",
          "references": [
              "DORA (2012) — [San Francisco Declaration on Research Assessment](https://sfdora.org)",
              "OpenAIRE (2024) — [OpenAIRE Graph v3 API Documentation](https://graph.openaire.eu/docs)",
              "OurResearch (2024) — [OpenAlex Documentation & Data Schema](https://docs.openalex.org)",
              "Plique, G. — [graphology-communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (Licence MIT)"
          ]
      },
      "export": {
          "exportButton": "Exportar",
          "exportMenu": "Opciones de exportación",
          "exportVisualization": "Visualización",
          "exportData": "Datos",
          "png": "Imagen PNG",
          "pngDesc": "Alta resolución (2x retina)",
          "svg": "Vector SVG",
          "svgDesc": "Calidad de publicación vectorial",
          "csv": "Hoja de cálculo CSV",
          "csvDesc": "Tabla de datos filtrados para Excel / Calc",
          "json": "Datos en bruto JSON",
          "jsonDesc": "Formato de datos estructurados",
          "downloading": "Generando exportación...",
          "success": "Exportación descargada con éxito",
          "error": "Error en la exportación",
          "noSvgFound": "No se detectó ningún gráfico visual para exportar"
      }
  },
};
