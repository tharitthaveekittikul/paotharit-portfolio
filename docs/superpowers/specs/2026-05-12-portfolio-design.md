# Portfolio & Technical Blog — Design Spec

**Date:** 2026-05-12  
**Status:** Approved  

---

## Overview

A production-grade personal portfolio and technical blog. Fully static (SSG), bilingual (EN primary / TH optional), deployed to Vercel via public GitHub repo. Content authored in Obsidian, published via a sync script.

---

## Core Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 App Router, full SSG |
| Styling | Tailwind v4 + shadcn/ui |
| Theming | next-themes (dark + light, toggle) |
| i18n | next-intl (`[locale]` routing) |
| Content | MDX files in `/content/[locale]/` |
| Frontmatter | gray-matter |
| MDX Rendering | next-mdx-remote/rsc |
| OG Images | next/og (auto-generated per post) |
| Analytics | @vercel/analytics (free Hobby tier) |
| Icons | simple-icons (tech stack badges) |
| Deploy | Vercel (auto-deploy on push to main) |
| CI | GitHub Actions (lint + type-check on PR) |
| Repo | Public GitHub |

---

## Folder Structure

```
paotharit-portfolio/
├── content/
│   ├── en/
│   │   ├── blog/
│   │   │   └── post-slug.mdx
│   │   └── projects/
│   │       └── zentri.mdx
│   └── th/
│       ├── blog/            ← optional, falls back to en/
│       └── projects/        ← optional, falls back to en/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── page.tsx               (homepage)
│   │       ├── about/page.tsx
│   │       ├── blog/
│   │       │   ├── page.tsx           (post list)
│   │       │   └── [slug]/
│   │       │       ├── page.tsx
│   │       │       └── opengraph-image.tsx
│   │       └── projects/
│   │           ├── page.tsx           (project list)
│   │           └── [slug]/
│   │               ├── page.tsx       (case study)
│   │               └── opengraph-image.tsx
│   ├── components/
│   │   ├── mdx/
│   │   │   ├── Callout.tsx            (Obsidian callout → styled block)
│   │   │   ├── Mermaid.tsx            (Mermaid.js diagram renderer)
│   │   │   └── TradingChart.tsx       (lightweight-charts wrapper)
│   │   ├── ui/                        (shadcn/ui components)
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── LocaleSwitcher.tsx
│   ├── lib/
│   │   ├── content.ts                 (MDX parsing + locale fallback)
│   │   └── og.ts                      (OG image helpers)
│   └── i18n/
│       ├── routing.ts
│       └── messages/
│           ├── en.json                (UI strings only)
│           └── th.json
├── public/
│   └── images/
├── scripts/
│   └── obsidian-sync.ts              (Obsidian → /content converter)
├── .github/
│   └── workflows/
│       └── ci.yml
└── docs/
    └── superpowers/
        └── specs/
```

---

## Frontmatter Schema

```yaml
---
# ── Core ──────────────────────────────────────────────
title: "Zentri: Building an AI-Powered Financial OS"
description: "How I built an institutional-grade portfolio analyzer using LLMs, FastAPI, and local inference."
date: 2026-04-22
updated: 2026-05-01       # optional — shows "Updated" badge
slug: zentri-architecture  # optional — auto-derived from filename if omitted
type: project              # blog | project

# ── Visibility ────────────────────────────────────────
status: published          # draft | published | archived
featured: true             # pins to homepage hero section

# ── Taxonomy ──────────────────────────────────────────
tags: [ai, llm, trading, python, nextjs]
techStack:
  - nextjs
  - python
  - fastapi
  - postgresql
  - redis
  - docker
  - ollama

# ── Media ─────────────────────────────────────────────
coverImage: /images/zentri/cover.jpg   # optional
ogImage: /images/zentri/og.jpg         # optional — auto-generated if omitted

# ── SEO ───────────────────────────────────────────────
seoTitle: "Building Zentri: AI Financial OS"   # optional — overrides title
seoDescription: "..."                           # optional — overrides description

# ── Case Study only (ignored on blog posts) ───────────
role: "Solo Developer"
duration: "3 months"
projectStatus: "In Progress"    # Completed | In Progress | Archived
metrics:
  - { label: "Assets Tracked", value: "5 classes" }
  - { label: "LLM Providers", value: "4" }
  - { label: "Analysis Latency", value: "< 3s" }
---
```

### Visibility Matrix

| status | featured | Result |
|--------|----------|--------|
| `draft` | any | Never built, never indexed |
| `published` | `false` | Listed in blog/projects, not on homepage |
| `published` | `true` | Listed + pinned on homepage hero |
| `archived` | any | Listed with "Archived" badge, excluded from featured |

---

## i18n Routing

- Locales: `en` (default), `th`
- URL pattern: `/en/blog/slug`, `/th/blog/slug`
- Root `/` redirects to browser locale, defaults to `/en`
- Content fallback: if `/content/th/blog/slug.mdx` does not exist, serve `/content/en/blog/slug.mdx`
- UI strings (nav, buttons, labels) translated in `messages/en.json` + `messages/th.json`
- Blog/project content: write Thai version only when needed — never blocked from publishing

---

## Dynamic Routing

```typescript
// src/lib/content.ts

export function getAllSlugs(type: 'blog' | 'projects'): string[] {
  // en/ is the source of truth for all slugs
  return readdirSync(`content/en/${type}`)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
}

export function getContent(type: 'blog' | 'projects', locale: string, slug: string) {
  const localePath = `content/${locale}/${type}/${slug}.mdx`
  const fallbackPath = `content/en/${type}/${slug}.mdx`
  const filePath = existsSync(localePath) ? localePath : fallbackPath
  const { data: frontmatter, content } = matter(readFileSync(filePath, 'utf-8'))
  return { frontmatter, content }
}
```

```typescript
// src/app/[locale]/blog/[slug]/page.tsx

export async function generateStaticParams() {
  const slugs = getAllSlugs('blog')
  return ['en', 'th'].flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  )
}
```

---

## MDX Integration

### Custom Components

| Component | Purpose |
|-----------|---------|
| `<Callout type="abstract">` | Converts Obsidian `> [!abstract]` callouts |
| `<Mermaid chart={...} />` | Renders Mermaid.js diagrams |
| `<TradingChart symbol="BTC/USD" />` | lightweight-charts wrapper |

### Usage in MDX

````mdx
<Mermaid chart={`
  sequenceDiagram
    UI->>API: POST /analysis
    API->>Redis: Enqueue job
`} />

<TradingChart symbol="BTC/USD" />

<Callout type="warning">
  This feature requires GPU acceleration.
</Callout>
````

---

## OG Image Generation

Auto-generated per post using `next/og` — no manual image creation needed.

```tsx
// src/app/[locale]/blog/[slug]/opengraph-image.tsx
export default async function OGImage({ params }) {
  const { frontmatter } = getContent('blog', params.locale, params.slug)
  return new ImageResponse(
    <div style={{ background: '#0a0a0a', display: 'flex', flexDirection: 'column', padding: 80 }}>
      <span style={{ fontSize: 60, color: 'white' }}>{frontmatter.title}</span>
      <span style={{ fontSize: 24, color: '#888' }}>{frontmatter.description}</span>
      <span style={{ fontSize: 18, color: '#555' }}>paotharit-portfolio.vercel.app</span>
    </div>,
    { width: 1200, height: 630 }
  )
}
```

---

## Analytics

```tsx
// src/app/[locale]/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Free Hobby tier: 3,000 events/month. Dashboard in Vercel project settings. Privacy-focused, no cookies.

---

## Case Study Structure

Every project MDX follows this narrative structure:

1. **The Problem** — what pain, why you built this, why existing tools failed
2. **System Architecture** — Mermaid diagram + component narrative
3. **Key Technical Decisions** — decision table (option chosen / rejected / why)
4. **The Hard Parts** — 3–5 specific challenges with what broke, what solved it
5. **Results** — concrete numbers (latency, cost, accuracy, uptime)
6. **What I'd Do Differently** — honest reflection

---

## Deploy Strategy

```
Write in Obsidian
    ↓
Run: npx obsidian-sync --source "~/Obsidian/Projects/Zentri" --include "Architecture.md" --output "content/en/projects/zentri"
    ↓
git push origin main
    ↓
Vercel auto-deploys (~2 min build)
    ↓
Live at paotharit-portfolio.vercel.app
    (custom domain: connect later in Vercel dashboard)
```

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
```

---

## Obsidian Sync Script

**Rule: allowlist only. Nothing publishes unless explicitly named.**

```bash
npx obsidian-sync \
  --source "~/Documents/Obsidian/10 - Projects/Zentri" \
  --include "Architecture.md" "Zentri Overview.md" \
  --output "content/en/projects/zentri"
```

Script responsibilities:
- Convert `[[wiki-links]]` → standard Markdown links
- Convert `> [!type] Title` → `<Callout type="type">` JSX
- Copy images from `Attachments/` → `public/images/[project]/`
- Never touch files not in `--include` list

`API Keys.md`, `Tasks/`, `Kanban.md` — never included, never at risk.

---

## Constraints

- No backend database — fully static/serverless
- Fast builds — all content compiled at build time
- Easy writing — Obsidian → sync → push workflow
- Clean, minimal, professional aesthetic — dark + light mode
- Public repo — no secrets ever committed
