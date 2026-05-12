'use client'

import { useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function render() {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
      if (ref.current) {
        // Use textContent — safe assignment, no HTML parsing
        ref.current.textContent = chart
        await mermaid.run({ nodes: [ref.current] })
      }
    }
    render()
  }, [chart])

  return <div ref={ref} className="my-6 overflow-x-auto" />
}
