"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ResumeLink } from "./ResumeLink";

type LinkKey = "blog" | "projects" | "docs" | "about" | "resume";

type NavLinksProps = {
  locale: string;
  labels: Record<LinkKey, string>;
  resumeHref: string;
};

const LINK_KEYS: LinkKey[] = ["blog", "projects", "docs", "about", "resume"];

export function NavLinks({ locale, labels, resumeHref }: NavLinksProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<LinkKey | null>(null);
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const activeKey =
    LINK_KEYS.find(
      (k) =>
        pathname === `/${locale}/${k}` ||
        pathname.startsWith(`/${locale}/${k}/`),
    ) ?? null;
  const displayKey = hoveredKey ?? activeKey;

  useEffect(() => {
    const container = containerRef.current;
    if (!displayKey || !container) {
      setPillStyle(null);
      return;
    }
    const el = container.querySelector<HTMLElement>(
      `[data-navkey="${displayKey}"]`,
    );
    if (!el) {
      setPillStyle(null);
      return;
    }
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    if (eRect.width === 0) {
      setPillStyle(null);
      return;
    }
    setPillStyle({ left: eRect.left - cRect.left, width: eRect.width });
  }, [displayKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let observer: ResizeObserver;
    try {
      observer = new ResizeObserver(() => {
        if (!displayKey) return;
        const el = container.querySelector<HTMLElement>(
          `[data-navkey="${displayKey}"]`,
        );
        if (!el) return;
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        if (eRect.width === 0) {
          setPillStyle(null);
          return;
        }
        setPillStyle({ left: eRect.left - cRect.left, width: eRect.width });
      });
      observer.observe(container);
    } catch {
      return;
    }
    return () => observer.disconnect();
  }, [displayKey]);

  const textClass = (key: LinkKey) =>
    displayKey === key
      ? "text-zinc-50 dark:text-zinc-900"
      : "text-zinc-400 dark:text-zinc-500";

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseLeave={() => setHoveredKey(null)}
    >
      {pillStyle && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-[0.5px] rounded-full bg-zinc-700 transition-all duration-150 ease-out dark:bg-zinc-200"
          style={{
            left: pillStyle.left,
            width: pillStyle.width,
          }}
        />
      )}
      <span
        data-navkey="blog"
        className="inline-flex"
        onMouseEnter={() => setHoveredKey("blog")}
      >
        <Link
          href={`/${locale}/blog`}
          className={`relative z-10 px-1.5 py-1 text-sm sm:px-3 ${textClass("blog")}`}
        >
          {labels.blog}
        </Link>
      </span>
      <span
        data-navkey="projects"
        className="inline-flex"
        onMouseEnter={() => setHoveredKey("projects")}
      >
        <Link
          href={`/${locale}/projects`}
          className={`relative z-10 px-1.5 py-1 text-sm sm:px-3 ${textClass("projects")}`}
        >
          {labels.projects}
        </Link>
      </span>
      <span
        data-navkey="docs"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey("docs")}
      >
        <Link
          href={`/${locale}/docs`}
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass("docs")}`}
        >
          {labels.docs}
        </Link>
      </span>
      <span
        data-navkey="about"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey("about")}
      >
        <Link
          href={`/${locale}/about`}
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass("about")}`}
        >
          {labels.about}
        </Link>
      </span>
      <span
        data-navkey="resume"
        className="hidden sm:inline-flex"
        onMouseEnter={() => setHoveredKey("resume")}
      >
        <ResumeLink
          label={labels.resume}
          href={resumeHref}
          location="nav"
          className={`relative z-10 px-2 py-1 text-sm sm:px-3 ${textClass("resume")}`}
        />
      </span>
    </div>
  );
}
