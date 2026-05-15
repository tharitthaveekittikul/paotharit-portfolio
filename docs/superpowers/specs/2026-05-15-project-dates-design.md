# Project Dates Design

**Date:** 2026-05-15  
**Scope:** Add publish year to project list cards and project detail header

---

## Context

Blog posts already display a locale-aware publish date on both the list and detail pages. Projects have a `date` field in `Frontmatter` and are sorted by it in `getAllContent`, but the date is never rendered in any project UI.

The `Frontmatter` type also defines an optional `updated?: string` field — this is out of scope for this change and will remain unused in the UI.

---

## What Changes

### 1. Projects list page (`src/app/[locale]/projects/page.tsx`)

Add a `<time>` element above each project title showing the **year only** (e.g. `2026`).

- Style: `text-sm text-zinc-400 dark:text-zinc-500` — matches blog list date style
- Position: above the `<h2>` title, inside the existing `<Link>` block
- Format: `{ year: 'numeric' }` — year only, no month or day
- Locale-aware: `locale === 'th' ? 'th-TH' : 'en-US'`
- `dateTime` attribute: ISO date string from `project.date`

Year-only is chosen over full date because projects don't have post-like recency. A bare year gives timeline context without triggering "this looks old" for projects done 1–2 years ago.

### 2. Projects detail page (`src/app/[locale]/projects/[slug]/page.tsx`)

Add a `<time>` element to the existing metadata row (the `flex gap-4` row that already shows role, duration, projectStatus).

- Style: same `text-sm text-zinc-500 dark:text-zinc-400` as siblings
- Format: year only, same as list
- Position: first item in the metadata row (before role)
- Only rendered when `frontmatter.date` is present (it is required in `Frontmatter`, but defensive check costs nothing here via `new Date(frontmatter.date).getFullYear()`)

---

## What Does NOT Change

- Blog pages — already implemented, no changes
- `Frontmatter` type — `date` and `updated` already typed correctly
- `content.ts` — already sorts by date, no changes needed
- `updated` field — remains typed but not displayed
- No tooltips, no relative time, no hover states

---

## Files to Edit

| File | Change |
|------|--------|
| `src/app/[locale]/projects/page.tsx` | Add `<time>` above title in each card |
| `src/app/[locale]/projects/[slug]/page.tsx` | Add `<time>` to metadata row |

---

## Success Criteria

- Projects list shows a year (e.g. `2026`) above each project title
- Projects detail header shows a year in the metadata row
- Both render correctly in EN and TH locales
- No visual regression on blog pages
- `npm run build` passes with no type errors
