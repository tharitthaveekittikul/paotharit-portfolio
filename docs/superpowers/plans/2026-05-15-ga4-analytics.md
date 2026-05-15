# GA4 Analytics Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Vercel Analytics with Google Analytics 4 using `@next/third-parties`.

**Architecture:** Install `@next/third-parties`, store the Measurement ID in `.env.local`, and swap the `<Analytics />` component in `src/app/[locale]/layout.tsx` for `<GoogleAnalytics />`.

**Tech Stack:** Next.js 16 App Router, `@next/third-parties/google`, `NEXT_PUBLIC_` env vars.

---

## File Map

| Action | File                                       |
| ------ | ------------------------------------------ |
| Modify | `package.json` (via npm install/uninstall) |
| Create | `.env.local`                               |
| Modify | `src/app/[locale]/layout.tsx`              |

---

### Task 1: Install and uninstall packages

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install `@next/third-parties`**

```bash
npm install @next/third-parties
```

- [ ] **Step 2: Remove `@vercel/analytics`**

```bash
npm uninstall @vercel/analytics
```

---

### Task 2: Add environment variable

**Files:**

- Create: `.env.local`

- [ ] **Step 1: Create `.env.local` with the GA4 Measurement ID**

Create the file at the project root with this content:

```
NEXT_PUBLIC_GA_ID=G-LZSBERQCZ2
```

---

### Task 3: Update layout to use GA4

**Files:**

- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Replace the Vercel Analytics import with GoogleAnalytics**

In `src/app/[locale]/layout.tsx`, remove:

```ts
import { Analytics } from "@vercel/analytics/react";
```

Add:

```ts
import { GoogleAnalytics } from "@next/third-parties/google";
```

- [ ] **Step 2: Replace the component in JSX**

Remove:

```tsx
<Analytics />
```

Add (keep it in the same position, after `</NextIntlClientProvider>`):

```tsx
<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
```

The final layout return should look like:

```tsx
return (
  <NextIntlClientProvider messages={messages}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CommandPaletteProvider>
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <CommandPalette />
      </CommandPaletteProvider>
    </ThemeProvider>
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
  </NextIntlClientProvider>
);
```

---

### Task 4: Verify

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check the page source**

Open `http://localhost:3000` in a browser, view page source, and confirm you see a script tag loading `https://www.googletagmanager.com/gtag/js?id=G-LZSBERQCZ2`.

- [ ] **Step 3: Run lint to confirm no leftover Vercel Analytics references**

```bash
npm run lint
```

Expected: no errors about `@vercel/analytics`.
