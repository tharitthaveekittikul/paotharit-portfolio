import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, basename, extname, resolve } from 'path'
import matter from 'gray-matter'
import { stringify } from 'yaml'

export function convertWikiLinks(content: string): string {
  // [[Page|Alias]] → [Alias](Page)
  content = content.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '[$2]($1)')
  // [[Page]] → [Page](Page)
  content = content.replace(/\[\[([^\]]+)\]\]/g, '[$1]($1)')
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

  // Path traversal guard: --output must stay inside project directory
  const projectRoot = process.cwd()
  const resolvedOutput = resolve(output)
  if (!resolvedOutput.startsWith(projectRoot)) {
    console.error(`--output must be within the project directory (${projectRoot})`)
    process.exit(1)
  }

  for (const file of includes) {
    const sourcePath = join(source, file)
    if (!existsSync(sourcePath)) {
      console.warn(`Not found: ${file}`)
      continue
    }
    const slug = basename(file, extname(file))
      .toLowerCase()
      .replace(/\s+/g, '-')
    processFile(sourcePath, resolvedOutput, slug)
  }

  copyImages(
    join(source, 'Attachments'),
    join(projectRoot, 'public/images', basename(resolvedOutput))
  )
}
