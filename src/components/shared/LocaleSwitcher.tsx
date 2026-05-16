'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  if (pathname.includes('/docs/')) return null

  function switchLocale() {
    const next = locale === 'en' ? 'th' : 'en'
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
  }

  return (
    <button
      onClick={switchLocale}
      className="cursor-pointer px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-50 dark:focus-visible:ring-zinc-900 rounded-lg"
    >
      {locale === 'en' ? 'TH' : 'EN'}
    </button>
  )
}
