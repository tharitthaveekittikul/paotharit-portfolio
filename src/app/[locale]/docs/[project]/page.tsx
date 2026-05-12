import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getFirstDocSlug } from '@/lib/docs'

export default async function ProjectDocsIndexPage({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  const locale = await getLocale()
  const firstSlug = getFirstDocSlug(project, locale)
  if (!firstSlug) redirect(`/${locale}`)
  redirect(`/${locale}/docs/${project}/${firstSlug.join('/')}`)
}
