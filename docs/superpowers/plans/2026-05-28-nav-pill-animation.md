# Nav Pill Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sliding pill indicator to the header nav that tracks hover and persists on the active page route.

**Architecture:** Extract nav links from `Header.tsx` (server component) into a new `NavLinks.tsx` client component. `NavLinks` uses `usePathname()` for active route detection and `getBoundingClientRect` on `data-navkey` span wrappers to position an absolutely-placed pill that transitions smoothly. `ResumeLink` is not modified — each nav item is wrapped in a `<span data-navkey="...">` so measurement is uniform across all link types.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, next-intl, Vitest + Testing Library

---

## File Map

| File | Action |
|------|--------|
| `src/components/shared/NavLinks.tsx` | Create — client component owning pill logic |
| `src/components/shared/__tests__/NavLinks.test.tsx` | Create — unit tests |
| `src/components/shared/Header.tsx` | Modify — replace nav links block with `<NavLinks>` |
| `src/components/shared/__tests__/Header.test.tsx` | Modify — add NavLinks mock |

---

## Task 1: Create NavLinks tests (TDD)

**Files:**
- Create: `src/components/shared/__tests__/NavLinks.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const mockPathname = vi.fn().mockReturnValue('/en/blog')

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('../ResumeLink', () => ({
  ResumeLink: ({ label, href, className }: { label: string; href: string; className?: string }) => (
    <a href={href} className={className}>{label}</a>
  ),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const defaultProps = {
  locale: 'en',
  labels: {
    blog: 'Blog',
    projects: 'Projects',
    docs: 'Docs',
    about: 'About',
    resume: 'Resume',
  },
  resumeHref: '/en/resume',
}

describe('NavLinks', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/en/blog')
    vi.resetModules()
  })

  it('renders all nav links with correct hrefs', async () => {
    const { NavLinks } = await import('../NavLinks')
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/en/blog')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/en/projects')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/en/docs')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about')
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/en/resume')
  })

  it('applies active text class to the link matching the current pathname', async () => {
    const { NavLinks } = await import('../NavLinks')
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveClass('text-zinc-50')
  })

  it('applies active text class to projects when pathname is /en/projects', async () => {
    mockPathname.mockReturnValue('/en/projects')
    const { NavLinks } = await import('../NavLinks')
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveClass('text-zinc-50')
  })

  it('shifts active text class to hovered link on mouseenter', async () => {
    const { NavLinks } = await import('../NavLinks')
    render(<NavLinks {...defaultProps} />)
    const projectsLink = screen.getByRole('link', { name: 'Projects' })
    fireEvent.mouseEnter(projectsLink.closest('[data-navkey="projects"]')!)
    expect(projectsLink).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveClass('text-zinc-50')
  })

  it('restores active text class on mouseleave from container', async () => {
    const { NavLinks } = await import('../NavLinks')
    const { container } = render(<NavLinks {...defaultProps} />)
    const navContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Projects' }).closest('[data-navkey="projects"]')!)
    fireEvent.mouseLeave(navContainer)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveClass('text-zinc-50')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail (component doesn't exist yet)**

```bash
npm run test:run -- NavLinks
```

Expected: FAIL — `Cannot find module '../NavLinks'`

---

## Task 2: Implement NavLinks.tsx

**Files:**
- Create: `src/components/shared/NavLinks.tsx`

- [ ] **Step 3: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ResumeLink } from './ResumeLink'

type LinkKey = 'blog' | 'projects' | 'docs' | 'about' | 'resume'

type NavLinksProps = {
  locale: string
  labels: Record<LinkKey, string>
  resumeHref: string
}

const LINK_KEYS: LinkKey[] = ['blog', 'projects', 'docs', 'about', 'resume']

export function NavLinks({ locale, labels, resumeHref }: NavLinksProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredKey, setHoveredKey] = useState<LinkKey | null>(null)
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null)

  const activeKey = LINK_KEYS.find(k => pathname.startsWith(`/${locale}/${k}`)) ?? null
  const displayKey = hoveredKey ?? activeKey

  useEffect(() => {
    const container = containerRef.current
    if (!displayKey || !container) { setPillStyle(null); return }
    const el = container.querySelector<HTMLElement>(`[data-navkey="${displayKey}"]`)
    if (!el) { setPillStyle(null); return }
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    setPillStyle({ left: eRect.left - cRect.left, width: eRect.width })
  }, [displayKey])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (!displayKey) return
      const el = container.querySelector<HTMLElement>(`[data-navkey="${displayKey}"]`)
      if (!el) return
      const cRect = container.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      setPillStyle({ left: eRect.left - cRect.left, width: eRect.width })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [displayKey])

  const textClass = (key: LinkKey) =>
    displayKey === key ? 'text-zinc-50 dark:text-zinc-900' : 'text-zinc-400 dark:text-zinc-500'

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseLeave={() => setHoveredKey(null)}
    >
      {pillStyle && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 rounded-full bg-zinc-700 transition-all duration-150 ease-out dark:bg-zinc-200"
          style={{ left: pillStyle.left, width: pillStyle.width }}
        />
      )}
      <span
        data-navkey="blog"
        className="inline-flex"
        onMouseEnter={() => setHoveredKey('blog')}
      >
        <Link
          href={`/${locale}/blog`}
          className={`relative z-10 px-1.5 py-1 text-sm sm:px-3 ${textClass('blog')}`}
        >
          {labels.blog}
        </Link>
      </span>
      <span
        data-navkey="projects"
        className="inline-flex"
        onMouseEnter={() => setHoveredKey('projects')}
      >
        <Link
          href={`/${locale}/projects`}
          className={`relative z-10 px-1.5 py-1 text-sm sm:px-3 ${textClass('projects')}`}
        >
          {labels.projects}
        </Link>
      </span>
      <span
        data-navkey="docs"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey('docs')}
      >
        <Link
          href={`/${locale}/docs`}
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass('docs')}`}
        >
          {labels.docs}
        </Link>
      </span>
      <span
        data-navkey="about"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey('about')}
      >
        <Link
          href={`/${locale}/about`}
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass('about')}`}
        >
          {labels.about}
        </Link>
      </span>
      <span
        data-navkey="resume"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey('resume')}
      >
        <ResumeLink
          label={labels.resume}
          href={resumeHref}
          location="nav"
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass('resume')}`}
        />
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Run NavLinks tests — all should pass**

```bash
npm run test:run -- NavLinks
```

Expected: PASS (5 tests)

---

## Task 3: Update Header.tsx

**Files:**
- Modify: `src/components/shared/Header.tsx`

- [ ] **Step 5: Replace the nav links block with `<NavLinks>`**

In `src/components/shared/Header.tsx`, replace the entire `<div className="flex items-center">` block (lines 24–59) with:

```tsx
<NavLinks
  locale={locale}
  labels={{
    blog: t('blog'),
    projects: t('projects'),
    docs: t('docs'),
    about: t('about'),
    resume: t('resume'),
  }}
  resumeHref={`/${locale}/resume`}
/>
```

Also add the import at the top of the file:

```tsx
import { NavLinks } from './NavLinks'
```

And remove the now-unused `ResumeLink` import from Header.tsx.

The `MobileMenu` invocation stays exactly where it is — it is NOT inside `NavLinks`. After the edit, `Header.tsx` should look like:

```tsx
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SearchButton } from "./SearchButton"
import { SocialLinks } from './SocialLinks'
import { EmailLink } from './EmailLink'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)]">
      <nav className="flex items-center gap-1 overflow-hidden rounded-full bg-zinc-900 px-2 py-1.5 backdrop-blur sm:gap-2 sm:px-3 sm:py-2 dark:bg-white">
        <Link
          href={`/${locale}`}
          className="px-1 text-sm font-semibold text-zinc-50 sm:px-2 dark:text-zinc-900"
        >
          paotharit
        </Link>
        <NavLinks
          locale={locale}
          labels={{
            blog: t('blog'),
            projects: t('projects'),
            docs: t('docs'),
            about: t('about'),
            resume: t('resume'),
          }}
          resumeHref={`/${locale}/resume`}
        />
        <MobileMenu
          locale={locale}
          labels={{ docs: t('docs'), about: t('about'), resume: t('resume'), moreLinks: t('moreLinks') }}
          resumeHref={`/${locale}/resume`}
        />
        <div data-testid="social-links" className="hidden lg:flex items-center">
          <SocialLinks className="p-2 text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900" />
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <SearchButton />
          <LocaleSwitcher />
          <ThemeToggle />
          <EmailLink />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 6: Add NavLinks mock to Header.test.tsx**

In `src/components/shared/__tests__/Header.test.tsx`, add this mock alongside the existing ones:

```tsx
vi.mock('../NavLinks', () => ({
  NavLinks: ({ labels }: { labels: Record<string, string> }) => (
    <div data-testid="nav-links">
      <a href="/en/blog">{labels.blog}</a>
      <a href="/en/projects">{labels.projects}</a>
      <a href="/en/docs">{labels.docs}</a>
      <a href="/en/about">{labels.about}</a>
    </div>
  ),
}))
```

- [ ] **Step 7: Run the full test suite**

```bash
npm run test:run
```

Expected: all existing Header tests pass, all new NavLinks tests pass. Zero failures.

- [ ] **Step 8: Start the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000/en` in a browser and verify:
1. The pill appears under the active nav link on page load
2. The pill slides smoothly to other links on hover
3. The pill returns to the active link on mouse-out
4. Navigating to `/en/blog`, `/en/projects`, `/en/about`, `/en/docs` each show the pill on the correct link
5. No layout shift on mobile (pill links are hidden on mobile)
