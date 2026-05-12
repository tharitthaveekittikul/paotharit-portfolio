import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { getDocContent, extractHeadings } from '@/lib/docs'
import { mdxComponents } from '@/components/mdx'
import { TableOfContents } from '@/components/docs'

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
        <nav className="mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Docs</span>
          {' / '}
          <span className="capitalize">{project}</span>
          {' / '}
          <span>{frontmatter.title}</span>
        </nav>
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
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
