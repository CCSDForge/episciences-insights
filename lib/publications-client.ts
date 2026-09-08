'use client';

import { useEffect, useState } from 'react';
import { Publication } from '@/lib/types';

let cachedPublications: Publication[] | null = null;
let inFlightPromise: Promise<Publication[]> | null = null;

/**
 * Fetches publications.json once on the client side, caching the parsed
 * array in memory so language switches and page transitions do not re-fetch.
 */
export function getPublicationsClient(): Promise<Publication[]> {
  if (cachedPublications) {
    return Promise.resolve(cachedPublications);
  }

  if (!inFlightPromise) {
    inFlightPromise = fetch('/data/publications.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load publications: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: Publication[]) => {
        cachedPublications = data;
        inFlightPromise = null;
        return data;
      })
      .catch((err) => {
        inFlightPromise = null;
        throw err;
      });
  }

  return inFlightPromise;
}

export interface UsePublicationsResult {
  publications: Publication[];
  loading: boolean;
  error: Error | null;
}

export function usePublications(initialData?: Publication[]): UsePublicationsResult {
  const [publications, setPublications] = useState<Publication[]>(() => {
    if (initialData && initialData.length > 0) return initialData;
    if (cachedPublications) return cachedPublications;
    return [];
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (initialData && initialData.length > 0) return false;
    if (cachedPublications) return false;
    return true;
  });

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (publications.length > 0) return;

    getPublicationsClient()
      .then((data) => {
        setPublications(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [publications.length]);

  return { publications, loading, error };
}
