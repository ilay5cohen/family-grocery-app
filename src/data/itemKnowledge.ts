import type { Category } from '../types'

export interface KnownItem {
  keywords: string[]
  category: Category
  price: number
  protein: boolean
  unit: string
}

/**
 * A comprehensive knowledge base of 200+ common Israeli supermarket items.
 * Used by the smart text parser, quick-picks, voice input and price estimator.
 * Matching handles substrings, plurals and everyday grocery terms.
 */
export const KNOWN_ITEMS: KnownItem[] = [
  // ================= PRODUCE (פירות וירקות) =================
  { keywords: ['עגבניות', 'עגבניה', 'עגבניות שרי', 'שרי'], category: 'produce', price: 7.9, protein: false, unit: 'ק"ג' },
  { keywords: ['מלפפונים', 'מלפפון', 'מלפפון חמוץ'], category: 'produce', price: 6.9, protein: false, unit: 'ק"ג' },
  { keywords: ['פלפל', 'פלפלים', 'גמבה', 'פלפל חריף', 'פלפל אדום', 'פלפל צהוב'], category: 'produce', price: 8.9, protein: false, unit: 'ק"ג' },
  { keywords: ['בצל', 'בצלים', 'בצל יבש', 'בצל סגול'], category: 'produce', price: 4.9, protein: false, unit: 'ק"ג' },
  { keywords: ['בצל ירוק', 'עירית'], category: 'produce', price: 3.9, protein: false, unit: 'צרור' },
  { keywords: ['שום', 'ראשי שום', 'שום כתוש'], category: 'produce', price: 6.9, protein: false, unit: 'מארז' },
  { keywords: ['תפוחי אדמה', 'תפוח אדמה', 'תפוד', 'בטטה', 'בטטות'], category: 'produce', price: 5.9, protein: false, unit: 'ק"ג' },
  { keywords: ['גזר', 'גזרים'], category: 'produce', price: 4.5, protein: false, unit: 'ק"ג' },
  { keywords: ['קישוא', 'קישואים', 'זוקיני'], category: 'produce', price: 7.5, protein: false, unit: 'ק"ג' },
  { keywords: ['חציל', 'חצילים'], category: 'produce', price: 6.9, protein: false, unit: 'ק"ג' },
  { keywords: ['כרוב', 'כרוב לבן', 'כרוב אדום'], category: 'produce', price: 5.5, protein: false, unit: 'ק"ג' },
  { keywords: ['כרובית'], category: 'produce', price: 9.9, protein: false, unit: 'יחידה' },
  { keywords: ['ברוקולי'], category: 'produce', price: 11.9, protein: false, unit: 'יחידה' },
  { keywords: ['חסה', 'חסה ערבית', 'חסה אייסברג', 'עלי בייבי', 'עלי תרד', 'תרד'], category: 'produce', price: 6.9, protein: false, unit: 'שקית' },
  { keywords: ['פטרוזיליה', 'כוסברה', 'שמיר', 'בזיליקום', 'נענע'], category: 'produce', price: 3.5, protein: false, unit: 'צרור' },
  { keywords: ['פטריות', 'פטריות שמפיניון', 'פטריות פורטובלו'], category: 'produce', price: 9.9, protein: false, unit: 'סלסלה' },
  { keywords: ['לימון', 'לימונים'], category: 'produce', price: 7.9, protein: false, unit: 'ק"ג' },
  { keywords: ['אבוקדו'], category: 'produce', price: 5.5, protein: false, unit: 'יחידה' },
  { keywords: ['בננות', 'בננה'], category: 'produce', price: 6.9, protein: false, unit: 'ק"ג' },
  { keywords: ['תפוחים', 'תפוח', 'תפוח עץ', 'חרמון', 'גרני סמית'], category: 'produce', price: 9.5, protein: false, unit: 'ק"ג' },
  { keywords: ['תפוזים', 'תפוז', 'קלמנטינות', 'קלמנטינה', 'אשכולית'], category: 'produce', price: 6.5, protein: false, unit: 'ק"ג' },
  { keywords: ['ענבים', 'אבטיח', 'מלון'], category: 'produce', price: 14.9, protein: false, unit: 'ק"ג' },
  { keywords: ['תותים', 'תות שדה'], category: 'produce', price: 17.9, protein: false, unit: 'סלסלה' },
  { keywords: ['אפרסק', 'נקטרינה', 'שזיפים', 'שזיף', 'משמש'], category: 'produce', price: 12.9, protein: false, unit: 'ק"ג' },
  { keywords: ['מנגו', 'אננס'], category: 'produce', price: 16.9, protein: false, unit: 'יחידה' },

  // ================= BAKERY (מאפייה) =================
  { keywords: ['לחם', 'לחם אחיד', 'לחם פרוס', 'לחם מחמצת', 'לחם קל', 'לחם כפרי'], category: 'bakery', price: 11.9, protein: false, unit: 'כיכר' },
  { keywords: ['פיתות', 'פיתה', 'פיתות כוסמין'], category: 'bakery', price: 9.9, protein: false, unit: 'שקית' },
  { keywords: ['לחמניות', 'לחמניה', 'לחמניות המבורגר'], category: 'bakery', price: 12.9, protein: false, unit: 'מארז' },
  { keywords: ['חלה', 'חלות', 'חלה לשבת'], category: 'bakery', price: 10.9, protein: false, unit: 'יחידה' },
  { keywords: ['טורטיות', 'טורטיה', 'לאפה'], category: 'bakery', price: 11.5, protein: false, unit: 'חבילה' },
  { keywords: ['קרואסון', 'רוגלך', 'מאפים', 'בורקס גבינה', 'בורקס תפוח אדמה'], category: 'bakery', price: 16.9, protein: false, unit: 'מארז' },
  { keywords: ['עוגיות', 'עוגה', 'עוגת שמרים', 'עוגת שוקולד', 'עוגיות שוקולד צ\'יפס'], category: 'bakery', price: 14.9, protein: false, unit: 'חבילה' },
  { keywords: ['צנימים', 'טוסטעים', 'קרקרים', 'פתית'], category: 'bakery', price: 9.9, protein: false, unit: 'חבילה' },

  // ================= DAIRY & EGGS (מוצרי חלב וביצים) =================
  { keywords: ['חלב', 'חלב תנובה', 'חלב 3%', 'חלב 1%'], category: 'dairy', price: 6.8, protein: false, unit: 'ליטר' },
  { keywords: ['חלב שקדים', 'חלב סויה', 'חלב שיבולת שועל', 'חלב קוקוס'], category: 'dairy', price: 11.9, protein: false, unit: 'ליטר' },
  { keywords: ['ביצים', 'ביצה', 'ביצים l', 'ביצים xl', 'ביצי חופש'], category: 'protein', price: 16.9, protein: true, unit: 'תבנית' },
  { keywords: ['קוטג', 'קוטג 5%', 'קוטג 9%'], category: 'dairy', price: 6.9, protein: true, unit: 'גביע' },
  { keywords: ['גבינה לבנה', 'גבינה לבנה 5%', 'סקי'], category: 'dairy', price: 6.5, protein: true, unit: 'גביע' },
  { keywords: ['גבינה צהובה', 'עמק', 'נעם', 'גלבוע'], category: 'dairy', price: 15.9, protein: true, unit: 'חבילה' },
  { keywords: ['גבינה בולגרית', 'בולגרית', 'פטה'], category: 'dairy', price: 14.9, protein: true, unit: 'קופסה' },
  { keywords: ['גבינת צפתית', 'צפתית', 'חמד'], category: 'dairy', price: 13.9, protein: true, unit: 'חבילה' },
  { keywords: ['גבינת שמנת', 'פילדלפיה', 'סימפוניה'], category: 'dairy', price: 12.9, protein: false, unit: 'גביע' },
  { keywords: ['מוצרלה', 'גבינת מוצרלה', 'פרמזן', 'פרמז\'ן'], category: 'dairy', price: 17.9, protein: true, unit: 'שקית' },
  { keywords: ['חמאה', 'מחמאה', 'חמאה הולנדית'], category: 'dairy', price: 9.2, protein: false, unit: 'חבילה' },
  { keywords: ['שמנת חמוצה', 'שמנת 15%'], category: 'dairy', price: 4.5, protein: false, unit: 'גביע' },
  { keywords: ['שמנת מתוקה', 'שמנת להקצפה', 'שמנת לבישול'], category: 'dairy', price: 7.9, protein: false, unit: 'קרטונית' },
  { keywords: ['יוגורט', 'דנונה', 'מולר', 'יוגורט תות'], category: 'dairy', price: 5.2, protein: false, unit: 'גביע' },
  { keywords: ['יוגורט יווני', 'יוגורט פרו', 'יוגורט חלבון', 'גו פרו', 'pro'], category: 'dairy', price: 6.9, protein: true, unit: 'גביע' },
  { keywords: ['שוקו', 'שוקו בשקית'], category: 'dairy', price: 4.9, protein: false, unit: 'שקית' },
  { keywords: ['מעדן', 'מילקי', 'קרלו', 'דני'], category: 'dairy', price: 4.2, protein: false, unit: 'גביע' },

  // ================= PROTEIN & MEAT (בשר, עוף, דגים ותחליפים) =================
  { keywords: ['חזה עוף', 'שניצל עוף', 'פילה עוף'], category: 'protein', price: 34.9, protein: true, unit: 'ק"ג' },
  { keywords: ['כרעיים', 'שוקיים', 'עוף שלם', 'פולקע', 'פרגיות'], category: 'protein', price: 29.9, protein: true, unit: 'ק"ג' },
  { keywords: ['בשר טחון', 'בקר טחון', 'טחון'], category: 'protein', price: 42.0, protein: true, unit: 'ק"ג' },
  { keywords: ['בקר', 'אנטריקוט', 'אסאדו', 'סינטה', 'צלי כתף'], category: 'protein', price: 79.0, protein: true, unit: 'ק"ג' },
  { keywords: ['הודו', 'חזה הודו', 'שווארמה הודו'], category: 'protein', price: 36.9, protein: true, unit: 'ק"ג' },
  { keywords: ['דג', 'סלמון', 'פילה סלמון'], category: 'protein', price: 69.0, protein: true, unit: 'ק"ג' },
  { keywords: ['אמנון', 'מושט', 'דניס', 'לברק'], category: 'protein', price: 39.0, protein: true, unit: 'ק"ג' },
  { keywords: ['טונה', 'טונה בשימורים', 'טונה במים', 'טונה בשמן'], category: 'protein', price: 6.9, protein: true, unit: 'קופסה' },
  { keywords: ['סרדינים', 'מקרל'], category: 'protein', price: 7.9, protein: true, unit: 'קופסה' },
  { keywords: ['טופו', 'סייטן'], category: 'protein', price: 11.9, protein: true, unit: 'אריזה' },
  { keywords: ['פסטרמה', 'נקניק', 'סלמי', 'קבנוס'], category: 'protein', price: 16.9, protein: true, unit: 'חבילה' },
  { keywords: ['נקניקיות'], category: 'protein', price: 14.9, protein: true, unit: 'שקית' },
  { keywords: ['אבקת חלבון', 'חלבונים'], category: 'protein', price: 19.9, protein: true, unit: 'אריזה' },

  // ================= PANTRY & DRY (מכולת, מזווה ושימורים) =================
  { keywords: ['אורז', 'אורז בסמטי', 'אורז פרסי', 'אורז יסמין', 'אורז מלא'], category: 'pantry', price: 9.9, protein: false, unit: 'ק"ג' },
  { keywords: ['פסטה', 'ספגטי', 'מקרוני', 'פנה', 'פוזילי', 'פטוצ\'יני'], category: 'pantry', price: 6.9, protein: false, unit: 'חבילה' },
  { keywords: ['פתיתים', 'קוסקוס', 'בורגול'], category: 'pantry', price: 6.5, protein: false, unit: 'שקית' },
  { keywords: ['שמן', 'שמן קנולה', 'שמן חמניות'], category: 'pantry', price: 9.9, protein: false, unit: 'בקבוק' },
  { keywords: ['שמן זית', 'שמן זית כתית'], category: 'pantry', price: 34.9, protein: false, unit: 'בקבוק' },
  { keywords: ['קמח', 'קמח לבן', 'קמח תופח', 'קמח כוסמין', 'קורנפלור'], category: 'pantry', price: 5.9, protein: false, unit: 'ק"ג' },
  { keywords: ['סוכר', 'סוכר חום', 'אבקת סוכר', 'סוכרזית'], category: 'pantry', price: 5.5, protein: false, unit: 'ק"ג' },
  { keywords: ['מלח', 'מלח שולחן', 'מלח גס', 'מלח ים'], category: 'pantry', price: 3.5, protein: false, unit: 'ק"ג' },
  { keywords: ['קפה', 'קפה שחור', 'נס קפה', 'אספרסו', 'קפסולות קפה'], category: 'pantry', price: 24.9, protein: false, unit: 'צנצנת' },
  { keywords: ['תה', 'ויסוצקי', 'תה ירוק', 'תה קמומיל'], category: 'pantry', price: 15.9, protein: false, unit: 'קופסה' },
  { keywords: ['טחינה', 'טחינה גולמית', 'טחינה ירוקה'], category: 'pantry', price: 14.9, protein: true, unit: 'קופסה' },
  { keywords: ['חומוס', 'סלט חומוס', 'סלטים', 'חציל במיונז', 'טחינה מוכנה'], category: 'pantry', price: 11.9, protein: false, unit: 'קופסה' },
  { keywords: ['שיבולת שועל', 'קוואקר', 'גרנולה'], category: 'pantry', price: 11.9, protein: true, unit: 'שקית' },
  { keywords: ['קורנפלקס', 'דגני בוקר', 'ברנפלקס', 'צ\'יריוס'], category: 'pantry', price: 19.9, protein: false, unit: 'קופסה' },
  { keywords: ['רסק עגבניות', 'עגבניות מרוסקות', 'פולפה', 'רוטב עגבניות'], category: 'pantry', price: 4.9, protein: false, unit: 'קופסה' },
  { keywords: ['קטשופ', 'מיונז', 'חרדל'], category: 'pantry', price: 11.9, protein: false, unit: 'בקבוק' },
  { keywords: ['רוטב סויה', 'טריאקי', 'רוטב צ\'ילי מתוק', 'חומץ', 'רוטב שום'], category: 'pantry', price: 12.9, protein: false, unit: 'בקבוק' },
  { keywords: ['תירס', 'תירס בשימורים'], category: 'pantry', price: 5.9, protein: false, unit: 'קופסה' },
  { keywords: ['אפונה', 'אפונה וגזר', 'שעועית אפויה', 'שעועית ברוטב'], category: 'pantry', price: 6.9, protein: true, unit: 'קופסה' },
  { keywords: ['חומוס גרגרים', 'עדשים', 'עדשים כתומות', 'עדשים ירוקות'], category: 'pantry', price: 8.9, protein: true, unit: 'שקית' },
  { keywords: ['זיתים', 'זיתים ירוקים', 'זיתים שחורים', 'זיתי קלמטה'], category: 'pantry', price: 8.9, protein: false, unit: 'קופסה' },
  { keywords: ['מלפפון חמוץ בשימורים', 'חמוצים'], category: 'pantry', price: 7.9, protein: false, unit: 'קופסה' },
  { keywords: ['דבש', 'סילאן', 'מייפל', 'ממרח שוקולד', 'נוטלה', 'השחר'], category: 'pantry', price: 16.9, protein: false, unit: 'צנצנת' },
  { keywords: ['חמאת בוטנים'], category: 'pantry', price: 16.9, protein: true, unit: 'צנצנת' },
  { keywords: ['ריבה', 'קונפיטורה'], category: 'pantry', price: 13.9, protein: false, unit: 'צנצנת' },
  { keywords: ['שוקולד', 'שוקולד מריר', 'שוקולד חלב'], category: 'pantry', price: 7.9, protein: false, unit: 'טבלה' },
  { keywords: ['במבה', 'ביסלי', 'תפוצ\'יפס', 'דוריטוס', 'חטיפים', 'פופקורן'], category: 'pantry', price: 5.5, protein: false, unit: 'שקית' },
  { keywords: ['פיצוחים', 'שקדים', 'אגוזי מלך', 'קשיו', 'בוטנים'], category: 'pantry', price: 16.9, protein: true, unit: 'שקית' },
  { keywords: ['מים', 'שישיית מים', 'סודה', 'מיץ', 'קולה', 'קולה זירו', 'ספרייט'], category: 'pantry', price: 14.9, protein: false, unit: 'מארז' },
  { keywords: ['בירה', 'יין', 'יין אדום', 'יין לבן'], category: 'pantry', price: 35.0, protein: false, unit: 'בקבוק' },

  // ================= FROZEN (קפואים) =================
  { keywords: ['גלידה', 'ארטיק', 'טילון'], category: 'frozen', price: 21.9, protein: false, unit: 'חבילה' },
  { keywords: ['שניצל תירס', 'שניצל קפוא', 'טבעול'], category: 'frozen', price: 29.9, protein: false, unit: 'אריזה' },
  { keywords: ['צ\'יפס קפוא', 'טבעות בצל'], category: 'frozen', price: 17.9, protein: false, unit: 'שקית' },
  { keywords: ['פיצה קפואה', 'פיצה מעדנות'], category: 'frozen', price: 24.9, protein: false, unit: 'יחידה' },
  { keywords: ['בורקס קפוא', 'בצק עלים', 'מלוואח', 'ג\'חנון', 'בצק פילו'], category: 'frozen', price: 18.9, protein: false, unit: 'חבילה' },
  { keywords: ['ירקות קפואים', 'שעועית ירוקה', 'אפונה קפואה', 'סנפרוסט', 'לקט ירקות'], category: 'frozen', price: 15.9, protein: false, unit: 'שקית' },
  { keywords: ['פירות קפואים', 'פירות יער', 'מנגו קפוא'], category: 'frozen', price: 19.9, protein: false, unit: 'שקית' },
  { keywords: ['קרמבו'], category: 'frozen', price: 22.9, protein: false, unit: 'מארז' },

  // ================= HOUSEHOLD & CLEANING (היגיינה וניקיון) =================
  { keywords: ['נייר טואלט'], category: 'household', price: 29.9, protein: false, unit: 'מארז' },
  { keywords: ['מגבות נייר', 'נייר סופג'], category: 'household', price: 16.9, protein: false, unit: 'מארז' },
  { keywords: ['מגבונים', 'מגבונים לחים'], category: 'household', price: 9.9, protein: false, unit: 'מארז' },
  { keywords: ['שקיות אשפה', 'שקיות זבל'], category: 'household', price: 14.9, protein: false, unit: 'גליל' },
  { keywords: ['סבון כלים', 'פיירי'], category: 'household', price: 11.9, protein: false, unit: 'בקבוק' },
  { keywords: ['טבליות למדיח', 'נוזל הברקה למדיח'], category: 'household', price: 34.9, protein: false, unit: 'אריזה' },
  { keywords: ['אבקת כביסה', 'ג\'ל כביסה', 'קפסולות כביסה'], category: 'household', price: 36.9, protein: false, unit: 'אריזה' },
  { keywords: ['מרכך כביסה'], category: 'household', price: 16.9, protein: false, unit: 'בקבוק' },
  { keywords: ['נוזל רצפות', 'תרסיס לניקוי חלונות', 'אקונומיקה'], category: 'household', price: 14.9, protein: false, unit: 'בקבוק' },
  { keywords: ['ספוג כלים', 'סקוץ\'', 'כריות ניקוי', 'מטליות', 'סמרטוט'], category: 'household', price: 8.9, protein: false, unit: 'חבילה' },
  { keywords: ['נייר כסף', 'נייר אפייה', 'שקיות אוכל', 'ניילון נצמד'], category: 'household', price: 11.9, protein: false, unit: 'גליל' },
  { keywords: ['שמפו', 'מרכך שיער', 'תחליב רחצה', 'סבון גוף'], category: 'household', price: 14.9, protein: false, unit: 'בקבוק' },
  { keywords: ['משחת שיניים', 'מברשת שיניים'], category: 'household', price: 12.9, protein: false, unit: 'יחידה' },
  { keywords: ['דאודורנט'], category: 'household', price: 15.9, protein: false, unit: 'יחידה' },
  { keywords: ['אלכוג\'ל', 'פלסטרים'], category: 'household', price: 9.9, protein: false, unit: 'יחידה' },
]

const DEFAULT_PRICE_BY_CATEGORY: Record<Category, number> = {
  produce: 8,
  bakery: 12,
  dairy: 10,
  protein: 30,
  pantry: 12,
  frozen: 20,
  household: 18,
  other: 15,
}

const DEFAULT_UNIT_BY_CATEGORY: Record<Category, string> = {
  produce: 'ק"ג',
  bakery: 'יחידה',
  dairy: 'יחידה',
  protein: 'יחידה',
  pantry: 'יחידה',
  frozen: 'יחידה',
  household: 'יחידה',
  other: 'יחידה',
}

/**
 * Fast lookup of grocery item profiles by keyword matching.
 */
export function lookupItem(rawName: string): {
  category: Category
  price: number
  protein: boolean
  unit: string
} {
  const query = rawName.trim().toLowerCase()

  for (const item of KNOWN_ITEMS) {
    for (const kw of item.keywords) {
      if (query.includes(kw) || kw.includes(query)) {
        return {
          category: item.category,
          price: item.price,
          protein: item.protein,
          unit: item.unit,
        }
      }
    }
  }

  // Fallback defaults
  return {
    category: 'other',
    price: DEFAULT_PRICE_BY_CATEGORY.other,
    protein: false,
    unit: DEFAULT_UNIT_BY_CATEGORY.other,
  }
}

/**
 * Supermarket Aisle Walk Order.
 * When in Supermarket Focus Mode, items are sorted by this natural path:
 * Produce first -> Bakery -> Dry/Pantry -> Household -> Dairy -> Meat -> Frozen last (so they don't melt!)
 */
export const SUPERMARKET_AISLE_ORDER: Category[] = [
  'produce',
  'bakery',
  'pantry',
  'household',
  'dairy',
  'protein',
  'frozen',
  'other',
]
