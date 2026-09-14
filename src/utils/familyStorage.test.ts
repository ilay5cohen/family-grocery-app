import { describe, it, expect } from 'vitest'
import {
  generateFamilyCode,
  FAMILY_CODE_LENGTH,
  isValidStoreState,
  familyStateKey,
} from './familyStorage'

describe('Family Storage & Security', () => {
  it('generates a family code with exact required length', () => {
    const code = generateFamilyCode()
    expect(code).toHaveLength(FAMILY_CODE_LENGTH)
    expect(code).toMatch(/^[A-Z0-9]+$/)
  })

  it('avoids ambiguous characters (0, O, 1, I, L) in family code', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateFamilyCode()
      expect(code).not.toMatch(/[0O1IL]/)
    }
  })

  it('generates correct familyStateKey', () => {
    expect(familyStateKey('fam-123')).toBe('family-grocery-list:fam-123')
  })

  it('validates a correct store state structure', () => {
    const validState = {
      family: { id: 'f1', code: 'ABC23', createdAt: Date.now() },
      members: [{ id: 'm1', name: 'יוסי', color: 'emerald', isAdmin: true }],
      items: [{ id: 'i1', name: 'חלב', quantity: 1, unit: 'ליטר' }],
      activity: [],
    }
    expect(isValidStoreState(validState)).toBe(true)
  })

  it('rejects corrupt or invalid state payloads safely', () => {
    expect(isValidStoreState(null)).toBe(false)
    expect(isValidStoreState({})).toBe(false)
    expect(isValidStoreState({ family: null, members: 'corrupted' })).toBe(false)
  })
})
