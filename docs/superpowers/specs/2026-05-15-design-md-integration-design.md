# design.md Integration

**Date:** 2026-05-15
**Status:** Approved

## Goal

Integrate the `@google/design.md` linter into the portfolio so that DESIGN.md can be validated for structural correctness, broken token references, and WCAG contrast ratios on demand.

## Scope

Three files change. Nothing else.

## Changes

### 1. `DESIGN.md` — frontmatter color format

All `oklch(...)` color values in the YAML frontmatter become hex. Token names, structure, prose, components, typography, spacing, and rounded sections are unchanged. The markdown body below the frontmatter is untouched.

Color mapping (oklch → hex):

| Token | oklch | hex |
|---|---|---|
| primary | oklch(0.608 0.206 38.7) | #ea580c |
| on-primary | oklch(0.985 0 0) | #fafafa |
| ink | oklch(0.145 0 0) | #111111 |
| body | oklch(0.371 0 0) | #3f3f46 |
| muted | oklch(0.556 0 0) | #71717a |
| canvas | oklch(1 0 0) | #ffffff |
| surface-card | oklch(1 0 0) | #ffffff |
| hairline | oklch(0.922 0 0) | #e4e4e7 |
| primary-dark | oklch(0.703 0.195 40.5) | #f97316 |
| on-primary-dark | oklch(0.145 0 0) | #111111 |
| ink-dark | oklch(0.985 0 0) | #fafafa |
| body-dark | oklch(0.871 0 0) | #d4d4d8 |
| muted-dark | oklch(0.708 0 0) | #a1a1aa |
| canvas-dark | oklch(0.145 0 0) | #09090b |
| surface-card-dark | oklch(0.205 0 0) | #27272a |
| hairline-dark | oklch(1 0 0 / 10%) | #ffffff1a |

The CSS implementation (`globals.css`, Tailwind) keeps oklch — the linter only reads DESIGN.md.

### 2. `package.json` — new script

```json
"lint:design": "npx @google/design.md lint DESIGN.md"
```

Run manually after any design system change. No CI integration — git is managed manually.

### 3. `AGENTS.md` — one instruction added

Add to the Design System section:

> After editing `DESIGN.md`, run `npm run lint:design` to validate token references and WCAG contrast.

## Success Criteria

- `npm run lint:design` exits with code 0
- No `error`-severity findings from the linter
- WCAG contrast warnings (if any) are reviewed and acknowledged

## Out of Scope

- CI/CD integration
- globals.css color format changes
- Any changes to prose in DESIGN.md
- Storybook or any other tooling
