import { setRequestLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getDocsProjects } from '@/lib/docs'
import { getDocsMeta } from '@/lib/docs-meta'

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('docsPage')
  const projects = getDocsProjects(locale)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {t('title')}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('description')}</p>
      {projects.length === 0 && (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">{t('empty')}</p>
      )}
      <ul className="mt-10 space-y-4">
        {projects.map((slug) => {
          const meta = getDocsMeta(slug)
          return (
            <li key={slug}>
              <Link
                href={`/${locale}/docs/${slug}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-orange-600 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-orange-500"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{meta.title}</p>
                  {meta.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {meta.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="shrink-0 text-zinc-400" size={16} />
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
