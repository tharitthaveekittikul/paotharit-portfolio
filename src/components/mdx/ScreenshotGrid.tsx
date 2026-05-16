import React from 'react'

interface ScreenshotGridProps {
  children: React.ReactNode
  className?: string
}

export function ScreenshotGrid({ children, className }: ScreenshotGridProps) {
  return (
    <div className={`not-prose columns-1 sm:columns-2 gap-4 [&>*]:break-inside-avoid${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
