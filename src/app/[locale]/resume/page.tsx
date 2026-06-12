import Link from 'next/link'
import Image from 'next/image'
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
  const work = await getTranslations('workExperience')
  const edu = await getTranslations('education')

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

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {work('title')}
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {work('scb.company')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {work('scb.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {work('scb.role')}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {work('scb.bullet1')}{' '}
                <Link
                  href={`/${locale}/projects/sat-scan-report`}
                  className="text-primary hover:underline"
                >
                  {work('scb.bullet1Link')}
                </Link>
              </li>
              <li className="text-sm text-muted-foreground">
                {work('scb.bullet2')}{' '}
                <Link
                  href={`/${locale}/projects/debenture-privilege-program`}
                  className="text-primary hover:underline"
                >
                  {work('scb.bullet2Link')}
                </Link>
              </li>
            </ul>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {(['1', '2', '3'] as const).map((n) => (
                <div key={n} className="relative h-24 w-32 shrink-0 overflow-hidden rounded">
                  <Image
                    src={`/work/scb/${n}.JPG`}
                    alt={`SCB Tech X intern photo ${n}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {work('pompkins.company')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {work('pompkins.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {work('pompkins.role')}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {work('pompkins.bullet1')}{' '}
                <Link
                  href={`/${locale}/projects/pompkins-food-ios`}
                  className="text-primary hover:underline"
                >
                  {work('pompkins.bullet1Link')}
                </Link>
              </li>
              <li className="text-sm text-muted-foreground">
                {work('pompkins.bullet2')}{' '}
                <Link
                  href={`/${locale}/projects/pompkins-web`}
                  className="text-primary hover:underline"
                >
                  {work('pompkins.bullet2Link1')}
                </Link>
                {' '}
                <Link
                  href={`/${locale}/projects/pompkins-food-web`}
                  className="text-primary hover:underline"
                >
                  {work('pompkins.bullet2Link2')}
                </Link>
                {' '}
                <Link
                  href={`/${locale}/projects/pompkins-merchant-portal`}
                  className="text-primary hover:underline"
                >
                  {work('pompkins.bullet2Link3')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {edu('title')}
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu('university.name')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu('university.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu('university.degree')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {edu('university.gpa')} · {edu('university.honors')}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {edu('university.ta')}
              </li>
              <li className="text-sm text-muted-foreground">
                {edu('university.volunteer')}{' '}
                <Link
                  href={`/${locale}/blog/ban-yang-pao-volunteer`}
                  className="text-primary hover:underline"
                >
                  {edu('university.volunteerLink')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu('highschool.name')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu('highschool.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu('highschool.program')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {edu('highschool.gpa')}
            </p>
          </div>
        </div>
      </section>

      <embed
        src="/resume.pdf"
        type="application/pdf"
        className="w-full rounded-lg border border-border"
        style={{ height: 'calc(100svh - 10rem)' }}
      />
    </div>
  )
}
