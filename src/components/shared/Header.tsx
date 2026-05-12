import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-semibold text-zinc-900 dark:text-zinc-50"
        >
          paotharit
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/${locale}/blog`}
            className="px-3 py-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="px-3 py-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t('projects')}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
