export interface SavedProfile {
  memberId: string
  memberName: string
  memberAvatar?: string
  memberColor?: string
  familyId: string
  familyCode: string
  savedAt: number
}

const SAVED_PROFILE_KEY = 'family-grocery-app:saved-profile:v1'

export function saveProfile(profile: SavedProfile): void {
  try {
    localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage unavailable */
  }
}

export function getSavedProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(SAVED_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedProfile
    if (parsed && parsed.memberId && parsed.familyId) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function clearSavedProfile(): void {
  try {
    localStorage.removeItem(SAVED_PROFILE_KEY)
  } catch {
    /* ignore */
  }
}
