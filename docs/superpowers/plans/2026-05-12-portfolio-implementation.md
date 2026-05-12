# Portfolio & Technical Blog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade bilingual (EN/TH) personal portfolio and technical blog using Next.js 16 App Router with full SSG, MDX content, dark/light theming, and Vercel deployment.

**Architecture:** All content stored as `.mdx` files in `/content/[locale]/`, compiled at build time via `next-mdx-remote/rsc`. i18n routing via `next-intl` with `[locale]` URL segments and automatic EN fallback for missing TH content. Zero runtime server — everything generated at `next build`.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind v4, shadcn/ui, next-intl v4, next-mdx-remote, gray-matter, next-themes, @vercel/analytics, simple-icons, mermaid, Vitest, Testing Library

> IMPORTANT: Before implementing any task, read the relevant section of `node_modules/next/dist/docs/` first. Next.js 16 has breaking changes — `params` is now a `Promise` that must be `await`-ed. Heed deprecation warnings.

---

## File Map

| Task | Action | File |
|------|--------|------|
| 1 | Install | `package.json` (deps added) |
| 2 | Create | `vitest.config.ts` |
| 2 | Create | `src/test-setup.ts` |
| 3 | Create | `src/i18n/routing.ts` |
| 3 | Create | `src/i18n/request.ts` |
| 3 | Create | `src/i18n/messages/en.json` |
| 3 | Create | `src/i18n/messages/th.json` |
| 3 | Create | `middleware.ts` |
| 3 | Modify | `next.config.ts` |
| 4 | Modify | `src/app/layout.tsx` (pass-through only) |
| 4 | Create | `src/app/[locale]/layout.tsx` |
| 4 | Delete | `src/app/page.tsx` |
| 5 | Modify | `src/app/globals.css` |
| 6 | Run | `npx shadcn@latest init` |
| 7 | Create | `src/lib/content.ts` |
| 7 | Create | `src/lib/__tests__/content.test.ts` |
| 7 | Create | `content/en/blog/.gitkeep` |
| 7 | Create | `content/en/projects/.gitkeep` |
| 7 | Create | `content/th/blog/.gitkeep` |
| 7 | Create | `content/th/projects/.gitkeep` |
| 8 | Create | `src/components/shared/ThemeToggle.tsx` |
| 8 | Create | `src/components/shared/LocaleSwitcher.tsx` |
| 8 | Create | `src/components/shared/Header.tsx` |
| 8 | Create | `src/components/shared/Footer.tsx` |
| 9 | Create | `src/app/[locale]/page.tsx` |
| 10 | Create | `src/app/[locale]/blog/page.tsx` |
| 10 | Create | `src/app/[locale]/blog/[slug]/page.tsx` |
| 10 | Create | `src/app/[locale]/blog/[slug]/opengraph-image.tsx` |
| 11 | Create | `src/app/[locale]/projects/page.tsx` |
| 11 | Create | `src/app/[locale]/projects/[slug]/page.tsx` |
| 11 | Create | `src/app/[locale]/projects/[slug]/opengraph-image.tsx` |
| 12 | Create | `src/components/mdx/Callout.tsx` |
| 12 | Create | `src/components/mdx/__tests__/Callout.test.tsx` |
| 12 | Create | `src/components/mdx/Mermaid.tsx` |
| 12 | Create | `src/components/mdx/TradingChart.tsx` |
| 12 | Create | `src/components/mdx/index.ts` |
| 13 | Create | `scripts/obsidian-sync.ts` |
| 13 | Create | `scripts/__tests__/obsidian-sync.test.ts` |
| 14 | Create | `.github/workflows/ci.yml` |
| 15 | Create | `content/en/blog/hello-world.mdx` |
| 15 | Create | `content/en/projects/zentri.mdx` |

---

## Task 1: Install Dependencies

**Files:** `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next-intl next-mdx-remote gray-matter next-themes \
  @vercel/analytics simple-icons mermaid lightweight-charts
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom \
  @types/mdx tsx
```

- [ ] **Step 3: Verify no peer-dep errors**

```bash
npm ls next-intl next-mdx-remote gray-matter next-themes
```

Expected: all four packages listed without errors.

---

## Task 2: Configure Vitest

**Files:** `vitest.config.ts`, `src/test-setup.ts`, `package.json`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Create `src/test-setup.ts`**

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to `package.json`**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npm run test:run
```

Expected: `No test files found` — confirms Vitest is wired up, not an error.

---

## Task 3: Configure next-intl i18n

**Files:** `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/messages/en.json`, `src/i18n/messages/th.json`, `middleware.ts`, `next.config.ts`

- [ ] **Step 1: Create `src/i18n/routing.ts`**

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'th'],
  defaultLocale: 'en',
})

export type Locale = (typeof routing.locales)[number]
```

- [ ] **Step 2: Create `src/i18n/request.ts`**

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create `src/i18n/messages/en.json`**

```json
{
  "nav": {
    "home": "Home",
    "blog": "Blog",
    "projects": "Projects",
    "about": "About"
  },
  "blog": {
    "title": "Blog",
    "readMore": "Read more",
    "publishedOn": "Published on",
    "updatedOn": "Updated on"
  },
  "projects": {
    "title": "Projects",
    "viewProject": "View project",
    "status": {
      "inProgress": "In Progress",
      "completed": "Completed",
      "archived": "Archived"
    }
  },
  "common": {
    "backToBlog": "Back to Blog",
    "backToProjects": "Back to Projects",
    "archived": "Archived"
  }
}
```

- [ ] **Step 4: Create `src/i18n/messages/th.json`**

```json
{
  "nav": {
    "home": "หน้าแรก",
    "blog": "บล็อก",
    "projects": "โปรเจกต์",
    "about": "เกี่ยวกับ"
  },
  "blog": {
    "title": "บล็อก",
    "readMore": "อ่านต่อ",
    "publishedOn": "เผยแพร่เมื่อ",
    "updatedOn": "อัปเดตเมื่อ"
  },
  "projects": {
    "title": "โปรเจกต์",
    "viewProject": "ดูโปรเจกต์",
    "status": {
      "inProgress": "กำลังพัฒนา",
      "completed": "เสร็จสมบูรณ์",
      "archived": "เก็บถาวร"
    }
  },
  "common": {
    "backToBlog": "กลับไปบล็อก",
    "backToProjects": "กลับไปโปรเจกต์",
    "archived": "เก็บถาวร"
  }
}
```

- [ ] **Step 5: Create `middleware.ts` at project root**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
```

- [ ] **Step 6: Update `next.config.ts`**

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {}

export default withNextIntl(nextConfig)
```

---

## Task 4: Restructure App Directory for [locale] Routing

**Files:** `src/app/layout.tsx` (modify), `src/app/[locale]/layout.tsx` (create), `src/app/page.tsx` (delete)

> In next-intl with App Router, the `[locale]` layout owns `<html>` and `<body>`. The root layout becomes a minimal pass-through.

- [ ] **Step 1: Replace `src/app/layout.tsx` with a pass-through**

```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 2: Delete `src/app/page.tsx`**

Remove the file — `[locale]/page.tsx` replaces it (created in Task 9).

- [ ] **Step 3: Create `src/app/[locale]/layout.tsx`**

```typescript
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Paotharit — Developer & Builder',
    template: '%s | Paotharit',
  },
  description: 'Personal portfolio and technical blog by Paotharit.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Task 5: Configure Dark Mode (Tailwind v4 + next-themes)

**Files:** `src/app/globals.css`

> Tailwind v4 uses media-query dark mode by default. We override it with `@custom-variant` so `next-themes` class toggling works.

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
/* src/app/globals.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Switch dark mode from media-query to class strategy for next-themes */
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

- [ ] **Step 2: Install typography plugin**

```bash
npm install -D @tailwindcss/typography
```

---

## Task 6: Install and Configure shadcn/ui

- [ ] **Step 1: Run the shadcn init command**

```bash
npx shadcn@latest init
```

When prompted: Style = Default, Base color = Zinc, CSS variables = Yes.

- [ ] **Step 2: Add Badge and Button components**

```bash
npx shadcn@latest add badge button
```

- [ ] **Step 3: Verify components exist**

```bash
ls src/components/ui/
```

Expected: `badge.tsx  button.tsx` present.

---

## Task 7: Build Content Utility (TDD)

**Files:** `src/lib/__tests__/content.test.ts`, `src/lib/content.ts`, content directories

- [ ] **Step 1: Create content directories**

```bash
mkdir -p content/en/blog content/en/projects content/th/blog content/th/projects
touch content/en/blog/.gitkeep content/en/projects/.gitkeep
touch content/th/blog/.gitkeep content/th/projects/.gitkeep
```

- [ ] **Step 2: Create test fixtures**

```bash
mkdir -p src/lib/__tests__/fixtures/content/en/blog
mkdir -p src/lib/__tests__/fixtures/content/th/blog
mkdir -p src/lib/__tests__/fixtures/content/en/projects
```

Create `src/lib/__tests__/fixtures/content/en/blog/hello-world.mdx`:

```mdx
---
title: Hello World
description: My first post
date: 2026-01-01
type: blog
status: published
featured: false
tags: [hello]
techStack: []
---

Hello world content.
```

Create `src/lib/__tests__/fixtures/content/en/blog/draft-post.mdx`:

```mdx
---
title: Draft Post
description: Not published yet
date: 2026-01-02
type: blog
status: draft
featured: false
tags: []
techStack: []
---

Draft content.
```

Create `src/lib/__tests__/fixtures/content/th/blog/hello-world.mdx`:

```mdx
---
title: สวัสดีโลก
description: โพสต์แรกของฉัน
date: 2026-01-01
type: blog
status: published
featured: false
tags: [hello]
techStack: []
---

เนื้อหาภาษาไทย
```

- [ ] **Step 3: Write failing tests in `src/lib/__tests__/content.test.ts`**

```typescript
// src/lib/__tests__/content.test.ts
import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { createContentUtils } from '../content'

const FIXTURE_ROOT = join(__dirname, 'fixtures/content')
const { getAllSlugs, getContent, getAllContent } = createContentUtils(FIXTURE_ROOT)

describe('getAllSlugs', () => {
  it('returns slugs from en/ as source of truth', () => {
    const slugs = getAllSlugs('blog')
    expect(slugs).toContain('hello-world')
    expect(slugs).toContain('draft-post')
  })

  it('returns empty array when directory does not exist', () => {
    const slugs = getAllSlugs('projects')
    expect(slugs).toEqual([])
  })
})

describe('getContent', () => {
  it('returns frontmatter and content for en locale', () => {
    const { frontmatter, content } = getContent('blog', 'en', 'hello-world')
    expect(frontmatter.title).toBe('Hello World')
    expect(content).toContain('Hello world content')
  })

  it('returns TH content when TH file exists', () => {
    const { frontmatter } = getContent('blog', 'th', 'hello-world')
    expect(frontmatter.title).toBe('สวัสดีโลก')
  })

  it('falls back to EN when TH file does not exist', () => {
    const { frontmatter } = getContent('blog', 'th', 'draft-post')
    expect(frontmatter.title).toBe('Draft Post')
  })
})

describe('getAllContent', () => {
  it('returns only published posts sorted by date descending', () => {
    const posts = getAllContent('blog', 'en')
    expect(posts.every(p => p.status === 'published')).toBe(true)
  })

  it('filters out draft posts', () => {
    const posts = getAllContent('blog', 'en')
    expect(posts.find(p => p.slug === 'draft-post')).toBeUndefined()
  })
})
```

- [ ] **Step 4: Run tests — verify FAIL**

```bash
npm run test:run -- src/lib/__tests__/content.test.ts
```

Expected: FAIL — `Cannot find module '../content'`

- [ ] **Step 5: Implement `src/lib/content.ts`**

```typescript
// src/lib/content.ts
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

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
}

export interface ContentItem extends Frontmatter {
  slug: string
}

export function createContentUtils(contentRoot: string) {
  function getAllSlugs(type: 'blog' | 'projects'): string[] {
    const dir = join(contentRoot, 'en', type)
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter(f => f.endsWith('.mdx'))
      .map(f => f.replace('.mdx', ''))
  }

  function getContent(
    type: 'blog' | 'projects',
    locale: string,
    slug: string
  ): { frontmatter: Frontmatter; content: string } {
    const localePath = join(contentRoot, locale, type, `${slug}.mdx`)
    const fallbackPath = join(contentRoot, 'en', type, `${slug}.mdx`)
    const filePath = existsSync(localePath) ? localePath : fallbackPath
    const raw = readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { frontmatter: data as Frontmatter, content }
  }

  function getAllContent(type: 'blog' | 'projects', locale: string): ContentItem[] {
    return getAllSlugs(type)
      .map(slug => {
        const { frontmatter } = getContent(type, locale, slug)
        return { slug, ...frontmatter }
      })
      .filter(item => item.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return { getAllSlugs, getContent, getAllContent }
}

const CONTENT_ROOT = join(process.cwd(), 'content')
export const { getAllSlugs, getContent, getAllContent } = createContentUtils(CONTENT_ROOT)
```

- [ ] **Step 6: Run tests — verify PASS**

```bash
npm run test:run -- src/lib/__tests__/content.test.ts
```

Expected: All 5 tests pass.

---

## Task 8: Build Shared Components

**Files:** `src/components/shared/ThemeToggle.tsx`, `src/components/shared/LocaleSwitcher.tsx`, `src/components/shared/Header.tsx`, `src/components/shared/Footer.tsx`

- [ ] **Step 1: Create `src/components/shared/ThemeToggle.tsx`**

```tsx
// src/components/shared/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render a placeholder until mounted to avoid hydration mismatch
  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  )
}
```

- [ ] **Step 2: Create `src/components/shared/LocaleSwitcher.tsx`**

```tsx
// src/components/shared/LocaleSwitcher.tsx
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
```

- [ ] **Step 3: Create `src/components/shared/Header.tsx`**

```tsx
// src/components/shared/Header.tsx
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
```

- [ ] **Step 4: Create `src/components/shared/Footer.tsx`**

```tsx
// src/components/shared/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} Paotharit Thaveekittikul
      </div>
    </footer>
  )
}
```

---

## Task 9: Build Homepage

**Files:** `src/app/[locale]/page.tsx`

- [ ] **Step 1: Create `src/app/[locale]/page.tsx`**

```tsx
// src/app/[locale]/page.tsx
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const featuredProjects = getAllContent('projects', locale).filter(p => p.featured).slice(0, 3)
  const recentPosts = getAllContent('blog', locale).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <section className="mb-20">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Paotharit Thaveekittikul
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
                className="group flex items-baseline justify-between gap-4"
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

---

## Task 10: Build Blog Routes

**Files:** `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/app/[locale]/blog/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create `src/app/[locale]/blog/page.tsx`**

```tsx
// src/app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บล็อก' : 'Blog' }
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const posts = getAllContent('blog', locale)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {locale === 'th' ? 'บล็อก' : 'Blog'}
      </h1>
      {posts.length === 0 ? (
        <p className="text-zinc-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.slug}>
              <Link href={`/${locale}/blog/${post.slug}`} className="group block">
                <time className="mb-1 block text-sm text-zinc-400">
                  {new Date(post.date).toLocaleDateString(
                    locale === 'th' ? 'th-TH' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </time>
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {post.title}
                </h2>
                <p className="mb-3 text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/blog/[slug]/page.tsx`**

```tsx
// src/app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllSlugs, getContent } from '@/lib/content'
import { mdxComponents } from '@/components/mdx'
import { Badge } from '@/components/ui/badge'

export async function generateStaticParams() {
  const slugs = getAllSlugs('blog')
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
    const { frontmatter } = getContent('blog', locale, slug)
    return {
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.description,
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  let frontmatter: ReturnType<typeof getContent>['frontmatter']
  let content: string
  try {
    ;({ frontmatter, content } = getContent('blog', locale, slug))
  } catch {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <time className="mb-2 block text-sm text-zinc-400">
          {new Date(frontmatter.date).toLocaleDateString(
            locale === 'th' ? 'th-TH' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </time>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <p className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">
          {frontmatter.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {frontmatter.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/blog/[slug]/opengraph-image.tsx`**

```tsx
// src/app/[locale]/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getContent } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const { frontmatter } = getContent('blog', locale, slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 16, color: '#71717a', marginBottom: 16 }}>
          paotharit
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {frontmatter.title}
        </div>
        <div style={{ fontSize: 24, color: '#a1a1aa', maxWidth: 800 }}>
          {frontmatter.description}
        </div>
      </div>
    ),
    size
  )
}
```

---

## Task 11: Build Projects Routes

**Files:** `src/app/[locale]/projects/page.tsx`, `src/app/[locale]/projects/[slug]/page.tsx`, `src/app/[locale]/projects/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create `src/app/[locale]/projects/page.tsx`**

```tsx
// src/app/[locale]/projects/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'โปรเจกต์' : 'Projects' }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const projects = getAllContent('projects', locale)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {locale === 'th' ? 'โปรเจกต์' : 'Projects'}
      </h1>
      {projects.length === 0 ? (
        <p className="text-zinc-500">No projects yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => (
            <Link
              key={project.slug}
              href={`/${locale}/projects/${project.slug}`}
              className="group block rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
                  {project.title}
                </h2>
                {project.projectStatus && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {project.projectStatus}
                  </Badge>
                )}
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.techStack.slice(0, 6).map(tech => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/projects/[slug]/page.tsx`**

```tsx
// src/app/[locale]/projects/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllSlugs, getContent } from '@/lib/content'
import { mdxComponents } from '@/components/mdx'
import { Badge } from '@/components/ui/badge'

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

  let frontmatter: ReturnType<typeof getContent>['frontmatter']
  let content: string
  try {
    ;({ frontmatter, content } = getContent('projects', locale, slug))
  } catch {
    notFound()
  }

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
        {frontmatter.metrics && frontmatter.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
            {frontmatter.metrics.map(metric => (
              <div key={metric.label}>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-500">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/projects/[slug]/opengraph-image.tsx`**

```tsx
// src/app/[locale]/projects/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getContent } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const { frontmatter } = getContent('projects', locale, slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 16, color: '#71717a', marginBottom: 16 }}>
          paotharit · project
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {frontmatter.title}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {frontmatter.techStack.slice(0, 5).map(tech => (
            <div
              key={tech}
              style={{
                background: '#27272a',
                color: '#a1a1aa',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 18,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
```

---

## Task 12: Build MDX Components (TDD for Callout)

**Files:** `src/components/mdx/__tests__/Callout.test.tsx`, `src/components/mdx/Callout.tsx`, `src/components/mdx/Mermaid.tsx`, `src/components/mdx/TradingChart.tsx`, `src/components/mdx/index.ts`

- [ ] **Step 1: Write failing test for Callout**

```tsx
// src/components/mdx/__tests__/Callout.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Callout } from '../Callout'

describe('Callout', () => {
  it('renders children', () => {
    render(<Callout type="info">Test content</Callout>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders the type label', () => {
    render(<Callout type="warning">Watch out</Callout>)
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('applies the correct border color class for abstract type', () => {
    const { container } = render(<Callout type="abstract">text</Callout>)
    expect(container.firstChild).toHaveClass('border-blue-300')
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
npm run test:run -- src/components/mdx/__tests__/Callout.test.tsx
```

Expected: FAIL — `Cannot find module '../Callout'`

- [ ] **Step 3: Implement `src/components/mdx/Callout.tsx`**

```tsx
// src/components/mdx/Callout.tsx
import type { ReactNode } from 'react'

type CalloutType = 'abstract' | 'info' | 'tip' | 'warning' | 'danger' | 'note'

const styles: Record<CalloutType, string> = {
  abstract: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30',
  info:     'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30',
  tip:      'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30',
  warning:  'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/30',
  danger:   'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
  note:     'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/30',
}

interface CalloutProps {
  type: CalloutType
  children: ReactNode
}

export function Callout({ type, children }: CalloutProps) {
  return (
    <div className={`my-4 rounded-lg border-l-4 px-4 py-3 ${styles[type]}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest opacity-70">
        {type}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify PASS**

```bash
npm run test:run -- src/components/mdx/__tests__/Callout.test.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 5: Create `src/components/mdx/Mermaid.tsx`**

> Mermaid requires client-side DOM manipulation. We lazy-import it and use `textContent` (not `innerHTML`) to safely set diagram source before calling `mermaid.run()`.

```tsx
// src/components/mdx/Mermaid.tsx
'use client'

import { useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function render() {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
      if (ref.current) {
        // Use textContent — safe assignment, no HTML parsing
        ref.current.textContent = chart
        await mermaid.run({ nodes: [ref.current] })
      }
    }
    render()
  }, [chart])

  return <div ref={ref} className="my-6 overflow-x-auto" />
}
```

- [ ] **Step 6: Create `src/components/mdx/TradingChart.tsx`**

```tsx
// src/components/mdx/TradingChart.tsx
'use client'

import { useEffect, useRef } from 'react'

interface TradingChartProps {
  symbol: string
  height?: number
}

export function TradingChart({ symbol, height = 300 }: TradingChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function render() {
      const { createChart } = await import('lightweight-charts')
      if (!ref.current) return

      const chart = createChart(ref.current, {
        height,
        layout: {
          background: { color: 'transparent' },
          textColor: '#71717a',
        },
        grid: {
          vertLines: { color: '#27272a' },
          horzLines: { color: '#27272a' },
        },
      })

      const series = chart.addLineSeries({ color: '#3b82f6' })
      // Static placeholder data — replace with real data fetching as needed
      series.setData([
        { time: '2024-01-01', value: 100 },
        { time: '2024-02-01', value: 120 },
        { time: '2024-03-01', value: 110 },
        { time: '2024-04-01', value: 140 },
      ])
      chart.timeScale().fitContent()
      cleanup = () => chart.remove()
    }

    render()
    return () => cleanup?.()
  }, [height])

  return (
    <div className="my-6">
      <p className="mb-2 text-sm text-zinc-500">{symbol}</p>
      <div ref={ref} />
    </div>
  )
}
```

- [ ] **Step 7: Create `src/components/mdx/index.ts`**

```typescript
// src/components/mdx/index.ts
import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'

export { Callout, Mermaid, TradingChart }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
}
```

---

## Task 13: Build Obsidian Sync Script (TDD)

**Files:** `scripts/__tests__/obsidian-sync.test.ts`, `scripts/obsidian-sync.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// scripts/__tests__/obsidian-sync.test.ts
import { describe, it, expect } from 'vitest'
import { convertWikiLinks, convertCallouts, buildFrontmatter } from '../obsidian-sync'

describe('convertWikiLinks', () => {
  it('converts simple wiki-links to markdown links', () => {
    expect(convertWikiLinks('See [[Architecture]] for details.')).toBe(
      'See [Architecture](Architecture) for details.'
    )
  })

  it('converts aliased wiki-links', () => {
    expect(convertWikiLinks('See [[Architecture|the architecture doc]].')).toBe(
      'See [the architecture doc](Architecture).'
    )
  })

  it('leaves normal markdown links untouched', () => {
    const input = '[link](https://example.com)'
    expect(convertWikiLinks(input)).toBe(input)
  })
})

describe('convertCallouts', () => {
  it('converts Obsidian abstract callout to JSX', () => {
    const input = '> [!abstract] Title\n> Content here\n'
    const result = convertCallouts(input)
    expect(result).toContain('<Callout type="abstract">')
    expect(result).toContain('Content here')
    expect(result).toContain('</Callout>')
  })

  it('converts warning callout', () => {
    const input = '> [!warning]\n> Watch out\n'
    expect(convertCallouts(input)).toContain('<Callout type="warning">')
  })
})

describe('buildFrontmatter', () => {
  it('preserves title and tags', () => {
    const fm = { title: 'Test', tags: ['ai'], status: 'approved', created: '2026-01-01' }
    const result = buildFrontmatter(fm, 'test-slug')
    expect(result.title).toBe('Test')
    expect(result.tags).toEqual(['ai'])
  })

  it('maps non-published obsidian status to draft', () => {
    const result = buildFrontmatter({ title: 'Test', status: 'planning' }, 'test-slug')
    expect(result.status).toBe('draft')
  })

  it('maps obsidian created field to date', () => {
    const result = buildFrontmatter({ title: 'Test', created: '2026-04-22' }, 'test-slug')
    expect(result.date).toBe('2026-04-22')
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npm run test:run -- scripts/__tests__/obsidian-sync.test.ts
```

Expected: FAIL — `Cannot find module '../obsidian-sync'`

- [ ] **Step 3: Implement `scripts/obsidian-sync.ts`**

```typescript
// scripts/obsidian-sync.ts
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, basename, extname } from 'path'
import matter from 'gray-matter'
import { stringify } from 'yaml'

export function convertWikiLinks(content: string): string {
  // [[Page|Alias]] → [Alias](Page)
  content = content.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '[$2]($1)')
  // [[Page]] → [Page](Page)
  content = content.replace(/\[\[([^\]]+)\]\]/g, '[$1]($1)')
  return content
}

export function convertCallouts(content: string): string {
  return content.replace(
    /^> \[!(\w+)\][^\n]*\n((?:^> [^\n]*\n?)*)/gm,
    (_match, type: string, body: string) => {
      const inner = body
        .split('\n')
        .map(line => line.replace(/^> ?/, ''))
        .join('\n')
        .trim()
      return `<Callout type="${type.toLowerCase()}">\n${inner}\n</Callout>\n`
    }
  )
}

export function buildFrontmatter(
  obsidianFm: Record<string, unknown>,
  slug: string
): Record<string, unknown> {
  const publishedStatuses = ['published', 'approved', 'done']
  return {
    title: obsidianFm.title ?? slug,
    description: obsidianFm.description ?? '',
    date: obsidianFm.created ?? new Date().toISOString().split('T')[0],
    ...(obsidianFm.updated ? { updated: obsidianFm.updated } : {}),
    slug,
    type: obsidianFm.type ?? 'project',
    status: publishedStatuses.includes(String(obsidianFm.status ?? ''))
      ? 'published'
      : 'draft',
    featured: obsidianFm.featured ?? false,
    tags: obsidianFm.tags ?? [],
    techStack: obsidianFm.techStack ?? [],
  }
}

function processFile(sourcePath: string, outputDir: string, outputSlug: string): void {
  const raw = readFileSync(sourcePath, 'utf-8')
  const { data: obsidianFm, content } = matter(raw)

  const newFm = buildFrontmatter(obsidianFm, outputSlug)
  let newContent = convertWikiLinks(content)
  newContent = convertCallouts(newContent)

  const fmString = stringify(newFm).trim()
  const output = `---\n${fmString}\n---\n\n${newContent.trim()}\n`

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, `${outputSlug}.mdx`), output)
  console.log(`OK ${outputSlug}.mdx`)
}

function copyImages(sourceAttachments: string, targetDir: string): void {
  if (!existsSync(sourceAttachments)) return
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  mkdirSync(targetDir, { recursive: true })
  for (const file of readdirSync(sourceAttachments)) {
    if (imageExts.includes(extname(file).toLowerCase())) {
      copyFileSync(join(sourceAttachments, file), join(targetDir, file))
      console.log(`image: ${file}`)
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const source = args[args.indexOf('--source') + 1]
  const output = args[args.indexOf('--output') + 1]
  const includeIdx = args.indexOf('--include')
  const includes = includeIdx !== -1
    ? args.slice(includeIdx + 1).filter(a => !a.startsWith('--'))
    : []

  if (!source || !output || includes.length === 0) {
    console.error('Usage: tsx scripts/obsidian-sync.ts --source <path> --include file1.md --output <path>')
    process.exit(1)
  }

  for (const file of includes) {
    const sourcePath = join(source, file)
    if (!existsSync(sourcePath)) {
      console.warn(`Not found: ${file}`)
      continue
    }
    const slug = basename(file, extname(file))
      .toLowerCase()
      .replace(/\s+/g, '-')
    processFile(sourcePath, output, slug)
  }

  copyImages(
    join(source, 'Attachments'),
    join(process.cwd(), 'public/images', basename(output))
  )
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npm run test:run -- scripts/__tests__/obsidian-sync.test.ts
```

Expected: All 7 tests pass.

- [ ] **Step 5: Add sync script to `package.json`**

```json
"sync": "tsx scripts/obsidian-sync.ts"
```

---

## Task 14: Add GitHub Actions CI

**Files:** `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:run
```

---

## Task 15: Add Sample Content and Verify Build

**Files:** `content/en/blog/hello-world.mdx`, `content/en/projects/zentri.mdx`

- [ ] **Step 1: Create `content/en/blog/hello-world.mdx`**

````mdx
---
title: "Hello World"
description: "First post on the new portfolio — testing MDX, syntax highlighting, and custom components."
date: 2026-05-12
type: blog
status: published
featured: false
tags: [meta, nextjs, mdx]
techStack: []
---

Welcome to the blog. This post tests all the custom MDX components.

## Callout Test

<Callout type="info">
  This is an info callout. Obsidian `> [!info]` blocks convert to this.
</Callout>

<Callout type="warning">
  This is a warning. Use it for gotchas and caveats.
</Callout>

## Mermaid Test

<Mermaid chart={`
graph TD
  A[Write in Obsidian] --> B[Run sync script]
  B --> C[git push]
  C --> D[Vercel deploys]
`} />

## Code Block Test

```typescript
const hello = (name: string) => `Hello, ${name}!`
```
````

- [ ] **Step 2: Create `content/en/projects/zentri.mdx`**

````mdx
---
title: "Zentri: AI-Powered Financial OS"
description: "An open-source, privacy-first financial OS that aggregates assets and uses LLMs to deliver institutional-grade analysis — running locally via Docker."
date: 2026-04-22
type: project
status: published
featured: true
tags: [ai, llm, trading, finance, python, nextjs]
techStack: [nextjs, python, fastapi, postgresql, redis, docker, ollama]
role: "Solo Developer"
duration: "Ongoing"
projectStatus: "In Progress"
metrics:
  - { label: "Asset Classes", value: "5" }
  - { label: "LLM Providers", value: "4" }
  - { label: "Analysis Latency", value: "< 3s" }
---

## The Problem

Managing a portfolio across Thai stocks, US equities, crypto, mutual funds, and gold requires
jumping between five different apps — none of which talk to each other, and none of which give
you a plain-language answer to: *what should I do right now?*

## System Architecture

<Mermaid chart={`
graph TD
  UI[Next.js Frontend] --> API[FastAPI Backend]
  API --> Redis[Redis Queue]
  Redis --> Worker[ARQ Worker]
  Worker --> PG[(PostgreSQL)]
  Worker --> Chroma[(ChromaDB)]
  Worker --> LLM[LLM Provider]
`} />

## Key Technical Decisions

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Job queue | Redis + ARQ | Celery | Simpler, no separate broker |
| Vector store | ChromaDB | Pinecone | Local-first, zero cost |
| LLM routing | Two-tier | Single model | Cost vs quality trade-off |

## What I'd Do Differently

Start with the data pipeline before the UI. I spent two weeks building a beautiful dashboard
before realising the data ingestion was unreliable — polish means nothing without trustworthy
data underneath.
````

- [ ] **Step 3: Run the full test suite**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 4: Run the build**

```bash
npm run build
```

Expected: Build succeeds. Output shows static pages for `/en`, `/th`, `/en/blog`, `/en/blog/hello-world`, `/en/projects`, `/en/projects/zentri`, and their `/th` counterparts.

- [ ] **Step 5: Start dev server and verify golden path**

```bash
npm run dev
```

Open `http://localhost:3000` — should redirect to `/en`. Check:
- [ ] Homepage shows Zentri project card with tech stack badges
- [ ] Dark/light toggle switches theme
- [ ] EN/TH switcher changes URL to `/th/` and shows Thai nav labels
- [ ] `/en/blog/hello-world` renders Callout components and Mermaid diagram
- [ ] `/en/projects/zentri` renders metrics grid and system architecture diagram
- [ ] OG image at `/en/blog/hello-world/opengraph-image` returns a 1200×630 PNG

---

## Task 16: OWASP Security Hardening

**Files:** `next.config.ts` (modify), `.github/workflows/ci.yml` (modify), `scripts/obsidian-sync.ts` (modify)

> Relevant OWASP Top 10 for a static portfolio: A03 (Injection/XSS), A05 (Security Misconfiguration), A06 (Vulnerable Components). The others (A01 Auth, A02 Crypto, A07 AuthN, A10 SSRF) don't apply — no auth, no database, no user input, no server-side requests.

- [ ] **Step 1: Add security headers to `next.config.ts`**

Replace the existing `next.config.ts` with:

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "connect-src 'self' *.vercel-insights.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
```

> Note: `'unsafe-inline'` and `'unsafe-eval'` are required for Mermaid.js and next-themes. If you later remove these libraries, tighten the CSP.

- [ ] **Step 2: Add `npm audit` to CI**

In `.github/workflows/ci.yml`, add after the `Install dependencies` step:

```yaml
      - name: Security audit
        run: npm audit --audit-level=high
```

Full updated jobs section:

```yaml
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=high

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:run
```

- [ ] **Step 3: Add path traversal guard to `scripts/obsidian-sync.ts`**

In `obsidian-sync.ts`, replace the `if (require.main === module)` CLI block's validation section:

```typescript
if (require.main === module) {
  const args = process.argv.slice(2)
  const source = args[args.indexOf('--source') + 1]
  const output = args[args.indexOf('--output') + 1]
  const includeIdx = args.indexOf('--include')
  const includes = includeIdx !== -1
    ? args.slice(includeIdx + 1).filter(a => !a.startsWith('--'))
    : []

  if (!source || !output || includes.length === 0) {
    console.error('Usage: tsx scripts/obsidian-sync.ts --source <path> --include file1.md --output <path>')
    process.exit(1)
  }

  // Guard: --output must stay within the project directory
  const { resolve } = await import('path')
  const projectRoot = process.cwd()
  const resolvedOutput = resolve(output)
  if (!resolvedOutput.startsWith(projectRoot)) {
    console.error(`--output must be within the project directory (${projectRoot})`)
    process.exit(1)
  }

  for (const file of includes) {
    const sourcePath = join(source, file)
    if (!existsSync(sourcePath)) {
      console.warn(`Not found: ${file}`)
      continue
    }
    const slug = basename(file, extname(file))
      .toLowerCase()
      .replace(/\s+/g, '-')
    processFile(sourcePath, resolvedOutput, slug)
  }

  copyImages(
    join(source, 'Attachments'),
    join(projectRoot, 'public/images', basename(resolvedOutput))
  )
}
```

- [ ] **Step 4: Verify headers in dev**

```bash
npm run dev
```

Then in a new terminal:

```bash
curl -I http://localhost:3000/en
```

Expected output includes:
```
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
content-security-policy: default-src 'self'; ...
```

---

## Self-Review

- [x] Architecture → Tasks 1, 3–5
- [x] Folder structure → all file paths match spec exactly
- [x] Frontmatter schema → `Frontmatter` interface in `content.ts` (Task 7)
- [x] Locale fallback → `createContentUtils` fallback logic (Task 7)
- [x] Dynamic routing → `generateStaticParams` in Tasks 10–11
- [x] MDX components → Task 12 (Callout TDD, Mermaid safe `textContent`, TradingChart)
- [x] OG images → `opengraph-image.tsx` in Tasks 10–11
- [x] Analytics → `<Analytics />` in `[locale]/layout.tsx` (Task 4)
- [x] Case study framework → sample `zentri.mdx` (Task 15)
- [x] Deploy → Task 14 (CI), Vercel auto-deploys on push to main
- [x] Obsidian sync → Task 13 (TDD, allowlist-only, no secret exposure)
- [x] `params` awaited in all Next.js 16 page/layout components
- [x] No git commit steps (user manages git manually)
- [x] `textContent` used instead of `innerHTML` in Mermaid (XSS safe)
- [x] Type names consistent: `Frontmatter`, `ContentItem`, `createContentUtils` used across all tasks
- [x] OWASP A03 (XSS/Injection) → CSP headers + Mermaid `textContent` + allowlist sync script
- [x] OWASP A05 (Misconfiguration) → security headers in `next.config.ts` (Task 16)
- [x] OWASP A06 (Vulnerable Components) → `npm audit --audit-level=high` in CI (Task 16)
- [x] OWASP A03 path traversal → output path guard in `obsidian-sync.ts` (Task 16)
