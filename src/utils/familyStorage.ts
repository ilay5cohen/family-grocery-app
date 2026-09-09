import type { StoreState } from '../types'

const REGISTRY_KEY = 'family-grocery-app:registry:v1'
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L — avoids ambiguous codes

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
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? '{}') as Record<string, string>
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

export function readFamilyState(familyId: string): StoreState | null {
  try {
    const raw = localStorage.getItem(familyStateKey(familyId))
    return raw ? (JSON.parse(raw) as StoreState) : null
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

export function generateFamilyCode(): string {
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export function generateUniqueFamilyCode(registry: Record<string, string>): string {
  let code = generateFamilyCode()
  while (registry[code]) code = generateFamilyCode()
  return code
}
