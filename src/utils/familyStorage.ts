import type { StoreState } from '../types'

const REGISTRY_KEY = 'family-grocery-app:registry:v1'
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L — avoids ambiguous codes

export const FAMILY_CODE_LENGTH = 5

export function familyStateKey(familyId: string): string {
  return `family-grocery-list:${familyId}`
}

/**
 * These helpers write directly to localStorage and broadcast on the same
 * `sync:${key}` channel useSharedState listens on — so account creation /
 * joining (which happens before the family's useFamilyStore hook is even
 * mounted) still shows up live in any other already-open tab on that family.
 */
function broadcast(key: string, data: unknown) {
  try {
    const channel = new BroadcastChannel(`sync:${key}`)
    channel.postMessage(data)
    channel.close()
  } catch {
    /* BroadcastChannel unsupported — localStorage persistence still works */
  }
}

export function readRegistry(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const clean: Record<string, string> = {}
    for (const [code, familyId] of Object.entries(parsed)) {
      if (typeof familyId === 'string') clean[code] = familyId
    }
    return clean
  } catch {
    return {}
  }
}

export function writeRegistry(registry: Record<string, string>) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
  } catch {
    /* storage unavailable (private mode / quota) */
  }
  broadcast(REGISTRY_KEY, registry)
}

/**
 * Storage can hold data written by an older app version, or be corrupted by
 * hand. Anything that fails this check is treated as "no family" rather than
 * being handed to callers that would crash on `state.members.some(...)`.
 */
export function isValidStoreState(value: unknown): value is StoreState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<StoreState>
  return (
    typeof state.family === 'object' &&
    state.family !== null &&
    typeof state.family.id === 'string' &&
    typeof state.family.code === 'string' &&
    Array.isArray(state.members) &&
    Array.isArray(state.items) &&
    Array.isArray(state.activity)
  )
}

export function readFamilyState(familyId: string): StoreState | null {
  try {
    const raw = localStorage.getItem(familyStateKey(familyId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidStoreState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeFamilyState(familyId: string, state: StoreState) {
  try {
    localStorage.setItem(familyStateKey(familyId), JSON.stringify(state))
  } catch {
    /* storage unavailable (private mode / quota) */
  }
  broadcast(familyStateKey(familyId), state)
}

/**
 * The family code is the only thing gating who can join a family, so it uses
 * crypto randomness rather than Math.random (which is predictable from prior
 * outputs in some engines). Rejection sampling keeps the character
 * distribution uniform instead of biasing toward the start of the alphabet.
 */
export function generateFamilyCode(): string {
  const limit = 256 - (256 % CODE_CHARS.length)
  let code = ''
  while (code.length < FAMILY_CODE_LENGTH) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    for (const byte of bytes) {
      if (code.length === FAMILY_CODE_LENGTH) break
      if (byte < limit) code += CODE_CHARS[byte % CODE_CHARS.length]
    }
  }
  return code
}

export function generateUniqueFamilyCode(registry: Record<string, string>): string {
  let code = generateFamilyCode()
  while (registry[code]) code = generateFamilyCode()
  return code
}
