'use client'

import { useRef, useState } from 'react'

export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = preRef.current?.querySelector('code')?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <pre ref={preRef} {...props} />
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded border border-white/20 bg-zinc-800/80 px-2 py-1 font-mono text-xs text-zinc-100 opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-zinc-700/90 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
