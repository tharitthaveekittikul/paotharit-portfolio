# Project Image Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clickable lightbox to project detail page screenshots, and auto-detected image strip to project cards on the listing and home pages.

**Architecture:** A `getProjectImages(slug)` utility scans `public/projects/<slug>/` at build time (server-side `fs`). Pages call this and pass the result as `images: string[]` to a presentational `ProjectImageStrip` component. The existing `ZoomableImage` MDX component is registered as a named component so MDX JSX can reference it directly.

**Tech Stack:** Next.js 16 App Router (server components), Vitest + @testing-library/react, Tailwind v4, existing `ZoomableImage` component.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/project-images.ts` | Scan folder, return sorted image paths |
| Create | `src/lib/__tests__/project-images.test.ts` | Unit tests for above |
| Create | `src/components/shared/ProjectImageStrip.tsx` | Presentational 4-tile horizontal strip |
| Create | `src/components/shared/__tests__/ProjectImageStrip.test.tsx` | Unit tests for above |
| Modify | `src/components/mdx/ZoomableImage.tsx` | Merge className prop with defaults |
| Modify | `src/components/mdx/index.ts` | Register `ZoomableImage` as named MDX component |
| Modify | `src/app/[locale]/projects/page.tsx` | Add `ProjectImageStrip` to listing cards |
| Modify | `src/app/[locale]/page.tsx` | Add `ProjectImageStrip` to home featured cards |
| Modify | `content/en/projects/zentri.mdx` | Replace `<img>` with `<ZoomableImage>` in screenshots section |

---

## Task 1: `getProjectImages` Utility

**Files:**
- Create: `src/lib/project-images.ts`
- Create: `src/lib/__tests__/project-images.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/project-images.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

vi.mock('fs')

describe('getProjectImages', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns sorted image paths filtered to image extensions', async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(
      ['z.png', 'a.jpg', 'b.webp', 'readme.md', '.DS_Store'] as unknown as fs.Dirent[]
    )
    const { getProjectImages } = await import('../project-images')
    expect(getProjectImages('zentri')).toEqual([
      '/projects/zentri/a.jpg',
      '/projects/zentri/b.webp',
      '/projects/zentri/z.png',
    ])
  })

  it('returns empty array when folder does not exist', async () => {
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    })
    const { getProjectImages } = await import('../project-images')
    expect(getProjectImages('missing')).toEqual([])
  })

  it('returns empty array for folder with no image files', async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(
      ['.DS_Store', 'readme.md'] as unknown as fs.Dirent[]
    )
    const { getProjectImages } = await import('../project-images')
    expect(getProjectImages('zentri')).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/lib/__tests__/project-images.test.ts
```

Expected: FAIL — "Cannot find module '../project-images'"

- [ ] **Step 3: Implement the utility**

Create `src/lib/project-images.ts`:

```typescript
import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export function getProjectImages(slug: string): string[] {
  const dir = path.join(process.cwd(), 'public', 'projects', slug)
  try {
    return fs
      .readdirSync(dir)
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(String(f)).toLowerCase()))
      .map(String)
      .sort()
      .map(f => `/projects/${slug}/${f}`)
  } catch {
    return []
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- src/lib/__tests__/project-images.test.ts
```

Expected: 3 tests PASS

---

## Task 2: `ProjectImageStrip` Component

**Files:**
- Create: `src/components/shared/ProjectImageStrip.tsx`
- Create: `src/components/shared/__tests__/ProjectImageStrip.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/shared/__tests__/ProjectImageStrip.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectImageStrip } from '../ProjectImageStrip'

describe('ProjectImageStrip', () => {
  it('renders nothing when images array is empty', () => {
    const { container } = render(<ProjectImageStrip images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all images when count is 4 or fewer', () => {
    const images = [
      '/projects/zentri/a.png',
      '/projects/zentri/b.png',
      '/projects/zentri/c.png',
    ]
    render(<ProjectImageStrip images={images} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })

  it('shows overflow count on 4th tile when more than 4 images', () => {
    const images = Array.from({ length: 9 }, (_, i) => `/projects/zentri/${i}.png`)
    render(<ProjectImageStrip images={images} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(4)
    expect(screen.getByText('+6')).toBeDefined()
  })

  it('shows exactly 4 tiles with no overflow when total is exactly 4', () => {
    const images = Array.from({ length: 4 }, (_, i) => `/projects/zentri/${i}.png`)
    render(<ProjectImageStrip images={images} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(4)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/shared/__tests__/ProjectImageStrip.test.tsx
```

Expected: FAIL — "Cannot find module '../ProjectImageStrip'"

- [ ] **Step 3: Implement `ProjectImageStrip`**

Create `src/components/shared/ProjectImageStrip.tsx`:

```tsx
interface ProjectImageStripProps {
  images: string[]
}

export function ProjectImageStrip({ images }: ProjectImageStripProps) {
  if (images.length === 0) return null

  const showOverlay = images.length > 4
  const tiles = images.slice(0, 4)
  const overflowCount = images.length - 3

  return (
    <div className="flex h-24 border-t border-zinc-200 dark:border-zinc-800">
      {tiles.map((src, i) => {
        const isOverflowTile = showOverlay && i === 3
        return (
          <div key={src} className="relative flex-1 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" role="img" className="h-full w-full object-cover" />
            {isOverflowTile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-sm font-medium text-white">+{overflowCount}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/shared/__tests__/ProjectImageStrip.test.tsx
```

Expected: 4 tests PASS

---

## Task 3: Wire Strip into Projects Listing Page

**Files:**
- Modify: `src/app/[locale]/projects/page.tsx`

- [ ] **Step 1: Restructure card and add strip**

Replace the full file content of `src/app/[locale]/projects/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContent } from '@/lib/content'
import { getProjectImages } from '@/lib/project-images'
import { Badge } from '@/components/ui/badge'
import { ProjectImageStrip } from '@/components/shared/ProjectImageStrip'

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
        <p className="text-zinc-500 dark:text-zinc-400">No projects yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map(project => {
            const images = getProjectImages(project.slug)
            return (
              <Link
                key={project.slug}
                href={`/${locale}/projects/${project.slug}`}
                className="group block overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="p-6">
                  <time
                    dateTime={new Date(project.date).toISOString().slice(0, 10)}
                    className="mb-1 block text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    {new Date(project.date).toLocaleDateString(
                      locale === 'th' ? 'th-TH' : 'en-US',
                      { year: 'numeric' }
                    )}
                  </time>
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
                </div>
                <ProjectImageStrip images={images} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build has no TypeScript errors**

```bash
npm run lint
```

Expected: no errors

---

## Task 4: Wire Strip into Home Page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add strip to featured project cards**

Replace the full file content of `src/app/[locale]/page.tsx`:

```tsx
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { getProjectImages } from '@/lib/project-images'
import { Badge } from '@/components/ui/badge'
import { ResumeLink } from '@/components/shared/ResumeLink'
import { ProjectImageStrip } from '@/components/shared/ProjectImageStrip'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('nav')
  const featuredProjects = getAllContent('projects', locale).filter(p => p.featured).slice(0, 3)
  const recentPosts = getAllContent('blog', locale).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <section className="mb-20">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Tharit Thaveekittikul
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Software engineer building AI systems, trading tools, and developer infrastructure.
        </p>
        <ResumeLink
          label={t('resume')}
          href={`/${locale}/resume`}
          location="hero"
          className="mt-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        />
      </section>

      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Projects
          </h2>
          <div className="space-y-6">
            {featuredProjects.map(project => {
              const images = getProjectImages(project.slug)
              return (
                <Link
                  key={project.slug}
                  href={`/${locale}/projects/${project.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-input"
                >
                  <div className="p-5">
                    <h3 className="mb-1 font-semibold text-foreground group-hover:text-foreground">
                      {project.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 5).map(tech => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ProjectImageStrip images={images} />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Writing
          </h2>
          <div className="space-y-4">
            {recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-2"
              >
                <span className="text-foreground group-hover:text-foreground">
                  {post.title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
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

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors

---

## Task 5: Fix `ZoomableImage` className Merging + Register as Named MDX Component

**Files:**
- Modify: `src/components/mdx/ZoomableImage.tsx`
- Modify: `src/components/mdx/index.ts`

- [ ] **Step 1: Update `ZoomableImage` to merge className**

Replace the full content of `src/components/mdx/ZoomableImage.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

interface ZoomableImageProps {
  src?: string
  alt?: string
  className?: string
  [key: string]: unknown
}

export function ZoomableImage({ src, alt = '', className, ...props }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  if (!src) return null

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in rounded-lg${className ? ` ${className}` : ''}`}
        onClick={() => setIsOpen(true)}
        title="Click to enlarge"
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
      {isOpen && (
        <div
          className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="cursor-pointer absolute right-5 top-5 rounded-full p-1 text-white/80 transition-colors hover:text-white"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Register `ZoomableImage` as a named MDX component**

Replace the full content of `src/components/mdx/index.ts`:

```typescript
import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { CodeBlock } from './CodeBlock'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'
import { ZoomableImage } from './ZoomableImage'

export { Callout, CodeBlock, Mermaid, TradingChart, ZoomableImage }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
  ZoomableImage,
  img: ZoomableImage as MDXComponents['img'],
  pre: (props) => {
    if ((props as Record<string, unknown>)['data-mermaid']) {
      const child = props.children as React.ReactElement<{ children?: string }>
      const chart = React.isValidElement(child) ? (child.props?.children ?? '') : ''
      return React.createElement(Mermaid, { chart })
    }
    const child = props.children as React.ReactElement<{ className?: string; children?: string }>
    if (React.isValidElement(child) && child.props?.className === 'language-mermaid') {
      return React.createElement(Mermaid, { chart: child.props.children ?? '' })
    }
    return React.createElement(CodeBlock, props)
  },
}
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors

---

## Task 6: Update Zentri MDX Screenshots to Use `<ZoomableImage>`

**Files:**
- Modify: `content/en/projects/zentri.mdx`

> **Note:** `content/` is synced from Obsidian. Apply the same change in your Obsidian source to prevent revert on next `npm run sync`.

- [ ] **Step 1: Replace `<img>` with `<ZoomableImage>` in the screenshots section**

In `content/en/projects/zentri.mdx`, replace the entire `## Screenshots` section:

```mdx
## Screenshots

<div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
  <figure>
    <ZoomableImage src="/projects/zentri/overview-page.png" alt="Overview dashboard" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Overview Dashboard</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/portfolio-page.png" alt="Portfolio breakdown" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Portfolio Breakdown</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/chat-page.png" alt="AI chat interface" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">AI Chat</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/ai-usage-page.png" alt="AI usage and token tracking" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">AI Usage</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/events-page.png" alt="IPO and dividend events calendar" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Events Calendar</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/transaction-page.png" alt="Transaction history" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Transactions</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/watchlist-page.png" alt="Watchlist with AI thesis" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Watchlist</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/pipeline-page.png" alt="Background job pipeline" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Background Pipeline</figcaption>
  </figure>
  <figure>
    <ZoomableImage src="/projects/zentri/settings-general-page.png" alt="General settings" className="border border-zinc-200 dark:border-zinc-800" />
    <figcaption className="mt-1 text-center text-xs text-zinc-500">Settings</figcaption>
  </figure>
</div>
```

- [ ] **Step 2: Start dev server and verify both features work**

```bash
npm run dev
```

Check:
1. `http://localhost:3000/en` — featured project cards show image strip
2. `http://localhost:3000/en/projects` — all project cards show image strip (only Zentri has images)
3. `http://localhost:3000/en/projects/zentri` — clicking any screenshot opens full-screen lightbox; Escape or click-outside closes it
