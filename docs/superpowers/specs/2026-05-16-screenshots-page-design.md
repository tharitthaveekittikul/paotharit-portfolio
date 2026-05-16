# Screenshots Gallery Page — Design Spec

**Date:** 2026-05-16  
**Status:** Approved

---

## Overview

Add a dedicated screenshots gallery page at `/[locale]/projects/[slug]/screenshots` that shows all images for a project in a masonry grid. The `ProjectImageStrip` on project cards (listing page and home page) becomes a separate click zone linking to this page rather than the project detail page.

This extends the existing card gallery (`2026-05-16-project-image-gallery-design.md`), which is already built.

---

## Route

```
/[locale]/projects/[slug]/screenshots
```

Server component. No client JS required.

**File:** `src/app/[locale]/projects/[slug]/screenshots/page.tsx`

---

## Page Layout

### Header

- Back link: `← {project.title}` pointing to `/[locale]/projects/[slug]`
- Project title as `<h1>`
- Minimal chrome — no description, tags, or dates

### Body

- Masonry grid of all images returned by `getProjectImages(slug)` (already exists in `src/lib/project-images.ts`)
- Each image rendered with `ZoomableImage` (already exists in `src/components/mdx/ZoomableImage.tsx`) for individual full-screen zoom
- Same column layout as existing `ScreenshotGrid`: `columns-1 sm:columns-2 gap-4`

### Empty State

- If `getProjectImages(slug)` returns `[]`, redirect to `/[locale]/projects/[slug]` — no images means no reason for this page to exist.

### Metadata

- Page `<title>`: `{project.title} — Screenshots`

---

## Card Restructure

Currently the entire project card is one `<Link>`. To split click zones (text → project detail, strip → screenshots), the outer wrapper becomes a `<div>` and two separate `<Link>`s sit inside.

### Before

```
<Link href="/[locale]/projects/[slug]" className="group block ...border...">
  <div className="p-6">...</div>
  <ProjectImageStrip images={images} />
</Link>
```

### After

```
<div className="group block ...border...">
  <Link href="/[locale]/projects/[slug]">
    <div className="p-6">...</div>
  </Link>
  <Link href="/[locale]/projects/[slug]/screenshots">
    <ProjectImageStrip images={images} />
  </Link>
</div>
```

The `group` class moves to the outer `<div>` so `group-hover:text-*` on the title still works.

**Affected files:**
- `src/app/[locale]/projects/page.tsx`
- `src/app/[locale]/page.tsx`

### Strip hover affordance

`ProjectImageStrip` gains `hover:brightness-90 transition-[filter]` on its outer wrapper to signal it is independently clickable. The `+N` label stays unchanged.

---

## Data

All data utilities already exist:

| Utility | Purpose |
|---------|---------|
| `getProjectImages(slug)` | Returns all image paths from `public/projects/[slug]/` |
| `getAllContent('projects', locale)` | Used to get project title for heading and metadata |

---

## Out of Scope

- Prev/next navigation between images on the screenshots page
- Image ordering beyond alphabetical
- Drag / swipe carousel
- Download button

---

## Testing

- Screenshots page with images → renders masonry grid
- Screenshots page with no images → redirects to project detail page
- Card text area click → navigates to project detail page
- Card strip click → navigates to screenshots page
- `ProjectImageStrip` hover → `brightness-90` applied
