'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale() {
    const next = locale === 'en' ? 'th' : 'en'
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale}>
      {locale === 'en' ? 'TH' : 'EN'}
    </Button>
  )
}
