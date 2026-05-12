import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'

export interface DocFrontmatter {
  title: string
  description: string
  type: 'doc'
}

export interface DocItem {
  type: 'item'
  label: string
  href: string
  slug: string[]
}

export interface DocGroup {
  type: 'group'
  label: string
  children: (DocItem | DocGroup)[]
}

export type SidebarNode = DocItem | DocGroup

export interface Heading {
  text: string
  id: string
  level: number
}

export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger()
  return content
    .split('\n')
    .flatMap(line => {
      const match = line.match(/^(#{2,3})\s+(.+)$/)
      if (!match) return []
      const level = match[1].length
      const text = match[2].trim()
      const id = slugger.slug(text)
      return [{ text, id, level }]
    })
}

function stripNumericPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
}

function toLabel(rawName: string): string {
  return stripNumericPrefix(rawName)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toSlugPart(rawName: string): string {
  return stripNumericPrefix(rawName).toLowerCase()
}

export function createDocsUtils(docsRoot: string) {
  function walkDir(dir: string, project: string, locale: string, slugParts: string[]): SidebarNode[] {
    if (!existsSync(dir)) return []
    return readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((entry): SidebarNode[] => {
        const baseName = entry.isDirectory() ? entry.name : entry.name.replace(/\.mdx$/, '')
        const slugPart = toSlugPart(baseName)
        const newSlugParts = [...slugParts, slugPart]

        if (entry.isDirectory()) {
          const children = walkDir(join(dir, entry.name), project, locale, newSlugParts)
          return [{ type: 'group' as const, label: toLabel(entry.name), children }]
        }

        if (!entry.name.endsWith('.mdx')) return []

        const raw = readFileSync(join(dir, entry.name), 'utf-8')
        const { data } = matter(raw)
        const label = (data.title as string | undefined) ?? toLabel(baseName)
        const href = `/${locale}/docs/${project}/${newSlugParts.join('/')}`
        return [{ type: 'item' as const, label, href, slug: newSlugParts }]
      })
  }

  function buildSidebarTree(project: string, locale: string): SidebarNode[] {
    return walkDir(join(docsRoot, locale, 'docs', project), project, locale, [])
  }

  function findFilePath(dir: string, slugParts: string[], depth: number): string | null {
    if (!existsSync(dir)) return null
    const target = slugParts[depth]
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const baseName = entry.isDirectory() ? entry.name : entry.name.replace(/\.mdx$/, '')
      if (toSlugPart(baseName) !== target) continue
      if (entry.isDirectory() && depth < slugParts.length - 1) {
        return findFilePath(join(dir, entry.name), slugParts, depth + 1)
      }
      if (entry.isFile() && entry.name.endsWith('.mdx') && depth === slugParts.length - 1) {
        return join(dir, entry.name)
      }
    }
    return null
  }

  function getDocBySlug(
    project: string,
    slugParts: string[],
    locale: string
  ): { frontmatter: DocFrontmatter; content: string } | null {
    const filePath = findFilePath(join(docsRoot, locale, 'docs', project), slugParts, 0)
    if (!filePath) return null
    const { data, content } = matter(readFileSync(filePath, 'utf-8'))
    return { frontmatter: data as DocFrontmatter, content }
  }

  function getDocContent(project: string, slugParts: string[], locale: string) {
    const result = getDocBySlug(project, slugParts, locale)
    if (!result) throw new Error(`Doc not found: ${project}/${slugParts.join('/')}`)
    return result
  }

  function getFirstDocSlug(project: string, locale: string): string[] | null {
    function findFirst(nodes: SidebarNode[]): string[] | null {
      for (const node of nodes) {
        if (node.type === 'item') return node.slug
        const found = findFirst(node.children)
        if (found) return found
      }
      return null
    }
    return findFirst(buildSidebarTree(project, locale))
  }

  return { buildSidebarTree, getDocBySlug, getDocContent, getFirstDocSlug }
}

const DOCS_ROOT = join(process.cwd(), 'content')
export const { buildSidebarTree, getDocBySlug, getDocContent, getFirstDocSlug } =
  createDocsUtils(DOCS_ROOT)
