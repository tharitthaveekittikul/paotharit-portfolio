# GA4 Custom Events Design

**Date:** 2026-05-15  
**Status:** Approved

## Goal

Add custom GA4 event tracking for social media icon clicks, email button clicks, and GitHub project link clicks. All tracking is code-only (no Enhanced Measurement dashboard toggle).

## Events

| Event name | Parameters | Fired when |
|---|---|---|
| `social_click` | `{ platform: 'GitHub' \| 'Instagram' \| 'Facebook' \| 'LinkedIn' }` | Social icon clicked in Header or Footer |
| `email_click` | _(none)_ | Email button clicked in Header |
| `project_github_click` | `{ project: string }` | GitHub link clicked on project detail page |

## Architecture

Header and Footer are server components — `onClick` handlers require client components. Three focused client components are introduced:

- **`SocialLinks`** — renders the social icon row, fires `social_click` on each click. Replaces the inline icon loops in both Header and Footer.
- **`EmailLink`** — renders the email `<a>` button in Header, fires `email_click` on click.
- **`ProjectGithubLink`** — renders a GitHub button on the project detail page, fires `project_github_click` on click.

`sendGAEvent` from `@next/third-parties/google` is used for all events.

## Files Changed

| Action | File |
|---|---|
| Create | `src/components/shared/SocialLinks.tsx` |
| Create | `src/components/shared/EmailLink.tsx` |
| Create | `src/components/shared/ProjectGithubLink.tsx` |
| Modify | `src/components/shared/Header.tsx` |
| Modify | `src/components/shared/Footer.tsx` |
| Modify | `src/lib/content.ts` — add `github?: string` to `Frontmatter` |
| Modify | `src/app/[locale]/projects/[slug]/page.tsx` — render `ProjectGithubLink` if `frontmatter.github` exists |

## GitHub Project Link — Content

The `github` field is optional in `Frontmatter`. The user adds it to their Obsidian notes and it syncs to `content/`. For Zentri: `github: https://github.com/tharitthaveekittikul/Zentri`.

The project detail page renders a "View on GitHub" button only when `frontmatter.github` is present.

## Out of Scope

- Resume download tracking (future)
- Live demo link tracking (future)
- Any dashboard-side Enhanced Measurement configuration
