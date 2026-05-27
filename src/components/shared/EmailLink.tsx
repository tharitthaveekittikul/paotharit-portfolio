'use client'

import { sendGAEvent } from '@next/third-parties/google'

interface EmailLinkProps {
  variant?: 'header' | 'inline'
}

export function EmailLink({ variant = 'header' }: EmailLinkProps) {
  const className = variant === 'inline'
    ? 'text-sm text-muted-foreground transition-colors hover:text-foreground'
    : 'ml-1 hidden rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 lg:inline-flex dark:bg-zinc-900 dark:text-white'

  return (
    <a
      href="mailto:tharit.thaveekittikul@gmail.com"
      className={className}
      onClick={() => sendGAEvent('event', 'email_click')}
    >
      tharit.thaveekittikul@gmail.com
    </a>
  )
}
