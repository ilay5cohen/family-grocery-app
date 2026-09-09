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

function buildMember(name: string, index: number, isAdmin: boolean): Member {
  const profile = avatarProfileFor(index)
  return {
    id: uid(),
    name: name.trim(),
    avatar: initialFor(name),
    color: profile.color,
    glow: profile.glow,
    isAdmin,
    joinedAt: Date.now(),
  }
}

function activityEntry(text: string, memberId?: string): ActivityEntry {
  return { id: uid(), text, memberId, createdAt: Date.now() }
}

export function createFamily(founderName: string): CreateFamilyResult {
  const registry = readRegistry()
  const code = generateUniqueFamilyCode(registry)
  const familyId = uid()
  const founder = buildMember(founderName, 0, true)

  const state: StoreState = {
    family: { id: familyId, code, createdAt: Date.now(), autoWeeklyReset: true, lastWeeklyReset: Date.now() },
    members: [founder],
    items: [],
    activity: [activityEntry(`${founder.name} יצר/ה את המשפחה 🎉`, founder.id)],
  }

  writeFamilyState(familyId, state)
  writeRegistry({ ...registry, [code]: familyId })

  return { familyId, memberId: founder.id, code }
}

export function joinFamily(rawCode: string, memberName: string): AuthResult | AuthError {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { error: 'נא להזין קוד משפחה.' }

  const registry = readRegistry()
  const familyId = registry[code]
  if (!familyId) return { error: 'קוד המשפחה שגוי. בדקו את הקוד ונסו שוב.' }

  const state = readFamilyState(familyId)
  if (!state) return { error: 'המשפחה לא נמצאה. ייתכן שהיא נמחקה.' }

  const trimmedName = memberName.trim()
  if (state.members.some((m) => m.name.trim() === trimmedName)) {
    return { error: 'כבר יש בן/בת משפחה עם השם הזה. נסו שם קצת שונה.' }
  }

  const member = buildMember(memberName, state.members.length, false)
  const nextState: StoreState = {
    ...state,
    members: [...state.members, member],
    activity: [activityEntry(`${member.name} הצטרף/ה למשפחה 👋`, member.id), ...state.activity],
  }

  writeFamilyState(familyId, nextState)
  return { familyId, memberId: member.id }
}
