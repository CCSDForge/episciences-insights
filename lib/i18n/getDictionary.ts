import { cache } from 'react';
import type { Locale, Translations } from './types';

const dictionaries: Record<Locale, () => Promise<Translations>> = {
  en: () => import('./dictionaries/en').then((m) => m.default),
  fr: () => import('./dictionaries/fr').then((m) => m.default),
  es: () => import('./dictionaries/es').then((m) => m.default),
};

export const getDictionary = cache(async (locale: Locale): Promise<Translations> => {
  const loader = dictionaries[locale] || dictionaries.en;
  return loader();
});
