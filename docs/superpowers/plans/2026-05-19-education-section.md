# Education Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual Education section to the `/resume` page, displayed above the PDF embed, covering KMUTNB (B.Eng. Computer Engineering, 2020–2024, GPA 3.58, Second Class Honors, two activities) and Debsirin School (Science & Mathematics, 2016–2019, GPA 3.58).

**Architecture:** All education text lives in the existing next-intl messages files under a new `education` namespace. The resume page fetches those translations with a second `getTranslations('education')` call and renders two hardcoded border cards above the `<embed>`. No data file, no new component — the data never changes.

**Tech Stack:** Next.js 16 App Router, next-intl, Tailwind v4, Vitest + @testing-library/react

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/i18n/messages/en.json` | Modify | Add `education` namespace (EN strings) |
| `src/i18n/messages/th.json` | Modify | Add `education` namespace (TH strings) |
| `src/app/[locale]/resume/__tests__/page.test.tsx` | Create | Tests for the education section rendering |
| `src/app/[locale]/resume/page.tsx` | Modify | Add Education section above PDF embed |
| `public/blog/ban-yang-pao/` | Already exists | Images 1.JPG–9.JPG already added by user |

---

## Task 1: Write the failing tests

**Files:**
- Create: `src/app/[locale]/resume/__tests__/page.test.tsx`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResumePage from '../page'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockImplementation(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`
  }),
}))

vi.mock('@/components/shared/ResumeDownloadButton', () => ({
  ResumeDownloadButton: ({ label }: { label: string }) => <button>{label}</button>,
}))

describe('ResumePage', () => {
  it('renders the education section heading', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.title')).toBeInTheDocument()
  })

  it('renders the university entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.university.name')).toBeInTheDocument()
    expect(screen.getByText('education.university.degree')).toBeInTheDocument()
  })

  it('renders the high school entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.highschool.name')).toBeInTheDocument()
    expect(screen.getByText('education.highschool.program')).toBeInTheDocument()
  })

  it('renders the PDF embed', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const embed = document.querySelector('embed')
    expect(embed).toBeInTheDocument()
    expect(embed?.getAttribute('src')).toBe('/resume.pdf')
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test:run -- src/app/\[locale\]/resume/__tests__/page.test.tsx
```

Expected: 3 tests fail with something like `Unable to find an element with the text: education.title`. The PDF embed test may pass if the page currently renders an `<embed>` — that's fine.

---

## Task 2: Add i18n strings

**Files:**
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/th.json`

- [ ] **Step 1: Add `education` namespace to `src/i18n/messages/en.json`**

Add after the closing `}` of the `"resume"` block (before the final `}`):

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

Full file after edit:

```json
{
  "nav": {
    "home": "Home",
    "blog": "Blog",
    "projects": "Projects",
    "resume": "Resume",
    "about": "About"
  },
  "blog": {
    "title": "Blog",
    "readMore": "Read more",
    "publishedOn": "Published on",
    "updatedOn": "Updated on"
  },
  "projects": {
    "title": "Projects",
    "viewProject": "View project",
    "status": {
      "inProgress": "In Progress",
      "completed": "Completed",
      "archived": "Archived"
    }
  },
  "common": {
    "backToBlog": "Back to Blog",
    "backToProjects": "Back to Projects",
    "archived": "Archived"
  },
  "resume": {
    "title": "Resume",
    "download": "Download PDF",
    "mobileNote": "PDF preview isn't available on mobile. Download to view."
  },
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
  },
  "notFound": {
    "heading": "Lost in the void",
    "body": "This page doesn't exist — but the rest of the site does.",
    "back": "Go back"
  }
}
```

- [ ] **Step 2: Add `education` namespace to `src/i18n/messages/th.json`**

Full file after edit:

```json
{
  "nav": {
    "home": "หน้าแรก",
    "blog": "บล็อก",
    "projects": "โปรเจกต์",
    "resume": "เรซูเม่",
    "about": "เกี่ยวกับ"
  },
  "blog": {
    "title": "บล็อก",
    "readMore": "อ่านต่อ",
    "publishedOn": "เผยแพร่เมื่อ",
    "updatedOn": "อัปเดตเมื่อ"
  },
  "projects": {
    "title": "โปรเจกต์",
    "viewProject": "ดูโปรเจกต์",
    "status": {
      "inProgress": "กำลังพัฒนา",
      "completed": "เสร็จสมบูรณ์",
      "archived": "เก็บถาวร"
    }
  },
  "common": {
    "backToBlog": "กลับไปบล็อก",
    "backToProjects": "กลับไปโปรเจกต์",
    "archived": "เก็บถาวร"
  },
  "resume": {
    "title": "เรซูเม่",
    "download": "ดาวน์โหลด PDF",
    "mobileNote": "ไม่สามารถแสดงตัวอย่าง PDF บนมือถือได้ กรุณาดาวน์โหลดเพื่อดู"
  },
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
  },
  "notFound": {
    "heading": "หลงทางแล้ว",
    "body": "ไม่พบหน้านี้ แต่ยังมีหน้าอื่นรออยู่นะ",
    "back": "กลับไป"
  }
}
```

- [ ] **Step 3: Run tests — still expect failures**

```bash
npm run test:run -- src/app/\[locale\]/resume/__tests__/page.test.tsx
```

Expected: same 3 failures — the page doesn't use the new translations yet.

---

## Task 3: Implement the Education section in the resume page

**Files:**
- Modify: `src/app/[locale]/resume/page.tsx`

- [ ] **Step 1: Replace the full file content**

```typescript
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ResumeDownloadButton } from '@/components/shared/ResumeDownloadButton'

export default async function ResumePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('resume')
  const edu = await getTranslations('education')

  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <ResumeDownloadButton
          label={t('download')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {edu('title')}
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu('university.name')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu('university.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu('university.degree')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              GPA 3.58 · {edu('honors')}
            </p>
            <ul className="mt-3 space-y-1">
              <li className="text-sm text-muted-foreground">
                · {edu('university.ta')}
              </li>
              <li className="text-sm text-muted-foreground">
                · {edu('university.volunteer')}
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu('highschool.name')}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu('highschool.years')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu('highschool.program')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              GPA 3.58
            </p>
          </div>
        </div>
      </section>

      <embed
        src="/resume.pdf"
        type="application/pdf"
        className="w-full rounded-lg border border-border"
        style={{ height: 'calc(100svh - 10rem)' }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Run tests — all should pass**

```bash
npm run test:run -- src/app/\[locale\]/resume/__tests__/page.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 3: Run full test suite to check for regressions**

```bash
npm run test:run
```

Expected: all tests pass.

---

## Task 4: Confirm image folder

**Files:**
- Existing: `public/blog/ban-yang-pao/` (1.JPG – 9.JPG already present)

- [ ] **Step 1: Verify images are in place**

```bash
ls public/blog/ban-yang-pao/
```

Expected: 1.JPG 2.JPG 3.JPG 4.JPG 5.JPG 6.JPG 7.JPG 8.JPG 9.JPG (or similar). No action needed — images are already there for the future blog post.

---

## Task 5: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open `/en/resume` in the browser**

Check:
- "EDUCATION" section heading appears above the PDF
- KMUTNB card shows institution name, degree, years (right-aligned), GPA · Second Class Honors, and both activity bullets
- Debsirin card shows school name, program, years (right-aligned), GPA
- PDF embed still renders below

- [ ] **Step 3: Switch to Thai locale — open `/th/resume`**

Check:
- Section heading shows "การศึกษา"
- University card shows Thai institution name and degree
- Activity bullets show Thai text
- High school card shows "โรงเรียนเทพศิรินทร์"

- [ ] **Step 4: Stop the dev server**
