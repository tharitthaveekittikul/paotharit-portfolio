import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SearchButton } from "./SearchButton"
import { SocialLinks } from './SocialLinks'
import { EmailLink } from './EmailLink'

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)]">
      <nav className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1.5 backdrop-blur sm:gap-2 sm:px-3 sm:py-2 dark:bg-white">
        <Link
          href={`/${locale}`}
          className="px-1 text-sm font-semibold text-zinc-50 sm:px-2 dark:text-zinc-900"
        >
          paotharit
        </Link>
        <div className="flex items-center">
          <Link
            href={`/${locale}/blog`}
            className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('projects')}
          </Link>
        </div>
        <div data-testid="social-links" className="hidden lg:flex items-center">
          <SocialLinks className="p-2 text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900" />
        </div>
        <div className="flex items-center gap-1">
          <SearchButton />
          <LocaleSwitcher />
          <ThemeToggle />
          <EmailLink />
        </div>
      </nav>
    </header>
  )
}
