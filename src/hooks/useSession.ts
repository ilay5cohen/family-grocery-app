import { useCallback, useState } from 'react'
import type { Session } from '../types'

const SESSION_KEY = 'family-grocery-app:session:v1'

function getStoredSession(): Session | null {
  try {
    // Check localStorage first so the user stays logged in across browser & PWA restarts
    const localRaw = localStorage.getItem(SESSION_KEY)
    if (localRaw) {
      return JSON.parse(localRaw) as Session
    }
    const sessionRaw = sessionStorage.getItem(SESSION_KEY)
    if (sessionRaw) {
      return JSON.parse(sessionRaw) as Session
    }
    return null
  } catch {
    return null
  }
}

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(() => getStoredSession())

  const login = useCallback((next: Session) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } catch {
      /* private browsing / quota — session stays in-memory for this tab */
    }
    setSessionState(next)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setSessionState(null)
  }, [])

  return { session, login, logout }
}

