import type { StoreState } from '../types'
import { readFamilyState, readRegistry, writeFamilyState, writeRegistry } from '../utils/familyStorage'
import { MEMBERS, SEED_ACTIVITY, SEED_ITEMS } from './seed'

export const DEMO_FAMILY_ID = 'demo-family'
export const DEMO_FAMILY_CODE = 'DEMO1'

/**
 * Seeds a live, pre-populated "demo family" exactly once per browser, so a
 * first-time visitor can explore the app instantly without creating a real
 * account. Safe to call on every app boot — it's a no-op once the demo
 * family already exists, so it never resets someone's in-progress demo.
 */
export function ensureDemoFamilySeeded() {
  const existing = readFamilyState(DEMO_FAMILY_ID)
  const registry = readRegistry()
  if (existing && registry[DEMO_FAMILY_CODE] === DEMO_FAMILY_ID) return

  const state: StoreState = {
    family: { id: DEMO_FAMILY_ID, code: DEMO_FAMILY_CODE, createdAt: Date.now(), autoWeeklyReset: true, lastWeeklyReset: Date.now() },
    members: MEMBERS,
    items: SEED_ITEMS,
    activity: SEED_ACTIVITY,
  }
  writeFamilyState(DEMO_FAMILY_ID, state)
  if (registry[DEMO_FAMILY_CODE] !== DEMO_FAMILY_ID) {
    writeRegistry({ ...registry, [DEMO_FAMILY_CODE]: DEMO_FAMILY_ID })
  }
}

export function joinDemoFamily(): { familyId: string; memberId: string } {
  ensureDemoFamilySeeded()
  const state = readFamilyState(DEMO_FAMILY_ID)
  // Storage can be unavailable or hold data an older version wrote; fall back
  // to the in-memory seed so "try the demo" never lands on a broken screen.
  const members = state?.members?.length ? state.members : MEMBERS
  const randomMember = members[Math.floor(Math.random() * members.length)]
  return { familyId: DEMO_FAMILY_ID, memberId: randomMember.id }
}
