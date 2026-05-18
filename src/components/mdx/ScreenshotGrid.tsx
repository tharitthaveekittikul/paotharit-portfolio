import React from 'react'

interface ScreenshotGridProps {
  children: React.ReactNode
  className?: string
}

export function ScreenshotGrid({ children, className }: ScreenshotGridProps) {
  const items = React.Children.toArray(children)
  return (
    <div className={`not-prose columns-1 sm:columns-2 gap-4${className ? ` ${className}` : ''}`}>
      {items.map((child, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  )
}
