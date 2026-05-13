import { getLocale } from 'next-intl/server'
import { buildSidebarTree } from '@/lib/docs'
import { Sidebar } from '@/components/docs'

const PROJECT_TITLES: Record<string, string> = {
  zentri: 'Zentri',
}

export default async function ProjectDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  const locale = await getLocale()
  const tree = buildSidebarTree(project, locale)
  const title = PROJECT_TITLES[project] ?? project

  return (
    <div className="flex gap-10 py-12">
      <aside className="hidden lg:block shrink-0">
        <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Sidebar tree={tree} projectTitle={title} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
