import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import { getDocContent, extractHeadings } from '@/lib/docs'
import { mdxComponents } from '@/components/mdx'
import { TableOfContents, CopyMarkdownButton } from '@/components/docs'

// Marks mermaid code blocks before rehype-pretty-code processes them.
// Sets data-mermaid="true" on <pre> and strips the language class from <code>
// so rehype-pretty-code leaves the block alone.
function rehypeExtractMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return
      const codeEl = node.children.find(
        (c): c is Element => c.type === 'element' && (c as Element).tagName === 'code',
      )
      if (!codeEl) return
      const classes = (codeEl.properties?.className ?? []) as string[]
      if (!classes.includes('language-mermaid')) return
      node.properties = { ...node.properties, 'data-mermaid': 'true' }
      codeEl.properties = { ...codeEl.properties, className: [] }
    })
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; project: string; slug: string[] }>
}): Promise<Metadata> {
  const { locale, project, slug } = await params
  try {
    const { frontmatter } = getDocContent(project, slug, locale)
    return { title: frontmatter.title, description: frontmatter.description }
  } catch {
    return {}
  }
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; project: string; slug: string[] }>
}) {
  const { locale, project, slug } = await params

  let result: ReturnType<typeof getDocContent>
  try {
    result = getDocContent(project, slug, locale)
  } catch {
    notFound()
  }
  const { frontmatter, content } = result!

  const headings = extractHeadings(content)

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 pb-[100vh]">
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-xs text-zinc-500 dark:text-zinc-400">
            <span>Docs</span>
            {' / '}
            <span className="capitalize">{project}</span>
            {' / '}
            <span>{frontmatter.title}</span>
          </nav>
          <CopyMarkdownButton content={content} filename={frontmatter.title} />
        </div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  rehypeExtractMermaid,
                  [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
                ],
              },
            }}
          />
        </div>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
  )
}
