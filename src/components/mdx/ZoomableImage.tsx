'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ZoomableImageProps {
  src?: string
  alt?: string
  className?: string
  priority?: boolean
}

export function ZoomableImage({ src, alt = '', className, priority }: ZoomableImageProps) {
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
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        priority={priority}
        style={{ width: '100%', height: 'auto' }}
        className={`cursor-zoom-in rounded-lg${className ? ` ${className}` : ''}`}
        onClick={() => setIsOpen(true)}
        title="Click to enlarge"
      />
      {isOpen && createPortal(
        <div
          className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="absolute right-5 top-5 h-auto w-auto rounded-full p-1 text-white/80 hover:bg-transparent hover:text-white [&_svg]:size-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
