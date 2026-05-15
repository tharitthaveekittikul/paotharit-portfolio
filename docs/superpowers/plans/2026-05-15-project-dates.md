# Project Dates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display a publish year on project list cards and the project detail header, matching the date-first visual pattern already used on blog pages.

**Architecture:** Two surgical edits — one to the projects list page and one to the projects detail page. No new files, no new utilities. The `date` field is already in `Frontmatter`, already populated in MDX frontmatter, and already sorted on in `getAllContent`. We only add JSX to render it.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/app/[locale]/projects/page.tsx` | Add `<time>` above `<h2>` title in each project card |
| `src/app/[locale]/projects/[slug]/page.tsx` | Add `<time>` as first item in the metadata flex row |

---

### Task 1: Add year to projects list cards

**Files:**
- Modify: `src/app/[locale]/projects/page.tsx`

- [ ] **Step 1: Open the file and locate the card inner block**

The card `<Link>` block currently starts with:
```tsx
<div className="mb-2 flex items-start justify-between gap-4">
  <h2 className="text-xl font-semibold text-zinc-900 ...">
    {project.title}
  </h2>
  ...
</div>
```

- [ ] **Step 2: Add the `<time>` element above that div**

Insert this line immediately before the `<div className="mb-2 flex items-start ...">` block:

```tsx
<time
  dateTime={project.date}
  className="mb-1 block text-sm text-zinc-400 dark:text-zinc-500"
>
  {new Date(project.date).toLocaleDateString(
    locale === 'th' ? 'th-TH' : 'en-US',
    { year: 'numeric' }
  )}
</time>
```

The full updated card body becomes:

```tsx
<Link
  key={project.slug}
  href={`/${locale}/projects/${project.slug}`}
  className="group block rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
>
  <time
    dateTime={project.date}
    className="mb-1 block text-sm text-zinc-400 dark:text-zinc-500"
  >
    {new Date(project.date).toLocaleDateString(
      locale === 'th' ? 'th-TH' : 'en-US',
      { year: 'numeric' }
    )}
  </time>
  <div className="mb-2 flex items-start justify-between gap-4">
    <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-black dark:text-zinc-50 dark:group-hover:text-white">
      {project.title}
    </h2>
    {project.projectStatus && (
      <Badge variant="outline" className="shrink-0 text-xs">
        {project.projectStatus}
      </Badge>
    )}
  </div>
  <p className="mb-4 text-zinc-600 dark:text-zinc-400">
    {project.description}
  </p>
  <div className="flex flex-wrap gap-1">
    {project.techStack.slice(0, 6).map(tech => (
      <Badge key={tech} variant="secondary" className="text-xs">
        {tech}
      </Badge>
    ))}
  </div>
</Link>
```

- [ ] **Step 3: Run the existing test suite to confirm nothing broke**

```bash
npm run test:run
```

Expected: all tests pass (no changes to logic, only JSX added)

---

### Task 2: Add year to projects detail header

**Files:**
- Modify: `src/app/[locale]/projects/[slug]/page.tsx`

- [ ] **Step 1: Locate the metadata flex row**

The row currently reads:
```tsx
<div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
  {frontmatter.role && <span>{frontmatter.role}</span>}
  {frontmatter.duration && <span>{frontmatter.duration}</span>}
  {frontmatter.projectStatus && (
    <Badge variant="outline">{frontmatter.projectStatus}</Badge>
  )}
</div>
```

- [ ] **Step 2: Add `<time>` as the first child of that row**

```tsx
<div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
  <time dateTime={frontmatter.date}>
    {new Date(frontmatter.date).toLocaleDateString(
      locale === 'th' ? 'th-TH' : 'en-US',
      { year: 'numeric' }
    )}
  </time>
  {frontmatter.role && <span>{frontmatter.role}</span>}
  {frontmatter.duration && <span>{frontmatter.duration}</span>}
  {frontmatter.projectStatus && (
    <Badge variant="outline">{frontmatter.projectStatus}</Badge>
  )}
</div>
```

Note: `<time>` inherits the row's `text-sm text-zinc-500 dark:text-zinc-400` — no extra className needed.

- [ ] **Step 3: Run tests again**

```bash
npm run test:run
```

Expected: all tests pass

---

### Task 3: Build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build completes with no TypeScript errors and no warnings about missing `date` field. The `date` field is `string` (non-optional) in `Frontmatter`, so it is always present — no runtime risk.

- [ ] **Step 2: Start dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:3000/en/projects` — confirm each project card shows a year above the title.

Open one project detail page — confirm the year appears as the first item in the metadata row (before role/duration).

Switch to `http://localhost:3000/th/projects` — confirm year renders in Thai locale (should still be a numeric year, just locale-formatted).
