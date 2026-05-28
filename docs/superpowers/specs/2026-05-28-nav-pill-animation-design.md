# Nav Pill Animation Design

**Date:** 2026-05-28  
**Status:** Approved

## Goal

Add a sliding pill indicator to the header navigation that tracks hover state and persists on the active page route.

## Components

### `Header.tsx` (unchanged structure)
Remains a server component. Passes `locale` and translated labels as props to `NavLinks`. The `MobileMenu` and utility controls (search, locale switcher, theme toggle, email) stay directly in `Header`.

### `NavLinks.tsx` (new client component)
`"use client"` — owns all pill logic.

**Props:**
```ts
type NavLinksProps = {
  locale: string
  labels: {
    blog: string
    projects: string
    docs: string
    about: string
    resume: string
  }
  resumeHref: string
}
```

**Behaviour:**
- `usePathname()` derives the active link key by matching the current pathname against `/${locale}/<slug>`
- One `useRef` per link stored in a refs object keyed by link key
- `hoveredKey` state (`string | null`) — set on `onMouseEnter`, cleared on `onMouseLeave` of the container
- `displayKey = hoveredKey ?? activeKey` — pill always follows hover, falls back to active page
- On `displayKey` change: read `offsetLeft` + `offsetWidth` from the target ref, update pill position via inline styles
- First render: pill jumps to active position with no transition (set via a `mounted` flag — transition class is only applied after first mount to avoid slide-in on page load)
- `ResizeObserver` on the container recalculates pill position on viewport resize

**Pill element:**
- `<span>` absolutely positioned inside the `relative` link container
- Styles: `absolute inset-y-1 rounded-full bg-zinc-700 dark:bg-zinc-200`
- Transition: `transition-all duration-150 ease-out` (applied after mount only)
- Z-index: behind link text (`-z-10` or `z-0` with links at `z-10`)

**Links:**
| Key | Route | Visibility |
|-----|-------|------------|
| blog | `/${locale}/blog` | always |
| projects | `/${locale}/projects` | always |
| docs | `/${locale}/docs` | `hidden sm:inline-flex` |
| about | `/${locale}/about` | `hidden sm:inline-flex` |
| resume | `/${locale}/resume` | `hidden sm:inline-flex` |

Active link text stays white (`text-zinc-50 dark:text-zinc-900`); inactive links remain muted (`text-zinc-400 dark:text-zinc-500`).

## Scope

- Logo link (`paotharit`) excluded from pill — it is a brand mark, not a nav item
- `MobileMenu` stays in `Header.tsx` — separate mobile-only control
- No new dependencies

## Files to Change

| File | Action |
|------|--------|
| `src/components/shared/NavLinks.tsx` | Create |
| `src/components/shared/Header.tsx` | Replace nav links div with `<NavLinks>` |
