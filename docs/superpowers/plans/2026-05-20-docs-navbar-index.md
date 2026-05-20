# Docs Navbar Link + Index Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Docs" nav link that leads to `/[locale]/docs` — a new index page listing all projects with technical documentation as clickable cards.

**Architecture:** A new `getDocsProjects(locale)` function reads `content/[locale]/docs/` to discover documented projects dynamically. A new `docs-meta.ts` config maps each project slug to a display title and description. The index page renders cards; clicking one uses the existing redirect in `/docs/[project]/page.tsx` to land on the first doc. The navbar gets one new link using the existing `nav.docs` i18n key.

**Tech Stack:** Next.js 16 App Router, next-intl, Tailwind v4, lucide-react, Vitest + @testing-library/react

---

### Task 1: Add `getDocsProjects` to `src/lib/docs.ts`

**Files:**
- Modify: `src/lib/docs.ts`
- Modify: `src/lib/__tests__/docs.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new `describe` block at the end of `src/lib/__tests__/docs.test.ts`:

```ts
describe('getDocsProjects', () => {
  const { getDocsProjects } = createDocsUtils(FIXTURES)

  it('returns directory names for a locale that has docs', () => {
    expect(getDocsProjects('en')).toEqual(['testproject'])
  })

  it('returns empty array for a locale with no docs directory', () => {
    expect(getDocsProjects('ja')).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/docs.test.ts
```

Expected: FAIL — `getDocsProjects is not a function`

- [ ] **Step 3: Implement `getDocsProjects` inside `createDocsUtils`**

In `src/lib/docs.ts`, add this function inside the `createDocsUtils` body, just before the `return` statement:

```ts
  function getDocsProjects(locale: string): string[] {
    const dir = join(docsRoot, locale, 'docs')
    if (!existsSync(dir)) return []
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  }
```

Update the `return` statement at the end of `createDocsUtils`:

```ts
  return { buildSidebarTree, getDocBySlug, getDocContent, getFirstDocSlug, getDocsProjects }
```

Update the bottom-of-file export to include `getDocsProjects`:

```ts
export const { buildSidebarTree, getDocBySlug, getDocContent, getFirstDocSlug, getDocsProjects } =
  createDocsUtils(DOCS_ROOT)
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/lib/__tests__/docs.test.ts
```

Expected: all tests PASS

---

### Task 2: Create `src/lib/docs-meta.ts`

**Files:**
- Create: `src/lib/docs-meta.ts`
- Create: `src/lib/__tests__/docs-meta.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/docs-meta.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { DOCS_META, getDocsMeta } from '../docs-meta'

describe('DOCS_META', () => {
  it('has entries for all four documented projects', () => {
    expect(DOCS_META).toHaveProperty('zentri')
    expect(DOCS_META).toHaveProperty('docrag')
    expect(DOCS_META).toHaveProperty('utiliship')
    expect(DOCS_META).toHaveProperty('llmsystemtrading')
  })

  it('each entry has a non-empty title and description', () => {
    for (const [, meta] of Object.entries(DOCS_META)) {
      expect(meta.title.length).toBeGreaterThan(0)
      expect(meta.description.length).toBeGreaterThan(0)
    }
  })
})

describe('getDocsMeta', () => {
  it('returns metadata for a known slug', () => {
    expect(getDocsMeta('zentri').title).toBe('Zentri')
  })

  it('falls back to the slug as title for an unknown project', () => {
    const meta = getDocsMeta('unknown-project')
    expect(meta.title).toBe('unknown-project')
    expect(meta.description).toBe('')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/docs-meta.test.ts
```

Expected: FAIL — `Cannot find module '../docs-meta'`

- [ ] **Step 3: Create `src/lib/docs-meta.ts`**

```ts
export type DocsMeta = {
  title: string
  description: string
}

export const DOCS_META: Record<string, DocsMeta> = {
  zentri: {
    title: 'Zentri',
    description: 'Technical architecture and API reference for the Zentri platform.',
  },
  docrag: {
    title: 'DocRAG',
    description: 'System design and API docs for the DocRAG retrieval pipeline.',
  },
  utiliship: {
    title: 'Utiliship',
    description: 'Frontend, API, and DevOps documentation for the Utiliship app.',
  },
  llmsystemtrading: {
    title: 'LLM System Trading',
    description: 'Architecture and implementation notes for the LLM trading system.',
  },
}

export function getDocsMeta(slug: string): DocsMeta {
  return DOCS_META[slug] ?? { title: slug, description: '' }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/lib/__tests__/docs-meta.test.ts
```

Expected: all tests PASS

---

### Task 3: Update i18n messages

**Files:**
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/th.json`

- [ ] **Step 1: Add `nav.docs` and `docsPage` namespace to `src/i18n/messages/en.json`**

Add `"docs": "Docs"` inside the `"nav"` object (between `"projects"` and `"resume"`):

```json
"nav": {
  "home": "Home",
  "blog": "Blog",
  "projects": "Projects",
  "docs": "Docs",
  "resume": "Resume",
  "about": "About"
}
```

Add a new top-level `"docsPage"` object (place it after the `"nav"` block):

```json
"docsPage": {
  "title": "Documentation",
  "description": "Technical write-ups for selected projects."
}
```

- [ ] **Step 2: Add the same keys to `src/i18n/messages/th.json`**

Add `"docs": "เอกสาร"` inside the `"nav"` object:

```json
"nav": {
  "home": "หน้าแรก",
  "blog": "บล็อก",
  "projects": "โปรเจกต์",
  "docs": "เอกสาร",
  "resume": "เรซูเม่",
  "about": "เกี่ยวกับ"
}
```

Add a new top-level `"docsPage"` object:

```json
"docsPage": {
  "title": "เอกสารประกอบ",
  "description": "เอกสารทางเทคนิคสำหรับโปรเจกต์ที่เลือก"
}
```

---

### Task 4: Add Docs link to Header

**Files:**
- Modify: `src/components/shared/Header.tsx`
- Modify: `src/components/shared/__tests__/Header.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a new `it` block inside the existing `describe('Header', ...)` in `Header.test.tsx`:

```ts
it('renders the docs nav link', async () => {
  const { Header } = await import('../Header')
  const jsx = await Header()
  render(jsx)
  expect(screen.getByText('docs').closest('a')).toHaveAttribute('href', '/en/docs')
})
```

Note: the mock `getTranslations` returns the key itself, so `t('docs')` → `'docs'`.

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: FAIL — `Unable to find an element with the text: docs`

- [ ] **Step 3: Add the Docs link to `Header.tsx`**

Inside the `<div className="flex items-center">` block (the one holding Blog and Projects links), insert the Docs link after the Projects `<Link>` and before `<ResumeLink>`:

```tsx
<Link
  href={`/${locale}/docs`}
  className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
>
  {t('docs')}
</Link>
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: all tests PASS

---

### Task 5: Create the docs index page

**Files:**
- Create: `src/app/[locale]/docs/page.tsx`
- Create: `src/app/[locale]/docs/__tests__/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/[locale]/docs/__tests__/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/lib/docs', () => ({
  getDocsProjects: vi.fn().mockReturnValue(['zentri', 'docrag', 'utiliship', 'llmsystemtrading']),
}))

vi.mock('@/lib/docs-meta', () => ({
  getDocsMeta: vi.fn((slug: string) => ({
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Desc for ${slug}`,
  })),
}))

describe('DocsIndexPage', () => {
  it('renders a card for each documented project', async () => {
    const { default: DocsIndexPage } = await import('../page')
    const jsx = await DocsIndexPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('Zentri')).toBeInTheDocument()
    expect(screen.getByText('Docrag')).toBeInTheDocument()
    expect(screen.getByText('Utiliship')).toBeInTheDocument()
    expect(screen.getByText('Llmsystemtrading')).toBeInTheDocument()
  })

  it('each card links to the correct docs route', async () => {
    const { default: DocsIndexPage } = await import('../page')
    const jsx = await DocsIndexPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('Zentri').closest('a')).toHaveAttribute('href', '/en/docs/zentri')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm run test:run -- "src/app/\[locale\]/docs/__tests__/page.test.tsx"
```

Expected: FAIL — `Cannot find module '../page'`

- [ ] **Step 3: Create `src/app/[locale]/docs/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getDocsProjects } from '@/lib/docs'
import { getDocsMeta } from '@/lib/docs-meta'

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('docsPage')
  const projects = getDocsProjects(locale)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {t('title')}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('description')}</p>
      <ul className="mt-10 space-y-4">
        {projects.map((slug) => {
          const meta = getDocsMeta(slug)
          return (
            <li key={slug}>
              <Link
                href={`/${locale}/docs/${slug}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-orange-600 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-orange-500"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{meta.title}</p>
                  {meta.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {meta.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="shrink-0 text-zinc-400" size={16} />
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm run test:run -- "src/app/\[locale\]/docs/__tests__/page.test.tsx"
```

Expected: all tests PASS

- [ ] **Step 5: Run the full suite to check for regressions**

```bash
npm run test:run
```

Expected: all tests PASS

---

### Task 6: Migrate `docs/[project]/layout.tsx` to shared `DOCS_META`

**Files:**
- Modify: `src/app/[locale]/docs/[project]/layout.tsx`

- [ ] **Step 1: Update the import and remove the local map**

Remove these lines:

```ts
const PROJECT_TITLES: Record<string, string> = {
  zentri: 'Zentri',
  docrag: 'DocRAG',
}
```

Add this import at the top of the file:

```ts
import { getDocsMeta } from '@/lib/docs-meta'
```

Replace:

```ts
const title = PROJECT_TITLES[project] ?? project
```

With:

```ts
const title = getDocsMeta(project).title
```

- [ ] **Step 2: Run the full suite**

```bash
npm run test:run
```

Expected: all tests PASS

---

## File map

| Task | Files |
|------|-------|
| 1 | `src/lib/docs.ts`, `src/lib/__tests__/docs.test.ts` |
| 2 | `src/lib/docs-meta.ts`, `src/lib/__tests__/docs-meta.test.ts` |
| 3 | `src/i18n/messages/en.json`, `src/i18n/messages/th.json` |
| 4 | `src/components/shared/Header.tsx`, `src/components/shared/__tests__/Header.test.tsx` |
| 5 | `src/app/[locale]/docs/page.tsx`, `src/app/[locale]/docs/__tests__/page.test.tsx` |
| 6 | `src/app/[locale]/docs/[project]/layout.tsx` |
