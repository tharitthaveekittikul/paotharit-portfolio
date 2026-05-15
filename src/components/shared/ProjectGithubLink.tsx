'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function ProjectGithubLink({
  href,
  project,
}: {
  href: string
  project: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
      onClick={() => sendGAEvent('event', 'project_github_click', { project })}
    >
      View on GitHub
    </a>
  )
}
