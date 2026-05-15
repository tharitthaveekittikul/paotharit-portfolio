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
  "[&_[cmdk-group-heading]]:text-zinc-400 dark:[&_[cmdk-group-heading]]:text-zinc-500";

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
      })
      .catch(() => {
        setEntries([]);
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg"
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
