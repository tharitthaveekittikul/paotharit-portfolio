import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { ResumeLink } from '@/components/shared/ResumeLink'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('nav')
  const featuredProjects = getAllContent('projects', locale).filter(p => p.featured).slice(0, 3)
  const recentPosts = getAllContent('blog', locale).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <section className="mb-20">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Tharit Thaveekittikul
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Software engineer building AI systems, trading tools, and developer infrastructure.
        </p>
        <ResumeLink
          label={t('resume')}
          href={`/${locale}/resume`}
          location="hero"
          className="mt-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        />
      </section>

      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Projects
          </h2>
          <div className="space-y-6">
            {featuredProjects.map(project => (
              <Link
                key={project.slug}
                href={`/${locale}/projects/${project.slug}`}
                className="group block rounded-lg border border-border p-5 transition-colors hover:border-input"
              >
                <h3 className="mb-1 font-semibold text-foreground group-hover:text-foreground">
                  {project.title}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
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
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Writing
          </h2>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-2"
              >
                <span className="text-foreground group-hover:text-foreground">
                  {post.title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
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
