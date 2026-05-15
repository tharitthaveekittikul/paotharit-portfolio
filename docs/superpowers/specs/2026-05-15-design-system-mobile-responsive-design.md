# Design System Implementation + Mobile Responsive

**Date:** 2026-05-15
**Status:** Approved

## Goal

Align the codebase with DESIGN.md by correcting the CSS token values, auditing components for visual drift, and adding full mobile responsive support across all pages.

## Approach

Option B: Token fix + mobile + full component audit. Update shadcn token values in `globals.css` to match DESIGN.md, audit every component for spec drift, and add Tailwind responsive prefixes. No new abstraction layer, no new dependencies beyond shadcn `Sheet` (already installed).

---

## Section 1 — CSS Token Layer

Update `globals.css` token values. Only `--primary` and `--primary-foreground` need changing — all other tokens already match DESIGN.md.

### Light mode (`:root`)

| Token | Current | Target |
|---|---|---|
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.608 0.206 38.7)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` (unchanged) |

### Dark mode (`.dark`)

| Token | Current | Target |
|---|---|---|
| `--primary` | `oklch(0.922 0 0)` | `oklch(0.703 0.195 40.5)` |
| `--primary-foreground` | `oklch(0.205 0 0)` | `oklch(0.145 0 0)` |

All other tokens (`--background`, `--card`, `--foreground`, `--muted-foreground`, `--border`, `--input`, `--ring`) already match DESIGN.md values.

---

## Section 2 — Component Audit

### Header (`src/components/shared/Header.tsx`)

- Replace hardcoded zinc classes with semantic token equivalents:
  - `border-zinc-200 dark:border-zinc-800` → `border-border`
  - `bg-white/80 dark:bg-zinc-950/80` → `bg-background/80`
  - `text-zinc-900 dark:text-zinc-50` → `text-foreground`
  - `text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50` → `text-muted-foreground hover:text-foreground`
  - Social icon `text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50` → `text-muted-foreground hover:text-foreground`
- Mobile: wrap social icons `div` with `hidden sm:flex` to hide below 640px

### Home page (`src/app/[locale]/page.tsx`)

- Hero `h1`: `text-4xl` → `text-2xl sm:text-4xl md:text-5xl` (DESIGN.md: 48px desktop → 28px mobile)
- Section top padding: `py-24` → `py-16 sm:py-24`
- Blog list row (`flex items-baseline justify-between`): add `flex-wrap gap-2` so date wraps cleanly on narrow screens

### Projects page (`src/app/[locale]/projects/page.tsx`)

- Top padding: `py-16` stays (already appropriate for mobile)
- Card padding: `p-6` matches DESIGN.md 20px spec (close enough — no change)
- Status badge row (`flex items-start justify-between`): already has `gap-4`, no change needed

### Docs layout (`src/app/[locale]/docs/layout.tsx`)

- Replace `w-full px-6` wrapper with a responsive two-column grid:
  - Mobile (`default`): single column, sidebar hidden
  - Desktop (`md+`): `grid grid-cols-[14rem_1fr] gap-8 max-w-5xl mx-auto px-6 py-12`

### Docs Sidebar (`src/components/docs/Sidebar.tsx`)

- Keep existing desktop sidebar unchanged (`w-56 shrink-0`)
- Add a mobile trigger: a `Sheet` (shadcn, already installed) triggered by a `Menu` icon button
- The `Sheet` wraps the existing sidebar content
- Trigger button is `md:hidden`, sidebar column is `hidden md:block`

### Footer (`src/components/shared/Footer.tsx`)

- Read and check for multi-column layouts; collapse to single column on mobile if needed
- Ensure minimum `py-8 px-6` padding

### Touch targets

- Social icon links: `p-2` → `p-2.5` to ensure ≥44×44px touch target (WCAG 2.1 AA)

---

## Section 3 — Mobile Responsive Strategy

Breakpoints follow DESIGN.md exactly:

| Breakpoint | Width | Key behavior |
|---|---|---|
| Mobile (default) | `< 640px` | Single column everywhere, hero 28px, social icons hidden in header, docs sidebar in Sheet drawer |
| Tablet (`sm`) | 640–768px | Full nav horizontal, hero 36px, social icons visible |
| Desktop (`md+`) | 768px+ | Docs sidebar always visible, hero 48px, all elements shown |

All responsive work is Tailwind utility classes only. The sole JS addition is the shadcn `Sheet` for the docs sidebar drawer.

---

## Files Changed

| File | Change |
|---|---|
| `src/app/globals.css` | Update `--primary` token values (light + dark) |
| `src/components/shared/Header.tsx` | Token classes + hide social icons on mobile |
| `src/app/[locale]/page.tsx` | Responsive hero type + padding |
| `src/app/[locale]/docs/layout.tsx` | Two-column responsive grid |
| `src/components/docs/Sidebar.tsx` | Add Sheet drawer for mobile |
| `src/components/shared/Footer.tsx` | Responsive check + fixes if needed |

---

## Success Criteria

- `npm run build` passes with no errors
- `npm run lint` passes
- On a 375px viewport: header fits one row, hero is readable, docs sidebar is accessible via Sheet trigger
- Orange primary accent appears on all interactive elements (buttons, focus rings, active nav)
- All existing tests pass (`npm run test:run`)

## Out of Scope

- New pages or routes
- Animation/transition tokens
- Error/success form states
- Print styles
- `impeccable` polish pass (separate future task)
