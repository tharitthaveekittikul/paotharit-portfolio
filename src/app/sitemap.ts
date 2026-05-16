import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/content'

const BASE = 'https://www.paotharit.me'
const LOCALES = ['en', 'th']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['', '/projects', '/blog', '/resume']
  const staticEntries = LOCALES.flatMap(locale =>
    staticRoutes.map(route => ({
      url: `${BASE}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  const blogSlugs = getAllSlugs('blog')
  const blogEntries = LOCALES.flatMap(locale =>
    blogSlugs.map(slug => ({
      url: `${BASE}/${locale}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  const projectSlugs = getAllSlugs('projects')
  const projectEntries = LOCALES.flatMap(locale =>
    projectSlugs.map(slug => ({
      url: `${BASE}/${locale}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  return [...staticEntries, ...blogEntries, ...projectEntries]
}
