'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="text-zinc-400 hover:bg-transparent hover:text-zinc-50 dark:text-zinc-500 dark:hover:bg-transparent dark:hover:text-zinc-900"
    >
      {locale === 'en' ? 'TH' : 'EN'}
    </Button>
  )
}
