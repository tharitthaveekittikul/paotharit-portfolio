# Screenshot Masonry Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Screenshots section's uniform 2-column CSS grid with a reusable `ScreenshotGrid` MDX component that renders a CSS masonry (multi-column) layout.

**Architecture:** Create a single server component `ScreenshotGrid` that wraps children in `columns-1 sm:columns-2` with `[&>*]:break-inside-avoid` to prevent figure splits. Register it in `mdxComponents` so all MDX files can use it. Migrate Zentri's existing screenshots div to the new component.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (CSS-first, no tailwind.config.js), Vitest + @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/mdx/ScreenshotGrid.tsx` | Masonry wrapper component |
| Create | `src/components/mdx/__tests__/ScreenshotGrid.test.tsx` | Component tests |
| Modify | `src/components/mdx/index.ts` | Export + register in mdxComponents |
| Modify | `content/en/projects/zentri.mdx` | Replace div wrapper with ScreenshotGrid |

---

### Task 1: Create ScreenshotGrid component (TDD)

**Files:**
- Create: `src/components/mdx/__tests__/ScreenshotGrid.test.tsx`
- Create: `src/components/mdx/ScreenshotGrid.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/mdx/__tests__/ScreenshotGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScreenshotGrid } from '../ScreenshotGrid'

describe('ScreenshotGrid', () => {
  it('renders children', () => {
    render(
      <ScreenshotGrid>
        <figure data-testid="fig">img</figure>
      </ScreenshotGrid>
    )
    expect(screen.getByTestId('fig')).toBeInTheDocument()
  })

  it('applies masonry and not-prose classes', () => {
    const { container } = render(
      <ScreenshotGrid>
        <div />
      </ScreenshotGrid>
    )
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('not-prose')
    expect(div.className).toContain('columns-1')
    expect(div.className).toContain('sm:columns-2')
  })

  it('merges custom className', () => {
    const { container } = render(
      <ScreenshotGrid className="mt-8">
        <div />
      </ScreenshotGrid>
    )
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('mt-8')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/components/mdx/__tests__/ScreenshotGrid.test.tsx
```

Expected: FAIL — `Cannot find module '../ScreenshotGrid'`

- [ ] **Step 3: Create the component**

Create `src/components/mdx/ScreenshotGrid.tsx`:

```tsx
interface ScreenshotGridProps {
  children: React.ReactNode
  className?: string
}

export function ScreenshotGrid({ children, className }: ScreenshotGridProps) {
  return (
    <div className={`not-prose columns-1 sm:columns-2 gap-4 [&>*]:break-inside-avoid${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/components/mdx/__tests__/ScreenshotGrid.test.tsx
```

Expected: PASS — 3 tests passing

---

### Task 2: Register ScreenshotGrid in MDX components

**Files:**
- Modify: `src/components/mdx/index.ts`

Current `index.ts` imports and exports:

```ts
import { Callout } from './Callout'
import { CodeBlock } from './CodeBlock'
import { Mermaid } from './Mermaid'
import { TradingChart } from './TradingChart'
import { ZoomableImage } from './ZoomableImage'

export { Callout, CodeBlock, Mermaid, TradingChart, ZoomableImage }

export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
  ZoomableImage,
  img: ZoomableImage as MDXComponents['img'],
  ...
}
```

- [ ] **Step 1: Add import, export, and mdxComponents entry**

Edit `src/components/mdx/index.ts` — add ScreenshotGrid in three places:

1. Add import after ZoomableImage import:
```ts
import { ScreenshotGrid } from './ScreenshotGrid'
```

2. Add to named exports:
```ts
export { Callout, CodeBlock, Mermaid, TradingChart, ZoomableImage, ScreenshotGrid }
```

3. Add to `mdxComponents` object:
```ts
export const mdxComponents: MDXComponents = {
  Callout,
  Mermaid,
  TradingChart,
  ZoomableImage,
  ScreenshotGrid,
  img: ZoomableImage as MDXComponents['img'],
  ...
}
```

- [ ] **Step 2: Verify build compiles cleanly**

```bash
npm run build
```

Expected: No TypeScript errors, build completes successfully.

---

### Task 3: Migrate Zentri screenshots to ScreenshotGrid

**Files:**
- Modify: `content/en/projects/zentri.mdx`

> **Note:** `content/` is synced from Obsidian. This is a one-time direct edit. You must also update the corresponding Obsidian source note before the next `npm run sync` or the change will be reverted.

The current Screenshots section wrapper in `content/en/projects/zentri.mdx`:

```mdx
<div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
  ...figures...
</div>
```

- [ ] **Step 1: Replace the outer div with ScreenshotGrid**

Change the opening tag from:
```mdx
<div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
```

To:
```mdx
<ScreenshotGrid>
```

And change the closing tag from:
```mdx
</div>
```

To:
```mdx
</ScreenshotGrid>
```

Leave all `<figure>`, `<ZoomableImage>`, and `<figcaption>` elements unchanged.

- [ ] **Step 2: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000/en/projects/zentri` (or `/th/projects/zentri`).

Check:
- Screenshots section renders as 2 columns on desktop
- Screenshots section renders as 1 column on mobile (resize browser or use DevTools)
- Each figure (image + caption) stays together — neither image nor caption breaks across columns
- Clicking an image opens the zoom modal (ZoomableImage behavior unchanged)

- [ ] **Step 3: Run full test suite**

```bash
npm run test:run
```

Expected: All tests pass.
