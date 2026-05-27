# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/about` page with a bio intro, "How I operate" systems showcase, and a closing CTA — then wire it into the header nav.

**Architecture:** A single async server component at `src/app/[locale]/about/page.tsx`, following the same pattern as existing pages (no `"use client"`, `setRequestLocale` + `getTranslations`, `generateMetadata`). All static text goes through `next-intl` translation keys. Images use `next/image`.

**Tech Stack:** Next.js 16 App Router, next-intl, Tailwind v4, shadcn/ui Badge, next/image

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/i18n/messages/en.json` |
| Modify | `src/i18n/messages/th.json` |
| Create | `src/app/[locale]/about/page.tsx` |
| Create | `src/app/[locale]/about/__tests__/page.test.tsx` |
| Modify | `src/components/shared/Header.tsx` |
| Modify | `src/components/shared/__tests__/Header.test.tsx` |

---

## Task 1: Add i18n translation keys

**Files:**
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/th.json`

- [ ] **Step 1: Add `about` namespace to `en.json`**

Add this block inside the root JSON object (alongside `"nav"`, `"blog"`, etc.):

```json
"about": {
  "title": "About",
  "openToWork": "Open to new opportunities",
  "bio": "I'm Tharit — I build AI systems, trading tools, and the kind of productivity infrastructure most people just talk about. I care about how things work under the hood and how the tools I build change the way people operate.",
  "systems": {
    "title": "How I operate",
    "obsidian": {
      "title": "Knowledge OS",
      "description": "I run my thinking through Obsidian — 1,000+ notes organized with PARA (Projects, Areas, Resources, Archives), with Kanban boards for active projects. The graph view makes it obvious: every idea connects to something else."
    },
    "ai": {
      "title": "AI Workflow",
      "description": "Claude Code is my primary development environment. I've built custom skills, hooks, and workflows that integrate LLMs into how I write, plan, and ship code every day."
    },
    "homelab": {
      "title": "Home Infrastructure",
      "description": "I run a Synology NAS at home with Docker containers, n8n for automations, and a handful of self-hosted services. If I can automate it or self-host it, I probably have."
    }
  },
  "closing": "I'm looking for a team that moves fast, cares about craft, and builds things worth building. If that sounds like your team, I'd like to talk.",
  "linkedin": "LinkedIn →"
}
```

- [ ] **Step 2: Add `about` namespace to `th.json`**

Add this block inside the root JSON object:

```json
"about": {
  "title": "เกี่ยวกับ",
  "openToWork": "พร้อมรับโอกาสใหม่",
  "bio": "ผมคือธาริต — ผมสร้างระบบ AI, เครื่องมือเทรดดิ้ง และโครงสร้างพื้นฐานด้านการทำงานที่คนส่วนใหญ่แค่พูดถึง ผมสนใจกลไกภายในว่าทุกอย่างทำงานอย่างไร และเครื่องมือที่สร้างช่วยเปลี่ยนแปลงวิธีทำงานของผู้คน",
  "systems": {
    "title": "วิธีที่ผมทำงาน",
    "obsidian": {
      "title": "ระบบจัดการความรู้",
      "description": "ผมใช้ Obsidian จัดการความคิด — บันทึกกว่า 1,000 รายการจัดระเบียบด้วย PARA พร้อม Kanban boards สำหรับโปรเจกต์ที่กำลังทำ Graph view แสดงให้เห็นว่าทุกความคิดเชื่อมต่อกัน"
    },
    "ai": {
      "title": "กระบวนการทำงานกับ AI",
      "description": "Claude Code คือสภาพแวดล้อมการพัฒนาหลักของผม ผมสร้าง skills, hooks และ workflows ที่ผสาน LLMs เข้ากับการเขียน วางแผน และ ship code ทุกวัน"
    },
    "homelab": {
      "title": "โครงสร้างพื้นฐานที่บ้าน",
      "description": "ผมรัน Synology NAS ที่บ้านพร้อม Docker containers, n8n สำหรับ automations และบริการ self-hosted หลายอย่าง ถ้า automate หรือ self-host ได้ ผมก็มีไว้แล้ว"
    }
  },
  "closing": "ผมกำลังมองหาทีมที่เดินหน้าเร็ว ใส่ใจในงานฝีมือ และสร้างสิ่งที่มีคุณค่า ถ้านั่นคือทีมของคุณ ผมอยากคุย",
  "linkedin": "LinkedIn →"
}
```

- [ ] **Step 3: Run lint to verify JSON is valid**

```bash
npm run lint
```

Expected: no errors.

---

## Task 2: Write failing tests for the About page

**Files:**
- Create: `src/app/[locale]/about/__tests__/page.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('@/components/shared/EmailLink', () => ({
  EmailLink: () => <a href="mailto:paopaioz.t@gmail.com">Email</a>,
}))

describe('AboutPage', () => {
  it('renders profile image with correct alt text', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByRole('img', { name: 'Tharit Thaveekittikul' })).toBeInTheDocument()
  })

  it('renders open to work badge', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('openToWork')).toBeInTheDocument()
  })

  it('renders all three system section titles', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('systems.obsidian.title')).toBeInTheDocument()
    expect(screen.getByText('systems.ai.title')).toBeInTheDocument()
    expect(screen.getByText('systems.homelab.title')).toBeInTheDocument()
  })

  it('renders LinkedIn link in closing section', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/paotharit/'
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/app/\[locale\]/about/__tests__/page.test.tsx
```

Expected: 4 failures — `../page` module not found.

---

## Task 3: Implement the About page

**Files:**
- Create: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Create the page component**

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { EmailLink } from '@/components/shared/EmailLink'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title') }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="mb-20">
        <div className="flex items-start gap-6">
          <Image
            src="/about/profile.jpg"
            alt="Tharit Thaveekittikul"
            width={96}
            height={96}
            className="rounded-lg object-cover shrink-0"
          />
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tharit Thaveekittikul
              </h1>
              <Badge variant="secondary">{t('openToWork')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Software Engineer</p>
            <p className="mt-3 max-w-xl text-muted-foreground">{t('bio')}</p>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t('systems.title')}
        </h2>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="relative aspect-video w-full">
              <Image
                src="/about/obsidian-graph.png"
                alt="Obsidian knowledge graph"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="mb-2 font-semibold text-foreground">
                {t('systems.obsidian.title')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('systems.obsidian.description')}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-2 font-semibold text-foreground">{t('systems.ai.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('systems.ai.description')}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="relative aspect-video w-full">
              <Image
                src="/projects/n8n-watchlist-tracking/n8n-workflow.png"
                alt="n8n automation workflow"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="mb-2 font-semibold text-foreground">
                {t('systems.homelab.title')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('systems.homelab.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-6 max-w-xl text-muted-foreground">{t('closing')}</p>
        <div className="flex items-center gap-4">
          <EmailLink />
          <Link
            href="https://www.linkedin.com/in/paotharit/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('linkedin')}
          </Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
npm run test:run -- src/app/\[locale\]/about/__tests__/page.test.tsx
```

Expected: 4 passing.

---

## Task 4: Add About link to Header

**Files:**
- Modify: `src/components/shared/Header.tsx`
- Modify: `src/components/shared/__tests__/Header.test.tsx`

- [ ] **Step 1: Read the current Header test to understand existing assertions**

Open `src/components/shared/__tests__/Header.test.tsx` and note which links are already tested.

- [ ] **Step 2: Add a failing test for the About link**

Add this `it` block inside the existing `describe` in `src/components/shared/__tests__/Header.test.tsx`:

```tsx
it('renders the About nav link', async () => {
  const { Header } = await import('../Header')
  const jsx = await Header()
  render(jsx)
  const aboutLink = screen.getByRole('link', { name: /about|เกี่ยวกับ/i })
  expect(aboutLink).toBeInTheDocument()
  expect(aboutLink).toHaveAttribute('href', '/en/about')
})
```

- [ ] **Step 3: Run to confirm the new test fails**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: the new `about` test fails, existing tests pass.

- [ ] **Step 4: Add the About link in `Header.tsx`**

In `src/components/shared/Header.tsx`, in the nav links `<div className="flex items-center">`, add after the `docs` link and before the `ResumeLink`:

```tsx
<Link
  href={`/${locale}/about`}
  className="hidden sm:inline-flex px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
>
  {t('about')}
</Link>
```

- [ ] **Step 5: Run all Header tests to confirm they pass**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: all tests pass.

---

## Task 5: Full test run and dev check

- [ ] **Step 1: Run the full test suite**

```bash
npm run test:run
```

Expected: all tests pass, no regressions.

- [ ] **Step 2: Start dev server and verify the About page**

```bash
npm run dev
```

Open `http://localhost:3000/en/about` and verify:
- Profile image placeholder area renders (will show broken image until `public/about/profile.jpg` is added)
- "Open to new opportunities" badge is visible
- Bio text renders
- All three system cards render with correct titles and descriptions
- Obsidian graph card shows image area (broken until `public/about/obsidian-graph.png` is added)
- n8n workflow card shows the existing image from `public/projects/n8n-watchlist-tracking/`
- Closing paragraph renders
- LinkedIn link is present and correct
- "About" link appears in the header nav

- [ ] **Step 3: Verify TH locale**

Open `http://localhost:3000/th/about` and confirm all text switches to Thai.

---

## After implementation — user-provided assets

Drop these files into place when ready:

| File | What it is |
|------|-----------|
| `public/about/profile.jpg` | Your profile photo |
| `public/about/obsidian-graph.png` | The graph view screenshot you shared |

The page will render correctly with placeholder broken images until these are added — no code change needed.
