import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { siGithub, siInstagram, siFacebook } from 'simple-icons'

// LinkedIn icon (not available in simple-icons)
const siLinkedin = {
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z'
}

function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={label}
      className="h-4 w-4 fill-current"
    >
      <path d={path} />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { href: 'https://github.com/tharitthaveekittikul', icon: siGithub, label: 'GitHub' },
  { href: 'https://www.instagram.com/paotharit/', icon: siInstagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/tharit.thaveekittikul/', icon: siFacebook, label: 'Facebook' },
  { href: 'https://www.linkedin.com/in/paotharit/', icon: siLinkedin, label: 'LinkedIn' },
]

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
          <div className="mx-2 flex items-center gap-1">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                <SocialIcon path={icon.path} label={label} />
              </a>
            ))}
          </div>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
