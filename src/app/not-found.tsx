import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { BackButton } from '@/components/shared/BackButton'

export default async function NotFound() {
  const locale = await getLocale()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'notFound' })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <p aria-hidden className="text-8xl font-bold text-muted-foreground sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {t('heading')}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        {t('body')}
      </p>
      <div className="mt-6">
        <BackButton label={t('back')} />
      </div>
    </div>
  )
}
