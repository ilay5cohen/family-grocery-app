import { ISRAELI_CATALOG, type CatalogProduct } from '../data/israeliProducts'
import { lookupItem } from '../data/itemKnowledge'
import type { Category } from '../types'

/**
 * Excel and PDF parsing pull in ~900KB of libraries, so they are imported
 * on demand rather than in the main bundle — most sessions never open the
 * import dialog at all.
 */
async function loadXlsx() {
  return import('xlsx')
}

let pdfWorkerConfigured = false
async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist')
  if (!pdfWorkerConfigured) {
    // The worker ships with the installed package and is bundled locally, so
    // PDF import can't break when a CDN lags behind a version bump — and no
    // third-party executable code is pulled into this origin at runtime.
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    pdfWorkerConfigured = true
  }
  return pdfjsLib
}

/** Guards against a mis-picked huge file freezing the tab during parsing. */
export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024

/** The cart itself holds 250 items, so parsing more rows than this is wasted work. */
export const MAX_IMPORT_ROWS = 300

export interface ImportCandidate {
  id: string
  name: string
  quantity: number
  unit: string
  category: Category
  isHighProtein: boolean
  estimatedPrice: number
  rawText: string
  matchedProduct?: CatalogProduct
  selected: boolean
}

const HEBREW_NUMBERS: Record<string, number> = {
  'אחד': 1, 'אחת': 1,
  'שני': 2, 'שתי': 2, 'שניים': 2, 'שתיים': 2,
  'שלוש': 3, 'שלושה': 3,
  'ארבע': 4, 'ארבעה': 4,
  'חמש': 5, 'חמישה': 5,
  'שש': 6, 'שישה': 6,
  'שבע': 7, 'שבעה': 7,
  'שמונה': 8, 'ששימונה': 8,
  'תשע': 9, 'תשעה': 9,
  'עשר': 10, 'עשרה': 10,
}

export const COMMON_UNITS = [
  'יחידה',
  'יח\'',
  'ק"ג',
  'קילו',
  'גרם',
  'ליטר',
  'חבילה',
  'מארז',
  'בקבוק',
  'שקית',
  'קופסה',
  'תבנית',
  'פחית',
]

const UNIT_WORDS = [
  'קופסאות', 'קופסה', 'ליטרים', 'ליטר', 'ק"ג', 'קג', 'קילו', 'קילוגרם',
  'חבילות', 'חבילה', 'יחידות', 'יחידה', 'יח\'', 'בקבוקים', 'בקבוק', 'שקיות', 'שקית',
  'תבניות', 'תבנית', 'אריזות', 'אריזה', 'גרם', 'צרור', 'גביע', 'מארז', 'מארזים', 'פחיות', 'פחית',
]

const IGNORED_PDF_PATTERNS = [
  /^עמוד\s+\d+/i,
  /^page\s+\d+/i,
  /חשבונית\s+מס/i,
  /קבלה\s+מס/i,
  /תעודת\s+משלוח/i,
  /תאריך:/i,
  /שעה:/i,
  /עוסק\s+מורשה/i,
  /ח\.פ\./i,
  /סה"כ/i,
  /סה״כ/i,
  /מע"מ/i,
  /תשלום\s+ב/i,
  /כרטיס\s+אשראי/i,
  /תודה\s+שקניתם/i,
  /ברקוד/i,
  /מספר\s+סידורי/i,
  /טלפון/i,
  /כתובת/i,
  /^[-=_*#\s]{3,}$/,
]

// Known common Hebrew grocery keywords used to detect reversed visual Hebrew in PDFs
const KNOWN_HEBREW_WORDS = new Set([
  'חלב', 'לחם', 'ביצים', 'גבינה', 'שמן', 'קוטג', 'בשר', 'עוף', 'עגבניות',
  'מלפפון', 'סוכר', 'קפה', 'תה', 'טונה', 'אורז', 'פסטה', 'יוגורט', 'חמאה',
  'שוקולד', 'מים', 'מיץ', 'קמח', 'מלח', 'פלפל', 'בצל', 'תפוח', 'תפוחי',
  'שניצל', 'חומוס', 'טחינה', 'זיתים', 'שימורים', 'שמפו', 'סבון', 'חטיף',
])

/**
 * Detects if a Hebrew word or string is encoded backwards (Visual Hebrew),
 * e.g. "בלח" instead of "חלב", "םיציב" instead of "ביצים".
 */
export function reverseHebrewString(str: string): string {
  return str.split('').reverse().join('')
}

export function detectAndFixVisualHebrew(text: string): string {
  if (!text || !/[\u0590-\u05FF]/.test(text)) return text

  const words = text.trim().split(/\s+/)
  let reversedScore = 0
  let normalScore = 0

  for (const word of words) {
    const cleanWord = word.replace(/[^א-ת]/g, '')
    if (cleanWord.length < 2) continue

    if (KNOWN_HEBREW_WORDS.has(cleanWord)) {
      normalScore++
    }
    const rev = reverseHebrewString(cleanWord)
    if (KNOWN_HEBREW_WORDS.has(rev)) {
      reversedScore++
    }
  }

  // If reversed words match known terms more than normal words, fix the string
  if (reversedScore > normalScore) {
    // Reverse only the Hebrew words and the word order
    return words
      .map((w) => (/[\u0590-\u05FF]/.test(w) ? reverseHebrewString(w) : w))
      .reverse()
      .join(' ')
  }

  return text
}

export function extractQuantityAndUnit(text: string): {
  quantity: number
  unit: string | null
  cleanName: string
  price?: number
} {
  let cleaned = text.trim()
  let quantity = 1
  let unit: string | null = null
  let price: number | undefined

  // 1. Check for price tag at the end (e.g., "₪14.90" or "14.90 ₪" or "- 14.90")
  const priceMatch = cleaned.match(/(?:₪\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*₪)$/)
  if (priceMatch) {
    const foundPrice = parseFloat(priceMatch[1] || priceMatch[2])
    if (!isNaN(foundPrice) && foundPrice > 0) {
      price = foundPrice
      cleaned = cleaned.slice(0, priceMatch.index).trim()
    }
  }

  // 2. Check for leading digits (e.g., "2 חלב" or "1.5 קג עגבניות")
  const leadingNumMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*/)
  if (leadingNumMatch) {
    const num = parseFloat(leadingNumMatch[1])
    if (!isNaN(num) && num > 0) {
      quantity = num
      cleaned = cleaned.slice(leadingNumMatch[0].length).trim()
    }
  } else {
    // Check for Hebrew number word (e.g., "שני חלב")
    const firstWord = cleaned.split(/\s+/)[0]
    if (firstWord && HEBREW_NUMBERS[firstWord]) {
      quantity = HEBREW_NUMBERS[firstWord]
      cleaned = cleaned.slice(firstWord.length).trim()
    }
  }

  // 3. Check for unit word immediately following quantity
  const nextWord = cleaned.split(/\s+/)[0]
  if (nextWord && UNIT_WORDS.includes(nextWord)) {
    unit = nextWord
    cleaned = cleaned.slice(nextWord.length).trim()
  }

  // 4. Also check for trailing quantity/unit (e.g., "חלב 3% - 2 יחידות" or "עגבניות (1 קג)")
  const trailingMatch = cleaned.match(/[-–—(]?\s*(\d+(?:\.\d+)?)\s*([א-ת]+)?[)]?$/)
  if (trailingMatch && quantity === 1) {
    const trailingNum = parseFloat(trailingMatch[1])
    if (!isNaN(trailingNum) && trailingNum > 0) {
      quantity = trailingNum
      if (trailingMatch[2] && UNIT_WORDS.includes(trailingMatch[2])) {
        unit = trailingMatch[2]
      }
      cleaned = cleaned.slice(0, trailingMatch.index).trim()
    }
  }

  // Clean leading/trailing punctuation, barcodes, numbers, and bullets
  cleaned = cleaned.replace(/^[\s•\-*–—\d.)]+/, '').trim()
  cleaned = cleaned.replace(/[\s\-*–—:]+$/, '').trim()

  return { quantity, unit, cleanName: cleaned, price }
}

export function matchToCatalog(
  rawName: string,
  explicitQuantity?: number,
  explicitUnit?: string,
  explicitPrice?: number,
): ImportCandidate {
  const { quantity: parsedQty, unit: parsedUnit, cleanName, price: parsedPrice } = extractQuantityAndUnit(rawName)
  const finalQty = explicitQuantity && explicitQuantity > 0 ? explicitQuantity : parsedQty
  const finalUnit = explicitUnit || parsedUnit
  const foundPrice = explicitPrice !== undefined && explicitPrice > 0 ? explicitPrice : parsedPrice

  const searchTarget = cleanName.toLowerCase()

  // 1. Find in Israeli catalog
  const matched = ISRAELI_CATALOG.find((p) => {
    const pName = p.name.toLowerCase()
    if (pName === searchTarget || pName.includes(searchTarget) || searchTarget.includes(pName)) {
      return true
    }
    return p.keywords.some((k) => {
      const kLower = k.toLowerCase()
      return kLower === searchTarget || searchTarget.includes(kLower)
    })
  })

  if (matched) {
    const pricePerUnit = foundPrice ?? matched.price
    return {
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: matched.name,
      quantity: finalQty,
      unit: finalUnit || matched.unit,
      category: matched.category,
      isHighProtein: Boolean(matched.protein),
      estimatedPrice: Math.round(pricePerUnit * finalQty * 100) / 100,
      rawText: rawName,
      matchedProduct: matched,
      selected: true,
    }
  }

  // 2. Fallback to general item knowledge
  const profile = lookupItem(cleanName)
  const pricePerUnit = foundPrice ?? profile.price
  return {
    id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    quantity: finalQty,
    unit: finalUnit || profile.unit,
    category: profile.category,
    isHighProtein: profile.protein,
    estimatedPrice: Math.round(pricePerUnit * finalQty * 100) / 100,
    rawText: rawName,
    selected: true,
  }
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file
 */
export async function parseExcelFile(file: File): Promise<ImportCandidate[]> {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error('קובץ האקסל ריק או אינו מכיל גיליונות.')
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  if (!rows || rows.length === 0) {
    throw new Error('לא נמצאו נתונים בגיליון.')
  }

  // Inspect headers in first 5 rows
  let headerRowIndex = -1
  let nameColIdx = -1
  let qtyColIdx = -1
  let unitColIdx = -1
  let priceColIdx = -1

  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const row = rows[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toLowerCase()
      if (/שם|מוצר|פריט|מצרך|תיאור|name|item|product|description/i.test(val)) {
        nameColIdx = c
        headerRowIndex = r
      }
      if (/כמות|qty|quantity|count|מספר/i.test(val)) {
        qtyColIdx = c
        headerRowIndex = r
      }
      if (/יחידה|מידה|unit/i.test(val)) {
        unitColIdx = c
      }
      if (/מחיר|מחיר ליח|עלות|price|total|סכום/i.test(val)) {
        priceColIdx = c
      }
    }
    if (nameColIdx !== -1) break
  }

  const candidates: ImportCandidate[] = []
  const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0

  for (let r = startRow; r < rows.length && candidates.length < MAX_IMPORT_ROWS; r++) {
    const row = rows[r]
    if (!row || !Array.isArray(row) || row.length === 0) continue

    if (nameColIdx !== -1) {
      // Structured column extraction
      const rawName = String(row[nameColIdx] || '').trim()
      if (!rawName || rawName.length < 2) continue

      let explicitQty: number | undefined
      if (qtyColIdx !== -1 && row[qtyColIdx] !== undefined) {
        const num = parseFloat(String(row[qtyColIdx]))
        if (!isNaN(num) && num > 0) explicitQty = num
      }

      let explicitUnit: string | undefined
      if (unitColIdx !== -1 && row[unitColIdx]) {
        explicitUnit = String(row[unitColIdx]).trim()
      }

      let explicitPrice: number | undefined
      if (priceColIdx !== -1 && row[priceColIdx] !== undefined) {
        const num = parseFloat(String(row[priceColIdx]).replace(/[^\d.]/g, ''))
        if (!isNaN(num) && num > 0) explicitPrice = num
      }

      candidates.push(matchToCatalog(rawName, explicitQty, explicitUnit, explicitPrice))
    } else {
      // Freeform row
      const firstCell = String(row[0] || '').trim()
      if (!firstCell || firstCell.length < 2) continue

      let explicitQty: number | undefined
      if (row.length > 1 && !isNaN(parseFloat(String(row[1])))) {
        explicitQty = parseFloat(String(row[1]))
      }

      candidates.push(matchToCatalog(firstCell, explicitQty))
    }
  }

  if (candidates.length === 0) {
    throw new Error('לא זוהו מוצרי קניות בקובץ. ודא שהקובץ כולל שמות מוצרים וכמויות.')
  }

  return candidates
}

interface PdfTextItem {
  str: string
  x: number
  y: number
  width: number
  height: number
}

interface PdfRow {
  y: number
  items: PdfTextItem[]
}

/**
 * Advanced PDF parser with Spatial Table Clustering and Hebrew Bidi Support
 */
export async function parsePdfFile(file: File): Promise<ImportCandidate[]> {
  const pdfjsLib = await loadPdfjs()
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    disableAutoFetch: true,
  })
  const pdfDoc = await loadingTask.promise

  if (pdfDoc.numPages === 0) {
    throw new Error('קובץ ה-PDF ריק.')
  }

  const extractedRows: { text: string; explicitQty?: number; explicitPrice?: number }[] = []

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const textContent = await page.getTextContent()

    const rawItems: PdfTextItem[] = []

    for (const item of textContent.items as any[]) {
      if (!item.str || !item.str.trim()) continue
      const transform = item.transform || [1, 0, 0, 1, 0, 0]
      rawItems.push({
        str: item.str.trim(),
        x: transform[4] || 0,
        y: transform[5] || 0,
        width: item.width || 0,
        height: item.height || 0,
      })
    }

    if (rawItems.length === 0) continue

    // 1. Group items into horizontal rows based on vertical Y position
    // Tolerance of 4.5px handles slight line misalignments in tables
    const rows: PdfRow[] = []
    // Sort descending by Y (top of page to bottom)
    rawItems.sort((a, b) => b.y - a.y)

    for (const item of rawItems) {
      let matchedRow = rows.find((r) => Math.abs(r.y - item.y) <= 4.5)
      if (!matchedRow) {
        matchedRow = { y: item.y, items: [] }
        rows.push(matchedRow)
      }
      matchedRow.items.push(item)
    }

    // 2. Process each horizontal row
    for (const row of rows) {
      // Sort items horizontally across the page:
      // In PDF coordinates, x=0 is left. In Hebrew tables, columns can be RTL or LTR.
      row.items.sort((a, b) => a.x - b.x)

      // Check if this row is an ignored header/footer or invoice metadata
      const fullLineRaw = row.items.map((it) => it.str).join(' ')
      if (IGNORED_PDF_PATTERNS.some((p) => p.test(fullLineRaw))) continue

      // Look for individual table cells in this row:
      // cell candidates: description, quantity, price
      let candidateName = ''
      let candidateQty: number | undefined
      let candidatePrice: number | undefined

      const textTokens: string[] = []
      const numTokens: number[] = []

      for (const item of row.items) {
        const text = detectAndFixVisualHebrew(item.str)
        const cleanNum = parseFloat(text.replace(/[₪$€,]/g, ''))

        // Check if pure number/price
        if (!isNaN(cleanNum) && /^[\d.,₪$€\s]+$/.test(text)) {
          numTokens.push(cleanNum)
        } else if (text.length >= 2 && !/^[\d\s\-=_*#.]+$/.test(text)) {
          textTokens.push(text)
        }
      }

      // If we found a description text
      if (textTokens.length > 0) {
        candidateName = textTokens.join(' ')

        // Assign numbers: usually smaller number is quantity, decimal/larger number is price
        if (numTokens.length === 1) {
          if (numTokens[0] > 0 && numTokens[0] <= 50 && Number.isInteger(numTokens[0])) {
            candidateQty = numTokens[0]
          } else if (numTokens[0] > 0) {
            candidatePrice = numTokens[0]
          }
        } else if (numTokens.length >= 2) {
          // In standard Israeli supermarket receipts/tables:
          // e.g. [Barcode, Name, Qty, UnitPrice, TotalPrice]
          // or [Qty, Name, Price]
          const positiveNums = numTokens.filter((n) => n > 0)
          if (positiveNums.length >= 2) {
            // Pick smallest sensible integer as quantity
            const qtyCandidate = positiveNums.find((n) => n > 0 && n <= 100 && (n % 1 === 0 || n % 0.5 === 0))
            if (qtyCandidate) candidateQty = qtyCandidate
            // Pick price
            const priceCandidate = positiveNums.find((n) => n !== qtyCandidate && n > 0 && n < 1000)
            if (priceCandidate) candidatePrice = priceCandidate
          }
        }

        extractedRows.push({
          text: candidateName,
          explicitQty: candidateQty,
          explicitPrice: candidatePrice,
        })
      }
    }
  }

  // 3. Match extracted rows to catalog
  const candidates: ImportCandidate[] = []

  for (const row of extractedRows) {
    if (candidates.length >= MAX_IMPORT_ROWS) break
    const trimmed = row.text.trim()
    if (trimmed.length < 2) continue
    if (IGNORED_PDF_PATTERNS.some((pattern) => pattern.test(trimmed))) continue
    if (/^[\d.,\s₪$€]+$/.test(trimmed)) continue

    const candidate = matchToCatalog(trimmed, row.explicitQty, undefined, row.explicitPrice)
    if (candidate.name && candidate.name.length >= 2) {
      candidates.push(candidate)
    }
  }

  if (candidates.length === 0) {
    throw new Error('לא זוהו מוצרי קניות ב-PDF. ודא שהקובץ מכיל טקסט קריא ולא תמונה סרוקה בלבד.')
  }

  return candidates
}

/**
 * Universal file entry point for Excel and PDF
 */
export async function parseImportFile(file: File): Promise<ImportCandidate[]> {
  if (file.size === 0) {
    throw new Error('הקובץ ריק. אנא בחר/י קובץ אחר.')
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    const limitMb = Math.round(MAX_IMPORT_FILE_BYTES / (1024 * 1024))
    throw new Error(`הקובץ גדול מדי (מעל ${limitMb}MB). נסו קובץ קטן יותר או פצלו אותו.`)
  }

  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
    return parseExcelFile(file)
  }

  if (lowerName.endsWith('.pdf')) {
    return parsePdfFile(file)
  }

  throw new Error('פורמט קובץ אינו נתמך. אנא בחר קובץ Excel (.xlsx, .xls, .csv) או מסמך PDF.')
}
