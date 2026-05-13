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
      className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-300 ${
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
