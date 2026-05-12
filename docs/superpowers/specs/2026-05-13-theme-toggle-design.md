# Theme Toggle: Switch + Circular View Transition

**Date:** 2026-05-13
**Status:** Approved

## Overview

Replace the current ghost button emoji toggle with an iOS-style pill switch. When clicked, trigger a circular reveal animation using the View Transition API — a circle expands from the toggle's center outward to cover the full viewport, revealing the new theme underneath.

## Component: ThemeToggle.tsx

**Visual design (Tailwind):**
- Track: `w-11 h-6` pill, `bg-zinc-200 dark:bg-zinc-700`, `rounded-full`, `transition-colors`
- Thumb: `w-4 h-4` white circle, `rounded-full`, positioned absolutely inside track
- Thumb position: `translate-x-1` (light) → `translate-x-6` (dark), animated via `transition-transform duration-200`
- `Sun` and `Moon` icons from `lucide-react` (`size={12}`) rendered inside the thumb

**Click handler logic:**
1. Get `getBoundingClientRect()` center of the button element via `ref`
2. Compute `x = rect.left + rect.width / 2`, `y = rect.top + rect.height / 2`
3. Compute `r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))`
4. Set CSS vars on `:root`: `--vt-x`, `--vt-y`, `--vt-r`
5. If `document.startViewTransition` exists: wrap `setTheme(...)` call inside it
6. Else: call `setTheme(...)` directly (graceful degradation)

**Hydration:** Keep existing `mounted` guard — renders a same-size placeholder (`w-11 h-6`) until mounted.

## CSS: globals.css

Add to end of file:

```css
::view-transition-old(root) {
  animation: none;
}

::view-transition-new(root) {
  clip-path: circle(0 at var(--vt-x) var(--vt-y));
  animation: vt-reveal 0.5s ease-in-out forwards;
}

@keyframes vt-reveal {
  to {
    clip-path: circle(var(--vt-r) at var(--vt-x) var(--vt-y));
  }
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/shared/ThemeToggle.tsx` | Full rewrite — pill switch + View Transition handler |
| `src/app/globals.css` | Add 3 CSS rules for `::view-transition-*` and `@keyframes vt-reveal` |

## Browser Support

- **Chrome 111+, Safari 18+, Edge 111+**: full circular reveal animation
- **Firefox, older browsers**: theme toggles immediately with no animation (no broken states)

## Out of Scope

- No changes to `next-themes` setup
- No changes to Header layout or other components
- No Framer Motion or other animation libraries added
