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
  'שמונה': 8,
  'תשע': 9, 'תשעה': 9,
  'עשר': 10, 'עשרה': 10,
}

const UNIT_WORDS = [
  'קופסאות', 'קופסה', 'ליטרים', 'ליטר', 'ק"ג', 'קג', 'קילו', 'קילוגרם',
  'חבילות', 'חבילה', 'יחידות', 'יחידה', 'בקבוקים', 'בקבוק', 'שקיות', 'שקית',
  'תבניות', 'תבנית', 'אריזות', 'אריזה', 'גרם', 'צרור', 'גביע', 'מארז', 'פחיות', 'פחית',
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
  /^[-=_*#\s]{3,}$/,
]

function extractQuantityAndUnit(text: string): { quantity: number; unit: string | null; cleanName: string } {
  let cleaned = text.trim()
  let quantity = 1
  let unit: string | null = null

  // 1. Check for leading digits (e.g., "2 חלב" or "1.5 קג עגבניות")
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

  // 2. Check for unit word immediately following quantity
  const nextWord = cleaned.split(/\s+/)[0]
  if (nextWord && UNIT_WORDS.includes(nextWord)) {
    unit = nextWord
    cleaned = cleaned.slice(nextWord.length).trim()
  }

  // 3. Also check for trailing quantity/unit (e.g., "חלב 3% - 2 יחידות" or "עגבניות (1 קג)")
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

  // Clean leading/trailing punctuation and bullets
  cleaned = cleaned.replace(/^[\s•\-*–—\d.)]+/, '').trim()
  cleaned = cleaned.replace(/[\s\-*–—:]+$/, '').trim()

  return { quantity, unit, cleanName: cleaned }
}

function matchToCatalog(rawName: string, explicitQuantity?: number, explicitUnit?: string): ImportCandidate {
  const { quantity: parsedQty, unit: parsedUnit, cleanName } = extractQuantityAndUnit(rawName)
  const finalQty = explicitQuantity && explicitQuantity > 0 ? explicitQuantity : parsedQty
  const finalUnit = explicitUnit || parsedUnit

  const searchTarget = cleanName.toLowerCase()

  // Find in Israeli catalog
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
    return {
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: matched.name,
      quantity: finalQty,
      unit: finalUnit || matched.unit,
      category: matched.category,
      isHighProtein: Boolean(matched.protein),
      estimatedPrice: Math.round(matched.price * finalQty * 100) / 100,
      rawText: rawName,
      matchedProduct: matched,
      selected: true,
    }
  }

  // Fallback to item knowledge
  const profile = lookupItem(cleanName)
  return {
    id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    quantity: finalQty,
    unit: finalUnit || profile.unit,
    category: profile.category,
    isHighProtein: profile.protein,
    estimatedPrice: Math.round(profile.price * finalQty * 100) / 100,
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

  // Inspect headers in first 3 rows
  let headerRowIndex = -1
  let nameColIdx = -1
  let qtyColIdx = -1
  let unitColIdx = -1

  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const row = rows[r]
    if (!Array.isArray(row)) continue
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toLowerCase()
      if (/שם|מוצר|פריט|מצרך|name|item|product|description|תיאור/i.test(val)) {
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

      candidates.push(matchToCatalog(rawName, explicitQty, explicitUnit))
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

/**
 * Parses a PDF file using PDF.js
 */
export async function parsePdfFile(file: File): Promise<ImportCandidate[]> {
  const pdfjsLib = await loadPdfjs()
  const buffer = await file.arrayBuffer()
  // Imported PDFs are untrusted input, so eval-based font handling stays off.
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    disableAutoFetch: true,
  })
  const pdfDoc = await loadingTask.promise

  if (pdfDoc.numPages === 0) {
    throw new Error('קובץ ה-PDF ריק.')
  }

  const rawLines: string[] = []

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const textContent = await page.getTextContent()

    let currentLine = ''
    let lastY: number | null = null

    for (const item of textContent.items as any[]) {
      if (!item.str) continue
      const y = item.transform ? item.transform[5] : null

      // Check if started a new line based on vertical Y position
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 6) {
        if (currentLine.trim()) rawLines.push(currentLine.trim())
        currentLine = item.str
      } else {
        currentLine += (currentLine ? ' ' : '') + item.str
      }
      lastY = y
    }
    if (currentLine.trim()) rawLines.push(currentLine.trim())
  }

  // Filter out headers, dates, and noise
  const candidates: ImportCandidate[] = []

  for (const line of rawLines) {
    if (candidates.length >= MAX_IMPORT_ROWS) break
    const trimmed = line.trim()
    if (trimmed.length < 2) continue
    if (IGNORED_PDF_PATTERNS.some((pattern) => pattern.test(trimmed))) continue

    // Ignore lines that are purely numbers or prices
    if (/^[\d.,\s₪$€]+$/.test(trimmed)) continue

    const candidate = matchToCatalog(trimmed)
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
