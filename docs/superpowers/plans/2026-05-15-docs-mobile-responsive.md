# Docs Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix sidebar scroll on desktop and add floating mobile controls (sidebar toggle, ToC dropdown, repositioned copy button) to the docs layout.

**Architecture:** Four targeted changes across three files plus one new component. The desktop layout is untouched — all mobile changes are gated behind responsive class breakpoints (`lg:hidden`, `xl:hidden`, `sm:hidden`/`sm:block`). The new `MobileTableOfContents` component mirrors the existing `TableOfContents` pattern but adds a floating button + popover.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, lucide-react, shadcn/ui Sheet

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/[locale]/docs/[project]/layout.tsx` | Fix sticky sidebar scroll; move sidebar toggle to fixed float |
| Modify | `src/components/docs/MobileDocsSidebar.tsx` | Style trigger as a floating icon button |
| Create | `src/components/docs/MobileTableOfContents.tsx` | Floating ToC icon + dropdown popover for mobile |
| Modify | `src/components/docs/index.ts` | Export `MobileTableOfContents` |
| Modify | `src/app/[locale]/docs/[project]/[...slug]/page.tsx` | Add mobile ToC; reposition copy button |

---

## Task 1: Fix desktop sidebar sticky scroll

**Files:**
- Modify: `src/app/[locale]/docs/[project]/layout.tsx`

The root cause: `sticky top-24` is on an inner `div` inside a flex child `<aside>`. Because the flex default is `align-items: stretch`, the aside stretches to the full height of the flex container (= article height), so sticky never fires and `overflow-y-auto` has nothing to scroll. Fix: move `sticky top-24` and add `self-start` to the `<aside>` itself.

- [ ] **Step 1: Open and read the file**

Open `src/app/[locale]/docs/[project]/layout.tsx` — confirm the current structure matches:
```tsx
<aside className="hidden lg:block shrink-0">
  <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1 ...">
```

- [ ] **Step 2: Move sticky to aside**

Replace the `<aside>` and its inner `<div>` with:
```tsx
<aside className="hidden lg:block shrink-0 self-start sticky top-24">
  <div className="h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    <Sidebar tree={tree} projectTitle={title} />
  </div>
</aside>
```

- [ ] **Step 3: Verify dev server renders correctly**

Run `npm run dev`. Navigate to any doc page on a wide screen (≥ 1024px). Scroll the page — the sidebar should remain fixed on screen while the content scrolls. If the sidebar content is longer than the viewport, scrolling within the sidebar area should work.

---

## Task 2: Style `MobileDocsSidebar` trigger as floating icon button

**Files:**
- Modify: `src/components/docs/MobileDocsSidebar.tsx`

The trigger button will be placed in a `fixed` wrapper in `layout.tsx` (Task 3). Here we update its visual style to match a floating action button (rounded, bordered, shadow-sm) instead of the plain inline icon.

- [ ] **Step 1: Update the SheetTrigger className**

Replace the current `SheetTrigger` className:
```tsx
<SheetTrigger
  aria-label="Menu"
  className="inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground hover:text-foreground"
>
```
With:
```tsx
<SheetTrigger
  aria-label="Open navigation"
  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
>
```

- [ ] **Step 2: Verify no visual regressions**

The component itself renders nothing until placed in a container — visual check happens in Task 3 after layout.tsx is updated.

---

## Task 3: Float the sidebar toggle in layout.tsx

**Files:**
- Modify: `src/app/[locale]/docs/[project]/layout.tsx`

Remove the current inline `<div className="mb-4 lg:hidden"><MobileDocsSidebar .../></div>` wrapper from inside `<main>`. Replace with a `fixed bottom-6 left-6 z-40 lg:hidden` container outside the flex row.

- [ ] **Step 1: Remove inline wrapper from inside main**

In `layout.tsx`, delete:
```tsx
<div className="mb-4 lg:hidden">
  <MobileDocsSidebar tree={tree} projectTitle={title} />
</div>
```

- [ ] **Step 2: Add floating fixed wrapper**

After the closing `</div>` of the outer flex container, add:
```tsx
<div className="fixed bottom-6 left-6 z-40 lg:hidden">
  <MobileDocsSidebar tree={tree} projectTitle={title} />
</div>
```

The full updated `layout.tsx` should look like:
```tsx
import { setRequestLocale } from 'next-intl/server'
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
  params: Promise<{ locale: string; project: string }>
}) {
  const { locale, project } = await params
  setRequestLocale(locale)
  const tree = buildSidebarTree(project, locale)
  const title = PROJECT_TITLES[project] ?? project

  return (
    <>
      <div className="flex gap-10 py-12">
        <aside className="hidden lg:block shrink-0 self-start sticky top-24">
          <div className="h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Sidebar tree={tree} projectTitle={title} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
      <div className="fixed bottom-6 left-6 z-40 lg:hidden">
        <MobileDocsSidebar tree={tree} projectTitle={title} />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify on mobile**

In browser devtools, set viewport to 375px width. Navigate to a doc page. A circular button should appear fixed at the bottom-left. Tapping it should open the sidebar Sheet drawer from the left. The button must not appear on desktop (≥ 1024px).

---

## Task 4: Create `MobileTableOfContents` component

**Files:**
- Create: `src/components/docs/MobileTableOfContents.tsx`

Floating fixed icon button (top-right, mobile only) that opens a dropdown popover listing all headings. Active heading tracked via IntersectionObserver — same logic as the existing `TableOfContents`. Closes on outside click or heading tap.

- [ ] **Step 1: Create the file**

Create `src/components/docs/MobileTableOfContents.tsx` with this content:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { List } from 'lucide-react'
import type { Heading } from '@/lib/docs'

export function MobileTableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    )
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="fixed top-[5.5rem] right-4 z-40 xl:hidden" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Table of contents"
        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        <List className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              On this page
            </p>
          </div>
          <ul className="pb-2">
            {headings.map(h => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={e => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setOpen(false)
                  }}
                  style={{ paddingLeft: h.level === 3 ? '1.5rem' : '1rem' }}
                  className={`block py-2.5 pr-4 text-sm transition-colors ${
                    activeId === h.id
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the file saved correctly**

Check that the file exists at `src/components/docs/MobileTableOfContents.tsx` and imports compile (no TypeScript errors).

---

## Task 5: Export `MobileTableOfContents` from the docs index

**Files:**
- Modify: `src/components/docs/index.ts`

- [ ] **Step 1: Add the export**

Append to `src/components/docs/index.ts`:
```ts
export { MobileTableOfContents } from './MobileTableOfContents'
```

The full file should now read:
```ts
export { Sidebar } from './Sidebar'
export { TableOfContents } from './TableOfContents'
export { CopyMarkdownButton } from './CopyMarkdownButton'
export { MobileTableOfContents } from './MobileTableOfContents'
```

---

## Task 6: Update `page.tsx` — mobile ToC + copy button repositioning

**Files:**
- Modify: `src/app/[locale]/docs/[project]/[...slug]/page.tsx`

Two changes:
1. Import and render `MobileTableOfContents` (fixed float, rendered outside the article flow).
2. Hide `CopyMarkdownButton` from the top bar on mobile; show it below `<h1>` on mobile only.

- [ ] **Step 1: Update the import line**

Replace:
```tsx
import { TableOfContents, CopyMarkdownButton } from '@/components/docs'
```
With:
```tsx
import { TableOfContents, CopyMarkdownButton, MobileTableOfContents } from '@/components/docs'
```

- [ ] **Step 2: Hide copy button from top bar on mobile**

Replace:
```tsx
<CopyMarkdownButton content={content} filename={frontmatter.title} />
```
(inside the `mb-6 flex items-center justify-between` div) with:
```tsx
<div className="hidden sm:block">
  <CopyMarkdownButton content={content} filename={frontmatter.title} />
</div>
```

- [ ] **Step 3: Add copy button below h1 on mobile + render mobile ToC**

Replace:
```tsx
<h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
  {frontmatter.title}
</h1>
```
With:
```tsx
<h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
  {frontmatter.title}
</h1>
<div className="mb-8 sm:hidden">
  <CopyMarkdownButton content={content} filename={frontmatter.title} />
</div>
```

- [ ] **Step 4: Add `MobileTableOfContents` to the JSX**

After the closing `</div>` of the outer `flex gap-8` wrapper, add:
```tsx
<MobileTableOfContents headings={headings} />
```

The final return should look like:
```tsx
return (
  <>
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 pb-[100vh]">
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-xs text-zinc-500 dark:text-zinc-400">
            <span>Docs</span>
            {' / '}
            <span className="capitalize">{project}</span>
            {' / '}
            <span>{frontmatter.title}</span>
          </nav>
          <div className="hidden sm:block">
            <CopyMarkdownButton content={content} filename={frontmatter.title} />
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <div className="mb-8 sm:hidden">
          <CopyMarkdownButton content={content} filename={frontmatter.title} />
        </div>
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  rehypeExtractMermaid,
                  [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
                ],
              },
            }}
          />
        </div>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
    <MobileTableOfContents headings={headings} />
  </>
)
```

- [ ] **Step 5: Verify full feature on mobile**

Run `npm run dev`. In devtools at 375px:
- Bottom-left: circular sidebar toggle button visible, opens Sheet on tap
- Top-right: circular ToC button visible, opens dropdown with headings on tap, active heading highlights as you scroll, closes on outside click
- Below h1: copy page button visible
- Top bar: copy button hidden

At ≥ 640px (`sm`): copy button moves back to top bar, disappears from below h1.
At ≥ 1024px (`lg`): floating sidebar toggle disappears.
At ≥ 1280px (`xl`): floating ToC button disappears, desktop ToC aside appears.

- [ ] **Step 6: Run lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 7: Run type check**

```bash
npx tsc --noEmit
```
Expected: no errors.
