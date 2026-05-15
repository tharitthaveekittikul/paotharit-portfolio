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
  return { title: locale === 'th' ? 'โปรเจกต์' : 'Projects' }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const projects = getAllContent('projects', locale)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {locale === 'th' ? 'โปรเจกต์' : 'Projects'}
      </h1>
      {projects.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">No projects yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <Link
              key={project.slug}
              href={`/${locale}/projects/${project.slug}`}
              className="group block rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <time
                dateTime={new Date(project.date).toISOString().slice(0, 10)}
                className="mb-1 block text-sm text-zinc-500 dark:text-zinc-400"
              >
                {new Date(project.date).toLocaleDateString(
                  locale === 'th' ? 'th-TH' : 'en-US',
                  { year: 'numeric' }
                )}
              </time>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {project.title}
                </h2>
                {project.projectStatus && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {project.projectStatus}
                  </Badge>
                )}
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.techStack.slice(0, 6).map(tech => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
