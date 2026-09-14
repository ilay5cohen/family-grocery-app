import { describe, it, expect } from 'vitest'
import {
  extractQuantityAndUnit,
  detectAndFixVisualHebrew,
  reverseHebrewString,
} from './fileImportParser'

describe('File Import Parser Engine', () => {
  describe('Visual Hebrew (Bidi) Detection & Reversal', () => {
    it('correctly reverses a single Hebrew word', () => {
      expect(reverseHebrewString('בלח')).toBe('חלב')
      expect(reverseHebrewString('םחל')).toBe('לחם')
      expect(reverseHebrewString('םיציב')).toBe('ביצים')
    })

    it('detects reversed Hebrew text from PDF stream and fixes it', () => {
      // "בלח הנובת 3%" represents reversed "חלב תנובה 3%"
      const fixed = detectAndFixVisualHebrew('בלח הנובת')
      expect(fixed).toContain('חלב')
    })

    it('leaves standard Hebrew unchanged when not reversed', () => {
      const original = 'חלב תנובה 3% 1 ליטר'
      const fixed = detectAndFixVisualHebrew(original)
      expect(fixed).toBe(original)
    })
  })

  describe('extractQuantityAndUnit', () => {
    it('extracts leading digits, unit, and item name', () => {
      const res = extractQuantityAndUnit('2 ק"ג עגבניות')
      expect(res.quantity).toBe(2)
      expect(res.unit).toBe('ק"ג')
      expect(res.cleanName).toBe('עגבניות')
    })

    it('extracts trailing price in shekels', () => {
      const res = extractQuantityAndUnit('שמן זית 750 מ"ל ₪34.90')
      expect(res.price).toBe(34.9)
      expect(res.cleanName).toContain('שמן זית')
    })

    it('extracts Hebrew number words', () => {
      const res = extractQuantityAndUnit('שני חלב תנובה')
      expect(res.quantity).toBe(2)
      expect(res.cleanName).toContain('חלב תנובה')
    })

    it('extracts trailing quantity and unit in parentheses', () => {
      const res = extractQuantityAndUnit('מלפפון (3 קילו)')
      expect(res.quantity).toBe(3)
      expect(res.unit).toBe('קילו')
      expect(res.cleanName).toBe('מלפפון')
    })
  })
})
