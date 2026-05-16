# Thai Project Content + Docs Locale Switcher

## Overview

Two independent changes:
1. Add Thai-language content files for all 9 projects
2. Hide the locale switcher in the navbar when on any `/docs/` route

## Change 1: Thai Project Files

**Location:** `content/th/projects/*.mdx` (one file per project)

**What changes per file:**
- Frontmatter `title`: unchanged (English)
- Frontmatter `description`: translated to Thai
- MDX body: translated to Thai, except content inside ` ```mermaid ``` ` fences which stays verbatim
- All other frontmatter fields (date, tags, techStack, github, metrics, etc.): unchanged

**Files to create (9 total):**
- docrag.mdx
- llmsystemtrading.mdx
- n8n-watchlist-tracking.mdx
- pompkins-food-ios.mdx
- pompkins-food-web.mdx
- pompkins-merchant-portal.mdx
- pompkins-web.mdx
- utiliship.mdx
- zentri.mdx

**How it works:** `getContent()` in `src/lib/content.ts` already checks `content/{locale}/{type}/{slug}.mdx` before falling back to English. No code changes needed in the content layer.

**Sync note:** These files are managed manually. `npm run sync` outputs to `content/en/` only — Thai files are safe from overwrites as long as the sync command targets the English path.

## Change 2: Hide Locale Switcher on Docs Pages

**File:** `src/components/shared/LocaleSwitcher.tsx`

**Change:** Add an early return before rendering when `pathname.includes('/docs/')`:

```tsx
if (pathname.includes('/docs/')) return null
```

**Why here:** `LocaleSwitcher` already calls `usePathname()`, so no prop-drilling or layout changes needed. Docs are English-only by design — switching locale on a docs page would land the user on a non-existent Thai docs route.

## Out of Scope

- Sync script locale support (deferred — user manages Thai files manually)
- Translating blog posts
- Thai docs content
