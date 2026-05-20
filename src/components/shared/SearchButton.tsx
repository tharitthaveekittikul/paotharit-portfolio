"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommandPalette } from "./CommandPaletteProvider";
import { Button } from "@/components/ui/button";

export function SearchButton() {
  const { setOpen } = useCommandPalette();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="gap-1.5 text-zinc-400 hover:bg-transparent hover:text-zinc-50 dark:text-zinc-500 dark:hover:bg-transparent dark:hover:text-zinc-900"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline text-[11px] opacity-50 tabular-nums">
        {isMac ? "⌘K" : "Ctrl K"}
      </span>
    </Button>
  );
}
