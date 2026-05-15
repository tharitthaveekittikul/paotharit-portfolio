# Command Palette Design

**Date:** 2026-05-13  
**Status:** Approved  
**Feature:** Global search + command palette for paotharit portfolio

---

## Overview

A global command palette triggered by `Cmd+K` / `Ctrl+K` (or a header search button) that searches blog posts, projects, docs pages, and doc section headings — and also executes actions like toggling the theme or switching locale.

---

## Architecture

### Search Index API

**Route:** `src/app/api/search/route.ts`  
**Method:** GET, `force-static` (cached at build time)  
**Query param:** `locale` (e.g. `?locale=en`)

Returns a flat JSON array of `SearchEntry`:

```ts
type SearchEntry = {
  type: 'blog' | 'project' | 'doc' | 'section' | 'action'
  title: string
  description?: string
  tags?: string[]
  href: string
  breadcrumb?: string
}
```

**Index sources:**

| Type | Source utility | Fields |
|------|---------------|--------|
| `blog` | `getAllContent('blog', locale)` | title, description, tags, href = `/[locale]/blog/[slug]` |
| `project` | `getAllContent('projects', locale)` | title, description, tags, href = `/[locale]/projects/[slug]` |
| `doc` | `buildSidebarTree` + `getDocBySlug` | title, description, breadcrumb, href = `/[locale]/docs/[project]/[...slug]` |
| `section` | `extractHeadings` per doc page | heading text, parent breadcrumb, href = doc href + `#heading-id` |
| `action` | hardcoded | Toggle Theme, Switch Locale, Go to Blog, Go to Projects |

Doc sections use the existing `extractHeadings` function from `src/lib/docs.ts`. Each heading becomes a separate `section` entry with `href = docHref#headingId`.

---

## Components

### `CommandPaletteProvider`
**File:** `src/components/shared/CommandPaletteProvider.tsx`  
**Type:** Client component (context provider)

Exposes `{ open, setOpen }` via React context. Wraps `src/app/[locale]/layout.tsx`. Also registers the global `Cmd+K` / `Ctrl+K` keydown listener.

### `CommandPalette`
**File:** `src/components/shared/CommandPalette.tsx`  
**Type:** Client component  
**Library:** `cmdk`

- Renders a modal overlay when `open === true`
- On first open: fetches `/api/search?locale=[locale]`, stores result in a `useRef` (persists across re-renders without re-fetching)
- `cmdk` handles client-side fuzzy filtering as the user types
- Results grouped in display order: **Actions → Blog → Projects → Docs → Sections**
- Each result shows: title + description/breadcrumb snippet + type badge
- Selecting an entry: `router.push(href)` then `setOpen(false)`
- Section entries navigate to `href#heading-id` so the browser scrolls to that heading
- `Escape` closes the palette

### `SearchButton`
**File:** `src/components/shared/SearchButton.tsx`  
**Type:** Client component

A small icon button using `lucide-react`'s `Search` icon. Calls `setOpen(true)` from `CommandPaletteProvider` context. Added to the Header next to `ThemeToggle`.

---

## Modified Files

| File | Change |
|------|--------|
| `src/app/[locale]/layout.tsx` | Wrap children with `<CommandPaletteProvider>` |
| `src/components/shared/Header.tsx` | Add `<SearchButton />` next to `<ThemeToggle />` |

---

## Data Flow

```
User presses Cmd+K (or Ctrl+K, or clicks SearchButton)
  → CommandPaletteProvider: setOpen(true)
  → CommandPalette renders
  → If first open: fetch /api/search?locale=en → cache in ref
  → User types → cmdk filters entries client-side (no network)
  → User selects entry:
      - action type → call handler (toggleTheme / switchLocale / navigate)
      - any other type → router.push(href) → setOpen(false)
  → Escape → setOpen(false)
```

---

## Edge Cases

- **Locale-aware:** index is fetched with current locale; all hrefs include `/[locale]/`
- **Section anchors:** `href` for section entries is `docHref#headingId`, triggering native browser scroll
- **Actions:** Theme toggle calls existing theme handler; locale switch navigates to the same path in the other locale
- **Empty state:** "No results" message shown when query matches nothing
- **Index cache:** stored in a `useRef` inside `CommandPalette` — persists for the session, fetched at most once per locale

---

## New Dependencies

- `cmdk` — command palette primitives for React

---

## New Files Summary

```
src/app/api/search/route.ts
src/components/shared/CommandPalette.tsx
src/components/shared/CommandPaletteProvider.tsx
src/components/shared/SearchButton.tsx
```
