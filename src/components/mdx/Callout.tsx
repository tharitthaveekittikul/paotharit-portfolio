import type { ReactNode } from 'react'

type CalloutType = 'abstract' | 'info' | 'tip' | 'warning' | 'danger' | 'note'

const styles: Record<CalloutType, string> = {
  abstract: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30',
  info:     'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30',
  tip:      'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30',
  warning:  'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/30',
  danger:   'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
  note:     'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/30',
}

interface CalloutProps {
  type: CalloutType
  children: ReactNode
}

export function Callout({ type, children }: CalloutProps) {
  return (
    <div className={`my-4 overflow-x-auto rounded-lg border-l-4 px-4 py-3 ${styles[type]}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest opacity-70">
        {type}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  )
}
