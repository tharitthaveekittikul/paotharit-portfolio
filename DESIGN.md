---
version: alpha
name: paotharit
description: |
  A minimal, content-forward portfolio for a software engineer.
  Zinc neutrals carry the structure; one orange accent marks intent.
  The chrome disappears — what recruiters and developers read is the work.

colors:
  # Light mode
  primary: "#ea580c"         # Orange-600 — brand voltage, CTAs, active states
  on-primary: "#fafafa"      # Near-white text over orange
  ink: "#111111"             # Darkest text — near black
  body: "#3f3f46"            # Regular text — zinc-700
  muted: "#71717a"           # Secondary text, disabled — zinc-500
  canvas: "#ffffff"          # Page floor — white
  surface-card: "#ffffff"    # Card surface — same as canvas in light mode
  hairline: "#e4e4e7"        # Borders, dividers — zinc-200

  # Dark mode overrides
  primary-dark: "#f97316"      # Orange-500 — brighter for dark backgrounds
  on-primary-dark: "#111111"   # Near-black text over orange (AAA contrast)
  ink-dark: "#fafafa"          # Near-white text
  body-dark: "#d4d4d8"         # Body text — zinc-300
  muted-dark: "#a1a1aa"        # Muted text — zinc-400
  canvas-dark: "#09090b"       # Page floor — zinc-950
  surface-card-dark: "#27272a" # Card surface — zinc-800, lifted above canvas
  # hairline-dark is oklch(1 0 0 / 10%) — alpha value, not expressible in 6-digit hex; see prose

typography:
  display-lg:
    fontFamily: "'Geist', sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -1.5px
  heading:
    fontFamily: "'Geist', sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.5px
  body-md:
    fontFamily: "'Geist', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0px
  button:
    fontFamily: "'Geist', sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0px
  caption:
    fontFamily: "'Geist', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
  mono:
    fontFamily: "'Geist Mono', monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: 0px

rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    hover: "background darkens ~10%"
    focus: "2px ring {colors.primary} at 50% opacity"
    disabled: "opacity 40%"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    hover: "text shifts to {colors.ink}"
  badge:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    border: "1px {colors.hairline}"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
    border: "1px {colors.hairline}"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    border: "1px {colors.hairline}"
    focus: "2px {colors.primary} border"
    disabled: "background {colors.surface-card}, text {colors.muted}"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.button}"
    padding: "4px 12px"
    hover: "text {colors.ink}"
    active: "text {colors.primary}"
  code-block:
    fontFamily: "{typography.mono}"
    backgroundLight: "oklch(0.96 0 0)"
    backgroundDark: "#24292e"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
---

## Overview

paotharit is a software engineer portfolio built for one purpose: get the reader to the work as fast as possible. The design system is intentionally invisible — zinc neutrals carry the structure, one orange accent marks intent, and Geist's engineering precision ties it together.

The system operates on contrast, not decoration. Light backgrounds push content forward; dark backgrounds shift depth without adding complexity. A single accent color (`{colors.primary}`) does all the heavy lifting — CTAs, active states, hover transitions, focus rings. Everything else is zinc.

**Key characteristics:**
- Monochromatic base — zinc handles all neutral surfaces and text hierarchy
- Single accent — orange appears only where interaction or priority demands it
- Border-only elevation — no drop shadows anywhere in the system
- Type scale anchored to Geist — tight letter-spacing at large sizes, relaxed at body
- Dual-mode first-class — light and dark are equally designed, not one derived from the other

---

## Colors

### Brand & Accent

- **Primary** (`{colors.primary}` `oklch(0.608 0.206 38.7)` / `#ea580c`): The only non-neutral color in the system. Used exclusively for primary CTAs, active nav states, link hovers, and focus rings. Nothing else should be this orange. Dark mode equivalent: `{colors.primary-dark}` (`oklch(0.703 0.195 40.5)` / `#f97316`) — slightly brighter to pop against dark canvas.
- **On-primary** (`{colors.on-primary}` `oklch(0.985 0 0)`): Near-white text placed over primary in light mode. Dark mode uses `{colors.on-primary-dark}` (`oklch(0.145 0 0)`) — near-black for AAA contrast over the brighter orange.

### Surface

- **Canvas** (`{colors.canvas}` `oklch(1 0 0)` / `#ffffff`): The page floor. Pure white in light mode, zinc-950 (`{colors.canvas-dark}`) in dark. Nothing sits below canvas.
- **Surface Card** (`{colors.surface-card}` `oklch(1 0 0)`): Raised content plates. In light mode, identical to canvas — cards are distinguished by hairline borders, not color difference. In dark mode, `{colors.surface-card-dark}` (`oklch(0.205 0 0)` / `#27272a`) lifts visibly above canvas by color alone.

### Text

- **Ink** (`{colors.ink}` `oklch(0.145 0 0)` / `#111111`): Headings, labels, highest-priority text. Near-black in light, near-white (`{colors.ink-dark}`) in dark.
- **Body** (`{colors.body}` `oklch(0.371 0 0)` / `#3f3f46`): Paragraph text, descriptions. zinc-200 (`{colors.body-dark}`) in dark.
- **Muted** (`{colors.muted}` `oklch(0.556 0 0)` / `#71717a`): Secondary labels, nav links at rest, captions, disabled states. zinc-400 (`{colors.muted-dark}`) in dark.

### Structure

- **Hairline** (`{colors.hairline}` `oklch(0.922 0 0)` / `#e4e4e7`): All borders and dividers. Never use shadows — borders only. Dark mode: `{colors.hairline-dark}` (`oklch(1 0 0 / 10%)`), 10% white.

---

## Typography

**Font families:** Geist (sans) for all display, heading, body, and UI text. Geist Mono for all code.

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| display-lg | 48px | 600 | 1.05 | -1.5px | Hero names, major section titles |
| heading | 24px | 600 | 1.25 | -0.5px | Page headings, card titles |
| body-md | 16px | 400 | 1.60 | 0px | Paragraph text, descriptions |
| button | 14px | 500 | 1 | 0px | Nav links, button labels |
| caption | 12px | 400 | 1.4 | 0px | Metadata, dates, secondary labels |
| mono | 13px | 400 | 1.75 | 0px | Inline code, code blocks |

### Principles

Geist is chosen because it reads as engineered — tight terminals, clean strokes, no personality quirks that compete with technical content. Negative letter-spacing at large sizes (`display-lg`, `heading`) compresses headlines into confident blocks. Body text relaxes to 1.6 line-height to make longer prose comfortable. Mono is a half-step smaller than body (13px vs 16px) so code stays visually subordinate to the prose around it.

### Font Substitutes

If Geist fails to load, the system falls back to the OS sans-serif stack. No significant layout shift — Geist is metric-compatible with system fonts. Geist Mono falls back to `ui-monospace, monospace`.

---

## Layout

**Spacing scale:** `{spacing.xs}` (4px) → `{spacing.section}` (80px).

**Container:** `max-w-3xl` (768px) centered, `px-6` (24px) gutters. Content never exceeds 768px — this keeps line lengths comfortable for long-form reading.

**Whitespace philosophy:** The system breathes. Section gaps use `{spacing.section}` (80px). Component internal padding never drops below `{spacing.md}` (12px). Crowded layouts signal noise — whitespace signals confidence.

**Container widths:**
- Mobile: full width, `px-6` (24px) gutters
- Tablet: same `max-w-3xl` constraint applies
- Desktop: capped at 768px, centered
- Wide: capped at 768px, gutters grow to absorb remaining space

---

## Elevation

**Strategy: borders only — no box shadows.**

Depth is created through color difference (canvas vs surface-card in dark mode) and hairline borders, never by shadow blur. This keeps the system crisp at every zoom level and avoids the generic "floating card" aesthetic.

- **Hairline borders** (1px `{colors.hairline}` / `{colors.hairline-dark}`): All card edges, input fields, dividers, header bottom border.
- **Header backdrop blur**: `bg-white/80 backdrop-blur` (light) / `bg-zinc-950/80 backdrop-blur` (dark). The only translucency in the system. Used only on the sticky header.
- **No modal shadows**: If modals are added, use `{colors.surface-card}` background + hairline border + dark overlay behind — no drop shadow on the dialog itself.

---

## Components

**`button-primary`**
Primary call-to-action. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 8px × 16px, rounded `{rounded.lg}`. Hover: background darkens ~10%. Focus: 2px `{colors.primary}` ring at 50% opacity. Disabled: opacity 40%, no pointer events.

**`button-ghost`**
Secondary or navigation action. Background transparent, text `{colors.muted}`, type `{typography.button}`, padding 8px × 12px, rounded `{rounded.lg}`. Hover: text shifts to `{colors.ink}`. No border, no background fill on any state.

**`badge`**
Inline label for tags, categories, or status. Background `{colors.surface-card}`, text `{colors.muted}`, type `{typography.caption}`, padding 2px × 8px, rounded `{rounded.full}`, 1px `{colors.hairline}` border.

**`card`**
Content container. Background `{colors.surface-card}`, text `{colors.ink}`, padding 20px, rounded `{rounded.lg}`, 1px `{colors.hairline}` border. No shadow. Dark mode: background `{colors.surface-card-dark}`, border `{colors.hairline-dark}`.

**`input`**
Text field. Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, padding 8px × 12px, rounded `{rounded.lg}`, 1px `{colors.hairline}` border. Focus: 2px `{colors.primary}` border. Disabled: background `{colors.surface-card}`, text `{colors.muted}`.

**`nav-link`**
Header navigation item. Text `{colors.muted}`, type `{typography.button}`, padding 4px × 12px. No border or background. Hover: text `{colors.ink}`. Active page: text `{colors.primary}`.

**`code-block`**
Fenced code container. Font `{typography.mono}`, background `oklch(0.96 0 0)` (light) / `#24292e` (dark), rounded `{rounded.lg}`, padding 20px × 24px. Syntax tokens provided by Shiki dual-theme (github-light / github-dark).

---

## Responsive Behavior

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | < 640px | Hero type 48px → 28px; all layouts single-column |
| Tablet | 640–768px | Full nav stays horizontal; max-w-3xl still applies |
| Desktop | 768–1280px | Centered column, gutters absorb space |
| Wide | > 1280px | No content change — max-w-3xl holds, gutters grow |

### Touch Targets

- All interactive elements: minimum 44 × 44px (WCAG 2.1 AA)
- Nav links: `py-1 px-3` minimum
- Social icon links: `p-2` padding wraps 16px icons (≈40px) — use `p-2.5` if failing touch audit

### Collapsing Strategy

Navigation stays horizontal at all breakpoints — the header is simple enough (logo + 2 links + icon row + controls) that a hamburger is unnecessary. Type scales down proportionally at mobile. No column reflow — the layout is single-column throughout.

---

## Known Gaps

- **Animations & transitions**: Timing curves not tokenized. `vt-reveal` view transition exists in CSS but easing/duration are not part of this system.
- **Error & success states**: Form validation colors not documented.
- **Skeleton / loading states**: Not covered.
- **Focus-visible ring**: Global `outline-ring/50` exists but per-component ring color behavior is not fully specified.
- **Print styles**: Not considered.
- **i18n layout shifts**: EN vs TH text length differences not documented as layout concerns.
- **Microinteractions**: Loading spinners, skeleton screens out of scope.
