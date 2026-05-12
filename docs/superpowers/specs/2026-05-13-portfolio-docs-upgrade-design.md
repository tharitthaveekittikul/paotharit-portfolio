# Portfolio Docs Upgrade — Design Spec

**Date:** 2026-05-13  
**Status:** Approved

---

## Goal

Upgrade the portfolio with: a richer Zentri project showcase (screenshots, fixed tables, docs link), a new `/docs` section with sidebar + TOC, an extended obsidian-sync script, and social icons in the header nav.

---

## Overall Architecture

Six distinct pieces:

```
Portfolio
├── /projects/zentri        ← Enriched showcase (screenshots, docs link, fixed tables)
├── /docs/zentri/           ← New docs section (sidebar + TOC)
│   ├── 01-architecture     ← From Architecture.md (synced from Obsidian)
│   └── 02-api/             ← From Docs/Backend/Endpoints/ (synced from Obsidian)
│       ├── 01-auth/
│       ├── 02-analysis/
│       ├── 03-assets/
│       └── ... (all other API domains)
├── Header                  ← + social icons (Facebook, Instagram, GitHub, LinkedIn)
├── scripts/obsidian-sync   ← Extended to sync docs content
├── src/lib/docs.ts         ← New: reads content/en/docs/, builds sidebar tree
└── src/app/[locale]/docs/  ← New: docs layout with sidebar + TOC
```

**Data flow:**
```
Obsidian Zentri notes
  → obsidian-sync.ts (transform + filter)
  → content/en/docs/zentri/*.mdx
  → docs.ts (auto-sidebar from file tree)
  → /docs/zentri/* (sidebar + TOC layout)

Obsidian Attachments/ (manual one-time copy)
  → public/projects/zentri/
  → /projects/zentri (screenshot gallery)
```

---

## Section 1: Content File Structure

```
content/
├── en/
│   ├── blog/
│   ├── projects/
│   │   └── zentri.mdx              ← enriched (screenshots, docs link, fixed table)
│   └── docs/
│       └── zentri/
│           ├── 01-architecture.mdx
│           └── 02-api/
│               ├── 01-auth/
│               │   ├── 01-login.mdx
│               │   ├── 02-logout.mdx
│               │   ├── 03-refresh.mdx
│               │   ├── 04-setup.mdx
│               │   └── 05-me.mdx
│               ├── 02-analysis/
│               ├── 03-assets/
│               ├── 04-cash-balance/
│               ├── 05-chat/
│               ├── 06-dividends/
│               ├── 07-documents/
│               ├── 08-events/
│               ├── 09-feature-llm-config/
│               ├── 10-import/
│               ├── 11-ipos/
│               ├── 12-llm/
│               └── 13-net-worth/
```

Numeric prefixes control sidebar ordering. Display labels strip the prefix and title-case the remainder. Frontmatter `title` overrides if present.

---

## Section 2: Extended obsidian-sync.ts

The script gains a `syncDocs()` function called alongside the existing sync:

**Source paths (Obsidian):**
- `~/Documents/04_Knowledge/paotharit-knowledge-base/10 - Projects/Zentri/Architecture.md`
- `~/Documents/04_Knowledge/paotharit-knowledge-base/10 - Projects/Zentri/Docs/Backend/Endpoints/**/*.md`

**Target:** `content/en/docs/zentri/`

**Transformations applied per file:**
1. Obsidian callouts → MDX `<Callout>` component:
   - `> [!warning]` → `<Callout type="warning">`
   - `> [!info]` → `<Callout type="info">`
   - `> [!tip]` → `<Callout type="tip">`
2. Strip entire sections matching these headings (heading + all content until next same-level heading):
   - `## 🛡️ Technical Defense`
   - `## 🔄 Change Impact Analysis`
3. Convert `[[wikilinks]]` → plain text (strip brackets)
4. Add MDX frontmatter (`title`, `description`) derived from the first `#` heading if not present
5. Mermaid fenced code blocks left as-is (Mermaid MDX component handles them)

**Excluded from sync:**
- `Data Model.md` (outdated, excluded by design)
- Obsidian frontmatter properties block (tags, status, created) stripped from output

---

## Section 3: src/lib/docs.ts

New utility, parallel to `content.ts`:

```typescript
// Key types
interface DocItem {
  title: string
  slug: string       // e.g. "zentri/01-architecture"
  href: string       // e.g. "/en/docs/zentri/architecture"
}

interface SidebarGroup {
  label: string
  items: (DocItem | SidebarGroup)[]
}

// Key functions
getDocContent(project: string, slugPath: string[]): { frontmatter, content }
buildSidebarTree(project: string, locale: string): SidebarGroup[]
extractHeadings(content: string): { text: string; id: string; level: number }[]
```

`buildSidebarTree` walks `content/en/docs/[project]/` recursively, strips numeric prefixes for display, uses frontmatter `title` if present, and returns a nested structure for the sidebar component.

`extractHeadings` parses `##` and `###` headings from raw MDX content for the right-side TOC.

---

## Section 4: /docs Layout (Sidebar + TOC)

**Routes:**
- `src/app/[locale]/docs/[project]/page.tsx` — redirects to first doc in that project
- `src/app/[locale]/docs/[project]/[...slug]/page.tsx` — individual doc page
- `src/app/[locale]/docs/[project]/layout.tsx` — docs shell layout

**Layout: 3-column**
```
[ Sidebar 240px ] [ Content max-w-2xl flex-1 ] [ TOC 200px ]
```

- **Left sidebar:** Collapsible section groups, active page highlighted, project title at top, sticky
- **Right TOC ("On this page"):** `##` and `###` headings, sticky, highlights current section on scroll
- **Mobile:** Sidebar collapses to a top drawer toggle button; TOC hidden on mobile

**Breadcrumb:** `Docs / Zentri / Architecture` shown above the page title.

**No global nav changes** — the existing Header stays on docs pages too.

---

## Section 5: /projects/zentri Updates

**Table rendering fix:**
- Verify `remark-gfm` is in the MDX pipeline (add if missing)
- Ensure Tailwind Typography prose table styles are active (check `@tailwindcss/typography` config)

**Screenshot gallery:**
- Copy 6–8 curated screenshots from Obsidian Attachments to `public/projects/zentri/`
- Curated set: `overview-page`, `portfolio-page`, `chat-page`, `net-worth-page`, `watchlist-page`, `pipeline-page`, `research-page`, `document-page`
- Rendered as a 2-column responsive grid inside zentri.mdx with captions
- Uses standard `<img>` tags (no special component needed)

**Docs link:**
- Prominent "View Documentation →" button/link added in the project header area (below tech stack badges)

**Content enrichment:**
- Expand the "Problem" section with more context from Obsidian notes
- Add a "Features" section listing key capabilities
- Existing Mermaid architecture diagram, key decisions table, and "What I'd Do Differently" kept as-is

---

## Section 6: Header Social Icons

**Links to add:**
- Facebook: `https://www.facebook.com/tharit.thaveekittikul/`
- Instagram: `https://www.instagram.com/paotharit/`
- GitHub: `https://github.com/tharitthaveekittikul`
- LinkedIn: `https://www.linkedin.com/in/paotharit/`

**Position:** After existing nav links (Blog, Projects), before LocaleSwitcher and ThemeToggle.

**Style:** SVG icons at 16×16px, `text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50`, same padding as ThemeToggle (`p-2`). Icons open in new tab (`target="_blank" rel="noopener noreferrer"`).

**Icon source:** Use inline SVG paths for the 4 platforms (no icon library dependency needed).

---

## What's Excluded

- Data Model.md (outdated, excluded by design decision)
- `## 🛡️ Technical Defense` section (filtered at sync time)
- `## 🔄 Change Impact Analysis` section (filtered at sync time)
- Settings screenshots (6 settings pages) — too granular for a showcase
- `backup-page`, `ai-usage-page`, `transaction-page` — lower visual impact
- Obsidian API Keys.md — sensitive, never included
- Runtime Obsidian path reading — won't work in deployment

---

## Out of Scope

- Thai (`th`) locale docs (docs section English-only for now)
- Search across docs (future enhancement)
- Multiple projects under `/docs` beyond Zentri (structure supports it, not implemented yet)
- Automated screenshot capture (manual copy, one-time)
