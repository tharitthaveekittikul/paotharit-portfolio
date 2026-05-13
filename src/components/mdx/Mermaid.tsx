'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidProps {
  chart: string
}

function getDarkMode() {
  return document.documentElement.classList.contains('dark')
}

async function renderChart(el: HTMLDivElement, chart: string, dark: boolean) {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'neutral',
    themeVariables: dark
      ? { primaryTextColor: '#e5e7eb', lineColor: '#6b7280', edgeLabelBackground: '#1f2937' }
      : {},
  })
  const id = `mermaid-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, chart)
  // text/html parser is lenient (handles <br> etc.) and runs in an inert document so scripts don't execute
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><body>${svg}`, 'text/html')
  const svgEl = doc.body.querySelector('svg')
  if (svgEl) el.replaceChildren(document.adoptNode(svgEl))
}

function scaleSvgToFit(el: HTMLDivElement) {
  const svg = el.querySelector('svg')
  if (!svg) return
  const w = parseFloat(svg.getAttribute('width') ?? '') || svg.viewBox?.baseVal?.width
  const h = parseFloat(svg.getAttribute('height') ?? '') || svg.viewBox?.baseVal?.height
  if (w && h && !svg.getAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.display = 'block'
}

function MermaidModal({ chart, onClose }: { chart: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      renderChart(ref.current, chart, getDarkMode()).then(() => {
        if (ref.current) scaleSvgToFit(ref.current)
      })
    }
  }, [chart])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="cursor-pointer absolute right-5 top-5 rounded-full bg-black/40 p-1.5 text-white/80 transition-colors hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        className="flex h-[88vh] w-[88vw] flex-col rounded-xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
        onClick={e => e.stopPropagation()}
      >
        <div ref={ref} className="min-h-0 flex-1" />
      </div>
    </div>
  )
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const draw = () => {
      if (ref.current) {
        renderChart(ref.current, chart, getDarkMode()).then(() => setRendered(true))
      }
    }
    draw()

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') { draw(); break }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [chart])

  return (
    <>
      <div
        className={`relative my-6 overflow-x-auto ${rendered ? 'group cursor-zoom-in' : ''}`}
        onClick={() => rendered && setIsOpen(true)}
        title={rendered ? 'Click to enlarge' : undefined}
      >
        <div ref={ref} />
        {rendered && (
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm0 0l4 4" />
            </svg>
            Enlarge
          </div>
        )}
      </div>
      {isOpen && <MermaidModal chart={chart} onClose={() => setIsOpen(false)} />}
    </>
  )
}
