import { lookupItem } from '../data/itemKnowledge'
import { ISRAELI_CATALOG } from '../data/israeliProducts'
import type { Category } from '../types'

export interface ParsedItem {
  name: string
  quantity: number
  unit: string
  category: Category
  isHighProtein: boolean
  estimatedPrice: number
  isStaple?: boolean
}

const HEBREW_NUMBERS: Record<string, number> = {
  'אחד': 1, 'אחת': 1,
  'שני': 2, 'שתי': 2, 'שניים': 2, 'שתיים': 2,
  'שלוש': 3, 'שלושה': 3,
  'ארבע': 4, 'ארבעה': 4,
  'חמש': 5, 'חמישה': 5,
  'שש': 6, 'שישה': 6,
  'שבע': 7, 'שבעה': 7,
  'שמונה': 8,
  'תשע': 9, 'תשעה': 9,
  'עשר': 10, 'עשרה': 10,
}

const UNIT_WORDS = [
  'קופסאות', 'קופסה', 'ליטרים', 'ליטר', 'ק"ג', 'קג', 'קילו', 'קילוגרם',
  'חבילות', 'חבילה', 'יחידות', 'יחידה', 'בקבוקים', 'בקבוק', 'שקיות', 'שקית',
  'תבניות', 'תבנית', 'אריזות', 'אריזה', 'גרם', 'צרור', 'גביע', 'מארז',
]

const LEADING_FILLER_WORDS = [
  'אנחנו צריכים', 'אני צריך', 'אני צריכה', 'צריכים', 'צריך', 'צריכה',
  'תוסיפי', 'תוסיף', 'תוסיפו', 'רוצה', 'רוצים', 'קונים', 'לקנות', 'תביא',
  'תביאי', 'בבקשה', 'גם', 'וגם', 'ו',
]

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripLeadingFillers(chunk: string): string {
  let text = chunk.trim().slice(0, 150) // Length safety cap
  let changed = true
  let iterations = 0
  while (changed && iterations < 15) {
    changed = false
    iterations++
    for (const filler of LEADING_FILLER_WORDS) {
      const escaped = escapeRegExp(filler)
      const re = new RegExp(`^${escaped}\\s+`, 'i')
      if (re.test(text)) {
        text = text.replace(re, '')
        changed = true
      }
    }
  }
  return text.trim()
}

function splitIntoChunks(text: string): string[] {
  return text
    .slice(0, 500) // limit input text length to 500 chars
    .split(/[,\n]|וגם|\s+ו(?=[א-ת])/)
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 30) // limit max 30 chunks per single parse
}

function extractQuantity(text: string): { quantity: number; rest: string } {
  const digitMatch = text.match(/^(\d+(?:\.\d+)?)\s*/)
  if (digitMatch) {
    const rawNum = parseFloat(digitMatch[1])
    const safeNum = Math.max(0.1, Math.min(999, isNaN(rawNum) ? 1 : rawNum))
    return { quantity: safeNum, rest: text.slice(digitMatch[0].length).trim() }
  }
  const firstWord = text.split(/\s+/)[0]
  if (firstWord && HEBREW_NUMBERS[firstWord] !== undefined) {
    return { quantity: HEBREW_NUMBERS[firstWord], rest: text.slice(firstWord.length).trim() }
  }
  return { quantity: 1, rest: text }
}

function extractUnit(text: string): { unit: string | null; rest: string } {
  const firstWord = text.split(/\s+/)[0]
  if (firstWord && UNIT_WORDS.includes(firstWord)) {
    return { unit: firstWord, rest: text.slice(firstWord.length).trim() }
  }
  return { unit: null, rest: text }
}

/**
 * "Smart" parser that turns free-form Hebrew shopping requests into
 * structured grocery items — e.g. "צריך 3 קופסאות טונה וגם חלבונים"
 * becomes two items with quantity, unit, category, protein flag and price.
 */
export function parseGroceryText(input: string): ParsedItem[] {
  const cleaned = stripLeadingFillers(input)
  const chunks = splitIntoChunks(cleaned)

  const results: ParsedItem[] = []
  for (const rawChunk of chunks) {
    const chunk = stripLeadingFillers(rawChunk)
    if (!chunk) continue

    const { quantity, rest: afterQty } = extractQuantity(chunk)
    const { unit, rest: afterUnit } = extractUnit(afterQty)
    const rawName = stripLeadingFillers(afterUnit).trim().slice(0, 80) // Max 80 chars
    if (!rawName) continue

    // Check if matches an authentic Israeli catalog product
    const lowerName = rawName.toLowerCase()
    const catalogMatch = ISRAELI_CATALOG.find((p) => {
      const pLower = p.name.toLowerCase()
      return (
        pLower === lowerName ||
        p.keywords.some((k) => k.toLowerCase() === lowerName || lowerName.includes(k.toLowerCase()))
      )
    })

    if (catalogMatch) {
      results.push({
        name: catalogMatch.name,
        quantity,
        unit: unit ?? catalogMatch.unit,
        category: catalogMatch.category,
        isHighProtein: Boolean(catalogMatch.protein),
        estimatedPrice: Math.round(catalogMatch.price * quantity * 100) / 100,
        isStaple: false,
      })
    } else {
      const profile = lookupItem(rawName)
      results.push({
        name: rawName.charAt(0).toUpperCase() + rawName.slice(1),
        quantity,
        unit: unit ?? profile.unit,
        category: profile.category,
        isHighProtein: profile.protein,
        estimatedPrice: Math.round(profile.price * quantity * 100) / 100,
        isStaple: false,
      })
    }
  }
  return results
}
