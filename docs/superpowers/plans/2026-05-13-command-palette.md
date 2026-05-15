# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global `Cmd+K`/`Ctrl+K` command palette that searches blog posts, projects, doc pages, and doc section headings — and executes actions like toggling theme or switching locale.

**Architecture:** A `CommandPaletteProvider` (client component) manages open state and registers keyboard shortcuts; a `CommandPalette` component powered by `cmdk` fetches a static search index from `/api/search?locale=en` once per session and caches it in a ref; the Header gains a `SearchButton` trigger. The provider lives inside `ThemeProvider` in the layout so the palette can call `useTheme()`.

**Tech Stack:** Next.js 16 App Router, cmdk, next-themes, next-intl, lucide-react, Tailwind CSS v4, Vitest + @testing-library/react

---

## File Map

| File                                               | Action | Responsibility                                                                        |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `src/app/api/search/route.ts`                      | Create | GET handler — assembles flat `SearchEntry[]` from blog, projects, docs, headings      |
| `src/components/shared/CommandPaletteProvider.tsx` | Create | React context with `open/setOpen`, `Cmd+K`/`Ctrl+K`/`Escape` keyboard listener        |
| `src/components/shared/SearchButton.tsx`           | Create | Header icon button that calls `setOpen(true)`                                         |
| `src/components/shared/CommandPalette.tsx`         | Create | cmdk UI — fetches index, groups results, handles navigation and actions               |
| `src/app/[locale]/layout.tsx`                      | Modify | Wrap `ThemeProvider` children with `CommandPaletteProvider`, add `<CommandPalette />` |
| `src/components/shared/Header.tsx`                 | Modify | Add `<SearchButton />` before `<LocaleSwitcher />`                                    |

---

### Task 1: Install cmdk

**Files:** none

- [ ] **Step 1: Install the package**

```bash
npm install cmdk
```

Expected: `cmdk` appears in `package.json` under `dependencies`.

- [ ] **Step 2: Verify install**

```bash
node -e "require('cmdk'); console.log('ok')"
```

Expected: prints `ok`

---

### Task 2: Search index API route

**Files:**

- Create: `src/app/api/search/route.ts`
- Test: `src/app/api/search/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/api/search/__tests__/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/content", () => ({
  getAllContent: vi.fn(),
}));

vi.mock("@/lib/docs", () => ({
  buildSidebarTree: vi.fn(),
  getDocBySlug: vi.fn(),
  extractHeadings: vi.fn(),
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import { GET } from "../route";
import { getAllContent } from "@/lib/content";
import { buildSidebarTree, getDocBySlug, extractHeadings } from "@/lib/docs";
import { existsSync, readdirSync } from "fs";

const mockGetAllContent = vi.mocked(getAllContent);
const mockBuildSidebarTree = vi.mocked(buildSidebarTree);
const mockGetDocBySlug = vi.mocked(getDocBySlug);
const mockExtractHeadings = vi.mocked(extractHeadings);
const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockGetAllContent.mockReturnValue([]);
  });

  it("returns blog entries", async () => {
    mockGetAllContent.mockImplementation((type) => {
      if (type === "blog")
        return [
          {
            slug: "hello",
            title: "Hello World",
            description: "A blog post",
            tags: ["react"],
            type: "blog" as const,
            status: "published" as const,
            featured: false,
            date: "2024-01-01",
            techStack: [],
          },
        ];
      return [];
    });
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "blog",
        title: "Hello World",
        href: "/en/blog/hello",
      }),
    );
  });

  it("returns project entries with techStack as tags", async () => {
    mockGetAllContent.mockImplementation((type) => {
      if (type === "projects")
        return [
          {
            slug: "zentri",
            title: "Zentri",
            description: "Finance app",
            tags: [],
            techStack: ["Next.js", "TypeScript"],
            type: "project" as const,
            status: "published" as const,
            featured: true,
            date: "2024-01-01",
          },
        ];
      return [];
    });
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "project",
        title: "Zentri",
        href: "/en/projects/zentri",
        tags: ["Next.js", "TypeScript"],
      }),
    );
  });

  it("returns doc and section entries from docs directory", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["zentri"] as any);
    mockBuildSidebarTree.mockReturnValue([
      {
        type: "item",
        label: "Overview",
        href: "/en/docs/zentri/overview",
        slug: ["overview"],
      },
    ]);
    mockGetDocBySlug.mockReturnValue({
      frontmatter: { title: "Overview", description: "Intro", type: "doc" },
      content: "## Introduction",
    });
    mockExtractHeadings.mockReturnValue([
      { text: "Introduction", id: "introduction", level: 2 },
    ]);
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "doc",
        title: "Overview",
        href: "/en/docs/zentri/overview",
      }),
    );
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "section",
        title: "Introduction",
        href: "/en/docs/zentri/overview#introduction",
        breadcrumb: "Zentri > Overview",
      }),
    );
  });

  it("skips docs when directory does not exist", async () => {
    mockExistsSync.mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data.filter((e: any) => e.type === "doc")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/app/api/search/__tests__/route.test.ts
```

Expected: FAIL — "Cannot find module '../route'"

- [ ] **Step 3: Create the API route**

Create `src/app/api/search/route.ts`:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { getAllContent } from "@/lib/content";
import {
  buildSidebarTree,
  getDocBySlug,
  extractHeadings,
  type SidebarNode,
  type DocItem,
} from "@/lib/docs";

export type SearchEntry = {
  type: "blog" | "project" | "doc" | "section" | "action";
  title: string;
  description?: string;
  tags?: string[];
  href: string;
  breadcrumb?: string;
};

function flattenItems(
  nodes: SidebarNode[],
  breadcrumbParts: string[],
): Array<{ item: DocItem; breadcrumb: string }> {
  const result: Array<{ item: DocItem; breadcrumb: string }> = [];
  for (const node of nodes) {
    if (node.type === "item") {
      result.push({ item: node, breadcrumb: breadcrumbParts.join(" > ") });
    } else {
      result.push(
        ...flattenItems(node.children, [...breadcrumbParts, node.label]),
      );
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "en";
  const entries: SearchEntry[] = [];

  for (const post of getAllContent("blog", locale)) {
    entries.push({
      type: "blog",
      title: post.title,
      description: post.description,
      tags: post.tags,
      href: `/${locale}/blog/${post.slug}`,
    });
  }

  for (const project of getAllContent("projects", locale)) {
    entries.push({
      type: "project",
      title: project.title,
      description: project.description,
      tags: project.techStack,
      href: `/${locale}/projects/${project.slug}`,
    });
  }

  const docsRoot = join(process.cwd(), "content", locale, "docs");
  if (existsSync(docsRoot)) {
    for (const projectName of readdirSync(docsRoot) as string[]) {
      const projectLabel =
        projectName.charAt(0).toUpperCase() + projectName.slice(1);
      const tree = buildSidebarTree(projectName, locale);
      const flatItems = flattenItems(tree, [projectLabel]);

      for (const { item, breadcrumb } of flatItems) {
        entries.push({
          type: "doc",
          title: item.label,
          href: item.href,
          breadcrumb,
        });

        const doc = getDocBySlug(projectName, item.slug, locale);
        if (doc) {
          for (const heading of extractHeadings(doc.content)) {
            entries.push({
              type: "section",
              title: heading.text,
              href: `${item.href}#${heading.id}`,
              breadcrumb: `${breadcrumb} > ${item.label}`,
            });
          }
        }
      }
    }
  }

  return NextResponse.json(entries);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/app/api/search/__tests__/route.test.ts
```

Expected: PASS (4 tests)

---

### Task 3: CommandPaletteProvider

**Files:**

- Create: `src/components/shared/CommandPaletteProvider.tsx`
- Test: `src/components/shared/__tests__/CommandPaletteProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/CommandPaletteProvider.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "../CommandPaletteProvider";

function TestConsumer() {
  const { open, setOpen } = useCommandPalette();
  return (
    <div>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <button onClick={() => setOpen(true)}>open</button>
    </div>
  );
}

describe("CommandPaletteProvider", () => {
  it("provides open=false by default", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("setOpen(true) updates state", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.click(screen.getByText("open"));
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  it("Cmd+K toggles open", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("Ctrl+K toggles open", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  it("Escape closes palette", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/shared/__tests__/CommandPaletteProvider.test.tsx
```

Expected: FAIL — "Cannot find module '../CommandPaletteProvider'"

- [ ] **Step 3: Implement CommandPaletteProvider**

Create `src/components/shared/CommandPaletteProvider.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: false,
  setOpen: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/shared/__tests__/CommandPaletteProvider.test.tsx
```

Expected: PASS (5 tests)

---

### Task 4: SearchButton

**Files:**

- Create: `src/components/shared/SearchButton.tsx`
- Test: `src/components/shared/__tests__/SearchButton.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/SearchButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPaletteContext } from "../CommandPaletteProvider";
import { SearchButton } from "../SearchButton";

function renderWithContext(setOpen: ReturnType<typeof vi.fn>) {
  return render(
    <CommandPaletteContext.Provider value={{ open: false, setOpen }}>
      <SearchButton />
    </CommandPaletteContext.Provider>,
  );
}

describe("SearchButton", () => {
  it("renders a button with accessible label", () => {
    renderWithContext(vi.fn());
    expect(screen.getByRole("button", { name: /open search/i })).toBeTruthy();
  });

  it("calls setOpen(true) when clicked", () => {
    const setOpen = vi.fn();
    renderWithContext(setOpen);
    fireEvent.click(screen.getByRole("button"));
    expect(setOpen).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/shared/__tests__/SearchButton.test.tsx
```

Expected: FAIL — "Cannot find module '../SearchButton'"

- [ ] **Step 3: Implement SearchButton**

Create `src/components/shared/SearchButton.tsx`:

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
      className="cursor-pointer p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/shared/__tests__/SearchButton.test.tsx
```

Expected: PASS (2 tests)

---

### Task 5: CommandPalette component

**Files:**

- Create: `src/components/shared/CommandPalette.tsx`
- Test: `src/components/shared/__tests__/CommandPalette.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/__tests__/CommandPalette.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CommandPaletteContext } from "../CommandPaletteProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { CommandPalette } from "../CommandPalette";

const mockEntries = [
  {
    type: "blog",
    title: "Hello World",
    description: "A post",
    href: "/en/blog/hello",
    tags: [],
  },
  {
    type: "project",
    title: "Zentri",
    description: "Finance app",
    href: "/en/projects/zentri",
    tags: ["Next.js"],
  },
  {
    type: "doc",
    title: "Overview",
    href: "/en/docs/zentri/overview",
    breadcrumb: "Zentri",
  },
  {
    type: "section",
    title: "Introduction",
    href: "/en/docs/zentri/overview#introduction",
    breadcrumb: "Zentri > Overview",
  },
];

function renderOpen(setOpen = vi.fn()) {
  mockFetch.mockResolvedValue({ json: async () => mockEntries });
  return render(
    <CommandPaletteContext.Provider value={{ open: true, setOpen }}>
      <CommandPalette />
    </CommandPaletteContext.Provider>,
  );
}

describe("CommandPalette", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders nothing when closed", () => {
    mockFetch.mockResolvedValue({ json: async () => [] });
    render(
      <CommandPaletteContext.Provider value={{ open: false, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    expect(
      screen.queryByPlaceholderText("Search or type a command..."),
    ).toBeNull();
  });

  it("renders search input when open", async () => {
    renderOpen();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search or type a command..."),
      ).toBeTruthy();
    });
  });

  it("shows Actions group with Toggle Theme", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Toggle Theme")).toBeTruthy();
    });
  });

  it("shows blog results after fetch", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeTruthy();
    });
  });

  it("shows section results with breadcrumb", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Introduction")).toBeTruthy();
      expect(screen.getByText("Zentri > Overview")).toBeTruthy();
    });
  });

  it("fetches index only once across multiple opens", async () => {
    mockFetch.mockResolvedValue({ json: async () => mockEntries });
    const { rerender } = render(
      <CommandPaletteContext.Provider value={{ open: true, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    rerender(
      <CommandPaletteContext.Provider value={{ open: false, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    rerender(
      <CommandPaletteContext.Provider value={{ open: true, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/shared/__tests__/CommandPalette.test.tsx
```

Expected: FAIL — "Cannot find module '../CommandPalette'"

- [ ] **Step 3: Implement CommandPalette**

Create `src/components/shared/CommandPalette.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import {
  Search,
  FileText,
  FolderOpen,
  BookOpen,
  Hash,
  Zap,
} from "lucide-react";
import { useCommandPalette } from "./CommandPaletteProvider";
import type { SearchEntry } from "@/app/api/search/route";

const ACTIONS: SearchEntry[] = [
  { type: "action", title: "Toggle Theme", href: "__toggle_theme__" },
  { type: "action", title: "Switch Locale", href: "__switch_locale__" },
  { type: "action", title: "Go to Blog", href: "__go_blog__" },
  { type: "action", title: "Go to Projects", href: "__go_projects__" },
];

const TYPE_ICON = {
  blog: FileText,
  project: FolderOpen,
  doc: BookOpen,
  section: Hash,
  action: Zap,
} as const;

const GROUP_STYLE =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 " +
  "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium " +
  "[&_[cmdk-group-heading]]:text-zinc-400";

const ITEM_STYLE =
  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm " +
  "text-zinc-700 aria-selected:bg-zinc-100 dark:text-zinc-300 dark:aria-selected:bg-zinc-800";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const indexRef = useRef<SearchEntry[] | null>(null);
  const [entries, setEntries] = useState<SearchEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    if (indexRef.current !== null) {
      setEntries(indexRef.current);
      return;
    }
    fetch(`/api/search?locale=${locale}`)
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        indexRef.current = data;
        setEntries(data);
      });
  }, [open, locale]);

  function handleSelect(entry: SearchEntry) {
    if (entry.href === "__toggle_theme__") {
      setTheme(theme === "dark" ? "light" : "dark");
    } else if (entry.href === "__switch_locale__") {
      router.push(`/${locale === "en" ? "th" : "en"}`);
    } else if (entry.href === "__go_blog__") {
      router.push(`/${locale}/blog`);
    } else if (entry.href === "__go_projects__") {
      router.push(`/${locale}/projects`);
    } else {
      router.push(entry.href);
    }
    setOpen(false);
  }

  if (!open) return null;

  const blogs = entries.filter((e) => e.type === "blog");
  const projects = entries.filter((e) => e.type === "project");
  const docs = entries.filter((e) => e.type === "doc");
  const sections = entries.filter((e) => e.type === "section");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="mx-4 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          loop
          className="rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <Command.Input
              autoFocus
              placeholder="Search or type a command..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions" className={GROUP_STYLE}>
              {ACTIONS.map((action) => {
                const Icon = TYPE_ICON.action;
                return (
                  <Command.Item
                    key={action.href}
                    value={action.title}
                    onSelect={() => handleSelect(action)}
                    className={ITEM_STYLE}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    {action.title}
                  </Command.Item>
                );
              })}
            </Command.Group>

            {blogs.length > 0 && (
              <Command.Group heading="Blog" className={GROUP_STYLE}>
                {blogs.map((entry) => {
                  const Icon = TYPE_ICON.blog;
                  return (
                    <Command.Item
                      key={entry.href}
                      value={`${entry.title} ${entry.description ?? ""} ${(entry.tags ?? []).join(" ")}`}
                      onSelect={() => handleSelect(entry)}
                      className={ITEM_STYLE}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{entry.title}</span>
                      {entry.description && (
                        <span className="ml-auto max-w-[180px] shrink-0 truncate text-xs text-zinc-400">
                          {entry.description}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {projects.length > 0 && (
              <Command.Group heading="Projects" className={GROUP_STYLE}>
                {projects.map((entry) => {
                  const Icon = TYPE_ICON.project;
                  return (
                    <Command.Item
                      key={entry.href}
                      value={`${entry.title} ${entry.description ?? ""} ${(entry.tags ?? []).join(" ")}`}
                      onSelect={() => handleSelect(entry)}
                      className={ITEM_STYLE}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{entry.title}</span>
                      {entry.tags && entry.tags.length > 0 && (
                        <span className="ml-auto shrink-0 text-xs text-zinc-400">
                          {entry.tags.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {docs.length > 0 && (
              <Command.Group heading="Docs" className={GROUP_STYLE}>
                {docs.map((entry) => {
                  const Icon = TYPE_ICON.doc;
                  return (
                    <Command.Item
                      key={entry.href}
                      value={`${entry.title} ${entry.breadcrumb ?? ""}`}
                      onSelect={() => handleSelect(entry)}
                      className={ITEM_STYLE}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{entry.title}</span>
                      {entry.breadcrumb && (
                        <span className="ml-auto shrink-0 text-xs text-zinc-400">
                          {entry.breadcrumb}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {sections.length > 0 && (
              <Command.Group heading="Sections" className={GROUP_STYLE}>
                {sections.map((entry) => {
                  const Icon = TYPE_ICON.section;
                  return (
                    <Command.Item
                      key={entry.href}
                      value={`${entry.title} ${entry.breadcrumb ?? ""}`}
                      onSelect={() => handleSelect(entry)}
                      className={ITEM_STYLE}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{entry.title}</span>
                      {entry.breadcrumb && (
                        <span className="ml-auto max-w-[180px] shrink-0 truncate text-xs text-zinc-400">
                          {entry.breadcrumb}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/shared/__tests__/CommandPalette.test.tsx
```

Expected: PASS (6 tests)

---

### Task 6: Wire layout and Header

**Files:**

- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/components/shared/Header.tsx`

- [ ] **Step 1: Update layout**

Open `src/app/[locale]/layout.tsx`. Add two imports after the existing imports:

```tsx
import { CommandPaletteProvider } from "@/components/shared/CommandPaletteProvider";
import { CommandPalette } from "@/components/shared/CommandPalette";
```

Replace the `ThemeProvider` block (inside `NextIntlClientProvider`):

```tsx
// Before
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</ThemeProvider>

// After
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <CommandPaletteProvider>
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <CommandPalette />
  </CommandPaletteProvider>
</ThemeProvider>
```

`CommandPaletteProvider` must be inside `ThemeProvider` so `CommandPalette` can call `useTheme()`.

- [ ] **Step 2: Add SearchButton to Header**

Open `src/components/shared/Header.tsx`. Add the import after the existing imports:

```tsx
import { SearchButton } from "./SearchButton";
```

Locate the `<div className="flex items-center gap-1">` block. Add `<SearchButton />` immediately before `<LocaleSwitcher />`:

```tsx
// Before
<LocaleSwitcher />
<ThemeToggle />

// After
<SearchButton />
<LocaleSwitcher />
<ThemeToggle />
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass, no regressions.

- [ ] **Step 4: Start dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/en`. Check each item:

- [ ] Press `Cmd+K` (or `Ctrl+K` on Windows) — palette opens with Actions group visible
- [ ] Search icon appears in header; clicking it opens palette
- [ ] Type a blog post title — filtered results appear under Blog
- [ ] Type a doc section heading — results appear under Sections with breadcrumb
- [ ] Select "Toggle Theme" — theme switches without navigation
- [ ] Select "Switch Locale" — navigates to `/th`
- [ ] Select a Sections result — navigates to page and scrolls to the heading anchor
- [ ] Press `Escape` — palette closes
- [ ] Click backdrop — palette closes
