import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { Publication, FundersFile } from '@/lib/types';

export function cleanDoi(doi: string): string {
  return (doi || '').replace(/^https?:\/\/doi\.org\//i, '').toLowerCase().trim();
}

type LinkedOutputsFile = Record<string, { datasets: { pid: string; url?: string }[]; software: { pid: string; url?: string }[] }>;

function getLinkedOutputs(): LinkedOutputsFile {
  const filePath = path.join(process.cwd(), 'public/data/linked-outputs.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse linked-outputs.json', e);
    return {};
  }
}

const devCache = globalThis as typeof globalThis & {
  __epiPubsCache?: { mtimeMs: number; data: Publication[] };
  __epiFundersCache?: { mtimeMs: number; data: FundersFile };
};

export const getPublications = cache(async (): Promise<Publication[]> => {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const mtimeMs = fs.statSync(filePath).mtimeMs;
    if (devCache.__epiPubsCache?.mtimeMs === mtimeMs) {
      return devCache.__epiPubsCache.data;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const publications: Publication[] = JSON.parse(fileContent);

    // linked-outputs.json comes from the opt-in `npm run collect:links`
    // pass and may not exist — attach it only when present.
    const linkedOutputs = getLinkedOutputs();
    if (Object.keys(linkedOutputs).length > 0) {
      for (const pub of publications) {
        const entry = linkedOutputs[cleanDoi(pub.doi)];
        if (entry && pub.open_science) {
          pub.open_science.linked_outputs = entry;
        }
      }
    }

    devCache.__epiPubsCache = { mtimeMs, data: publications };
    return publications;
  } catch (e) {
    console.error('Failed to parse publications.json', e);
    return [];
  }
});

export const getFunders = cache(async (): Promise<FundersFile> => {
  const filePath = path.join(process.cwd(), 'public/data/funders.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    const mtimeMs = fs.statSync(filePath).mtimeMs;
    if (devCache.__epiFundersCache?.mtimeMs === mtimeMs) {
      return devCache.__epiFundersCache.data;
    }

    const funders = JSON.parse(fs.readFileSync(filePath, 'utf8')) as FundersFile;
    devCache.__epiFundersCache = { mtimeMs, data: funders };
    return funders;
  } catch (e) {
    console.error('Failed to parse funders.json', e);
    return {};
  }
});

export function getLastUpdated(): string | null {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch (e) {
    console.error('Failed to get publications.json mtime', e);
    return null;
  }
}

export interface CorpusStats {
  totalPublications: number;
  totalHostedJournals: number;
  activeJournals: number;
  collectedAt?: string;
}

export const getCorpusStats = cache(function getCorpusStats(): CorpusStats {
  const filePath = path.join(process.cwd(), 'public/data/corpus-stats.json');
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse corpus-stats.json', e);
    }
  }
  return {
    totalPublications: 8062,
    totalHostedJournals: 47,
    activeJournals: 41,
  };
});


