import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, basename, extname, resolve } from 'path'
import matter from 'gray-matter'
import { stringify } from 'yaml'

export function convertWikiLinks(content: string, resolver?: (name: string) => string | null): string {
  // [[Page|Alias]] → [Alias](resolved-url-or-Page)
  content = content.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_match, page, alias) => {
    const href = resolver?.(page.trim()) ?? page.trim()
    return `[${alias}](${href})`
  })
  // [[Page]] → [Page](resolved-url-or-Page)
  content = content.replace(/\[\[([^\]]+)\]\]/g, (_match, page) => {
    const href = resolver?.(page.trim()) ?? page.trim()
    return `[${page}](${href})`
  })
  return content
}

export function convertCallouts(content: string): string {
  return content.replace(
    /^> \[!(\w+)\][^\n]*\n((?:^> [^\n]*\n?)*)/gm,
    (_match, type: string, body: string) => {
      const inner = body
        .split('\n')
        .map(line => line.replace(/^> ?/, ''))
        .join('\n')
        .trim()
      return `<Callout type="${type.toLowerCase()}">\n${inner}\n</Callout>\n`
    }
  )
}

export function stripSections(content: string, headings: string[]): string {
  let result = content
  for (const heading of headings) {
    const level = (heading.match(/^(#+)/)?.[1] ?? '##').length
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Match from the heading line through all content until next heading of same or higher level
    const boundary = `#{1,${level}}[^#]`
    const pattern = new RegExp(
      `(?:^|\\n)${escapedHeading}[^\\n]*\\n[\\s\\S]*?(?=\\n${boundary}|$)`,
      'g'
    )
    result = result.replace(pattern, '')
  }
  return result
}

export function buildDocFrontmatter(
  obsidianFm: Record<string, unknown>,
  content: string
): Record<string, unknown> {
  const h1Match = content.match(/^#\s+(.+)$/m)
  const titleFromHeading = h1Match ? h1Match[1].trim() : 'Untitled'
  return {
    title: obsidianFm.title ?? titleFromHeading,
    description: obsidianFm.description ?? '',
    type: 'doc',
  }
}

const DOC_STRIP_HEADINGS = ['## 🛡️ Technical Defense', '## 🔄 Change Impact Analysis']

function numericPrefix(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function deriveUrlBase(outputBase: string): string {
  const idx = outputBase.indexOf('/content/')
  return idx === -1 ? '' : outputBase.slice(idx + '/content'.length)
}

function buildDocUrlMap(obsidianBase: string, projectKey: string, outputBase: string): Map<string, string> {
  const map = new Map<string, string>()
  const urlBase = deriveUrlBase(outputBase)
  const endpointsBase = join(obsidianBase, 'Docs', 'Backend', 'Endpoints')
  if (!existsSync(endpointsBase)) return map

  const domains = readdirSync(endpointsBase, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))

  domains.forEach((domain, di) => {
    const domainSlug = `${numericPrefix(di)}-${domain.name.toLowerCase()}`
    const files = readdirSync(join(endpointsBase, domain.name))
      .filter(f => f.endsWith('.md'))
      .sort()

    files.forEach((file, fi) => {
      const noteTitle = basename(file, '.md')
      const outSlug = `${numericPrefix(fi)}-${noteTitle.toLowerCase().replace(/[\s_]+/g, '-')}`
      map.set(noteTitle, `${urlBase}/${projectKey}/02-api/${domainSlug}/${outSlug}`)
    })
  })

  return map
}

function processDocFile(srcPath: string, destPath: string, resolver?: (name: string) => string | null): void {
  const raw = readFileSync(srcPath, 'utf-8')
  const { data: obsidianFm, content } = matter(raw)
  let body = stripSections(content, DOC_STRIP_HEADINGS)
  body = convertWikiLinks(body, resolver)
  body = convertCallouts(body)
  const newFm = buildDocFrontmatter(obsidianFm as Record<string, unknown>, body)
  // Strip the H1 heading — the page renders it from frontmatter.title
  body = body.replace(/^# [^\n]+\n?/m, '').trimStart()
  const fmStr = stringify(newFm).trim()
  writeFileSync(destPath, `---\n${fmStr}\n---\n\n${body.trim()}\n`)
  console.log(`doc: ${basename(destPath)}`)
}

export function syncDocs(obsidianBase: string, projectKey: string, outputBase: string): void {
  const outDir = join(outputBase, projectKey)
  mkdirSync(outDir, { recursive: true })

  const urlMap = buildDocUrlMap(obsidianBase, projectKey, outputBase)
  const resolver = (name: string) => urlMap.get(name) ?? null

  // Top-level docs
  const topLevel = [{ src: join(obsidianBase, 'Architecture.md'), out: '01-architecture.mdx' }]
  for (const { src, out } of topLevel) {
    if (!existsSync(src)) { console.warn(`Not found: ${src}`); continue }
    processDocFile(src, join(outDir, out), resolver)
  }

  // API endpoint docs from Docs/Backend/Endpoints/
  const endpointsBase = join(obsidianBase, 'Docs', 'Backend', 'Endpoints')
  if (!existsSync(endpointsBase)) return

  const apiOutDir = join(outDir, '02-api')
  const domains = readdirSync(endpointsBase, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))

  domains.forEach((domain, di) => {
    const domainSlug = `${numericPrefix(di)}-${domain.name.toLowerCase()}`
    const domainOut = join(apiOutDir, domainSlug)
    mkdirSync(domainOut, { recursive: true })

    const files = readdirSync(join(endpointsBase, domain.name))
      .filter(f => f.endsWith('.md'))
      .sort()

    files.forEach((file, fi) => {
      const outSlug = `${numericPrefix(fi)}-${basename(file, '.md').toLowerCase().replace(/[\s_]+/g, '-')}`
      processDocFile(join(endpointsBase, domain.name, file), join(domainOut, `${outSlug}.mdx`), resolver)
    })
  })
}

export function buildFrontmatter(
  obsidianFm: Record<string, unknown>,
  slug: string
): Record<string, unknown> {
  const publishedStatuses = ['published', 'approved', 'done']
  return {
    title: obsidianFm.title ?? slug,
    description: obsidianFm.description ?? '',
    date: obsidianFm.created ?? new Date().toISOString().split('T')[0],
    ...(obsidianFm.updated ? { updated: obsidianFm.updated } : {}),
    slug,
    type: obsidianFm.type ?? 'project',
    status: publishedStatuses.includes(String(obsidianFm.status ?? ''))
      ? 'published'
      : 'draft',
    featured: obsidianFm.featured ?? false,
    tags: obsidianFm.tags ?? [],
    techStack: obsidianFm.techStack ?? [],
  }
}

function processFile(sourcePath: string, outputDir: string, outputSlug: string): void {
  const raw = readFileSync(sourcePath, 'utf-8')
  const { data: obsidianFm, content } = matter(raw)

  const newFm = buildFrontmatter(obsidianFm, outputSlug)
  let newContent = convertWikiLinks(content)
  newContent = convertCallouts(newContent)

  const fmString = stringify(newFm).trim()
  const output = `---\n${fmString}\n---\n\n${newContent.trim()}\n`

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, `${outputSlug}.mdx`), output)
  console.log(`OK ${outputSlug}.mdx`)
}

function copyImages(sourceAttachments: string, targetDir: string): void {
  if (!existsSync(sourceAttachments)) return
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  mkdirSync(targetDir, { recursive: true })
  for (const file of readdirSync(sourceAttachments)) {
    if (imageExts.includes(extname(file).toLowerCase())) {
      copyFileSync(join(sourceAttachments, file), join(targetDir, file))
      console.log(`image: ${file}`)
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const projectRoot = process.cwd()

  if (args.includes('--docs')) {
    const source = args[args.indexOf('--source') + 1]
    const project = args[args.indexOf('--project') + 1]
    const output = args[args.indexOf('--output') + 1]

    if (!source || !project || !output) {
      console.error('Usage: tsx scripts/obsidian-sync.ts --docs --source <path> --project <name> --output <path>')
      process.exit(1)
    }
    const resolvedOutput = resolve(output)
    if (!resolvedOutput.startsWith(projectRoot)) {
      console.error(`--output must be within the project directory`)
      process.exit(1)
    }
    syncDocs(source, project, resolvedOutput)
  } else {
    const source = args[args.indexOf('--source') + 1]
    const output = args[args.indexOf('--output') + 1]
    const includeIdx = args.indexOf('--include')
    const includes = includeIdx !== -1
      ? args.slice(includeIdx + 1).filter(a => !a.startsWith('--'))
      : []

    if (!source || !output || includes.length === 0) {
      console.error('Usage: tsx scripts/obsidian-sync.ts --source <path> --include file1.md --output <path>')
      process.exit(1)
    }
    const resolvedOutput = resolve(output)
    if (!resolvedOutput.startsWith(projectRoot)) {
      console.error(`--output must be within the project directory`)
      process.exit(1)
    }
    for (const file of includes) {
      const sourcePath = join(source, file)
      if (!existsSync(sourcePath)) { console.warn(`Not found: ${file}`); continue }
      const slug = basename(file, extname(file)).toLowerCase().replace(/\s+/g, '-')
      processFile(sourcePath, resolvedOutput, slug)
    }
    copyImages(join(source, 'Attachments'), join(projectRoot, 'public/images', basename(resolvedOutput)))
  }
}
