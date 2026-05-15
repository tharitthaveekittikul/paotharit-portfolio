# Project Image Gallery — Design Spec

**Date:** 2026-05-16  
**Status:** Approved

---

## Overview

Two related features that bring project screenshots into the browsing experience:

1. **Lightbox on detail page** — clicking any screenshot on a project's detail page opens it full-screen.
2. **Card gallery** — project cards on the listing page and home page show a horizontal strip of up to 4 screenshots; if more exist, the 4th tile shows a `+N` count overlay.

---

## Feature 1 — Lightbox on Detail Page

### Approach

Reuse the existing `ZoomableImage` component (`src/components/mdx/ZoomableImage.tsx`). It is currently registered in the MDX components map as `img` (catches markdown `![...]()` syntax only). Add it as a second key `ZoomableImage` so it is also usable as an explicit JSX component inside MDX files.

In `zentri.mdx` (and any future project MDX), replace every `<img ... />` inside the screenshots `<div>` with `<ZoomableImage ... />`. The component already handles:
- Full-screen overlay on click
- Close on Escape or click-outside
- `max-h-[90vh] max-w-[90vw]` sizing

### Changes Required

| File | Change |
|------|--------|
| `src/app/[locale]/projects/[slug]/page.tsx` | Add `ZoomableImage` key to MDX components map |
| `content/en/projects/zentri.mdx` | Replace `<img>` → `<ZoomableImage>` in screenshots section |

No new components needed.

---

## Feature 2 — Card Gallery

### Data Source

At render time, the server component calls a utility `getProjectImages(slug: string): string[]` that:
- Reads `public/projects/<slug>/` with `fs.readdirSync`
- Filters to `.png`, `.jpg`, `.jpeg`, `.webp` extensions
- Sorts alphabetically
- Returns relative public paths (`/projects/<slug>/filename.ext`)
- Returns `[]` if the folder doesn't exist

This runs server-side (App Router server component) so no client bundle cost.

### Card Gallery UI

Rendered as a horizontal strip below the card's text content, above the bottom edge of the card.

- **Strip height:** `h-24` (96px) — tall enough to read, compact enough not to dominate
- **Image count:** up to 4 tiles, equal width, no scroll
- **Overflow tile (4th position):** when total images > 4, the 4th tile shows a dark overlay with `+N` text (white, `text-sm font-medium`), where N = total − 3
- **No gap** between tiles; rounded corners only on first-left and last-right to match card's `rounded-lg`
- **Border-top:** `border-t border-hairline` separates strip from text content
- **Clicks:** the entire card (including strip) is one `<Link>` — images are not separately interactive in the card view
- **Empty state:** strip is not rendered if `getProjectImages` returns 0 images

### Affected Card Locations

| Location | File |
|----------|------|
| Projects listing page | `src/app/[locale]/projects/page.tsx` |
| Home page featured section | `src/app/[locale]/page.tsx` |

Both locations use inline card markup (no shared `ProjectCard` component). The gallery strip markup is extracted into a small `ProjectImageStrip` server component so it isn't duplicated.

### `ProjectImageStrip` Component

```
src/components/shared/ProjectImageStrip.tsx
```

Props: `slug: string`  
Returns: the 4-tile strip JSX, or `null` if no images found.

### Utility

```
src/lib/project-images.ts
```

Exports `getProjectImages(slug: string): string[]`.

---

## Out of Scope

- Lightbox on the card gallery tiles (navigate to detail page instead)
- Drag / swipe carousel
- Image ordering beyond alphabetical
- Lazy loading (Next.js `<Image>` handles this if used, but `<img>` is acceptable for thumbnails)

---

## Testing

- `getProjectImages` with existing folder → returns sorted paths
- `getProjectImages` with missing folder → returns `[]`
- `ProjectImageStrip` with 0 images → renders nothing
- `ProjectImageStrip` with 3 images → renders 3 tiles, no overflow
- `ProjectImageStrip` with 9 images → renders 3 tiles + `+6` overlay tile
