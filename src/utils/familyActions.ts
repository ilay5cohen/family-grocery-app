import type { ActivityEntry, Member, StoreState } from '../types'
import { avatarProfileFor, initialFor } from './avatarPalette'
import {
  generateUniqueFamilyCode,
  readFamilyState,
  readRegistry,
  writeFamilyState,
  writeRegistry,
} from './familyStorage'
import { uid } from './id'
import {
  findFamilyByCode,
  pushFamilyState,
} from '../services/cloudSync'

export interface AuthResult {
  familyId: string
  memberId: string
}

export interface CreateFamilyResult extends AuthResult {
  code: string
}

export interface AuthError {
  error: string
}

/** Long names break avatar badges and member lists, so they're capped at the source. */
export const MAX_MEMBER_NAME_LENGTH = 24

export function normalizeMemberName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, MAX_MEMBER_NAME_LENGTH)
}

function buildMember(name: string, index: number, isAdmin: boolean): Member {
  const profile = avatarProfileFor(index)
  const cleanName = normalizeMemberName(name)
  return {
    id: uid(),
    name: cleanName,
    avatar: initialFor(cleanName),
    color: profile.color,
    glow: profile.glow,
    isAdmin,
    joinedAt: Date.now(),
  }
}

function activityEntry(text: string, memberId?: string): ActivityEntry {
  return { id: uid(), text, memberId, createdAt: Date.now() }
}

export async function createFamily(founderName: string): Promise<CreateFamilyResult> {
  if (!normalizeMemberName(founderName)) {
    throw new Error('נא להזין שם.')
  }
  const registry = readRegistry()
  const code = generateUniqueFamilyCode(registry)
  const familyId = uid()
  const founder = buildMember(founderName, 0, true)

  const state: StoreState = {
    family: { id: familyId, code, createdAt: Date.now(), autoWeeklyReset: true, lastWeeklyReset: Date.now() },
    members: [founder],
    items: [],
    activity: [activityEntry(`${founder.name} יצר/ה את המשפחה`, founder.id)],
  }

  // 1. Write locally
  writeFamilyState(familyId, state)
  writeRegistry({ ...registry, [code]: familyId })

  // 2. Sync to Cloud (Supabase + Zero-config Relay)
  pushFamilyState(familyId, code, state).catch(() => {})

  return { familyId, memberId: founder.id, code }
}

export async function joinFamily(
  rawCode: string,
  memberName: string,
  options?: { fallbackFamilyId?: string; founderName?: string }
): Promise<AuthResult | AuthError> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { error: 'נא להזין קוד משפחה.' }

  const registry = readRegistry()
  let familyId = registry[code]
  let state = familyId ? readFamilyState(familyId) : null

  // If not found in local storage, check Cloud Sync (Supabase + Relay)
  if (!state) {
    const cloudFamily = await findFamilyByCode(code)
    if (cloudFamily) {
      familyId = cloudFamily.familyId
      state = cloudFamily.state
      // Cache in local storage for offline resilience
      writeRegistry({ ...registry, [code]: familyId })
      writeFamilyState(familyId, state)
    }
  }

  // If still not found, check if invite link provided family fallback metadata
  if (!state && options?.fallbackFamilyId) {
    familyId = options.fallbackFamilyId
    const founder = buildMember(options.founderName || 'חבר/ת משפחה', 0, true)
    state = {
      family: { id: familyId, code, createdAt: Date.now(), autoWeeklyReset: true, lastWeeklyReset: Date.now() },
      members: [founder],
      items: [],
      activity: [activityEntry(`המשפחה חוברה דרך קישור הזמנה`, founder.id)],
    }
    writeRegistry({ ...registry, [code]: familyId })
    writeFamilyState(familyId, state)
    pushFamilyState(familyId, code, state).catch(() => {})
  }

  if (!familyId || !state) {
    return { error: 'קוד המשפחה שגוי או שלא קיים. בדקו את הקוד ונסו שוב.' }
  }

  const trimmedName = normalizeMemberName(memberName)
  if (!trimmedName) {
    return { error: 'נא להזין שם.' }
  }

  // If this member already exists in the family (e.g. logging in from second device), log in directly!
  const existingMember = state.members.find(
    (m) => m.name.trim().toLowerCase() === trimmedName.toLowerCase()
  )
  if (existingMember) {
    return { familyId, memberId: existingMember.id }
  }

  // Otherwise, add new member to the family
  const member = buildMember(trimmedName, state.members.length, false)
  const nextState: StoreState = {
    ...state,
    members: [...state.members, member],
    activity: [activityEntry(`${member.name} הצטרף/ה למשפחה`, member.id), ...state.activity],
  }

  // Write updated state locally and to Cloud Sync
  writeFamilyState(familyId, nextState)
  pushFamilyState(familyId, code, nextState).catch(() => {})

  return { familyId, memberId: member.id }
}
