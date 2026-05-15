import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ResumeDownloadButton } from '@/components/shared/ResumeDownloadButton'

export default async function ResumePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('resume')

  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <ResumeDownloadButton
          label={t('download')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        />
      </div>
      <embed
        src="/resume.pdf"
        type="application/pdf"
        className="w-full rounded-lg border border-border"
        style={{ height: 'calc(100svh - 10rem)' }}
      />
    </div>
  )
}
