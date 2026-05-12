import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllSlugs, getContent } from '@/lib/content'
import { mdxComponents } from '@/components/mdx'
import { Badge } from '@/components/ui/badge'

export async function generateStaticParams() {
  const slugs = getAllSlugs('blog')
  return ['en', 'th'].flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  try {
    const { frontmatter } = getContent('blog', locale, slug)
    return {
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.description,
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  let frontmatter: ReturnType<typeof getContent>['frontmatter']
  let content: string
  try {
    ;({ frontmatter, content } = getContent('blog', locale, slug))
  } catch {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <time className="mb-2 block text-sm text-zinc-400">
          {new Date(frontmatter.date).toLocaleDateString(
            locale === 'th' ? 'th-TH' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </time>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <p className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">
          {frontmatter.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {frontmatter.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
