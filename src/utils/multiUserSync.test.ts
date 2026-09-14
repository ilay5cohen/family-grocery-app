import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createFamily, joinFamily } from './familyActions'
import { mergeStoreStates } from './stateMerge'
import { readFamilyState, readRegistry } from './familyStorage'
import type { StoreState } from '../types'

const storageMap = new Map<string, string>()
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
}
// Polyfill localStorage and BroadcastChannel for Node test environment
;(globalThis as any).localStorage = mockLocalStorage
;(globalThis as any).BroadcastChannel = class {
  constructor() {}
  postMessage() {}
  close() {}
}

describe('Multi-User Family Joining & Real-Time Sync', () => {
  beforeEach(() => {
    storageMap.clear()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    }))
  })

  it('allows User A to create a family and User B to join successfully', async () => {
    // 1. User A creates a family
    const created = await createFamily('דניאל')
    expect(created.code).toHaveLength(5)
    expect(created.familyId).toBeTruthy()

    const registry = readRegistry()
    expect(registry[created.code]).toBe(created.familyId)

    const state = readFamilyState(created.familyId)
    expect(state?.members).toHaveLength(1)
    expect(state?.members[0].name).toBe('דניאל')
    expect(state?.members[0].isAdmin).toBe(true)

    // 2. User B joins the same family with the code
    const joined = await joinFamily(created.code, 'רוני')
    expect('error' in joined).toBe(false)
    if ('familyId' in joined) {
      expect(joined.familyId).toBe(created.familyId)
      expect(joined.memberId).not.toBe(created.memberId)
    }

    // Verify updated state has both members
    const updatedState = readFamilyState(created.familyId)
    expect(updatedState?.members).toHaveLength(2)
    expect(updatedState?.members.map((m) => m.name)).toEqual(['דניאל', 'רוני'])
  })

  it('allows an existing member to re-login without throwing duplicate name error', async () => {
    const created = await createFamily('אמא')
    const stateBefore = readFamilyState(created.familyId)
    expect(stateBefore?.members[0].name).toBe('אמא')

    // Re-login from another device with the same name "אמא"
    const reLogin = await joinFamily(created.code, 'אמא')
    expect('error' in reLogin).toBe(false)
    if ('familyId' in reLogin) {
      expect(reLogin.familyId).toBe(created.familyId)
      expect(reLogin.memberId).toBe(created.memberId)
    }

    // Number of members should not duplicate
    const stateAfter = readFamilyState(created.familyId)
    expect(stateAfter?.members).toHaveLength(1)
  })

  it('joins using fallback metadata from invite link even if local registry is empty', async () => {
    const code = 'K7M9P'
    const fallbackFid = 'fam-remote-999'

    // Local storage is empty on device B
    expect(readRegistry()[code]).toBeUndefined()

    // Device B joins with link fallback
    const joined = await joinFamily(code, 'סבתא', {
      fallbackFamilyId: fallbackFid,
      founderName: 'אבא',
    })

    expect('error' in joined).toBe(false)
    if ('familyId' in joined) {
      expect(joined.familyId).toBe(fallbackFid)
    }

    const state = readFamilyState(fallbackFid)
    expect(state?.members.map((m) => m.name)).toContain('סבתא')
  })

  it('correctly merges concurrent updates from two users without data loss', () => {
    const baseState: StoreState = {
      family: { id: 'f1', code: 'ABC23', createdAt: 1000, autoWeeklyReset: true, lastWeeklyReset: 1000 },
      members: [
        { id: 'm1', name: 'אבא', avatar: 'א', color: '#292524', glow: 'rgba(0,0,0,0.1)', isAdmin: true, joinedAt: 1000 },
        { id: 'm2', name: 'אמא', avatar: 'א', color: '#292524', glow: 'rgba(0,0,0,0.1)', isAdmin: false, joinedAt: 1050 },
      ],
      items: [
        {
          id: 'item-milk',
          name: 'חלב',
          quantity: 2,
          unit: 'ליטר',
          category: 'dairy',
          isHighProtein: false,
          estimatedPrice: 7,
          addedBy: 'm1',
          createdAt: 1000,
        },
      ],
      activity: [],
    }

    // User A on Phone A: Marks 'item-milk' as bought
    const userAState: StoreState = {
      ...baseState,
      items: [
        { ...baseState.items[0], boughtBy: 'm1', boughtAt: 2000 },
      ],
      activity: [{ id: 'a1', text: 'אבא קנה חלב', memberId: 'm1', createdAt: 2000 }],
    }

    // User B on Phone B: Concurrently adds 'item-bread'
    const userBState: StoreState = {
      ...baseState,
      items: [
        ...baseState.items,
        {
          id: 'item-bread',
          name: 'לחם שיפון',
          quantity: 1,
          unit: 'יחידה',
          category: 'bakery',
          isHighProtein: false,
          estimatedPrice: 15,
          addedBy: 'm2',
          createdAt: 2050,
        },
      ],
      activity: [{ id: 'a2', text: 'אמא הוסיפה לחם שיפון', memberId: 'm2', createdAt: 2050 }],
    }

    // Merge User A and User B updates
    const merged = mergeStoreStates(userAState, userBState)

    // 1. Both items must exist
    expect(merged.items).toHaveLength(2)
    const milk = merged.items.find((i) => i.id === 'item-milk')
    const bread = merged.items.find((i) => i.id === 'item-bread')

    // 2. Milk must remain bought!
    expect(milk?.boughtBy).toBe('m1')
    expect(milk?.boughtAt).toBe(2000)

    // 3. Bread must be present!
    expect(bread?.name).toBe('לחם שיפון')

    // 4. Activity contains both actions sorted by time
    expect(merged.activity).toHaveLength(2)
    expect(merged.activity[0].text).toBe('אמא הוסיפה לחם שיפון')
    expect(merged.activity[1].text).toBe('אבא קנה חלב')
  })
})
