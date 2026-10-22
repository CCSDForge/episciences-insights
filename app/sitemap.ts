import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';
  const lastModified = new Date();
  const locales = ['en', 'fr', 'es'] as const;
  const sections = ['usage', 'reach', 'topics', 'funders', 'open-science', 'network', 'help'] as const;

  const entries: MetadataRoute.Sitemap = [];

  // Root per-locale entries
  for (const loc of locales) {
    entries.push({
      url: `${siteUrl}/${loc}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          'x-default': `${siteUrl}/en/`,
          en: `${siteUrl}/en/`,
          fr: `${siteUrl}/fr/`,
          es: `${siteUrl}/es/`,
        },
      },
    });
  }

  // Section entries
  for (const sec of sections) {
    for (const loc of locales) {
      entries.push({
        url: `${siteUrl}/${loc}/${sec}/`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: {
            'x-default': `${siteUrl}/en/${sec}/`,
            en: `${siteUrl}/en/${sec}/`,
            fr: `${siteUrl}/fr/${sec}/`,
            es: `${siteUrl}/es/${sec}/`,
          },
        },
      });
    }
  }

  return entries;
}
