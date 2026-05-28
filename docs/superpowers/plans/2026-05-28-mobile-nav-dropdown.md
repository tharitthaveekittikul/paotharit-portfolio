# Mobile Nav Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `⋯` button on mobile that opens a dropdown showing Docs, About, and Resume links hidden from the pill navbar.

**Architecture:** Extract a `"use client"` `MobileMenu` component that manages open/close state; `Header` stays a server component and passes locale + translated labels as props. The dropdown panel is absolutely positioned below the pill, styled to match the existing dark pill theme.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Vitest + React Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/shared/MobileMenu.tsx` | `⋯` button + dropdown panel, open/close state, click-outside |
| Modify | `src/components/shared/Header.tsx` | Import and render `<MobileMenu>` with locale + labels |
| Create | `src/components/shared/__tests__/MobileMenu.test.tsx` | Unit tests for MobileMenu |
| Modify | `src/components/shared/__tests__/Header.test.tsx` | Add mock + test for MobileMenu presence |

---

### Task 1: Write failing MobileMenu tests

**Files:**
- Create: `src/components/shared/__tests__/MobileMenu.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MobileMenu } from '../MobileMenu'

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }))

const defaultProps = {
  locale: 'en',
  labels: { docs: 'Docs', about: 'About', resume: 'Resume' },
  resumeHref: '/en/resume',
}

describe('MobileMenu', () => {
  it('renders the ⋯ trigger button', () => {
    render(<MobileMenu {...defaultProps} />)
    expect(screen.getByRole('button', { name: /more navigation links/i })).toBeInTheDocument()
  })

  it('dropdown is hidden by default', () => {
    render(<MobileMenu {...defaultProps} />)
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking the button shows the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Resume')).toBeInTheDocument()
  })

  it('clicking the button again hides the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /more navigation links/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking a link closes the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    fireEvent.click(screen.getByText('Docs'))
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking outside closes the dropdown', () => {
    render(
      <div>
        <MobileMenu {...defaultProps} />
        <button>outside</button>
      </div>
    )
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('docs link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs').closest('a')).toHaveAttribute('href', '/en/docs')
  })

  it('about link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/en/about')
  })

  it('resume link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Resume').closest('a')).toHaveAttribute('href', '/en/resume')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/components/shared/__tests__/MobileMenu.test.tsx
```

Expected: all tests FAIL with "Cannot find module '../MobileMenu'"

---

### Task 2: Implement MobileMenu

**Files:**
- Create: `src/components/shared/MobileMenu.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ResumeLink } from './ResumeLink'

interface MobileMenuProps {
  locale: string
  labels: { docs: string; about: string; resume: string }
  resumeHref: string
}

export function MobileMenu({ locale, labels, resumeHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-label="More navigation links"
        className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
      >
        ⋯
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[120px] rounded-lg border border-white/10 bg-zinc-900 py-1 dark:border-zinc-900/10 dark:bg-white"
          onClick={() => setOpen(false)}
        >
          <Link
            href={`/${locale}/docs`}
            className="block px-4 py-2 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {labels.docs}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="block px-4 py-2 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {labels.about}
          </Link>
          <ResumeLink
            label={labels.resume}
            href={resumeHref}
            location="nav"
            className="block px-4 py-2 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run MobileMenu tests to verify they pass**

```bash
npm run test:run -- src/components/shared/__tests__/MobileMenu.test.tsx
```

Expected: all 9 tests PASS

---

### Task 3: Integrate MobileMenu into Header

**Files:**
- Modify: `src/components/shared/Header.tsx`
- Modify: `src/components/shared/__tests__/Header.test.tsx`

- [ ] **Step 1: Add failing Header test for MobileMenu**

Add this mock and test to `src/components/shared/__tests__/Header.test.tsx`:

At the top with the other `vi.mock` calls, add:
```tsx
vi.mock('../MobileMenu', () => ({
  MobileMenu: ({ labels }: { labels: { docs: string; about: string; resume: string } }) => (
    <button aria-label="More navigation links">{labels.docs}</button>
  ),
}))
```

Add this test inside the `describe('Header', ...)` block:
```tsx
it('renders MobileMenu with correct labels and locale', async () => {
  const { Header } = await import('../Header')
  const jsx = await Header()
  render(jsx)
  expect(screen.getByRole('button', { name: /more navigation links/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run Header tests to verify the new test fails**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: the new test FAILS, all existing tests PASS

- [ ] **Step 3: Update Header.tsx to import and render MobileMenu**

Replace the entire `src/components/shared/Header.tsx` with:

```tsx
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SearchButton } from "./SearchButton"
import { SocialLinks } from './SocialLinks'
import { EmailLink } from './EmailLink'
import { ResumeLink } from './ResumeLink'
import { MobileMenu } from './MobileMenu'

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)]">
      <nav className="flex items-center gap-1 overflow-hidden rounded-full bg-zinc-900 px-2 py-1.5 backdrop-blur sm:gap-2 sm:px-3 sm:py-2 dark:bg-white">
        <Link
          href={`/${locale}`}
          className="px-1 text-sm font-semibold text-zinc-50 sm:px-2 dark:text-zinc-900"
        >
          paotharit
        </Link>
        <div className="flex items-center">
          <Link
            href={`/${locale}/blog`}
            className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('projects')}
          </Link>
          <Link
            href={`/${locale}/docs`}
            className="hidden sm:inline-flex px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('docs')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="hidden sm:inline-flex px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          >
            {t('about')}
          </Link>
          <ResumeLink
            label={t('resume')}
            href={`/${locale}/resume`}
            location="nav"
            className="hidden px-2 py-1 text-sm text-zinc-400 hover:text-zinc-50 sm:inline-flex sm:px-3 dark:text-zinc-500 dark:hover:text-zinc-900"
          />
          <MobileMenu
            locale={locale}
            labels={{ docs: t('docs'), about: t('about'), resume: t('resume') }}
            resumeHref={`/${locale}/resume`}
          />
        </div>
        <div data-testid="social-links" className="hidden lg:flex items-center">
          <SocialLinks className="p-2 text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900" />
        </div>
        <div className="flex items-center gap-1">
          <SearchButton />
          <LocaleSwitcher />
          <ThemeToggle />
          <EmailLink />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Run all Header tests to verify they all pass**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: all tests PASS including the new MobileMenu test

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npm run test:run
```

Expected: all tests PASS

- [ ] **Step 6: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Resize to mobile width (< 640px). Verify:
- `⋯` button appears between `Projects` and the icon controls
- Clicking `⋯` shows a dropdown with Docs, About, Resume
- Clicking any dropdown link closes it and navigates
- Clicking outside the dropdown closes it
- At `sm` breakpoint and above, the `⋯` button disappears and Docs/About/Resume show inline as before
