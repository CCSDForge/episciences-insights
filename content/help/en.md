---
title: "Methodological Note"
subtitle: "This page details how the corpus is assembled, where data comes from, how indicators are processed, and their limitations."
badge: "Methodology"
institution: "CCSD (CNRS, Inria, INRAE) - Episciences Platform"
author: "Episciences Team, CCSD"
date: "October 2026"
backToDashboard: "Back to dashboard"
tocTitle: "Table of Contents"
tocItems:
  - id: "sec1"
    label: "1. Context"
  - id: "sec2"
    label: "2. Data Sources"
  - id: "sec3"
    label: "3. Ingestion and Processing"
  - id: "sec4"
    label: "4. Calculation Methods"
  - id: "sec5"
    label: "5. Limitations"
  - id: "sec6"
    label: "6. Links and Documentation"
---

## 1. Context

Episciences Insights is developed by the CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). It presents indicators on publications hosted on the Episciences platform: authors, affiliations and countries, research topics, funding, open science practices, and readership metrics. The corpus gathers over {publicationsCount} publications across the platform ({journalsCount} hosted journals); updates are scheduled monthly or alongside updates to source datasets and data models.

All indicators originate exclusively from open infrastructures and their calculation methodology is documented below. In accordance with DORA and CoARA principles, the dashboard excludes proprietary metrics such as journal impact factors.

> ### The overlay journal model (Diamond Open Access)
>
> Episciences journals operate on the [overlay journals](https://en.wikipedia.org/wiki/Overlay_journal) model: manuscripts are first deposited in an open repository (HAL, arXiv, Zenodo...), then peer-reviewed under the editorial board's authority. Both publication and reading are completely free: no fees are charged to authors (no APCs), and articles are immediately open access for all readers.

## 2. Data Sources

Data is collected from multiple sources interconnected through persistent identifiers (DOI, ROR, ORCID). The table below details what each source provides.

| Source | Access | Data scope | Link identifier |
| :--- | :--- | :--- | :--- |
| [Episciences](https://www.episciences.org) | REST API (`api.episciences.org`) | List of published articles, journal names and codes, author affiliations, submission and publication dates, MSC 2020 codes | DOI, docid, rvcode |
| [OpenAlex](https://openalex.org) | REST API Works & Funders (`api.openalex.org`) | Authors, affiliations, countries, SDGs, research topics, reference counts, related works, funder names | DOI, OpenAlex ID |
| [OpenAIRE Graph](https://graph.openaire.eu) | API v3 Research Products (`api.openaire.eu`) | Funded research projects, hosting repositories (HAL, arXiv, Zenodo...), licenses, JEL codes | DOI, OpenAIRE PID |
| [ROR (Research Organization Registry)](https://ror.org) | REST API Organization (`api.ror.org`) | Organization persistent identifiers, institution countries, funder geolocations (latitude, longitude) | ROR ID |
| [zbMATH Open](https://zbmath.org) | Via Episciences export | Mathematics Subject Classification 2020 (MSC 2020) official codes | MSC 2020 Code |
| **Episciences KPI Logs** | `kpi_downloads.json` | Full-text file downloads and abstract views per journal, per paper, and per country | DOI, rvcode |

### Open Datasets

The consolidated datasets compiled to power the dashboard are made freely available under the [Creative Commons CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) license:
* [Download consolidated publications dataset (JSON)](/data/publications.json)
* [Download normalized funders repository (JSON)](/data/funders.json)

## 3. Ingestion and Processing

Data is gathered and processed upstream by a collection pipeline. The static site is then generated from these consolidated datasets.

1. **Step 1 - Publication List :** The canonical list of publication DOIs is retrieved from the Episciences API and normalized (stripping URI prefixes, lowercase conversion).
2. **Step 2 - Metadata Harvesting :** For each DOI, metadata is queried concurrently across OpenAlex, OpenAIRE Graph, and the Episciences export. Valid responses are cached locally for 30 days, while empty responses are cached for 24 hours to prevent redundant requests.
3. **Step 3 - Journals and Affiliations :** Global aggregators like OpenAlex often misattribute the journal to the preprint repository (HAL, arXiv...) or report an inaccurate name. Canonical journal names and short codes (rvcode) are therefore sourced directly from Episciences. Author affiliations declared on Episciences enrich OpenAlex records when a ROR ID is available; countries are resolved via ROR.
4. **Step 4 - Funding Reconciliation :** Grants reported by OpenAlex and OpenAIRE are merged and deduplicated. Funder names are standardized using OpenAlex. The ROR registry provides geographic coordinates and resolves orphan funders.
5. **Step 5 - Asset Preparation and Compression :** Normalized datasets are stored in JSON and pre-compressed (Brotli and Gzip), reducing the publication payload size by more than 90%.

## 4. Calculation Methods

### Sustainable Development Goals (SDG)

OpenAlex associates publications with one or more of the 17 UN SDGs, with relevance scores between 0.4 and 1.0 (scores below 0.4 are discarded). Only a portion of the corpus is covered.

Across sets of publications, the dashboard retains the maximum score per SDG rather than the average. An average would dilute high-relevance contributions within large volumes of fundamental research.

### Co-funding Network (Louvain)

In the co-funding network, two funders are connected when they fund the same publications. Funder clusters are computed using the Louvain community detection algorithm via graphology.

### Readership and Views

Download and page view metrics originate exclusively from Episciences platform consultation logs and reflect activity occurring directly on journal websites. They are aggregated by journal, by article, and by country when IP resolution is available.

These figures do not account for consultations or downloads occurring on open repositories (HAL, arXiv, Zenodo, etc.) where the same articles are freely available: actual overall readership is therefore likely higher than reported here.

> **Methodological Note :** Usage counts cannot be directly compared between journals: mature journals or high-volume publishing outlets naturally accumulate more views than recent venues. Consultation practices also vary widely across disciplines.

### Scientific Lineage and Research Artifacts (Scholix)

For each article, cited references and related works are sourced from OpenAlex open data, contextualizing publications within their research landscape.

In the third pillar ("Associated Research Artifacts"), linked datasets and software are harvested from the OpenAIRE Graph following the [Scholix (RDA/WDS)](http://www.scholix.org/) framework. This protocol standardizes bidirectional links between research publications, datasets, and software hosted across trusted repositories (Dryad, Zenodo, Software Heritage, etc.).

### Research Topics and Disciplinary Classifications

Topics are derived from concepts indexed by OpenAlex. For mathematics journals, this view is enriched with official MSC 2020 codes from zbMATH Open, and JEL codes for economics.

### Geographic Reach and Co-authorship

A country is credited when at least one author declares an institutional affiliation located in that country. Maps and flow diagrams illustrate international research collaborations worldwide.

## 5. Limitations

Several limitations should be kept in mind when interpreting indicators:

* **Coverage and Exhaustiveness :** While the corpus captures virtually all publications across the platform, external aggregators do not constitute an absolute exhaustive catalog. External coverage by third parties (OpenAlex, OpenAIRE) is not guaranteed for every single record, and certain open science or thematic indicators appear only where matching records exist.
* **Indexing Latency :** Recent publications may not yet be fully indexed by OpenAlex or OpenAIRE, or may have partial metadata.
* **Automated Models :** Several metadata elements sourced from OpenAlex (notably research concepts, SDG alignment, and related works) are generated by automated algorithms and may carry approximations.
* **Disciplinary Classifications :** MSC 2020 (mathematics) and JEL (economics) classification codes only apply to relevant journals. Their absence elsewhere is expected.
* **Author Affiliations :** Institutional affiliations come from OpenAlex, supplemented by Episciences declarations with a ROR ID. Automated affiliation parsing may contain gaps or inaccuracies.
* **Research Artifacts (Data and Code) :** Detection of linked datasets and software (Scholix) relies on metadata declarations submitted by authors in partner repositories (Dryad, Zenodo, etc.) and harvested by the OpenAIRE Graph. Only a fraction of articles currently carries formal links.
* **Continuous Improvement :** The Episciences team is continuously working to refine, verify, and enrich these datasets to ensure an increasingly faithful representation of the journals' scholarly impact.

## 6. Links and Documentation

* **DORA** (2012). *San Francisco Declaration on Research Assessment*. Available at: [https://sfdora.org](https://sfdora.org) (accessed November 2026).
* **CoARA** (2022). *Agreement on Reforming Research Assessment*. Coalition for Advancing Research Assessment. Available at: [https://coara.org](https://coara.org) (accessed November 2026).
* **OpenAIRE**. *OpenAIRE Graph v3 API Documentation* [online]. OpenAIRE A.M.K.E. Available at: [https://graph.openaire.eu/docs](https://graph.openaire.eu/docs) (accessed November 2026).
* **OurResearch**. *OpenAlex Documentation & Data Schema* [online]. Available at: [https://docs.openalex.org](https://docs.openalex.org) (accessed November 2026).
* **Research Organization Registry (ROR)**. *Registry Documentation and API* [online]. Available at: [https://ror.org](https://ror.org) (accessed November 2026).
* **American Economic Association (AEA)**. *JEL Classification System / EconLit Subject Descriptors* [online]. Available at: [https://www.aeaweb.org/econlit/jelCodes.php](https://www.aeaweb.org/econlit/jelCodes.php) (accessed November 2026).
* **zbMATH Open**. *Mathematics Subject Classification (MSC 2020)* [online]. FIZ Karlsruhe. Available at: [https://zbmath.org/classification/](https://zbmath.org/classification/) (accessed November 2026).
* **American Mathematical Society (AMS)**. *MSC2020 – Mathematics Subject Classification System* [online]. Available at: [https://msc2020.org](https://msc2020.org) and [https://mathscinet.ams.org/msc/msc2020.html](https://mathscinet.ams.org/msc/msc2020.html) (accessed November 2026).
* **United Nations (UN)**. *Sustainable Development Goals (SDGs) – The 2030 Agenda for Sustainable Development* [online]. United Nations. Available at: [https://sdgs.un.org/goals](https://sdgs.un.org/goals) (accessed November 2026).
* **Research Data Alliance (RDA) & World Data System (WDS)**. *Scholix: A Framework for Scholarly Link Exchange* [online]. Available at: [http://www.scholix.org/](http://www.scholix.org/) (accessed November 2026).
* **Bostock, M.** *world-atlas: Pre-built TopoJSON from Natural Earth* [online data]. GitHub. ISC License / Public Domain. Available at: [https://github.com/topojson/world-atlas](https://github.com/topojson/world-atlas) (accessed November 2026).
* **Plique, G.** *graphology-communities-louvain: Louvain community detection algorithm for graphology* [online software]. Graphology. MIT License. Available at: [https://graphology.github.io/standard-library/communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (accessed November 2026).
