import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

export interface Frontmatter {
  title: string
  description: string
  date: string
  updated?: string
  slug?: string
  type: 'blog' | 'project'
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  tags: string[]
  techStack: string[]
  coverImage?: string
  ogImage?: string
  seoTitle?: string
  seoDescription?: string
  role?: string
  duration?: string
  projectStatus?: string
  metrics?: { label: string; value: string }[]
}

export interface ContentItem extends Frontmatter {
  slug: string
}

export function createContentUtils(contentRoot: string) {
  function getAllSlugs(type: 'blog' | 'projects'): string[] {
    const dir = join(contentRoot, 'en', type)
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter(f => f.endsWith('.mdx'))
      .map(f => f.replace('.mdx', ''))
  }

  function getContent(
    type: 'blog' | 'projects',
    locale: string,
    slug: string
  ): { frontmatter: Frontmatter; content: string } {
    const localePath = join(contentRoot, locale, type, `${slug}.mdx`)
    const fallbackPath = join(contentRoot, 'en', type, `${slug}.mdx`)
    const filePath = existsSync(localePath) ? localePath : fallbackPath
    const raw = readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { frontmatter: data as Frontmatter, content }
  }

  function getAllContent(type: 'blog' | 'projects', locale: string): ContentItem[] {
    return getAllSlugs(type)
      .map(slug => {
        const { frontmatter } = getContent(type, locale, slug)
        return { slug, ...frontmatter }
      })
      .filter(item => item.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return { getAllSlugs, getContent, getAllContent }
}

const CONTENT_ROOT = join(process.cwd(), 'content')
export const { getAllSlugs, getContent, getAllContent } = createContentUtils(CONTENT_ROOT)
