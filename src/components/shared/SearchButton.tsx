"use client";

import { Search } from "lucide-react";
import { useCommandPalette } from "./CommandPaletteProvider";

export function SearchButton() {
  const { setOpen } = useCommandPalette();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="cursor-pointer p-2.5 rounded-lg text-zinc-400 hover:text-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-50 dark:focus-visible:ring-zinc-900"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
