import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.episciences.org';
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/en/`,
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
    },
    {
      url: `${siteUrl}/fr/`,
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
    },
    {
      url: `${siteUrl}/es/`,
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
    },
    {
      url: `${siteUrl}/en/network/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'x-default': `${siteUrl}/en/network/`,
          en: `${siteUrl}/en/network/`,
          fr: `${siteUrl}/fr/network/`,
          es: `${siteUrl}/es/network/`,
        },
      },
    },
    {
      url: `${siteUrl}/fr/network/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'x-default': `${siteUrl}/en/network/`,
          en: `${siteUrl}/en/network/`,
          fr: `${siteUrl}/fr/network/`,
          es: `${siteUrl}/es/network/`,
        },
      },
    },
    {
      url: `${siteUrl}/es/network/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'x-default': `${siteUrl}/en/network/`,
          en: `${siteUrl}/en/network/`,
          fr: `${siteUrl}/fr/network/`,
          es: `${siteUrl}/es/network/`,
        },
      },
    },
  ];
}
