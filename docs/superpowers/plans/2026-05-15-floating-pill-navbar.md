# Floating Pill Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current sticky top-bar header with a fixed, centered, floating pill-shaped navbar matching the approved reference design.

**Architecture:** Three files change — `Header.tsx` is fully rewritten as a pill shell, `SearchButton.tsx` is simplified to icon-only, and `layout.tsx` gains `pt-20` on `<main>` to clear the fixed pill. Tests update in lockstep with each change.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, next-intl, next-themes, lucide-react

---

## File Map

| File | Change |
|------|--------|
| `src/components/shared/Header.tsx` | Full rewrite — pill shell, email CTA, remove social links |
| `src/components/shared/__tests__/Header.test.tsx` | Remove social-links tests, add email + nav tests |
| `src/components/shared/SearchButton.tsx` | Remove text/kbd, icon-only button |
| `src/app/[locale]/layout.tsx` | Add `pt-20` to `<main>` |

---

## Task 1: Update Header tests to reflect new structure

**Files:**
- Modify: `src/components/shared/__tests__/Header.test.tsx`

- [ ] **Step 1: Replace the file with updated tests**

```tsx
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('../SearchButton', () => ({ SearchButton: () => <button>Search</button> }))
vi.mock('../LocaleSwitcher', () => ({ LocaleSwitcher: () => <button>Locale</button> }))
vi.mock('../ThemeToggle', () => ({ ThemeToggle: () => <button>Theme</button> }))

describe('Header', () => {
  it('renders the logo link pointing to locale root', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    const logo = screen.getByText('paotharit')
    expect(logo.closest('a')).toHaveAttribute('href', '/en')
  })

  it('renders blog and projects nav links', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    expect(screen.getByText('blog').closest('a')).toHaveAttribute('href', '/en/blog')
    expect(screen.getByText('projects').closest('a')).toHaveAttribute('href', '/en/projects')
  })

  it('renders email mailto link', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    const emailLink = screen.getByRole('link', { name: /tharit\.thaveekittikul@gmail\.com/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:tharit.thaveekittikul@gmail.com')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: 2 new tests FAIL (`blog and projects nav links`, `email mailto link`). The social-links tests are gone. The logo test may still pass (logo text unchanged).

---

## Task 2: Rewrite Header.tsx as floating pill

**Files:**
- Modify: `src/components/shared/Header.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SearchButton } from "./SearchButton"

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-max max-w-[calc(100vw-2rem)]">
      <nav className="flex items-center gap-2 rounded-full border-2 border-zinc-900 bg-white/90 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-zinc-950/90">
        <Link
          href={`/${locale}`}
          className="px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          paotharit
        </Link>
        <div className="flex items-center">
          <Link
            href={`/${locale}/blog`}
            className="px-3 py-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="px-3 py-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t('projects')}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <SearchButton />
          <LocaleSwitcher />
          <ThemeToggle />
          <a
            href="mailto:tharit.thaveekittikul@gmail.com"
            className="ml-1 hidden rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white sm:inline-flex dark:bg-white dark:text-zinc-900"
          >
            tharit.thaveekittikul@gmail.com
          </a>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/shared/__tests__/Header.test.tsx
```

Expected: all 3 tests PASS.

---

## Task 3: Simplify SearchButton to icon-only

**Files:**
- Modify: `src/components/shared/SearchButton.tsx`

The current SearchButton renders a bordered box with "Search ⌘K" text. Inside the pill it should be a minimal icon button.

- [ ] **Step 1: Replace SearchButton implementation**

```tsx
"use client";

import { Search } from "lucide-react";
import { useCommandPalette } from "./CommandPaletteProvider";

export function SearchButton() {
  const { setOpen } = useCommandPalette();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="cursor-pointer p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
```

- [ ] **Step 2: Run SearchButton tests to confirm they still pass**

```bash
npm run test:run -- src/components/shared/__tests__/SearchButton.test.tsx
```

Expected: both tests PASS (aria-label and click handler are unchanged).

---

## Task 4: Add pt-20 to layout main

**Files:**
- Modify: `src/app/[locale]/layout.tsx:41`

- [ ] **Step 1: Add `pt-20` to the `<main>` element**

Change line 41 from:
```tsx
<main className="flex-1">{children}</main>
```
to:
```tsx
<main className="flex-1 pt-20">{children}</main>
```

- [ ] **Step 2: Run full test suite to confirm nothing broke**

```bash
npm run test:run
```

Expected: all tests PASS.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Check:
- Pill floats centered at top with space above it
- Light mode: white pill with thick dark border, dark email button
- Dark mode: dark pill with subtle border, white email button
- Email button hidden on mobile (< 640px)
- Search icon opens command palette
- Locale switcher and theme toggle work as before
- Page content starts below the pill (not hidden behind it)
