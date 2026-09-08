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
          "countriesMetric": "Countries"
      },
      "tabs": {
          "overview": "Overview",
          "reach": "Global Reach",
          "topics": "Research Landscape",
          "funders": "Funder Impact",
          "lineage": "Research Lineage & Open Science",
          "usage": "Usage Analytics"
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
          "metricsP1": "The scientific metrics and connections visualized in this dashboard are powered by the OpenAlex API, the OpenAIRE Graph API, the Episciences API, the zbMATH Open API (https://api.zbmath.org/), and the ROR API (https://ror.org/). Please note that these datasets may not represent the exhaustive catalog of Episciences publications, indexing latencies may occur, and external source coverage of a given publication is not guaranteed: open science indicators and subject classifications are only available where matching records exist.",
          "metricsP2": "Certain metadata (including research topics, SDG alignment, and related works) are generated using OpenAlex automated algorithms. Funding codes and acronyms, hosting repositories, license information, citation impact indicators, and research infrastructure affiliations are sourced from OpenAIRE Graph. Mathematics Subject Classifications (MSC 2020) are sourced from zbMATH Open. Research institution and funder identification, geocoding, and disambiguation are powered by the ROR (Research Organization Registry) API. Episciences is engaged in a permanent effort to refine, verify, and enrich these datasets to provide an increasingly accurate representation of our research impact.",
          "downloadsNoteTitle": "Download statistics",
          "downloadsNote": "are sourced exclusively from the Episciences platform and reflect downloads occurring directly on journal websites. They do not account for downloads from open repositories, where the same articles may also be freely available. Actual readership figures are therefore likely higher than those reported here."
      },
      "footer": {
          "license": "CC-BY 2026 Episciences Insights - Open Source (GPL v3)",
          "source": "Data automatically aggregated from the OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open, and ROR APIs"
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
          "selectedPublication": "Selected Publication"
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
          "reachOverview": "Overview & Affiliations",
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
          "funderVolumeTitle": "Volume by Research Funder",
          "funderVolumeDesc": "Ranked volume of acknowledgments for national, European, and international research grant sponsors.",
          "affiliatedCountries": "Affiliated Countries",
          "representedWorldwide": "represented worldwide",
          "affiliatedInstitutions": "Affiliated Institutions",
          "distinctOrganizations": "distinct research organizations",
          "authorAffiliationsTitle": "Global Reach: Author Affiliations",
          "authorAffiliationsSubtitle": "Geographic distribution across {count} countries (log scale)",
          "topContributingCountries": "Top Contributing Countries",
          "rankedByPubs": "Ranked by number of affiliated publications",
          "topContributingInstitutions": "Top Contributing Institutions",
          "deduplicatedRor": "Deduplicated by ROR identifier",
          "noRor": "No ROR available",
          "clickToExplore": "Click to explore affiliations in {country}",
          "relationalViews": "Relational Views & Flows",
          "topicsNetwork": "Topics Network",
          "topicsMatrix": "Topics Matrix",
          "mscNetwork": "MSC Network",
          "mscMatrix": "MSC Matrix",
          "countryNetwork": "Country Network",
          "institutionNetwork": "Institution Network",
          "collaborationMatrix": "Collaboration Matrix",
          "geographicFlows": "Global Geographic Flows",
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
          "downloadsByCountry": "Total downloads by country (log scale)",
          "activeCountries": "Active Countries",
          "mapLegend": "Full Archive PDF Downloads by Country",
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
          "countriesMetric": "Pays"
      },
      "tabs": {
          "overview": "Vue d'ensemble",
          "reach": "Rayonnement mondial",
          "topics": "Paysage thématique",
          "funders": "Impact financeurs",
          "lineage": "Filiation & Science Ouverte",
          "usage": "Analytique d'usage"
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
          "metricsP1": "Les indicateurs scientifiques et relations visualisés dans ce tableau de bord sont alimentés par les API OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open (https://api.zbmath.org/) et ROR (https://ror.org/). Veuillez noter qu'aucun jeu de données ne constitue un catalogue exhaustif absolu des publications d'Episciences : des délais d'indexation peuvent survenir, et la couverture d'un article par les sources externes n'est pas garantie (les indicateurs de science ouverte et classifications thématiques ne sont disponibles que lorsqu'un enregistrement correspondant existe).",
          "metricsP2": "Certaines métadonnées (notamment les thématiques de recherche, l'alignement avec les ODD et les travaux connexes) sont générées par les modèles automatisés d'OpenAlex. Les codes de financement, entrepôts d'hébergement, licences, indicateurs d'impact des citations et affiliations aux infrastructures de recherche proviennent d'OpenAIRE Graph. Les classifications mathématiques (MSC 2020) proviennent de zbMATH Open. L'identification, la géolocalisation et la désambiguïsation des institutions de recherche et des financeurs s'appuient sur l'API ROR (Research Organization Registry). Episciences s'investit continuellement pour affiner, vérifier et enrichir ces données afin d'offrir une vision toujours plus fidèle de son impact scientifique.",
          "downloadsNoteTitle": "Statistiques de téléchargement",
          "downloadsNote": "proviennent exclusivement de la plateforme Episciences et reflètent les consultations directes sur les sites des revues. Elles ne comptabilisent pas les téléchargements effectués sur les entrepôts ouverts où les mêmes articles peuvent être librement accessibles. Le lectorat effectif est donc très probablement supérieur aux chiffres présentés ici."
      },
      "footer": {
          "license": "CC-BY 2026 Episciences Insights - Open Source (GPL v3)",
          "source": "Données automatiquement agrégées depuis les API OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open et ROR"
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
          "selectedPublication": "Publication sélectionnée"
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
          "reachOverview": "Vue d'ensemble & Affiliations",
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
          "funderVolumeTitle": "Volume par organisme de financement",
          "funderVolumeDesc": "Classement par volume de remerciements pour les organismes de subventions nationaux, européens et internationaux.",
          "affiliatedCountries": "Pays affiliés",
          "representedWorldwide": "représentés dans le monde",
          "affiliatedInstitutions": "Institutions affiliées",
          "distinctOrganizations": "organismes de recherche distincts",
          "authorAffiliationsTitle": "Rayonnement mondial : Affiliations des auteurs",
          "authorAffiliationsSubtitle": "Distribution géographique à travers {count} pays (échelle logarithmique)",
          "topContributingCountries": "Principaux pays contributeurs",
          "rankedByPubs": "Classés par nombre de publications affiliées",
          "topContributingInstitutions": "Principales institutions contributrices",
          "deduplicatedRor": "Dédoublonnées par identifiant ROR",
          "noRor": "Aucun ROR disponible",
          "clickToExplore": "Cliquer pour explorer les affiliations : {country}",
          "relationalViews": "Vues relationnelles & Flux",
          "topicsNetwork": "Réseau thématique",
          "topicsMatrix": "Matrice thématique",
          "mscNetwork": "Réseau MSC",
          "mscMatrix": "Matrice MSC",
          "countryNetwork": "Réseau par pays",
          "institutionNetwork": "Réseau par institution",
          "collaborationMatrix": "Matrice de collaboration",
          "geographicFlows": "Flux géographiques mondiaux",
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
          "downloadsByCountry": "Téléchargements totaux par pays (échelle logarithmique)",
          "activeCountries": "Pays actifs",
          "mapLegend": "Téléchargements PDF de l'archive par pays",
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
          "countriesMetric": "Países"
      },
      "tabs": {
          "overview": "Resumen",
          "reach": "Alcance global",
          "topics": "Panorama temático",
          "funders": "Impacto de financiadores",
          "lineage": "Linaje & Ciencia Abierta",
          "usage": "Analítica de uso"
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
          "metricsP1": "Los indicadores científicos y relaciones visualizados en este panel son proporcionados por las API de OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open (https://api.zbmath.org/) y ROR (https://ror.org/). Tenga en cuenta que ningún conjunto de datos representa un catálogo exhaustivo absoluto de las publicaciones de Episciences: pueden producirse retrasos en la indexación y no se garantiza la cobertura de una publicación por fuentes externas (los indicadores de ciencia abierta y clasificaciones solo están disponibles donde existen registros concordantes).",
          "metricsP2": "Ciertos metadatos (incluidos temas de investigación, alineación con ODS y obras relacionadas) son generados por modelos automatizados de OpenAlex. Los códigos de financiación, repositorios de alojamiento, licencias, indicadores de impacto de citas y afiliaciones a infraestructuras de investigación provienen de OpenAIRE Graph. Las clasificaciones matemáticas (MSC 2020) proceden de zbMATH Open. La identificación, geolocalización y desambiguación de instituciones y financiadores se basan en la API ROR (Research Organization Registry). Episciences trabaja continuamente para afinar, verificar y enriquecer estos datos y ofrecer una representación cada vez más fiel de su impacto científico.",
          "downloadsNoteTitle": "Estadísticas de descarga",
          "downloadsNote": "proceden exclusivamente de la plataforma Episciences y reflejan las consultas directas en los sitios de las revistas. No contabilizan descargas realizadas en repositorios abiertos donde los mismos artículos también pueden estar disponibles libremente. El número real de lectores es, por tanto, muy probablemente superior al presentado aquí."
      },
      "footer": {
          "license": "CC-BY 2026 Episciences Insights - Código Abierto (GPL v3)",
          "source": "Datos agregados automáticamente desde las API de OpenAlex, OpenAIRE Graph, Episciences, zbMATH Open y ROR"
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
          "selectedPublication": "Publicación seleccionada"
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
          "reachOverview": "Resumen y Afiliaciones",
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
          "funderVolumeTitle": "Volumen por financiador de investigación",
          "funderVolumeDesc": "Clasificación por volumen de agradecimientos para patrocinadores nacionales, europeos e internacionales.",
          "affiliatedCountries": "Países afiliados",
          "representedWorldwide": "representados en el mundo",
          "affiliatedInstitutions": "Instituciones afiliadas",
          "distinctOrganizations": "organizaciones de investigación distintas",
          "authorAffiliationsTitle": "Alcance global: Afiliaciones de autores",
          "authorAffiliationsSubtitle": "Distribución geográfica en {count} países (escala logarítmica)",
          "topContributingCountries": "Principales países colaboradores",
          "rankedByPubs": "Ordenados por número de publicaciones afiliadas",
          "topContributingInstitutions": "Principales instituciones colaboradoras",
          "deduplicatedRor": "Desduplicadas mediante identificador ROR",
          "noRor": "Sin ROR disponible",
          "clickToExplore": "Haga clic para explorar las afiliaciones en {country}",
          "relationalViews": "Vistas relacionales y Flujos",
          "topicsNetwork": "Red temática",
          "topicsMatrix": "Matriz temática",
          "mscNetwork": "Red MSC",
          "mscMatrix": "Matriz MSC",
          "countryNetwork": "Red por países",
          "institutionNetwork": "Red por instituciones",
          "collaborationMatrix": "Matriz de colaboración",
          "geographicFlows": "Flujos geográficos globales",
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
          "downloadsByCountry": "Descargas totales por país (escala logarítmica)",
          "activeCountries": "Países activos",
          "mapLegend": "Descargas de PDF del archivo por país",
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
      }
  },
};
