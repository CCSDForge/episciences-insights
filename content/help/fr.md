---
title: "Note méthodologique"
subtitle: "Cette page décrit comment le corpus est constitué, d'où proviennent les données, comment elles sont traitées et quelles sont leurs limites."
badge: "Méthodologie"
institution: "CCSD (CNRS, Inria, INRAE) - Plateforme Episciences"
author: "Équipe Episciences, CCSD"
date: "Octobre 2026"
backToDashboard: "Retour au tableau de bord"
tocTitle: "Sommaire"
tocItems:
  - id: "sec1"
    label: "1. Contexte"
  - id: "sec2"
    label: "2. Sources de données"
  - id: "sec3"
    label: "3. Collecte et traitement"
  - id: "sec4"
    label: "4. Méthodes de calcul"
  - id: "sec5"
    label: "5. Limites"
  - id: "sec6"
    label: "6. Liens et documentation"
---

## 1. Contexte

Episciences Insights est développé par le CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). Il présente des indicateurs sur les articles publiés par les revues hébergées sur la plateforme Episciences : auteurs/autrices, affiliations et pays, thématiques de recherche, financements, pratiques de science ouverte et consultations. Le corpus rassemble plus de {publicationsCount} publications issues des revues de la plateforme ({journalsCount} revues hébergées) ; les mises à jour sont prévues mensuellement ou en fonction des évolutions des données ou modèles de données utilisés.

Les indicateurs proviennent uniquement d'infrastructures ouvertes et leur mode de calcul est documenté ci-dessous. Conformément aux principes de DORA et de CoARA, le tableau de bord n'utilise pas d'indicateurs propriétaires comme le facteur d'impact.

> ### Le modèle overlay journal (accès ouvert diamant)
>
> Les revues Episciences fonctionnent selon le modèle des [overlay journals](https://en.wikipedia.org/wiki/Overlay_journal) : les manuscrits sont déposés au préalable dans une archive ouverte (HAL, arXiv, Zenodo...), puis évalués par les pairs sous la responsabilité du comité éditorial de la revue. La publication et la lecture sont entièrement gratuites : aucun frais n'est demandé aux auteurs/autrices (sans APC), et les articles sont en accès libre et immédiat pour l'ensemble des lecteurs/lectrices.

## 2. Sources de données

Les données proviennent de plusieurs sources, reliées entre elles par des identifiants pérennes (DOI, ROR, ORCID). Le tableau ci-dessous précise ce que fournit chacune d'elles.

| Source | Accès | Données utilisées | Identifiant de liaison |
| :--- | :--- | :--- | :--- |
| [Episciences](https://www.episciences.org) | API REST (`api.episciences.org`) | Liste des articles publiés, nom et code des revues, affiliations des auteurs, dates de soumission et de publication, codes MSC 2020 | DOI, docid, rvcode |
| [OpenAlex](https://openalex.org) | API REST Works & Funders (`api.openalex.org`) | Auteurs, affiliations, pays, ODD, thématiques, nombre de références, travaux liés, noms des financeurs | DOI, OpenAlex ID |
| [OpenAIRE Graph](https://graph.openaire.eu) | API v3 Research Products (`api.openaire.eu`) | Projets financés, archives d'hébergement (HAL, arXiv, Zenodo...), licences, codes JEL | DOI, OpenAIRE PID |
| [ROR (Research Organization Registry)](https://ror.org) | API REST Organization (`api.ror.org`) | Identifiants des organismes, pays des établissements, localisation des financeurs (latitude, longitude) | ROR ID |
| [zbMATH Open](https://zbmath.org) | Via l'export Episciences | Codes de la Mathematics Subject Classification (MSC 2020) | Code MSC 2020 |
| **Episciences KPI Logs** | `kpi_downloads.json` | Téléchargements et consultations de pages, par revue, par article et par pays | DOI, rvcode |

### Jeux de données ouverts (Open Data)

Les jeux de données consolidés utilisés pour alimenter la plateforme sont mis à disposition sous licence [Creative Commons CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) :
* [Télécharger le fichier consolidé des publications (JSON)](/data/publications.json)
* [Télécharger le référentiel normalisé des financeurs (JSON)](/data/funders.json)

## 3. Collecte et traitement

Les données sont collectées et traitées en amont par une suite de scripts. Le site est ensuite généré à partir de ces données.

1. **Étape 1 - Liste des articles :** La liste des DOI des articles publiés est récupérée depuis l'API Episciences, puis normalisée (préfixes supprimés, passage en minuscules).
2. **Étape 2 - Collecte des métadonnées :** Pour chaque DOI, les métadonnées sont demandées à OpenAlex, à OpenAIRE Graph et à l'export Episciences. Les réponses sont gardées en cache local pendant 30 jours. Les réponses vides sont gardées en cache 24 heures pour éviter des requêtes répétées.
3. **Étape 3 - Revues et affiliations :** Il arrive fréquemment qu'OpenAlex rattache l'article à l'archive de dépôt (HAL, arXiv...) ou donne un nom de revue inexact. Le nom et le code de la revue (rvcode) sont donc pris dans les données Episciences. Les affiliations des auteurs déclarées sur Episciences complètent celles d'OpenAlex lorsqu'elles comportent un identifiant ROR ; leur pays est obtenu via ROR.
4. **Étape 4 - Financements :** Les financements indiqués par OpenAlex et par OpenAIRE sont fusionnés et dédoublonnés. Les noms des financeurs sont normalisés à l'aide d'OpenAlex. Le registre ROR fournit leur localisation et permet d'identifier ceux qu'OpenAlex ne reconnaît pas.
5. **Étape 5 - Préparation des fichiers :** Les données sont enregistrées en JSON puis compressées (Brotli et Gzip). La taille du fichier des publications est ainsi divisée par plus de dix.

## 4. Méthodes de calcul

### Objectifs de développement durable (ODD)

OpenAlex associe à certaines publications un ou plusieurs des 17 ODD de l'ONU, avec un score de pertinence compris entre 0,4 et 1 (les scores inférieurs à 0,4 ne sont pas conservés). Une partie seulement du corpus est couverte.

Lorsqu'on observe un ensemble d'articles, le tableau de bord retient le score maximal obtenu pour chaque ODD plutôt qu'une moyenne. Une moyenne masquerait en effet les contributions fortes au milieu d'un grand volume d'articles de recherche fondamentale.

### Réseau de co-financement (Louvain)

Sur le graphe des financeurs, deux organismes sont reliés s'ils financent les mêmes articles. Les regroupements de financeurs sont identifiés à l'aide de l'algorithme de détection de communautés de Louvain, via la bibliothèque graphology.

### Précautions relatives aux statistiques de consultation

Les statistiques de téléchargement et de consultation de pages proviennent exclusivement de la plateforme Episciences et reflètent les consultations directes sur les sites des revues. Elles sont agrégées par revue, par article et par pays lorsque l'adresse IP permet de le déterminer.

Ces indicateurs ne comptabilisent pas les consultations et téléchargements effectués sur les archives ouvertes ou entrepôts partenaires (HAL, arXiv, Zenodo...) où les mêmes articles sont librement accessibles : le lectorat effectif global est donc très probablement supérieur aux chiffres présentés ici.

> **Attention méthodologique :** Les chiffres de consultation ne sont pas directement comparables d'une revue à l'autre : une revue ancienne ou publiant un grand nombre d'articles cumulera naturellement plus de vues qu'une revue récente. De même, les pratiques de consultation varient sensiblement selon les disciplines.

### Lignée scientifique et artefacts de recherche (Scholix)

Pour chaque article, les références citées et les travaux liés sont issus des données ouvertes d'OpenAlex. Cette mise en perspective permet de situer chaque publication dans son contexte scientifique.

Dans le troisième volet (« Artefacts de recherche associés »), les jeux de données et logiciels liés sont moissonnés auprès d'OpenAIRE Graph via le schéma [Scholix (RDA/WDS)](http://www.scholix.org/). Ce protocole standardise les liens bidirectionnels entre publications scientifiques, jeux de données de recherche et logiciels hébergés dans des entrepôts certifiés (Dryad, Zenodo, Software Heritage, etc.).

### Thématiques et classifications

Les thématiques de recherche sont déduites des concepts identifiés par OpenAlex. Pour les revues de mathématiques, cette classification est enrichie par les codes officiels MSC 2020 issus de zbMATH Open, et par les codes JEL pour l'économie.

### Portée géographique et co-signatures

Un pays est comptabilisé dès lors qu'au moins un coauteur ou une coautrice déclare une affiliation dans ce pays. Les cartes et visualisations de flux mettent ainsi en évidence la distribution des coopérations scientifiques internationales.

## 5. Limites

Plusieurs limites sont à garder à l'esprit pour interpréter les résultats :

* **Couverture et exhaustivité :** Bien que le corpus rassemble la quasi-totalité des publications de la plateforme, aucun agrégateur externe ne constitue un catalogue exhaustif absolu. La couverture d'un article par des sources tierces (OpenAlex, OpenAIRE) n'est pas garantie, et certains indicateurs (science ouverte, ODD, classifications) ne sont disponibles que lorsqu'un enregistrement correspondant existe.
* **Délai d'indexation :** Un article récent peut ne pas encore être indexé par OpenAlex ou OpenAIRE, ou ne l'être que partiellement.
* **Modèles algorithmiques :** Certaines métadonnées issues d'OpenAlex (notamment les concepts thématiques, l'alignement avec les ODD et les travaux connexes) sont produites par des modèles automatisés et peuvent comporter des approximations.
* **Classifications disciplinaires :** Les codes MSC 2020 (mathématiques) et JEL (économie) ne concernent que certaines revues. Leur absence ailleurs est normale.
* **Affiliations :** Les établissements des auteurs proviennent d'OpenAlex, complétés par les affiliations déclarées sur Episciences avec un identifiant ROR. Le rattachement automatique d'OpenAlex peut contenir des erreurs, et une partie des auteurs reste sans établissement connu.
* **Artefacts de recherche (données et code) :** La détection des jeux de données et logiciels liés (Scholix) dépend des déclarations effectuées par les auteurs dans des entrepôts partenaires (Dryad, Zenodo, etc.) et moissonnées par OpenAIRE Graph. Seule une fraction des articles dispose de ces liens formalisés.
* **Démarche d'amélioration continue :** L'équipe d'Episciences s'investit continuellement pour affiner, vérifier et enrichir ces jeux de données afin d'offrir une représentation toujours plus fidèle de l'impact scientifique des revues.

## 6. Liens et documentation

* **DORA** (2012). *Déclaration de San Francisco sur l’évaluation de la recherche*. Disponible sur : [https://sfdora.org](https://sfdora.org) (consulté en novembre 2026).
* **CoARA** (2022). *Agreement on Reforming Research Assessment*. Coalition for Advancing Research Assessment. Disponible sur : [https://coara.org](https://coara.org) (consulté en novembre 2026).
* **OpenAIRE**. *OpenAIRE Graph v3 API Documentation* [en ligne]. OpenAIRE A.M.K.E. Disponible sur : [https://graph.openaire.eu/docs](https://graph.openaire.eu/docs) (consulté en novembre 2026).
* **OurResearch**. *OpenAlex Documentation & Data Schema* [en ligne]. Disponible sur : [https://docs.openalex.org](https://docs.openalex.org) (consulté en novembre 2026).
* **Research Organization Registry (ROR)**. *Registry Documentation and API* [en ligne]. Disponible sur : [https://ror.org](https://ror.org) (consulté en novembre 2026).
* **American Economic Association (AEA)**. *JEL Classification System / EconLit Subject Descriptors* [en ligne]. Disponible sur : [https://www.aeaweb.org/econlit/jelCodes.php](https://www.aeaweb.org/econlit/jelCodes.php) (consulté en novembre 2026).
* **zbMATH Open**. *Mathematics Subject Classification (MSC 2020)* [en ligne]. FIZ Karlsruhe. Disponible sur : [https://zbmath.org/classification/](https://zbmath.org/classification/) (consulté en novembre 2026).
* **American Mathematical Society (AMS)**. *MSC2020 – Mathematics Subject Classification System* [en ligne]. Disponible sur : [https://msc2020.org](https://msc2020.org) et [https://mathscinet.ams.org/msc/msc2020.html](https://mathscinet.ams.org/msc/msc2020.html) (consulté en novembre 2026).
* **Organisation des Nations Unies (ONU)**. *Objectifs de développement durable (ODD) – Agenda 2030* [en ligne]. Nations Unies. Disponible sur : [https://sdgs.un.org/goals](https://sdgs.un.org/goals) (consulté en novembre 2026).
* **Research Data Alliance (RDA) & World Data System (WDS)**. *Scholix: A Framework for Scholarly Link Exchange* [en ligne]. Disponible sur : [http://www.scholix.org/](http://www.scholix.org/) (consulté en novembre 2026).
* **Bostock, M.** *world-atlas: Pre-built TopoJSON from Natural Earth* [données en ligne]. GitHub. Licence ISC / Domaine public. Disponible sur : [https://github.com/topojson/world-atlas](https://github.com/topojson/world-atlas) (consulté en novembre 2026).
* **Plique, G.** *graphology-communities-louvain: Louvain community detection algorithm for graphology* [logiciel en ligne]. Graphology. Licence MIT. Disponible sur : [https://graphology.github.io/standard-library/communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (consulté en novembre 2026).
