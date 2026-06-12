# Work Experience Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Work Experience section to the resume page above Education, with two cards (SCB Tech X and POMPKINS), bullet points linked to project pages, and a 3-photo strip on the SCB card.

**Architecture:** All content lives in i18n translation keys (`workExperience` namespace) following the existing `education` namespace pattern. The resume page renders a new `<section>` using the same card primitives already in the file. No new components needed.

**Tech Stack:** Next.js 16 App Router, next-intl, next/image, Tailwind v4, Vitest + @testing-library/react

---

## File Map

| File                                              | Change                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/i18n/messages/en.json`                       | Add `workExperience` namespace                                                                             |
| `src/i18n/messages/th.json`                       | Add `workExperience` namespace (Thai)                                                                      |
| `src/app/[locale]/resume/__tests__/page.test.tsx` | Add work experience tests; update 2 existing assertions that count headings/list items                     |
| `src/app/[locale]/resume/page.tsx`                | Add Work Experience section above Education; add `next/image` import and `workExperience` translation call |

---

## Task 1: Add English i18n keys

**Files:**

- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: Add `workExperience` namespace to en.json**

Open `src/i18n/messages/en.json`. Add the following block after the `"resume"` section and before the `"education"` section:

```json
  "workExperience": {
    "title": "Work Experience",
    "scb": {
      "company": "SCB Tech X",
      "role": "Software Developer Intern",
      "years": "Jun 2023 – Mar 2024",
      "bullet1": "Built SAT Scan Report — automated security scanning and dependency analysis",
      "bullet1Link": "SAT Scan Report →",
      "bullet2": "Developed Debenture Privilege Program — bond investment feature for SCB customers",
      "bullet2Link": "Debenture Privilege Program →"
    },
    "pompkins": {
      "company": "POMPKINS",
      "role": "Software Developer",
      "years": "Jul 2024 – Nov 2025",
      "bullet1": "Built POMPKINS Food iOS — real-time food ordering app with Live Activity widgets",
      "bullet1Link": "POMPKINS Food iOS →",
      "bullet2": "Developed web platform and merchant portal for restaurant management",
      "bullet2Link1": "POMPKINS Web →",
      "bullet2Link2": "Merchant Portal →"
    }
  },
```

The full `en.json` should now have keys in this order: `nav`, `blog`, `projects`, `common`, `resume`, `workExperience`, `education`, `notFound`.

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/en.json','utf8')); console.log('valid')"
```

Expected: `valid`

---

## Task 2: Add Thai i18n keys

**Files:**

- Modify: `src/i18n/messages/th.json`

- [ ] **Step 1: Add `workExperience` namespace to th.json**

Open `src/i18n/messages/th.json`. Add the following block after the `"resume"` section and before the `"education"` section:

```json
  "workExperience": {
    "title": "ประสบการณ์ทำงาน",
    "scb": {
      "company": "SCB Tech X",
      "role": "Software Developer Intern",
      "years": "มิ.ย. 2566 – มี.ค. 2567",
      "bullet1": "พัฒนาระบบ SAT Scan Report — เครื่องมือสแกนความปลอดภัยอัตโนมัติและวิเคราะห์ dependencies",
      "bullet1Link": "SAT Scan Report →",
      "bullet2": "พัฒนา Debenture Privilege Program — ฟีเจอร์ลงทุนหุ้นกู้สำหรับลูกค้า SCB",
      "bullet2Link": "Debenture Privilege Program →"
    },
    "pompkins": {
      "company": "POMPKINS",
      "role": "Software Developer",
      "years": "ก.ค. 2567 – พ.ย. 2568",
      "bullet1": "พัฒนาแอป POMPKINS Food iOS — สั่งอาหารแบบเรียลไทม์พร้อม Live Activity widgets",
      "bullet1Link": "POMPKINS Food iOS →",
      "bullet2": "พัฒนาเว็บแพลตฟอร์มและ merchant portal สำหรับจัดการร้านอาหาร",
      "bullet2Link1": "POMPKINS Web →",
      "bullet2Link2": "Merchant Portal →"
    }
  },
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/th.json','utf8')); console.log('valid')"
```

Expected: `valid`

---

## Task 3: Write failing tests for Work Experience

**Files:**

- Modify: `src/app/[locale]/resume/__tests__/page.test.tsx`

- [ ] **Step 1: Add `next/image` mock and update existing assertions**

The page will now render `next/image` (for SCB photos), so mock it. Also, two existing assertions count DOM nodes and will need updating once the section is added — update them now so the test file represents the final expected state.

Replace the entire content of `src/app/[locale]/resume/__tests__/page.test.tsx` with:

```tsx
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ResumePage from "../page";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockImplementation(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("@/components/shared/ResumeDownloadButton", () => ({
  ResumeDownloadButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
}));

afterEach(cleanup);

describe("ResumePage", () => {
  it("renders the work experience section heading", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(screen.getByText("workExperience.title")).toBeInTheDocument();
  });

  it("renders the SCB Tech X entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(screen.getByText("workExperience.scb.company")).toBeInTheDocument();
    expect(screen.getByText("workExperience.scb.role")).toBeInTheDocument();
    expect(screen.getByText("workExperience.scb.years")).toBeInTheDocument();
  });

  it("renders the POMPKINS entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(
      screen.getByText("workExperience.pompkins.company"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("workExperience.pompkins.role"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("workExperience.pompkins.years"),
    ).toBeInTheDocument();
  });

  it("renders project links in SCB entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    const satLink = screen.getByText("workExperience.scb.bullet1Link");
    expect(satLink.closest("a")?.getAttribute("href")).toBe(
      "/en/projects/sat-scan-report",
    );
    const debLink = screen.getByText("workExperience.scb.bullet2Link");
    expect(debLink.closest("a")?.getAttribute("href")).toBe(
      "/en/projects/debenture-privilege-program",
    );
  });

  it("renders project links in POMPKINS entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    const foodLink = screen.getByText("workExperience.pompkins.bullet1Link");
    expect(foodLink.closest("a")?.getAttribute("href")).toBe(
      "/en/projects/pompkins-food-ios",
    );
    const webLink = screen.getByText("workExperience.pompkins.bullet2Link1");
    expect(webLink.closest("a")?.getAttribute("href")).toBe(
      "/en/projects/pompkins-web",
    );
    const merchantLink = screen.getByText(
      "workExperience.pompkins.bullet2Link2",
    );
    expect(merchantLink.closest("a")?.getAttribute("href")).toBe(
      "/en/projects/pompkins-merchant-portal",
    );
  });

  it("renders 3 SCB intern photos", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    const photos = screen.getAllByRole("img");
    expect(photos).toHaveLength(3);
    expect(photos[0]).toHaveAttribute("src", "/work/scb/1.JPG");
    expect(photos[1]).toHaveAttribute("src", "/work/scb/2.JPG");
    expect(photos[2]).toHaveAttribute("src", "/work/scb/3.JPG");
  });

  it("renders the education section heading", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(screen.getByText("education.title")).toBeInTheDocument();
  });

  it("renders the university entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(screen.getByText("education.university.name")).toBeInTheDocument();
    expect(screen.getByText("education.university.degree")).toBeInTheDocument();
    expect(screen.getByText(/education\.university\.gpa/)).toBeInTheDocument();
    // 6 list items total: 2 work (SCB) + 2 work (POMPKINS) + 2 education (university)
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
  });

  it("renders the high school entry", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    expect(screen.getByText("education.highschool.name")).toBeInTheDocument();
    expect(
      screen.getByText("education.highschool.program"),
    ).toBeInTheDocument();
    // 4 h3 headings: SCB Tech X, POMPKINS, university, highschool
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("renders a link to the volunteer blog post", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    const link = screen.getByText("education.university.volunteerLink");
    expect(link.closest("a")?.getAttribute("href")).toBe(
      "/en/blog/ban-yang-pao-volunteer",
    );
  });

  it("renders the PDF embed", async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: "en" }) });
    render(jsx);
    const embed = document.querySelector("embed");
    expect(embed).toBeInTheDocument();
    expect(embed?.getAttribute("src")).toBe("/resume.pdf");
  });
});
```

- [ ] **Step 2: Run tests — verify they fail on the new work experience tests**

```bash
npm run test:run -- src/app/\\[locale\\]/resume/__tests__/page.test.tsx
```

Expected: Several FAIL results for the new `workExperience.*` tests. The existing education and PDF tests should still pass (they don't depend on the new section yet). The heading count and listitem count tests will also fail — that's expected.

---

## Task 4: Implement Work Experience section in resume page

**Files:**

- Modify: `src/app/[locale]/resume/page.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import Link from "next/link";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ResumeDownloadButton } from "@/components/shared/ResumeDownloadButton";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resume");
  const work = await getTranslations("workExperience");
  const edu = await getTranslations("education");

  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <ResumeDownloadButton
          label={t("download")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {work("title")}
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {work("scb.company")}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {work("scb.years")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{work("scb.role")}</p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {work("scb.bullet1")}{" "}
                <Link
                  href={`/${locale}/projects/sat-scan-report`}
                  className="text-primary hover:underline"
                >
                  {work("scb.bullet1Link")}
                </Link>
              </li>
              <li className="text-sm text-muted-foreground">
                {work("scb.bullet2")}{" "}
                <Link
                  href={`/${locale}/projects/debenture-privilege-program`}
                  className="text-primary hover:underline"
                >
                  {work("scb.bullet2Link")}
                </Link>
              </li>
            </ul>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {(["1", "2", "3"] as const).map((n) => (
                <div
                  key={n}
                  className="relative h-24 w-32 shrink-0 overflow-hidden rounded"
                >
                  <Image
                    src={`/work/scb/${n}.JPG`}
                    alt={`SCB Tech X intern photo ${n}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {work("pompkins.company")}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {work("pompkins.years")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {work("pompkins.role")}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {work("pompkins.bullet1")}{" "}
                <Link
                  href={`/${locale}/projects/pompkins-food-ios`}
                  className="text-primary hover:underline"
                >
                  {work("pompkins.bullet1Link")}
                </Link>
              </li>
              <li className="text-sm text-muted-foreground">
                {work("pompkins.bullet2")}{" "}
                <Link
                  href={`/${locale}/projects/pompkins-web`}
                  className="text-primary hover:underline"
                >
                  {work("pompkins.bullet2Link1")}
                </Link>{" "}
                <Link
                  href={`/${locale}/projects/pompkins-merchant-portal`}
                  className="text-primary hover:underline"
                >
                  {work("pompkins.bullet2Link2")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {edu("title")}
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu("university.name")}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu("university.years")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu("university.degree")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {edu("university.gpa")} · {edu("university.honors")}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li className="text-sm text-muted-foreground">
                {edu("university.ta")}
              </li>
              <li className="text-sm text-muted-foreground">
                {edu("university.volunteer")}{" "}
                <Link
                  href={`/${locale}/blog/ban-yang-pao-volunteer`}
                  className="text-primary hover:underline"
                >
                  {edu("university.volunteerLink")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="mb-1 flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {edu("highschool.name")}
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {edu("highschool.years")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {edu("highschool.program")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {edu("highschool.gpa")}
            </p>
          </div>
        </div>
      </section>

      <embed
        src="/resume.pdf"
        type="application/pdf"
        className="w-full rounded-lg border border-border"
        style={{ height: "calc(100svh - 10rem)" }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Run all resume tests — verify they all pass**

```bash
npm run test:run -- src/app/\\[locale\\]/resume/__tests__/page.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 3: Run full test suite — verify no regressions**

```bash
npm run test:run
```

Expected: All tests PASS.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 5: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000/en/resume` and verify:

- "Work Experience" section appears above "Education"
- SCB Tech X card shows company name, role, dates, 2 bullets with orange links, 3 photos in a horizontal strip
- POMPKINS card shows company name, role, dates, 2 bullets with orange links, no photos
- Both project links navigate correctly
- Switch to `/th/resume` and verify Thai text renders correctly
- Toggle dark mode — cards should look identical in structure to Education cards
