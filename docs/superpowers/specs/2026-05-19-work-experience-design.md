# Work Experience Section — Design Spec

**Date:** 2026-05-19
**Status:** Approved

## Overview

Add a Work Experience section to the resume page (`/resume`) above the existing Education section. The section follows the identical card pattern already used for Education — no new design tokens, no new components.

## Placement

`src/app/[locale]/resume/page.tsx` — insert a new `<section>` between the page header (title + download button) and the existing Education section.

## Cards

### SCB Tech X

| Field    | Value                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Company  | SCB Tech X                                                                                                          |
| Role     | Software Developer Intern                                                                                           |
| Dates    | Jun 2023 – Mar 2024                                                                                                 |
| Bullet 1 | Built SAT Scan Report — automated security scanning and dependency analysis → linked to `/projects/sat-scan-report` |
| Bullet 2 | Developed Debenture Privilege Program — bond investment feature → linked to `/projects/debenture-privilege-program` |
| Photos   | 3 team/workplace photos at `public/work/scb/1.JPG`, `2.JPG`, `3.JPG`                                                |

Photo strip: horizontal row of `next/image` thumbnails, `h-24 w-auto object-cover rounded`, rendered below bullets.

### POMPKINS

| Field    | Value                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Company  | POMPKINS                                                                                                                                           |
| Role     | Software Developer                                                                                                                                 |
| Dates    | Jul 2024 – Nov 2025                                                                                                                                |
| Bullet 1 | Built POMPKINS Food iOS — real-time food ordering with Live Activity widgets → linked to `/projects/pompkins-food-ios`                             |
| Bullet 2 | Developed web platform and merchant portal for restaurant management → linked to `/projects/pompkins-web` and `/projects/pompkins-merchant-portal` |
| Photos   | None                                                                                                                                               |

## Card HTML/JSX structure

Mirrors Education exactly:

```tsx
<div className="rounded-lg border border-border p-5">
  <div className="mb-1 flex items-start justify-between gap-4">
    <h3 className="font-semibold text-foreground">{company}</h3>
    <span className="shrink-0 text-xs text-muted-foreground">{dates}</span>
  </div>
  <p className="text-sm text-muted-foreground">{role}</p>
  <ul className="mt-3 list-disc space-y-1 pl-4">
    <li className="text-sm text-muted-foreground">
      {bullet} <Link href={...} className="text-primary hover:underline">{linkLabel}</Link>
    </li>
  </ul>
  {/* SCB only */}
  <div className="mt-3 flex gap-2 overflow-x-auto">
    {photos.map(...) => <Image h-24 object-cover rounded />}
  </div>
</div>
```

## i18n

New `workExperience` namespace added to both `src/i18n/messages/en.json` and `src/i18n/messages/th.json`.

Key structure:

```json
"workExperience": {
  "title": "Work Experience",
  "scb": {
    "company": "SCB Tech X",
    "role": "Software Developer Intern",
    "years": "Jun 2023 – Mar 2024",
    "bullet1": "Built SAT Scan Report — automated security scanning and dependency analysis",
    "bullet1Link": "SAT Scan Report →",
    "bullet2": "Developed Debenture Privilege Program — bond investment feature for SCB customers",
    "bullet2Link": "Debenture Privilege Program →"
  },
  "pompkins": {
    "company": "POMPKINS",
    "role": "Software Developer",
    "years": "Jul 2024 – Nov 2025",
    "bullet1": "Built POMPKINS Food iOS — real-time food ordering app with Live Activity widgets",
    "bullet1Link": "POMPKINS Food iOS →",
    "bullet2": "Developed web platform and merchant portal for restaurant management",
    "bullet2Link1": "POMPKINS Web →",
    "bullet2Link2": "Merchant Portal →"
  }
}
```

Thai translations use the same keys with Thai text.

## Files changed

| File                                      | Change                                      |
| ----------------------------------------- | ------------------------------------------- |
| `src/i18n/messages/en.json`               | Add `workExperience` namespace              |
| `src/i18n/messages/th.json`               | Add `workExperience` namespace (Thai)       |
| `src/app/[locale]/resume/page.tsx`        | Add Work Experience section above Education |
| `public/work/scb/1.JPG`, `2.JPG`, `3.JPG` | Intern team photos (already present)        |

## Out of scope

- Home page changes
- New shared components
- Company logos
