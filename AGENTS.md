<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Context

paotharit is a bilingual (EN/TH) software engineer portfolio. Target audience: developers, HR, and recruiters. The design goal is invisible chrome — content loads fast, structure is scannable, nothing decorative competes for attention.

Stack: Next.js 16 (App Router) + React 19 + Tailwind v4 + next-mdx-remote + next-intl + next-themes + shadcn/ui.

## Design System

Read `DESIGN.md` before writing any UI code. It defines:
- All color tokens (zinc neutral base + orange accent, both light and dark)
- Typography scale (Geist Sans + Geist Mono, 6 styles)
- Spacing, radius, and component token compositions

**Do not hardcode hex values or px sizes** — reference the token names from DESIGN.md.  
**Do not introduce new colors** — the system uses zinc + one orange only.  
**Do not add box shadows** — elevation strategy is borders-only.  
**After editing `DESIGN.md`**, run `npm run lint:design` to validate token references and WCAG contrast.

## Content Conventions

- Content lives in `content/` as MDX files synced from Obsidian via `npm run sync`
- **Never manually edit files in `content/`** — they will be overwritten on next sync
- MDX is rendered via `next-mdx-remote`; syntax highlighting via `rehype-pretty-code` + `shiki` (dual-theme)
- MDX components are in `src/components/mdx/` — extend there, not in content files
- i18n: locale files in `messages/` (EN/TH). Always add both locales for any new string.

## Routing & i18n

- All pages live under `src/app/[locale]/` — the locale segment is always present
- Use `next-intl` for translations: `getTranslations()` (server) / `useTranslations()` (client)
- Use `setRequestLocale(locale)` at the top of every page component (Next.js 16 requirement)

## Testing

- Write tests in `__tests__/` subdirectories beside the component
- Framework: Vitest + `@testing-library/react` + jsdom
- Run once: `npm run test:run`
- Do not mock internal modules — only mock at system boundaries (fetch, fs, external APIs)

## Anti-Patterns

- Do not use `tailwind.config.js` — Tailwind v4 is CSS-first (`@import "tailwindcss"` in globals.css)
- Do not use `getServerSideProps` or `getStaticProps` — App Router uses async server components
- Do not use `next/router` — use `next/navigation` (App Router)
- Do not add `"use client"` unless the component genuinely needs browser APIs or event handlers
- Do not add `console.log` to production code

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
