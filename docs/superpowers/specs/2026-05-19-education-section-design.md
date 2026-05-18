# Education Section — Design Spec

**Date:** 2026-05-19  
**Status:** Approved

---

## Overview

Add an Education section to the `/resume` page, displayed above the PDF embed. The section is hardcoded in the component (data never changes) and fully bilingual via the existing `next-intl` translation system.

A companion blog post (Ban Yang Pao volunteer photos) is out of scope for this task and will be built in a future session once images are available. At that point, the Volunteer Lead activity line will gain a "See photos →" link.

---

## Location

`src/app/[locale]/resume/page.tsx` — inserted between the title/download-button row and the `<embed>` PDF element.

---

## Visual Design

Section heading matches the Projects/Writing heading style used on the home page:

```
text-sm font-semibold uppercase tracking-widest text-muted-foreground
```

Two entry cards using the standard `card` component pattern:

```
EDUCATION

┌───────────────────────────────────────────────────┐
│ King Mongkut's University of Technology           │
│ North Bangkok                      2020 – 2024    │
│ Bachelor of Computer Engineering                  │
│ GPA 3.58 · Second Class Honors                    │
│                                                   │
│ · Teaching Assistant, Programming Fundamental     │
│   (C, Python)                                     │
│ · Volunteer Lead — Computer lab setup at          │
│   Ban Yang Pao School, led 25+ students           │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ Debsirin School                    2016 – 2019    │
│ Science and Mathematics Program                   │
│ GPA 3.58                                          │
└───────────────────────────────────────────────────┘
```

Card styling tokens (from DESIGN.md):
- Container: `rounded-lg border border-border p-5`
- Institution name: `font-semibold text-foreground`
- Degree/program: `text-sm text-muted-foreground`
- Year (right-aligned): `shrink-0 text-xs text-muted-foreground`
- GPA / Honors line: `text-xs text-muted-foreground`
- Activity bullets: `text-sm text-muted-foreground`

No box shadows. No new colors outside the design system.

---

## i18n

New `education` namespace added to both `src/i18n/messages/en.json` and `src/i18n/messages/th.json`.

### en.json additions

```json
"education": {
  "title": "Education",
  "honors": "Second Class Honors",
  "university": {
    "name": "King Mongkut's University of Technology North Bangkok",
    "degree": "Bachelor of Computer Engineering",
    "years": "2020 – 2024",
    "ta": "Teaching Assistant, Programming Fundamental (C, Python)",
    "volunteer": "Volunteer Lead — Computer lab setup at Ban Yang Pao School, led 25+ students"
  },
  "highschool": {
    "name": "Debsirin School",
    "program": "Science and Mathematics Program",
    "years": "2016 – 2019"
  }
}
```

### th.json additions

```json
"education": {
  "title": "การศึกษา",
  "honors": "เกียรตินิยมอันดับสอง",
  "university": {
    "name": "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    "degree": "วิศวกรรมศาสตรบัณฑิต สาขาวิศวกรรมคอมพิวเตอร์",
    "years": "2020 – 2024",
    "ta": "ผู้ช่วยสอน วิชาพื้นฐานการเขียนโปรแกรม (C, Python)",
    "volunteer": "หัวหน้าอาสาสมัคร — ติดตั้งห้องคอมพิวเตอร์โรงเรียนบ้านยางเปา นำทีมนักศึกษากว่า 25 คน"
  },
  "highschool": {
    "name": "โรงเรียนเทพศิรินทร์",
    "program": "โปรแกรมวิทยาศาสตร์-คณิตศาสตร์",
    "years": "2016 – 2019"
  }
}
```

---

## Image folder

`public/images/blog/ban-yang-pao/` — created with `.gitkeep`. The user will add volunteer photos here before the blog post task begins.

---

## Files to create / modify

| File | Change |
|------|--------|
| `src/app/[locale]/resume/page.tsx` | Add Education section above `<embed>` |
| `src/i18n/messages/en.json` | Add `education` namespace |
| `src/i18n/messages/th.json` | Add `education` namespace |
| `public/blog/ban-yang-pao/` | Already exists — 9 photos added by user |

---

## Out of scope

- Blog post for Ban Yang Pao volunteer experience (future task)
- "See photos →" link on Volunteer Lead line (added when blog post is live)
- Primary school (Saint Dominic) — omitted intentionally
