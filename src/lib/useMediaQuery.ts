'use client'

import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useKeyboardInset(enabled: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const viewport = window.visualViewport
      if (!enabled || !viewport) return () => {}
      viewport.addEventListener('resize', notify)
      viewport.addEventListener('scroll', notify)
      return () => {
        viewport.removeEventListener('resize', notify)
        viewport.removeEventListener('scroll', notify)
      }
    },
    () => {
      const viewport = window.visualViewport
      if (!enabled || !viewport) return 0
      return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
    },
    () => 0,
  )
}
