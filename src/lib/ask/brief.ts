import { readFileSync } from 'fs'
import { join } from 'path'

export interface BriefProject {
  slug: string
  title: string
  summary: string
  stack: string
  text: string
}

export interface KnowledgeBrief {
  profile: string
  projects: BriefProject[]
}

export const BRIEF_PATH = join(process.cwd(), 'src/lib/ask/knowledge-brief.md')

export function parseBrief(markdown: string): KnowledgeBrief {
  const [profilePart, projectsPart = ''] = markdown.split(/^# Projects\s*$/m)
  const profile = profilePart.replace(/^# Profile\s*$/m, '').replace(/<!--[\s\S]*?-->/g, '').trim()
  const projects = projectsPart
    .split(/^## /m)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split('\n')
      const [slug, title] = heading.split('|').map((part) => part.trim())
      const text = rest.join('\n').trim()
      const summary = text.split('\n').find((line) => line.trim() && !line.startsWith('-')) ?? ''
      const stack = text.match(/^- Stack:\s*(.+)$/m)?.[1].trim() ?? ''
      return { slug, title: title ?? slug, summary: summary.trim(), stack, text }
    })
  return { profile, projects }
}

let cached: KnowledgeBrief | null = null

export function loadBrief(): KnowledgeBrief {
  cached ??= parseBrief(readFileSync(BRIEF_PATH, 'utf8'))
  return cached
}

export function sliceBrief(brief: KnowledgeBrief, slugs: string[], locale: string): string {
  const index = brief.projects
    .map((p) => `- [${p.title}](/${locale}/projects/${p.slug}): ${p.summary}${p.stack ? ` Stack: ${p.stack}.` : ''}`)
    .join('\n')
  const detail = brief.projects
    .filter((p) => slugs.includes(p.slug))
    .map((p) => `### ${p.title}\n${p.text}`)
    .join('\n\n')
  return `${brief.profile}\nResume page (work experience, education): [resume](/${locale}/resume). About page: [about](/${locale}/about).\n\n## Project index\n${index}\n\n## Project detail\n${detail}`
}
