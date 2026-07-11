import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://scopeguard.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/tos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
