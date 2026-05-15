'use client'

import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import type { SidebarNode } from '@/lib/docs'

export function MobileDocsSidebar({
  tree,
  projectTitle,
}: {
  tree: SidebarNode[]
  projectTitle: string
}) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open navigation"
        className="inline-flex items-center justify-center w-8 h-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 overflow-y-auto p-6">
        <Sidebar tree={tree} projectTitle={projectTitle} />
      </SheetContent>
    </Sheet>
  )
}
