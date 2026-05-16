import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { getProjectImages, getBlogImages } from '@/lib/project-images'
import { Badge } from '@/components/ui/badge'
import { ResumeLink } from '@/components/shared/ResumeLink'
import { ProjectImageStrip } from '@/components/shared/ProjectImageStrip'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('nav')
  const allProjects = getAllContent('projects', locale)
  const featuredProjects = allProjects.filter(p => p.featured).slice(0, 3)
  const allPosts = getAllContent('blog', locale)
  const recentPosts = allPosts.slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tharit Thaveekittikul',
    url: 'https://www.paotharit.me',
    jobTitle: 'Software Engineer',
    sameAs: [
      'https://github.com/tharitthaveekittikul',
      'https://www.linkedin.com/in/paotharit/',
      'https://www.instagram.com/paotharit/',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Projects
            </h2>
            <Link
              href={`/${locale}/projects`}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              See all ({allProjects.length})
            </Link>
          </div>
          <div className="space-y-6">
            {featuredProjects.map(project => {
              const images = getProjectImages(project.slug)
              return (
                <div
                  key={project.slug}
                  className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-input"
                >
                  <Link
                    href={`/${locale}/projects/${project.slug}`}
                    className="block"
                    aria-label={`View ${project.title}`}
                  >
                    <div className="p-5">
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
                    </div>
                  </Link>
                  {images.length > 0 && (
                    <Link
                      href={`/${locale}/projects/${project.slug}/screenshots`}
                      aria-label={`View all screenshots for ${project.title}`}
                    >
                      <ProjectImageStrip images={images} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Writing
            </h2>
            <Link
              href={`/${locale}/blog`}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              See all ({allPosts.length})
            </Link>
          </div>
          <div className="space-y-6">
            {recentPosts.map(post => {
              const images = getBlogImages(post.slug)
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-input"
                >
                  <div className="p-5">
                    <h3 className="mb-1 font-semibold text-foreground">
                      {post.title}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString(
                        locale === 'th' ? 'th-TH' : 'en-US',
                        { year: 'numeric', month: 'short' }
                      )}
                    </span>
                  </div>
                  <ProjectImageStrip images={images} />
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
    </>
  )
}
