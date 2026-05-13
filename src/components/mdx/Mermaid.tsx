'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidProps {
  chart: string
}

async function renderChart(el: HTMLDivElement, chart: string) {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
  const id = `mermaid-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, chart)
  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml')
  el.replaceChildren(parsed.documentElement)
}

function MermaidModal({ chart, onClose }: { chart: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) renderChart(ref.current, chart)
  }, [chart])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute right-5 top-5 rounded-full p-1 text-white/80 transition-colors hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        ref={ref}
        className="max-h-[90vh] max-w-[90vw] overflow-auto rounded-xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (ref.current) {
      renderChart(ref.current, chart).then(() => setRendered(true))
    }
  }, [chart])

  return (
    <>
      <div
        ref={ref}
        className={`my-6 overflow-x-auto ${rendered ? 'cursor-zoom-in' : ''}`}
        onClick={() => rendered && setIsOpen(true)}
        title={rendered ? 'Click to enlarge' : undefined}
      />
      {isOpen && <MermaidModal chart={chart} onClose={() => setIsOpen(false)} />}
    </>
  )
}
