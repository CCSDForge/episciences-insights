---
title: "Nota metodológica y marco cienciométrico"
subtitle: "Esta página describe cómo se constituye el corpus, de dónde proceden los datos, cómo se procesan y cuáles son sus límites."
badge: "Metodología"
institution: "CCSD (CNRS, Inria, INRAE) - Plataforma Episciences"
author: "Equipo Episciences, CCSD"
date: "Octubre de 2026"
backToDashboard: "Volver al panel"
tocTitle: "Sumario"
tocItems:
  - id: "sec1"
    label: "1. Contexto"
  - id: "sec2"
    label: "2. Fuentes de datos"
  - id: "sec3"
    label: "3. Recolección y procesamiento"
  - id: "sec4"
    label: "4. Métodos de cálculo"
  - id: "sec5"
    label: "5. Límites"
  - id: "sec6"
    label: "6. Arquitectura, licencias y reproducibilidad"
  - id: "sec7"
    label: "7. Enlaces y documentación"
---

## 1. Contexto

Episciences Insights es desarrollado por el CCSD (Centre pour la Communication Scientifique Directe, UAR 3668). Presenta indicadores sobre los artículos publicados en las revistas alojadas en la plataforma Episciences: autores/autoras, afiliaciones y países, temáticas de investigación, financiación, prácticas de ciencia abierta y estadísticas de consulta. El corpus reúne más de {publicationsCount} publicaciones procedentes de las revistas de la plataforma ({journalsCount} revistas alojadas); las actualizaciones están previstas mensualmente o según las evoluciones de los datos o modelos de datos utilizados.

Los indicadores proceden exclusivamente de infraestructuras abiertas y su método de cálculo está documentado a continuación. De conformidad con los principios de DORA y CoARA, el panel no utiliza métricas propietarias como el factor de impacto.

> ### El modelo overlay journal (acceso abierto diamante)
>
> Las revistas de Episciences funcionan según el modelo de [overlay journals](https://en.wikipedia.org/wiki/Overlay_journal): los manuscritos se depositan previamente en un repositorio abierto (HAL, arXiv, Zenodo...), y luego son evaluados por pares bajo la responsabilidad del comité editorial de la revista. La publicación y la lectura son totalmente gratuitas: no se exige ningún coste a los autores/autoras (sin APC), y los artículos están en acceso libre e inmediato para todos los lectores/lectoras.

## 2. Fuentes de datos

Los datos proceden de varias fuentes, conectadas entre sí mediante identificadores persistentes (DOI, ROR, ORCID). La tabla siguiente detalla lo que aporta cada una de ellas.

| Fuente | Acceso | Datos utilizados | Identificador de enlace |
| :--- | :--- | :--- | :--- |
| [Episciences](https://www.episciences.org) | API REST (`api.episciences.org`) | Lista de artículos publicados, nombre y código de las revistas, afiliaciones de autores, fechas de envío y publicación, códigos MSC 2020 | DOI, docid, rvcode |
| [OpenAlex](https://openalex.org) | API REST Works & Funders (`api.openalex.org`) | Autores, afiliaciones, países, ODS, temáticas, número de referencias, trabajos relacionados, nombres de financiadores | DOI, OpenAlex ID |
| [OpenAIRE Graph](https://graph.openaire.eu) | API v3 Research Products (`api.openaire.eu`) | Proyectos financiados, repositorios de alojamiento (HAL, arXiv, Zenodo...), licencias, códigos JEL | DOI, OpenAIRE PID |
| [ROR (Research Organization Registry)](https://ror.org) | API REST Organization (`api.ror.org`) | Identificadores de instituciones, países de los centros, localización de los financiadores (latitud, longitud) | ROR ID |
| [zbMATH Open](https://zbmath.org) | A través de la exportación Episciences | Códigos de la Mathematics Subject Classification (MSC 2020) | Código MSC 2020 |
| **Episciences KPI Logs** | `kpi_downloads.json` | Descargas de texto completo y visualizaciones de resúmenes por revista, por artículo y por país | DOI, rvcode |

## 3. Recolección y procesamiento

Los datos se recopilan y procesan previamente mediante una serie de scripts. A continuación, el sitio se genera a partir de estos datos consolidados.

1. **Paso 1 - Lista de artículos :** La lista de DOI de los artículos publicados se obtiene desde la API de Episciences y se normaliza (eliminación de prefijos, paso a minúsculas).
2. **Paso 2 - Recolección de metadatos :** Para cada DOI, se solicitan los metadatos a OpenAlex, OpenAIRE Graph y la exportación de Episciences. Las respuestas se conservan en caché local durante 30 días, y las respuestas vacías durante 24 horas para evitar peticiones repetitivas.
3. **Paso 3 - Revistas y afiliaciones :** A menudo, OpenAlex asocia el artículo al repositorio de depósito (HAL, arXiv...) o indica un nombre de revista inexacto. El nombre y el código de la revista (rvcode) proceden directamente de Episciences. Las afiliaciones de autores declaradas en Episciences complementan las de OpenAlex cuando disponen de un identificador ROR; sus países se obtienen mediante ROR.
4. **Paso 4 - Financiación :** Las ayudas y proyectos de OpenAlex y OpenAIRE se combinan y deduplican. Los nombres de los financiadores se normalizan con OpenAlex. El registro ROR proporciona su localización geográfica e identifica las entidades no reconocidas por OpenAlex.
5. **Paso 5 - Preparación de archivos :** Los datos se guardan en JSON y se comprimen previamente (Brotli y Gzip). El tamaño del archivo de publicaciones se reduce así en más de un 90 %.

## 4. Métodos de cálculo

### Objetivos de Desarrollo Sostenible (ODS)

OpenAlex asocia a determinadas publicaciones uno o varios de los 17 ODS de la ONU, con una puntuación de pertinencia entre 0,4 y 1 (las puntuaciones inferiores a 0,4 se descartan). Solo una parte del corpus está cubierta.

Al observar un conjunto de artículos, el panel conserva la puntuación máxima obtenida para cada ODS en lugar de una media. Una media ocultaría las contribuciones destacadas entre el gran volumen de artículos de investigación fundamental.

### Red de co-financiación (Louvain)

En el grafo de financiadores, dos entidades están conectadas si financian los mismos artículos. Las agrupaciones de financiadores se identifican mediante el algoritmo de detección de comunidades de Louvain, a través de la biblioteca graphology.

### Estadísticas de consulta y uso

Las cifras de descargas y visualizaciones proceden de los registros de consulta de la plataforma Episciences. Se agregan por revista, por artículo y por país cuando la dirección IP lo permite.

> **Atención metodológica :** Las cifras de consulta no son directamente comparables entre revistas: una revista veterana o con un volumen elevado de publicaciones acumulará más visitas que una reciente. Asimismo, las prácticas de lectura varían notablemente según la disciplina.

### Linaje científico y artefactos de investigación (Scholix)

Para cada artículo, las referencias citadas y los trabajos relacionados proceden de los datos abiertos de OpenAlex, situando cada publicación en su entorno científico.

En el tercer pilar («Artefactos de investigación asociados»), los conjuntos de datos y software vinculados se recopilan de OpenAIRE Graph mediante el protocolo [Scholix (RDA/WDS)](http://www.scholix.org/). Este estándar armoniza los enlaces bidireccionales entre publicaciones, conjuntos de datos y software en repositorios fiables (Dryad, Zenodo, Software Heritage, etc.).

### Temáticas y clasificaciones disciplinares

Las temáticas se deducen de los conceptos indexados por OpenAlex. Para las revistas de matemáticas, esta vista se enriquece con los códigos oficiales MSC 2020 de zbMATH Open, y con códigos JEL para economía.

### Alcance geográfico y coautorías

Un país se contabiliza en la afiliación cuando al menos un coautor declara una afiliación institucional ubicada en ese país. Los mapas y diagramas de flujo reflejan las colaboraciones científicas internacionales.

## 5. Límites

Conviene tener en cuenta varios límites metodológicos al interpretar los resultados:

* **Plazo de indexación :** Un artículo reciente puede no estar todavía indexado por OpenAlex o OpenAIRE, o solo de forma parcial.
* **Clasificaciones disciplinarias :** Los códigos MSC 2020 (matemáticas) y JEL (economía) solo corresponden a las revistas pertinentes. Su ausencia en otros campos es normal.
* **Afiliaciones institucionales :** Las afiliaciones de los autores proceden de OpenAlex, complementadas por las declaraciones en Episciences con identificador ROR. La asignación automática de OpenAlex puede contener imprecisiones.
* **Artefactos de investigación (datos y código) :** La detección de conjuntos de datos y software vinculados (Scholix) depende de las declaraciones realizadas en repositorios asociados (Dryad, Zenodo, etc.) y recolectadas por OpenAIRE Graph. Solo una fracción de los artículos cuenta con estos enlaces formalizados.

## 6. Arquitectura, licencias y reproducibilidad

El sitio es un conjunto de archivos estáticos, generados a partir de datos procesados previamente.

### Sitio estático
Generado con Next.js como archivos estáticos HTML y JSON. Todos los recursos, incluido el mapa base, se sirven localmente: la consulta no genera llamadas a servicios de terceros.

### Compresión
Los datos se comprimen con antelación (Brotli y Gzip), lo que reduce el volumen de descarga.

### Licencias y datos abiertos
El código fuente se distribuye bajo licencia GNU GPL v3. Los conjuntos de datos consolidados se difunden bajo licencia Creative Commons Atribución 4.0 Internacional (CC-BY 4.0).

* [Descargar el archivo de publicaciones (JSON)](/data/publications.json)
* [Descargar el archivo de financiadores (JSON)](/data/funders.json)

### Reproducir la recolección
Todo el pipeline puede ejecutarse localmente con Node.js:

```bash
# 1. Clonar el repositorio (GPL v3)
git clone https://github.com/CCSDForge/episciences-insights.git
cd episciences-insights && npm install

# 2. Sincronizar los DOI desde la API de Episciences
npm run sync:dois

# 3. Recolectar y fusionar los metadatos
npm run collect

# Opcional: recolectar enlaces Scholix (datos y software)
npm run collect:links

# 4. Generar el sitio estático
npm run build
```

## 7. Enlaces y documentación

* DORA (2012) - [San Francisco Declaration on Research Assessment](https://sfdora.org)
* CoARA (2022) - [Coalition for Advancing Research Assessment](https://coara.org)
* OpenAIRE (2024) - [OpenAIRE Graph v3 API Documentation](https://graph.openaire.eu/docs)
* OurResearch (2024) - [OpenAlex Documentation & Data Schema](https://docs.openalex.org)
* ROR (2024) - [Research Organization Registry](https://ror.org)
* zbMATH Open - [Mathematics Subject Classification (MSC 2020)](https://zbmath.org/classification/)
* Scholix - [Marco para el intercambio de enlaces académicos (RDA/WDS)](http://www.scholix.org/)
* Natural Earth & world-atlas (Mike Bostock) - [Mapa base mundial TopoJSON (Licencia ISC / Dominio público)](https://github.com/topojson/world-atlas)
* Plique, G. - [graphology-communities-louvain](https://graphology.github.io/standard-library/communities-louvain) (Licence MIT)
