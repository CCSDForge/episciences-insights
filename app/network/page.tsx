import type { Metadata } from 'next';
import RootRedirect from '@/components/RootRedirect';

export const metadata: Metadata = {
  title: 'Network Explorer - Episciences Insights',
  description: 'Interactive network analysis of co-funding, global affiliations, MSC classifications, and research topics across Episciences publications.',
  alternates: {
    canonical: 'https://insights.episciences.org/en/network/',
    languages: {
      'x-default': 'https://insights.episciences.org/en/network/',
      en: 'https://insights.episciences.org/en/network/',
      fr: 'https://insights.episciences.org/fr/network/',
      es: 'https://insights.episciences.org/es/network/',
    },
  },
};

export default function NetworkRootPage() {
  return <RootRedirect targetPath="network" />;
}
