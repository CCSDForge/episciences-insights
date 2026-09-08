import fs from 'node:fs';
import path from 'node:path';
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

export async function getPublications(): Promise<Publication[]> {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return [];
  try {
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
