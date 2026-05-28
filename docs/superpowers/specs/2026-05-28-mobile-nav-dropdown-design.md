# Mobile Nav Dropdown Design

**Date:** 2026-05-28  
**Status:** Approved

## Problem

On mobile, the pill navbar shows only `paotharit`, `Blog`, `Projects`, Search, Language, and Theme. `Docs`, `About`, and `Resume` are hidden via `hidden sm:inline-flex` — no way to reach them on small screens.

## Solution

Add a `⋯` trigger on mobile that opens a dropdown panel listing the hidden routes.

## Architecture

**New file:** `src/components/shared/MobileMenu.tsx`  
- `"use client"` component  
- Accepts `locale: string` and label props (`docs`, `about`, `resume`) so `Header` retains all server logic  
- Manages `open` boolean state  
- Renders `⋯` button + absolutely-positioned dropdown panel

**Modified file:** `src/components/shared/Header.tsx`  
- Import and render `<MobileMenu>` in the links section  
- Pass `locale` and translated labels as props  
- Keep the existing `hidden sm:inline-flex` links unchanged (they still appear at sm+)

## Component Design

### MobileMenu props
```ts
interface MobileMenuProps {
  locale: string
  labels: { docs: string; about: string; resume: string }
  resumeHref: string
}
```

### Trigger button
- Styled identically to other nav links: `text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900`
- `sm:hidden` — disappears at sm breakpoint
- Text: `⋯` (Unicode ellipsis, not three dots)

### Dropdown panel
- `absolute top-full mt-2` positioned below the pill
- Background: `bg-zinc-900 dark:bg-white`
- Border: `border border-white/10 dark:border-zinc-900/10`
- Rounded: `rounded-lg`
- Contains three links: Docs, About, Resume — each full-width, same text styling as nav links
- `ResumeLink` component used for Resume (consistent with existing nav)

### Behaviour
- Opens on `⋯` click, closes on second click (toggle)
- Closes when any link inside is clicked
- Closes on click-outside (via `useEffect` + `mousedown` listener)
- No animation required (keep it simple)

## What Does Not Change
- Desktop nav is untouched — `sm:inline-flex` links remain as-is
- `SocialLinks` stays `hidden lg:flex`
- `Header` remains a server component

## Testing
- Update `Header.test.tsx`: assert `MobileMenu` renders on mobile viewport
- Unit test `MobileMenu`: open/close toggle, link click closes menu, click-outside closes menu
