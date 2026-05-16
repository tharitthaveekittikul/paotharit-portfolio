import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { getProjectImages } from '@/lib/project-images'
import { ZoomableImage } from '@/components/mdx/ZoomableImage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getAllContent('projects', locale).find(p => p.slug === slug)
  const title = project?.title ?? slug
  return { title: `${title} — ${locale === 'th' ? 'ภาพหน้าจอ' : 'Screenshots'}` }
}

export default async function ScreenshotsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const images = getProjectImages(slug)
  if (images.length === 0) {
    redirect(`/${locale}/projects/${slug}`)
  }

  const project = getAllContent('projects', locale).find(p => p.slug === slug)
  const title = project?.title ?? slug

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/${locale}/projects/${slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← {title}
      </Link>
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <div className="columns-1 gap-4 sm:columns-2">
        {images.map(image => (
          <div key={image.src} className="mb-4 break-inside-avoid">
            <ZoomableImage src={image.src} alt={image.alt} />
          </div>
        ))}
      </div>
    </div>
  )
}
