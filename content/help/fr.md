---
title: "Note méthodologique et cadre scientométrique"
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
    label: "6. Architecture, licences et reproductibilité"
  - id: "sec7"
    label: "7. Liens et documentation"
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

Les chiffres de téléchargements et de vues proviennent des journaux de consultation de la plateforme Episciences. Ils sont agrégés par revue, par article et par pays lorsque l'adresse IP permet de le déterminer.

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

* **Délai d'indexation :** Un article récent peut ne pas encore être indexé par OpenAlex ou OpenAIRE, ou ne l'être que partiellement.
* **Classifications disciplinaires :** Les codes MSC 2020 (mathématiques) et JEL (économie) ne concernent que certaines revues. Leur absence ailleurs est normale.
* **Affiliations :** Les établissements des auteurs proviennent d'OpenAlex, complétés par les affiliations déclarées sur Episciences avec un identifiant ROR. Le rattachement automatique d'OpenAlex peut contenir des erreurs, et une partie des auteurs reste sans établissement connu.
* **Artefacts de recherche (données et code) :** La détection des jeux de données et logiciels liés (Scholix) dépend des déclarations effectuées par les auteurs dans des entrepôts partenaires (Dryad, Zenodo, etc.) et moissonnées par OpenAIRE Graph. Seule une fraction des articles dispose de ces liens formalisés.

## 6. Architecture, licences et reproductibilité

Le site est un ensemble de fichiers statiques, générés à partir de données préparées à l'avance.

### Site statique
Le site est généré avec Next.js sous forme de fichiers HTML et JSON. Toutes les ressources, y compris le fond de carte, sont servies par le site lui-même : la consultation ne déclenche aucun appel vers un service tiers.

### Compression
Les données sont compressées à l'avance (Brotli et Gzip), ce qui réduit le volume à télécharger.

### Licences et données ouvertes
Le code source est publié sous licence GNU GPL v3. Les jeux de données consolidés sont diffusés sous licence CC-BY 4.0.

* [Télécharger le fichier des publications (JSON)](/data/publications.json)
* [Télécharger le fichier des financeurs (JSON)](/data/funders.json)

### Reproduire la collecte
L'ensemble du traitement peut être relancé localement avec Node.js :

```bash
# 1. Cloner le dépôt (GPL v3)
git clone https://github.com/CCSDForge/episciences-insights.git
cd episciences-insights && npm install

# 2. Récupérer la liste des DOI depuis l'API Episciences
npm run sync:dois

# 3. Collecter et fusionner les métadonnées
npm run collect

# Optionnel : collecter les liens Scholix (données et logiciels)
npm run collect:links

# 4. Générer le site statique
npm run build
```

## 7. Liens et documentation

* DORA (2012) - [San Francisco Declaration on Research Assessment](https://sfdora.org)
* CoARA (2022) - [Coalition for Advancing Research Assessment](https://coara.org)
* OpenAIRE (2024) - [OpenAIRE Graph v3 API Documentation](https://graph.openaire.eu/docs)
* OurResearch (2024) - [OpenAlex Documentation & Data Schema](https://docs.openalex.org)
* ROR (2024) - [Research Organization Registry](https://ror.org)
* zbMATH Open - [Mathematics Subject Classification (MSC 2020)](https://zbmath.org/classification/)
* Scholix - [Cadre d'échange de liens pour la recherche (RDA/WDS)](http://www.scholix.org/)
* Natural Earth & world-atlas (Mike Bostock) - [Fond de carte mondial TopoJSON (Licence ISC / Domaine public)](https://github.com/topojson/world-atlas)
* Plique, G. - [graphology-communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (Licence MIT)
