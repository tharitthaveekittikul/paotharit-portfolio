# Screenshots Gallery Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/[locale]/projects/[slug]/screenshots` gallery page and make the `ProjectImageStrip` on project cards a separate click zone linking to it.

**Architecture:** New server-rendered page at `screenshots/page.tsx` reads all project images via the existing `getProjectImages` utility and renders them in a masonry grid using `ZoomableImage`. Project cards on the listing page and home page are restructured so the text block and image strip are two independent `<Link>` elements inside a shared `<div>` wrapper.

**Tech Stack:** Next.js 16 App Router (server components), React 19, Tailwind v4, Vitest + RTL

---

## File Map

| File | Action |
|------|--------|
| `src/app/[locale]/projects/[slug]/screenshots/page.tsx` | Create — gallery page |
| `src/app/[locale]/projects/[slug]/screenshots/__tests__/page.test.tsx` | Create — page tests |
| `src/components/shared/ProjectImageStrip.tsx` | Modify — add hover affordance |
| `src/app/[locale]/projects/page.tsx` | Modify — split card into two links |
| `src/app/[locale]/page.tsx` | Modify — split featured project cards only |

---

## Task 1: Add hover affordance to ProjectImageStrip

**Files:**
- Modify: `src/components/shared/ProjectImageStrip.tsx`

- [ ] **Step 1: Add `transition-[filter] hover:brightness-90` to the outer div**

Open `src/components/shared/ProjectImageStrip.tsx`. Change line 13:

```tsx
// Before
<div className="flex gap-1.5 px-3 pb-3">

// After
<div className="flex gap-1.5 px-3 pb-3 transition-[filter] hover:brightness-90">
```

- [ ] **Step 2: Run existing tests to confirm no regressions**

```bash
npm run test:run -- src/components/shared/__tests__/ProjectImageStrip.test.tsx
```

Expected: all 4 tests pass.

---

## Task 2: Write failing tests for screenshots page

**Files:**
- Create: `src/app/[locale]/projects/[slug]/screenshots/__tests__/page.test.tsx`

- [ ] **Step 1: Create the test directory**

```bash
mkdir -p src/app/\[locale\]/projects/\[slug\]/screenshots/__tests__
```

- [ ] **Step 2: Write failing tests**

Create `src/app/[locale]/projects/[slug]/screenshots/__tests__/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScreenshotsPage from '../page'
import { getProjectImages } from '@/lib/project-images'
import { getAllContent } from '@/lib/content'
import { redirect } from 'next/navigation'

vi.mock('@/lib/project-images')
vi.mock('@/lib/content')
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn() }))

describe('ScreenshotsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to project page when no images exist', async () => {
    vi.mocked(getProjectImages).mockReturnValue([])
    vi.mocked(getAllContent).mockReturnValue([])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'zentri' }),
    })
    render(jsx)

    expect(redirect).toHaveBeenCalledWith('/en/projects/zentri')
  })

  it('renders one img per image returned by getProjectImages', async () => {
    vi.mocked(getProjectImages).mockReturnValue([
      '/projects/zentri/a.png',
      '/projects/zentri/b.png',
      '/projects/zentri/c.png',
    ])
    vi.mocked(getAllContent).mockReturnValue([
      { slug: 'zentri', title: 'Zentri', date: '2024-01-01', description: '', techStack: [], featured: false },
    ])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'zentri' }),
    })
    render(jsx)

    const imgs = document.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
  })

  it('renders back link pointing to the project detail page', async () => {
    vi.mocked(getProjectImages).mockReturnValue(['/projects/zentri/a.png'])
    vi.mocked(getAllContent).mockReturnValue([
      { slug: 'zentri', title: 'Zentri', date: '2024-01-01', description: '', techStack: [], featured: false },
    ])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'zentri' }),
    })
    render(jsx)

    const link = screen.getByRole('link', { name: /← Zentri/i })
    expect(link.getAttribute('href')).toBe('/en/projects/zentri')
  })

  it('falls back to slug as title when project is not found in content', async () => {
    vi.mocked(getProjectImages).mockReturnValue(['/projects/unknown/a.png'])
    vi.mocked(getAllContent).mockReturnValue([])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'unknown' }),
    })
    render(jsx)

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm run test:run -- src/app/\\[locale\\]/projects/\\[slug\\]/screenshots/__tests__/page.test.tsx
```

Expected: FAIL — `Cannot find module '../page'`

---

## Task 3: Implement the screenshots page

**Files:**
- Create: `src/app/[locale]/projects/[slug]/screenshots/page.tsx`

- [ ] **Step 1: Create the page file**

Create `src/app/[locale]/projects/[slug]/screenshots/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getAllContent } from '@/lib/content'
import { getProjectImages } from '@/lib/project-images'
import { ZoomableImage } from '@/components/mdx/ZoomableImage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getAllContent('projects', locale).find(p => p.slug === slug)
  const title = project?.title ?? slug
  return { title: `${title} — ${locale === 'th' ? 'ภาพหน้าจอ' : 'Screenshots'}` }
}

export default async function ScreenshotsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const images = getProjectImages(slug)
  if (images.length === 0) {
    redirect(`/${locale}/projects/${slug}`)
  }

  const project = getAllContent('projects', locale).find(p => p.slug === slug)
  const title = project?.title ?? slug

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/${locale}/projects/${slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← {title}
      </Link>
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <div className="columns-1 gap-4 sm:columns-2">
        {images.map(src => (
          <div key={src} className="mb-4 break-inside-avoid">
            <ZoomableImage src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
npm run test:run -- src/app/\\[locale\\]/projects/\\[slug\\]/screenshots/__tests__/page.test.tsx
```

Expected: all 4 tests pass.

---

## Task 4: Restructure project listing card

**Files:**
- Modify: `src/app/[locale]/projects/page.tsx`

The outer `<Link>` becomes a `<div>`. The text content gets its own `<Link>`. The strip gets its own `<Link>` pointing to `/screenshots`, rendered only when images exist.

- [ ] **Step 1: Replace the card markup**

In `src/app/[locale]/projects/page.tsx`, replace the `projects.map` return value (lines 37–76) with:

```tsx
{projects.map(project => {
  const images = getProjectImages(project.slug)
  return (
    <div
      key={project.slug}
      className="group overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <Link
        href={`/${locale}/projects/${project.slug}`}
        className="block"
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
      </Link>
      {images.length > 0 && (
        <Link href={`/${locale}/projects/${project.slug}/screenshots`}>
          <ProjectImageStrip images={images} />
        </Link>
      )}
    </div>
  )
})}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000/en/projects`. Confirm:
- Hovering the text area shows `group-hover` title color change.
- Hovering the image strip dims it slightly.
- Clicking the text area navigates to the project detail page.
- Clicking the image strip navigates to `/en/projects/[slug]/screenshots`.

---

## Task 5: Restructure featured project cards on home page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

Only the featured projects section changes. The blog posts section (`recentPosts.map`) is left untouched — blog posts have no screenshots page.

- [ ] **Step 1: Replace the featured projects card markup**

In `src/app/[locale]/page.tsx`, replace the `featuredProjects.map` return value (lines 46–68) with:

```tsx
{featuredProjects.map(project => {
  const images = getProjectImages(project.slug)
  return (
    <div
      key={project.slug}
      className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-input"
    >
      <Link href={`/${locale}/projects/${project.slug}`} className="block">
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
      </Link>
      {images.length > 0 && (
        <Link href={`/${locale}/projects/${project.slug}/screenshots`}>
          <ProjectImageStrip images={images} />
        </Link>
      )}
    </div>
  )
})}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/en`. Confirm:
- Clicking the text area of a featured project goes to the project detail page.
- Clicking the image strip of a featured project goes to `/en/projects/[slug]/screenshots`.
- The screenshots page shows all images in a masonry grid with individual zoom.
- Back link on screenshots page returns to the project detail page.
