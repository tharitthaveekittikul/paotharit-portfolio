# Theme Toggle Switch + Circular Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the emoji ghost button theme toggle with an iOS-style pill switch that triggers a circular View Transition reveal animation expanding from the toggle across the full viewport.

**Architecture:** The `ThemeToggle` component becomes a `role="switch"` button with a pill track and sliding thumb using Tailwind. On click, it reads its own bounding rect, sets CSS custom properties (`--vt-x`, `--vt-y`, `--vt-r`) on `:root`, then wraps `setTheme()` in `document.startViewTransition()`. The CSS uses `::view-transition-new(root)` with a `clip-path: circle()` keyframe to animate the reveal. Browsers without the API fall back silently.

**Tech Stack:** React, next-themes, lucide-react, Tailwind CSS, View Transition API (native browser), Vitest + @testing-library/react

---

## File Map

| Action | Path                                                   | Responsibility                                          |
| ------ | ------------------------------------------------------ | ------------------------------------------------------- |
| Modify | `src/components/shared/ThemeToggle.tsx`                | Pill switch UI + View Transition click handler          |
| Modify | `src/app/globals.css`                                  | `::view-transition-*` keyframe rules                    |
| Create | `src/components/shared/__tests__/ThemeToggle.test.tsx` | Unit tests for switch rendering + theme switching logic |

---

### Task 1: Write failing tests for ThemeToggle

**Files:**

- Create: `src/components/shared/__tests__/ThemeToggle.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

let mockTheme = "light";
const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
    delete (document as any).startViewTransition;
  });

  it("renders a switch button after mount", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("switch", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("has aria-checked false in light mode", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("has aria-checked true in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls setTheme with dark when clicked in light mode", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with light when clicked in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("wraps setTheme in startViewTransition when available", () => {
    const mockTransition = vi.fn((cb: () => void) => cb());
    (document as any).startViewTransition = mockTransition;

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));

    expect(mockTransition).toHaveBeenCalled();
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme directly when startViewTransition is unavailable", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/shared/__tests__/ThemeToggle.test.tsx
```

Expected: FAIL — `ThemeToggle` currently renders a `<button>` with no `role="switch"`, so `getByRole('switch')` throws.

---

### Task 2: Rewrite ThemeToggle component

**Files:**

- Modify: `src/components/shared/ThemeToggle.tsx`

- [ ] **Step 1: Replace the entire file with this implementation**

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-11 h-6" />;

  const isDark = theme === "dark";

  const handleClick = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);
    document.documentElement.style.setProperty("--vt-r", `${r}px`);

    const next = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    document.startViewTransition(() => setTheme(next));
  };

  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-300 ${
        isDark ? "bg-zinc-700" : "bg-zinc-200"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-6" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon size={10} className="text-zinc-700" />
        ) : (
          <Sun size={10} className="text-zinc-500" />
        )}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npx vitest run src/components/shared/__tests__/ThemeToggle.test.tsx
```

Expected: All 7 tests PASS.

---

### Task 3: Add View Transition CSS to globals.css

**Files:**

- Modify: `src/app/globals.css`

- [ ] **Step 1: Append these rules at the end of `src/app/globals.css`** (after the closing `}` of the `@layer base` block)

```css
::view-transition-old(root) {
  animation: none;
}

::view-transition-new(root) {
  clip-path: circle(0 at var(--vt-x) var(--vt-y));
  animation: vt-reveal 0.5s ease-in-out forwards;
}

@keyframes vt-reveal {
  to {
    clip-path: circle(var(--vt-r) at var(--vt-x) var(--vt-y));
  }
}
```

- [ ] **Step 2: Run the dev server and manually verify the animation**

```bash
npm run dev
```

Open `http://localhost:3000`. Click the pill switch in the header. You should see a circle expand from the toggle outward to reveal the new theme across the full viewport. On browsers without the View Transition API, the theme should still switch with no animation and no errors.
