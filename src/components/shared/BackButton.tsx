'use client'

import { useRouter } from 'next/navigation'

export function BackButton({ label }: { label: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </button>
  )
}
