import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/account/', '/settings/'], // Protect private routes from crawling
    },
    sitemap: 'https://finance-flame-delta.vercel.app/sitemap.xml',
  };
}
