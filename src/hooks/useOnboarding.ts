import { useCallback, useState } from 'react'

const STORAGE_KEY = 'family-grocery-list:onboarding-seen:v1'

/**
 * Per-device "have they seen the welcome tour" flag. Deliberately plain
 * localStorage (not useSharedState) — whether one family member has been
 * onboarded on their phone has nothing to do with anyone else's device.
 */
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return true
    }
  })

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* private browsing / quota — onboarding will just reappear next visit */
    }
    setHasSeenOnboarding(true)
  }, [])

  return { hasSeenOnboarding, markSeen }
}
