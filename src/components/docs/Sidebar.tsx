'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SidebarNode, DocGroup, DocItem } from '@/lib/docs'

function hasActiveDescendant(children: (DocItem | DocGroup)[], pathname: string): boolean {
  return children.some(child =>
    child.type === 'item'
      ? pathname.startsWith(child.href)
      : hasActiveDescendant(child.children, pathname)
  )
}

function GroupNode({ group, depth }: { group: DocGroup; depth: number }) {
  const pathname = usePathname()
  const hasActive = hasActiveDescendant(group.children, pathname)
  const [open, setOpen] = useState(hasActive || depth === 0)

  return (
    <li>
      <button
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
      >
        {group.label}
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="ml-3 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {group.children.map((child, i) => (
            <SidebarNodeItem key={i} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

function SidebarNodeItem({ node, depth }: { node: SidebarNode; depth: number }) {
  const pathname = usePathname()
  if (node.type === 'group') return <GroupNode group={node} depth={depth} />
  const isActive = pathname === node.href
  return (
    <li>
      <Link
        href={node.href}
        className={`block py-1 text-sm transition-colors ${
          isActive
            ? 'font-medium text-zinc-900 dark:text-zinc-50'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
        }`}
      >
        {node.label}
      </Link>
    </li>
  )
}

export function Sidebar({ tree, projectTitle }: { tree: SidebarNode[]; projectTitle: string }) {
  return (
    <nav className="w-56 shrink-0">
      <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{projectTitle}</p>
      <ul className="space-y-1">
        {tree.map((node, i) => (
          <SidebarNodeItem key={i} node={node} depth={0} />
        ))}
      </ul>
    </nav>
  )
}
