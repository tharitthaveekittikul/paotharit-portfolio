import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const featuredProjects = getAllContent('projects', locale).filter(p => p.featured).slice(0, 3)
  const recentPosts = getAllContent('blog', locale).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <section className="mb-20">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tharit Thaveekittikul
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Software engineer building AI systems, trading tools, and developer infrastructure.
        </p>
      </section>

      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Projects
          </h2>
          <div className="space-y-6">
            {featuredProjects.map(project => (
              <Link
                key={project.slug}
                href={`/${locale}/projects/${project.slug}`}
                className="group block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <h3 className="mb-1 font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {project.title}
                </h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 5).map(tech => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Writing
          </h2>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex items-baseline justify-between gap-4"
              >
                <span className="text-zinc-800 group-hover:text-black dark:text-zinc-200 dark:group-hover:text-white">
                  {post.title}
                </span>
                <span className="shrink-0 text-sm text-zinc-400">
                  {new Date(post.date).toLocaleDateString(
                    locale === 'th' ? 'th-TH' : 'en-US',
                    { year: 'numeric', month: 'short' }
                  )}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
