# Screenshot Masonry Grid — Design Spec

**Date:** 2026-05-16  
**Scope:** All project MDX pages (current: Zentri, DocRAG; future projects inherit automatically)

---

## Problem

The Screenshots section uses a uniform 2-column CSS grid (`grid grid-cols-1 sm:grid-cols-2`). Screenshots have varying heights — dashboard views are much taller than single-panel views — leaving uneven whitespace between rows.

## Solution

Replace the bare `div` grid wrapper with a reusable `ScreenshotGrid` MDX component that applies CSS masonry (multi-column) layout. Layout logic lives in one component; MDX authoring stays the same.

---

## Component

**File:** `src/components/mdx/ScreenshotGrid.tsx`

- Server component — no client-side JS needed
- Props: `children: React.ReactNode`, optional `className?: string`
- Layout classes: `not-prose columns-1 sm:columns-2 gap-4 [&>*]:break-inside-avoid`
  - 1 column on mobile, 2 columns at `sm` and above
  - `[&>*]:break-inside-avoid` prevents figures from splitting across columns
- No internal padding or margin — inherits the prose layout context

**Registration:** Export from `src/components/mdx/index.ts` and add to `mdxComponents` map so it's available in all MDX files without explicit import.

---

## Migration

**Existing projects:**

Replace the outer `<div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">` in each project MDX with `<ScreenshotGrid>`. Inner `<figure>` / `<ZoomableImage>` / `<figcaption>` markup stays unchanged.

`content/` files updated directly as a one-time migration. User must mirror the change in the corresponding Obsidian source notes before next sync to avoid revert.

**Future projects:**

Author screenshots in Obsidian using `<ScreenshotGrid>` instead of a bare `div`. No other setup required.

---

## Out of Scope

- Changing caption markup or ZoomableImage behavior
- 3-column or Pinterest-style infinite masonry
- Any JS-based masonry library
