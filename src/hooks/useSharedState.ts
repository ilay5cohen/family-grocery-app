import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Zero-cost "real-time sync" for a frontend-only demo.
 *
 * State is persisted to localStorage and broadcast across every open tab /
 * window of the app via BroadcastChannel, so when one family member checks
 * an item off, everyone else's screen updates instantly — no backend, no
 * server cost. Swap this hook's internals for a Supabase Realtime channel
 * later without touching any component.
 */
export function useSharedState<T>(key: string, initialValue: T) {
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    const channel = new BroadcastChannel(`sync:${key}`)
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<T>) => {
      setState(event.data)
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setState(JSON.parse(event.newValue) as T)
        } catch {
          /* ignore malformed payloads */
        }
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      channel.close()
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const updateState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
        try {
          localStorage.setItem(key, JSON.stringify(next))
          channelRef.current?.postMessage(next)
        } catch {
          /* storage unavailable (private mode / quota) — state still updates in-memory */
        }
        return next
      })
    },
    [key],
  )

  return [state, updateState] as const
}
