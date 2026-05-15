"use client";

import { Search } from "lucide-react";
import { useCommandPalette } from "./CommandPaletteProvider";

export function SearchButton() {
  const { setOpen } = useCommandPalette();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded border border-zinc-200 bg-white px-1 py-0.5 text-xs text-zinc-400 sm:inline dark:border-zinc-700 dark:bg-zinc-900">
        ⌘K
      </kbd>
    </button>
  );
}
