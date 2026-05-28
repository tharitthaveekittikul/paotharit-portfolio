"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { ResumeLink } from "./ResumeLink";

interface MobileMenuProps {
  locale: string;
  labels: { docs: string; about: string; resume: string; moreLinks: string };
  resumeHref: string;
}

export function MobileMenu({ locale, labels, resumeHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="sm:hidden">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={labels.moreLinks}
        className="p-1 text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
      >
        <MoreHorizontal size={16} />
      </button>
      {open &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              right: dropdownPos.right,
              zIndex: 100,
            }}
            className="min-w-[120px] rounded-lg border border-white/10 bg-zinc-900 py-1 dark:border-zinc-900/10 dark:bg-white animate-in fade-in-0 slide-in-from-top-2 duration-150 mt-1"
            onClick={() => setOpen(false)}
          >
            <Link
              href={`/${locale}/docs`}
              className="block px-4 py-3 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
            >
              {labels.docs}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="block px-4 py-3 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
            >
              {labels.about}
            </Link>
            <ResumeLink
              label={labels.resume}
              href={resumeHref}
              location="nav"
              className="block px-4 py-3 text-sm text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900"
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
