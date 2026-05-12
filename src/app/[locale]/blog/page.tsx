import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บล็อก' : 'Blog' }
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const posts = getAllContent('blog', locale)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {locale === 'th' ? 'บล็อก' : 'Blog'}
      </h1>
      {posts.length === 0 ? (
        <p className="text-zinc-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.slug}>
              <Link href={`/${locale}/blog/${post.slug}`} className="group block">
                <time className="mb-1 block text-sm text-zinc-400">
                  {new Date(post.date).toLocaleDateString(
                    locale === 'th' ? 'th-TH' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </time>
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {post.title}
                </h2>
                <p className="mb-3 text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
