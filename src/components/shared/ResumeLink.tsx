'use client'

import { sendGAEvent } from '@next/third-parties/google'

interface ResumeLinkProps {
  label: string
  href: string
  location: 'nav' | 'hero'
  className?: string
}

export function ResumeLink({ label, href, location, className }: ResumeLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => sendGAEvent('event', 'resume_page_open', { location })}
    >
      {label}
    </a>
  )
}
