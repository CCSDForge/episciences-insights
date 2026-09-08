import type { Metadata } from 'next';
import RootRedirect from '@/components/RootRedirect';

export const metadata: Metadata = {
  title: 'Episciences Insights',
  description: 'Visualizing scientific research impact, funding, and open science indicators for Episciences publications.',
  alternates: {
    canonical: 'https://insights.episciences.org/en/',
    languages: {
      'x-default': 'https://insights.episciences.org/en/',
      en: 'https://insights.episciences.org/en/',
      fr: 'https://insights.episciences.org/fr/',
      es: 'https://insights.episciences.org/es/',
    },
  },
};

export default function RootPage() {
  return <RootRedirect targetPath="" />;
}
