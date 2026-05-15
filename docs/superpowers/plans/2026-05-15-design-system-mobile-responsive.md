# Design System + Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the codebase with DESIGN.md by correcting CSS token values to the orange primary accent, auditing components for visual drift, and adding full mobile responsive support.

**Architecture:** Update shadcn token VALUES in `globals.css` so the orange primary propagates automatically through all components. Add Tailwind responsive prefixes to existing components. For the docs sidebar, create a new `MobileDocsSidebar` client component that wraps the shadcn `Sheet`.

**Tech Stack:** Next.js 16 + Tailwind v4 + shadcn/ui + Vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/globals.css` | Modify | Update `--primary` token values (light + dark) |
| `src/components/shared/Header.tsx` | Modify | Token classes + hide social icons on mobile |
| `src/components/shared/Footer.tsx` | Modify | Token classes |
| `src/app/[locale]/page.tsx` | Modify | Responsive hero type + padding + blog row wrap |
| `src/app/[locale]/docs/[project]/layout.tsx` | Modify | Add MobileDocsSidebar trigger |
| `src/components/docs/MobileDocsSidebar.tsx` | Create | Client Sheet wrapper for mobile sidebar |
| `src/components/shared/__tests__/Header.test.tsx` | Create | Header rendering tests |
| `src/components/docs/__tests__/MobileDocsSidebar.test.tsx` | Create | Sheet trigger + open tests |

---

## Task 1: Update CSS Design Tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update light mode `--primary` token**

In `src/app/globals.css`, inside the `:root` block, change:
```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```
to:
```css
--primary: oklch(0.608 0.206 38.7);
--primary-foreground: oklch(0.985 0 0);
```

- [ ] **Step 2: Update dark mode `--primary` token**

In `src/app/globals.css`, inside the `.dark` block, change:
```css
--primary: oklch(0.922 0 0);
--primary-foreground: oklch(0.205 0 0);
```
to:
```css
--primary: oklch(0.703 0.195 40.5);
--primary-foreground: oklch(0.145 0 0);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Exits with code 0, no errors.

---

## Task 2: Audit and Update Header

**Files:**
- Modify: `src/components/shared/Header.tsx`
- Create: `src/components/shared/__tests__/Header.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/shared/__tests__/Header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

vi.mock('../SearchButton', () => ({ SearchButton: () => <button>Search</button> }))
vi.mock('../LocaleSwitcher', () => ({ LocaleSwitcher: () => <button>Locale</button> }))
vi.mock('../ThemeToggle', () => ({ ThemeToggle: () => <button>Theme</button> }))

describe('Header', () => {
  it('renders the logo link', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    expect(screen.getByText('paotharit')).toBeInTheDocument()
  })

  it('hides social icons on mobile with hidden sm:flex classes', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    const { container } = render(jsx)
    const socialWrapper = container.querySelector('.hidden.sm\\:flex')
    expect(socialWrapper).toBeInTheDocument()
  })

  it('renders all four social links inside the hidden wrapper', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    const { container } = render(jsx)
    const socialWrapper = container.querySelector('.hidden.sm\\:flex')
    const links = socialWrapper?.querySelectorAll('a')
    expect(links?.length).toBe(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- Header.test`
Expected: FAIL — `hidden sm:flex` class not present yet.

- [ ] **Step 3: Replace Header with token classes and mobile social hide**

Replace the full content of `src/components/shared/Header.tsx`:

```tsx
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SearchButton } from "./SearchButton"
import { siGithub, siInstagram, siFacebook } from 'simple-icons'

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-semibold text-foreground"
        >
          paotharit
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/${locale}/blog`}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {t('projects')}
          </Link>
          <div className="mx-2 hidden sm:flex items-center gap-1">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="cursor-pointer p-2.5 text-muted-foreground hover:text-foreground"
              >
                <SocialIcon path={icon.path} label={label} />
              </a>
            ))}
          </div>
          <SearchButton />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- Header.test`
Expected: All 3 tests PASS.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: No errors.

---

## Task 3: Audit and Update Footer

**Files:**
- Modify: `src/components/shared/Footer.tsx`

No new test needed — Footer has no logic, only token class drift.

- [ ] **Step 1: Replace Footer with token classes**

Replace the full content of `src/components/shared/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tharit Thaveekittikul
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Exits with code 0.

---

## Task 4: Update Home Page for Mobile

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Apply responsive hero type, padding, and blog row wrap**

Replace the full content of `src/app/[locale]/page.tsx`:

```tsx
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const featuredProjects = getAllContent('projects', locale).filter(p => p.featured).slice(0, 3)
  const recentPosts = getAllContent('blog', locale).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <section className="mb-20">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-50">
          Tharit Thaveekittikul
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Software engineer building AI systems, trading tools, and developer infrastructure.
        </p>
      </section>

      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Projects
          </h2>
          <div className="space-y-6">
            {featuredProjects.map(project => (
              <Link
                key={project.slug}
                href={`/${locale}/projects/${project.slug}`}
                className="group block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <h3 className="mb-1 font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {project.title}
                </h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 5).map(tech => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Writing
          </h2>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-2"
              >
                <span className="text-zinc-800 group-hover:text-black dark:text-zinc-200 dark:group-hover:text-white">
                  {post.title}
                </span>
                <span className="shrink-0 text-sm text-zinc-400">
                  {new Date(post.date).toLocaleDateString(
                    locale === 'th' ? 'th-TH' : 'en-US',
                    { year: 'numeric', month: 'short' }
                  )}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Exits with code 0.

---

## Task 5: Add Mobile Sheet Drawer to Docs Sidebar

**Files:**
- Create: `src/components/docs/MobileDocsSidebar.tsx`
- Modify: `src/app/[locale]/docs/[project]/layout.tsx`
- Create: `src/components/docs/__tests__/MobileDocsSidebar.test.tsx`

- [ ] **Step 1: Check if shadcn Sheet is installed**

Run: `ls src/components/ui/ | grep sheet`
- If output shows `sheet.tsx`: skip to Step 3.
- If empty: run Step 2.

- [ ] **Step 2: Install shadcn Sheet (only if not already present)**

Run: `npx shadcn@latest add sheet`
Expected: Creates `src/components/ui/sheet.tsx`. Exits with code 0.

- [ ] **Step 3: Write failing test**

Create `src/components/docs/__tests__/MobileDocsSidebar.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MobileDocsSidebar } from '../MobileDocsSidebar'
import type { SidebarNode } from '@/lib/docs'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/en/docs/zentri'),
}))

const mockTree: SidebarNode[] = [
  { type: 'item', label: 'Introduction', href: '/en/docs/zentri/intro' },
]

describe('MobileDocsSidebar', () => {
  it('renders a menu trigger button', () => {
    render(<MobileDocsSidebar tree={mockTree} projectTitle="Zentri" />)
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
  })

  it('opens the sheet and shows project title when trigger is clicked', async () => {
    render(<MobileDocsSidebar tree={mockTree} projectTitle="Zentri" />)
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    expect(await screen.findByText('Zentri')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test:run -- MobileDocsSidebar.test`
Expected: FAIL — `MobileDocsSidebar` module does not exist yet.

- [ ] **Step 5: Create MobileDocsSidebar component**

Create `src/components/docs/MobileDocsSidebar.tsx`:

```tsx
'use client'

import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import type { SidebarNode } from '@/lib/docs'

export function MobileDocsSidebar({
  tree,
  projectTitle,
}: {
  tree: SidebarNode[]
  projectTitle: string
}) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Menu"
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-6">
        <Sidebar tree={tree} projectTitle={projectTitle} />
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 6: Update docs project layout to include mobile trigger**

Replace the full content of `src/app/[locale]/docs/[project]/layout.tsx`:

```tsx
import { getLocale } from 'next-intl/server'
import { buildSidebarTree } from '@/lib/docs'
import { Sidebar } from '@/components/docs'
import { MobileDocsSidebar } from '@/components/docs/MobileDocsSidebar'

const PROJECT_TITLES: Record<string, string> = {
  zentri: 'Zentri',
}

export default async function ProjectDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  const locale = await getLocale()
  const tree = buildSidebarTree(project, locale)
  const title = PROJECT_TITLES[project] ?? project

  return (
    <div className="flex gap-10 py-12">
      <aside className="hidden lg:block shrink-0">
        <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Sidebar tree={tree} projectTitle={title} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <MobileDocsSidebar tree={tree} projectTitle={title} />
        </div>
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test:run -- MobileDocsSidebar.test`
Expected: Both tests PASS.

- [ ] **Step 8: Run full test suite**

Run: `npm run test:run`
Expected: All tests pass, no regressions.

- [ ] **Step 9: Run final build**

Run: `npm run build`
Expected: Exits with code 0.

---

## Success Criteria

- `npm run build` passes with no errors
- `npm run lint` passes
- `npm run test:run` — all tests green
- Orange primary accent visible on interactive elements (buttons, focus rings, active nav states)
- On a 375px viewport: header fits one row (social icons hidden), hero text readable at ~28px
- Docs sidebar accessible via Sheet trigger on mobile
