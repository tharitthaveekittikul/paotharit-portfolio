'use client'

import { useEffect, useState } from 'react'

interface ZoomableImageProps {
  src?: string
  alt?: string
  [key: string]: unknown
}

export function ZoomableImage({ src, alt = '', ...props }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  if (!src) return null

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="cursor-zoom-in rounded-lg"
        onClick={() => setIsOpen(true)}
        title="Click to enlarge"
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="absolute right-5 top-5 rounded-full p-1 text-white/80 transition-colors hover:text-white"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
