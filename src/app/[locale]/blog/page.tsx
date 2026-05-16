import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { ProjectImageStrip } from '@/components/shared/ProjectImageStrip'
import { getBlogImages } from '@/lib/project-images'

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
        <p className="text-zinc-500 dark:text-zinc-400">No posts yet.</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => {
            const images = getBlogImages(post.slug)
            return (
              <article key={post.slug}>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-input"
                >
                  <div className="p-5">
                    <time className="mb-1 block text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </time>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">
                      {post.title}
                    </h2>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ProjectImageStrip images={images} />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
