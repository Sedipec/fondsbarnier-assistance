import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://fondsbarnier-assistance.fr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/*', '/espace/*', '/api/*'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
