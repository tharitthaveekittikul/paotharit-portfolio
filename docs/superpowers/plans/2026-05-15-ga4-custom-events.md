# GA4 Custom Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GA4 custom event tracking for social media icon clicks, email button clicks, and GitHub project link clicks.

**Architecture:** Header and Footer are server components so can't hold `onClick` handlers. Three focused client components (`SocialLinks`, `EmailLink`, `ProjectGithubLink`) are created and swapped in. All fire `sendGAEvent` from `@next/third-parties/google`. `Frontmatter` type gets an optional `github` field so the project detail page can conditionally render a GitHub button.

**Tech Stack:** Next.js 16 App Router, React 19, `@next/third-parties/google` (`sendGAEvent`), Vitest + @testing-library/react.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/content.ts` | Add `github?: string` to `Frontmatter` |
| Create | `src/components/shared/SocialLinks.tsx` | Client component — social icon links + GA4 tracking |
| Create | `src/components/shared/EmailLink.tsx` | Client component — email button + GA4 tracking |
| Create | `src/components/shared/ProjectGithubLink.tsx` | Client component — project GitHub link + GA4 tracking |
| Modify | `src/components/shared/Header.tsx` | Use `SocialLinks` + `EmailLink` instead of inline |
| Modify | `src/components/shared/Footer.tsx` | Use `SocialLinks` instead of inline |
| Modify | `src/app/[locale]/projects/[slug]/page.tsx` | Render `ProjectGithubLink` when `frontmatter.github` exists |
| Create | `src/components/shared/__tests__/SocialLinks.test.tsx` | Tests for social click events |
| Create | `src/components/shared/__tests__/EmailLink.test.tsx` | Tests for email click event |
| Create | `src/components/shared/__tests__/ProjectGithubLink.test.tsx` | Tests for project github click event |

---

### Task 1: Add `github` field to Frontmatter type

**Files:**
- Modify: `src/lib/content.ts:23`

- [ ] **Step 1: Add `github?: string` to the `Frontmatter` interface**

In `src/lib/content.ts`, add the field after `metrics`:

```ts
export interface Frontmatter {
  title: string
  description: string
  date: string
  updated?: string
  slug?: string
  type: 'blog' | 'project'
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  tags: string[]
  techStack: string[]
  coverImage?: string
  ogImage?: string
  seoTitle?: string
  seoDescription?: string
  role?: string
  duration?: string
  projectStatus?: string
  metrics?: { label: string; value: string }[]
  github?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no new type errors.

---

### Task 2: Create `SocialLinks` client component

**Files:**
- Create: `src/components/shared/SocialLinks.tsx`
- Create: `src/components/shared/__tests__/SocialLinks.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/SocialLinks.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SocialLinks } from '../SocialLinks'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('SocialLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires social_click with platform GitHub on GitHub link click', () => {
    render(<SocialLinks className="p-2" />)
    fireEvent.click(screen.getByRole('link', { name: 'GitHub' }))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'social_click', { platform: 'GitHub' })
  })

  it('fires social_click with platform LinkedIn on LinkedIn link click', () => {
    render(<SocialLinks className="p-2" />)
    fireEvent.click(screen.getByRole('link', { name: 'LinkedIn' }))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'social_click', { platform: 'LinkedIn' })
  })

  it('renders all 4 social links', () => {
    render(<SocialLinks className="p-2" />)
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- SocialLinks
```

Expected: FAIL — `SocialLinks` not found.

- [ ] **Step 3: Create `SocialLinks.tsx`**

Create `src/components/shared/SocialLinks.tsx`:

```tsx
'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { siGithub, siInstagram, siFacebook } from 'simple-icons'

const siLinkedin = {
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
}

const SOCIAL_LINKS = [
  { href: 'https://github.com/tharitthaveekittikul', icon: siGithub, label: 'GitHub' },
  { href: 'https://www.instagram.com/paotharit/', icon: siInstagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/tharit.thaveekittikul/', icon: siFacebook, label: 'Facebook' },
  { href: 'https://www.linkedin.com/in/paotharit/', icon: siLinkedin, label: 'LinkedIn' },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <>
      {SOCIAL_LINKS.map(({ href, icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
          onClick={() => sendGAEvent('event', 'social_click', { platform: label })}
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={label}
            className="h-4 w-4 fill-current"
          >
            <path d={icon.path} />
          </svg>
        </a>
      ))}
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- SocialLinks
```

Expected: 3 tests PASS.

---

### Task 3: Create `EmailLink` client component

**Files:**
- Create: `src/components/shared/EmailLink.tsx`
- Create: `src/components/shared/__tests__/EmailLink.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/EmailLink.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EmailLink } from '../EmailLink'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('EmailLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires email_click event on click', () => {
    render(<EmailLink />)
    fireEvent.click(screen.getByRole('link'))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'email_click')
  })

  it('has correct mailto href', () => {
    render(<EmailLink />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'mailto:tharit.thaveekittikul@gmail.com'
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- EmailLink
```

Expected: FAIL — `EmailLink` not found.

- [ ] **Step 3: Create `EmailLink.tsx`**

Create `src/components/shared/EmailLink.tsx`:

```tsx
'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function EmailLink() {
  return (
    <a
      href="mailto:tharit.thaveekittikul@gmail.com"
      className="ml-1 hidden rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 lg:inline-flex dark:bg-zinc-900 dark:text-white"
      onClick={() => sendGAEvent('event', 'email_click')}
    >
      tharit.thaveekittikul@gmail.com
    </a>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- EmailLink
```

Expected: 2 tests PASS.

---

### Task 4: Create `ProjectGithubLink` client component

**Files:**
- Create: `src/components/shared/ProjectGithubLink.tsx`
- Create: `src/components/shared/__tests__/ProjectGithubLink.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/ProjectGithubLink.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ProjectGithubLink } from '../ProjectGithubLink'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('ProjectGithubLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires project_github_click with project name on click', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    fireEvent.click(screen.getByRole('link'))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'project_github_click', {
      project: 'zentri',
    })
  })

  it('has correct href', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/tharitthaveekittikul/Zentri'
    )
  })

  it('opens in new tab', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- ProjectGithubLink
```

Expected: FAIL — `ProjectGithubLink` not found.

- [ ] **Step 3: Create `ProjectGithubLink.tsx`**

Create `src/components/shared/ProjectGithubLink.tsx`:

```tsx
'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function ProjectGithubLink({ href, project }: { href: string; project: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      onClick={() => sendGAEvent('event', 'project_github_click', { project })}
    >
      View on GitHub
    </a>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- ProjectGithubLink
```

Expected: 3 tests PASS.

---

### Task 5: Update `Header.tsx` to use `SocialLinks` and `EmailLink`

**Files:**
- Modify: `src/components/shared/Header.tsx`

- [ ] **Step 1: Replace inline social icons and email with new components**

Full new content of `src/components/shared/Header.tsx`:

```tsx
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
```

- [ ] **Step 2: Run existing Header tests**

```bash
npm run test:run -- Header
```

Expected: all existing Header tests PASS.

---

### Task 6: Update `Footer.tsx` to use `SocialLinks`

**Files:**
- Modify: `src/components/shared/Footer.tsx`

- [ ] **Step 1: Replace inline social icons with `SocialLinks`**

Full new content of `src/components/shared/Footer.tsx`:

```tsx
import { SocialLinks } from './SocialLinks'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Tharit Thaveekittikul</span>
        <div className="flex items-center gap-1 lg:hidden">
          <SocialLinks className="p-2 hover:text-foreground transition-colors" />
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```

Expected: all tests PASS.

---

### Task 7: Render `ProjectGithubLink` on project detail page

**Files:**
- Modify: `src/app/[locale]/projects/[slug]/page.tsx`

- [ ] **Step 1: Import `ProjectGithubLink` and render it when `frontmatter.github` exists**

Full new content of `src/app/[locale]/projects/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllSlugs, getContent } from '@/lib/content'
import { mdxComponents } from '@/components/mdx'
import { Badge } from '@/components/ui/badge'
import { ProjectGithubLink } from '@/components/shared/ProjectGithubLink'

export async function generateStaticParams() {
  const slugs = getAllSlugs('projects')
  return ['en', 'th'].flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  try {
    const { frontmatter } = getContent('projects', locale, slug)
    return {
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.description,
    }
  } catch {
    return {}
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  let result: ReturnType<typeof getContent>
  try {
    result = getContent('projects', locale, slug)
  } catch {
    notFound()
  }
  const { frontmatter, content } = result!

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
          {frontmatter.description}
        </p>
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={new Date(frontmatter.date).toISOString().slice(0, 10)}>
            {new Date(frontmatter.date).toLocaleDateString(
              locale === 'th' ? 'th-TH' : 'en-US',
              { year: 'numeric' }
            )}
          </time>
          {frontmatter.role && <span>{frontmatter.role}</span>}
          {frontmatter.duration && <span>{frontmatter.duration}</span>}
          {frontmatter.projectStatus && (
            <Badge variant="outline">{frontmatter.projectStatus}</Badge>
          )}
        </div>
        <div className="mb-6 flex flex-wrap gap-1">
          {frontmatter.techStack.map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        {frontmatter.github && (
          <div className="mb-6">
            <ProjectGithubLink href={frontmatter.github} project={slug} />
          </div>
        )}
        {frontmatter.metrics && frontmatter.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
            {frontmatter.metrics.map(metric => (
              <div key={metric.label}>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```

Expected: all tests PASS.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ Compiled successfully` with no errors.
