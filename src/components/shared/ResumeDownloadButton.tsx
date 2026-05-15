'use client'

import { sendGAEvent } from '@next/third-parties/google'

interface ResumeDownloadButtonProps {
  label: string
  className?: string
}

export function ResumeDownloadButton({ label, className }: ResumeDownloadButtonProps) {
  return (
    <a
      href="/resume.pdf"
      download
      className={className}
      onClick={() => sendGAEvent('event', 'resume_download', { location: 'resume_page' })}
    >
      {label}
    </a>
  )
}
