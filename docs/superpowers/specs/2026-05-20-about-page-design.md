# About Page Design

**Date:** 2026-05-20  
**Goal:** A dedicated `/about` page that answers "who is this person?" quickly for recruiters, then shows how they think and operate for engineers and hiring managers.

---

## Routes

- `src/app/[locale]/about/page.tsx`
- Add "About" link to header nav (translation key already exists)

---

## Section 1: Bio Intro

**Layout:** Photo (square, ~96px, rounded-lg) on the left + text on the right on desktop. Stacked on mobile.

**Content:**
- Profile photo — `public/about/profile.jpg` (user to provide)
- Name + "Software Engineer" title
- "Open to new opportunities" badge — existing `Badge` component, secondary variant
- 2–3 sentence bio (user to write, placeholder provided in translation keys)

**i18n key:** `about.bio`

---

## Section 2: How I Operate

Three subsections. Each: screenshot + 2–3 sentence description.  
Desktop: image on top, text below (full-width card). Mobile: same — stacked.  
Use existing `card` component style — border, no shadow.

### Knowledge OS
- Screenshot: `public/about/obsidian-graph.png` (user to provide — the graph view screenshot)
- i18n key: `about.systems.obsidian`
- Placeholder: PARA method, 1000+ linked notes, Kanban boards for active projects inside the vault

### AI Workflow
- No screenshot (optional: Claude Code terminal screenshot at `public/about/claude-workflow.png`)
- i18n key: `about.systems.ai`
- Placeholder: Claude Code for development, LLMs integrated into daily thinking and writing workflow

### Home Infrastructure
- Screenshots: reuse existing images —
  - `public/projects/n8n-watchlist-tracking/n8n-workflow.png`
  - `public/projects/n8n-watchlist-tracking/synology-nas-container-manager-n8n-image.png`
- i18n key: `about.systems.homelab`
- Placeholder: Synology NAS, n8n automations, self-hosted services

---

## Section 3: Closing CTA

- 2–3 sentence paragraph about what kind of role/team (user to write, placeholder in translation keys)
- i18n key: `about.closing`
- Direct links: email (reuse `EmailLink` component) + LinkedIn (inline anchor)
- No contact form

---

## Assets

| Path | Status |
|------|--------|
| `public/about/profile.jpg` | User to provide |
| `public/about/obsidian-graph.png` | User to provide |
| `public/about/claude-workflow.png` | Optional, user to provide |
| `public/projects/n8n-watchlist-tracking/n8n-workflow.png` | Already exists |
| `public/projects/n8n-watchlist-tracking/synology-nas-container-manager-n8n-image.png` | Already exists |

---

## Component Reuse

- `Badge` — "Open to new opportunities" indicator
- `EmailLink` — email CTA in closing section
- `Image` from `next/image` — all images (use `width`/`height` for fixed assets, `fill` + relative container for responsive)
- No new design tokens — use existing card/surface styles from DESIGN.md

## i18n Keys to Add (EN + TH)

```
about.openToWork        — "Open to new opportunities"
about.bio               — 2–3 sentence bio (placeholder)
about.systems.title     — "How I operate"
about.systems.obsidian  — Knowledge OS description
about.systems.ai        — AI Workflow description
about.systems.homelab   — Home Infrastructure description
about.closing           — Closing paragraph + CTA label
```

---

## Out of Scope

- Contact form
- Page-level analytics events (GA already captures pageviews)
- Dark/light screenshot variants
