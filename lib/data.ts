import fs from 'node:fs';
import path from 'node:path';
import { Publication, FundersFile, OpenCitationsImpact, VenueCitationSummary } from '@/lib/types';

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

export function getOpenCitations(): Record<string, OpenCitationsImpact> {
  const filePath = path.join(process.cwd(), 'public/data/opencitations.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse opencitations.json', e);
    return {};
  }
}

export function getVenueCitations(): Record<string, VenueCitationSummary> {
  const filePath = path.join(process.cwd(), 'public/data/venue-citations.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse venue-citations.json', e);
    return {};
  }
}

export async function getPublications(): Promise<Publication[]> {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const publications: Publication[] = JSON.parse(fileContent);

    // linked-outputs.json comes from the opt-in `npm run collect:links`
    // pass and may not exist — attach it only when present.
    const linkedOutputs = getLinkedOutputs();
    const hasLinkedOutputs = Object.keys(linkedOutputs).length > 0;

    // opencitations.json comes from `npm run collect:citations`
    const openCitationsData = getOpenCitations();
    const hasOpenCitations = Object.keys(openCitationsData).length > 0;

    if (hasLinkedOutputs || hasOpenCitations) {
      for (const pub of publications) {
        const key = cleanDoi(pub.doi);
        if (hasLinkedOutputs && pub.open_science) {
          const entry = linkedOutputs[key];
          if (entry) pub.open_science.linked_outputs = entry;
        }
        if (hasOpenCitations && !pub.opencitations) {
          const ocEntry = openCitationsData[key];
          if (ocEntry) pub.opencitations = ocEntry;
        }
      }
    }

    return publications;
  } catch (e) {
    console.error('Failed to parse publications.json', e);
    return [];
  }
}

export async function getFunders(): Promise<FundersFile> {
  const filePath = path.join(process.cwd(), 'public/data/funders.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse funders.json', e);
    return {};
  }
}

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

