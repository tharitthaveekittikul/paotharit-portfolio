# Floating Pill Navbar — Design Spec

**Date:** 2026-05-15
**Status:** Approved

## Overview

Replace the current sticky top-bar header with a floating pill-shaped navbar. The pill is always centered in the viewport, matches the reference design's dark/light aesthetic, and stays within the existing DESIGN.md token system (no shadows, borders only).

---

## Positioning

- `fixed top-4 left-1/2 -translate-x-1/2 z-50`
- Width: auto-sized to content, capped at `max-w-3xl`
- All page layouts gain `pt-20` to prevent content hiding behind the fixed pill

---

## Pill Shell

| Property | Light mode | Dark mode |
|----------|-----------|-----------|
| Background | `{colors.canvas}` (white) | `{colors.canvas-dark}` (zinc-950) |
| Border | 2px solid `{colors.ink}` | 1px `{colors.hairline-dark}` (10% white) |
| Shape | `rounded-full` | same |
| Padding | `px-3 py-2` | same |
| Backdrop | `backdrop-blur bg-canvas/80` | `backdrop-blur bg-canvas-dark/80` |

No box shadows — elevation from color difference and border only, per DESIGN.md.

---

## Internal Layout

```
[ paotharit ]  [ Blog ]  [ Projects ]  [ 🔍 ] [ locale ] [ theme ]  [ email pill ]
  ← left                  center                                        right →
```

All items are vertically centered with `items-center gap-1` (existing pattern).

### Logo (left)
- Text: `"paotharit"`
- Style: `{typography.button}` weight, `{colors.ink}` / `{colors.ink-dark}`
- Links to `/${locale}`

### Nav links (center)
- Blog → `/${locale}/blog`
- Projects → `/${locale}/projects`
- Style: existing `nav-link` token — muted at rest, ink on hover, primary if active page
- `px-3 py-1 text-sm`

### Right controls (right)
Order left-to-right: `SearchButton` → `LocaleSwitcher` → `ThemeToggle` → email pill button

### Email pill button
- Text: `tharit.thaveekittikul@gmail.com`
- Shape: `rounded-full px-4 py-1.5 text-sm font-medium`
- Light mode: `bg-ink text-on-primary` (near-black background, white text)
- Dark mode: `bg-white text-ink-dark` (white background, near-black text)  
- `href="mailto:tharit.thaveekittikul@gmail.com"`
- Hidden on mobile: `hidden sm:inline-flex`

---

## Mobile Behavior (< 640px)

- Email pill button hidden (`hidden sm:inline-flex`)
- All other controls remain: logo, Blog, Projects, search, locale, theme
- No hamburger menu — navigation is simple enough to stay horizontal
- Pill width shrinks naturally with content

---

## File Changes

| File | Change |
|------|--------|
| `src/components/shared/Header.tsx` | Full redesign — pill shell, layout, email button |
| `src/app/[locale]/layout.tsx` | Add `pt-20` to main content area |

---

## Out of Scope

- Social icon links removed from header (move to footer separately)
- No animation on mount (view transitions already handled globally)
- No hamburger / drawer for mobile
