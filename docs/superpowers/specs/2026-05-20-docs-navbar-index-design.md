# Design: Docs Navbar Link + Index Page

**Date:** 2026-05-20  
**Status:** Approved

## Goal

Surface the docs section in the primary navbar so visitors who don't explore individual projects can still discover that the portfolio includes written technical documentation. Clicking "Docs" in the nav shows a project listing; clicking a project card enters that project's docs immediately.

---

## Routing

| Path | Behavior |
|------|----------|
| `/{locale}/docs` | New index page — lists all projects with docs |
| `/{locale}/docs/[project]` | Existing — redirects to first doc slug |
| `/{locale}/docs/[project]/[...slug]` | Existing — renders doc page with sidebar |

No existing routes are changed.

---

## Nav change

Add `"Docs"` link to `src/components/shared/Header.tsx` between Projects and Resume. Matches existing link style (`text-zinc-400 hover:text-zinc-50`). Hidden on mobile below `sm` if the navbar becomes too wide — same treatment as Resume.

Translation key: `nav.docs`  
- EN: `"Docs"`  
- TH: `"เอกสาร"`

---

## Shared metadata config

Create `src/lib/docs-meta.ts` — single source of truth for per-project display data used by both the index page and `docs/[project]/layout.tsx`.

```ts
export type DocsMeta = {
  title: string
  description: string
}

export const DOCS_META: Record<string, DocsMeta> = {
  zentri: {
    title: 'Zentri',
    description: '...',
  },
  docrag: {
    title: 'DocRAG',
    description: '...',
  },
  utiliship: {
    title: 'Utiliship',
    description: '...',
  },
  llmsystemtrading: {
    title: 'LLM System Trading',
    description: '...',
  },
}
```

`docs/[project]/layout.tsx` replaces its local `PROJECT_TITLES` map with a lookup against `DOCS_META`.

---

## Index page

**File:** `src/app/[locale]/docs/page.tsx`

- Server component — no `"use client"`
- Calls `setRequestLocale(locale)` at the top
- Reads `content/[locale]/docs/` directory to get the list of project slugs (dynamic, not hardcoded)
- Renders a heading + grid of project cards
- Each card: project title (from `DOCS_META`), one-line description, right-pointing chevron
- Card click → `/{locale}/docs/[project]` (existing redirect handles first-doc navigation)
- Falls back gracefully if a slug has no entry in `DOCS_META` (shows formatted slug as title, empty description)

**i18n namespace:** `docsPage`  
- `docsPage.title` — page heading  
  - EN: `"Documentation"`  
  - TH: `"เอกสารประกอบ"`  
- `docsPage.description` — subtitle  
  - EN: `"Technical write-ups for selected projects."`  
  - TH: `"เอกสารทางเทคนิคสำหรับโปรเจกต์ที่เลือก"`

---

## Card design

Uses the existing `card` token from DESIGN.md:
- Background `surface-card`, border `hairline`, padding 20px, radius `rounded-lg`
- Title: `heading` typography style
- Description: `body-md` typography, color `muted`
- Chevron icon (16px, color `muted`) aligned right
- Hover: border shifts to `primary` color (consistent with interactive cards elsewhere)
- No box shadow

---

## Testing

- `src/app/[locale]/docs/__tests__/page.test.tsx`
- Verifies all 4 project cards render with correct titles
- Mocks `fs.readdirSync` at the system boundary (reads `content/` directory)
- Follows existing Vitest + `@testing-library/react` pattern

---

## Files to create / modify

| Action | File |
|--------|------|
| Create | `src/lib/docs-meta.ts` |
| Create | `src/app/[locale]/docs/page.tsx` |
| Create | `src/app/[locale]/docs/__tests__/page.test.tsx` |
| Modify | `src/components/shared/Header.tsx` |
| Modify | `src/app/[locale]/docs/[project]/layout.tsx` |
| Modify | `src/i18n/messages/en.json` |
| Modify | `src/i18n/messages/th.json` |

---

## Out of scope

- Doc search across projects
- Doc count / last-updated metadata on cards
- Tech stack badges on cards
- Mobile hamburger menu changes
