'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function EmailLink() {
  return (
    <a
      href="mailto:tharit.thaveekittikul@gmail.com"
      className="ml-1 hidden rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 lg:inline-flex dark:bg-zinc-900 dark:text-white"
      onClick={() => sendGAEvent('event', 'email_click')}
    >
      tharit.thaveekittikul@gmail.com
    </a>
  )
}
