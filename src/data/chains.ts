import type { Category } from '../types'

export interface SupermarketChain {
  id: string
  name: string
  shortName: string
  logoText: string
  brandColor: string
  bgLight: string
  borderLight: string
  tagline: string
  badge?: string
  baseMultiplier: number
  categoryMultipliers: Record<Category, number>
  strengths: string[]
}

export const SUPERMARKET_CHAINS: SupermarketChain[] = [
  {
    id: 'rami-levy',
    name: 'רמי לוי שיווק השקמה',
    shortName: 'רמי לוי',
    logoText: 'רמי לוי',
    brandColor: '#dc2626', // red
    bgLight: 'bg-red-50',
    borderLight: 'border-red-200',
    tagline: 'סל הקניות הזול והמשתלם בישראל',
    badge: 'מוביל במחיר',
    baseMultiplier: 0.90,
    categoryMultipliers: {
      protein: 0.88, // בשר, עוף ודגים במחירי מבצע חזקים
      dairy: 0.92,
      produce: 0.90,
      bakery: 0.94,
      pantry: 0.89,
      frozen: 0.91,
      household: 0.88, // חומרי ניקוי וטואלטיקה זולים
      other: 0.92,
    },
    strengths: ['בשר ועוף', 'חומרי ניקוי', 'מוצרי מזווה בסיסיים'],
  },
  {
    id: 'yohananof',
    name: 'יוחננוף — סופרשוק למשפחה',
    shortName: 'יוחננוף',
    logoText: 'יוחננוף',
    brandColor: '#ea580c', // orange
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    tagline: 'שוק פירות וירקות ענק ומחירים תחרותיים',
    badge: 'הכי זול בירקות',
    baseMultiplier: 0.92,
    categoryMultipliers: {
      protein: 0.91,
      dairy: 0.93,
      produce: 0.85, // שוק פירות וירקות הזול בארץ
      bakery: 0.92,
      pantry: 0.93,
      frozen: 0.92,
      household: 0.94,
      other: 0.93,
    },
    strengths: ['פירות וירקות טריים', 'מחלקת מאפים', 'מבצעי כמויות'],
  },
  {
    id: 'carrefour',
    name: 'קרפור (Carrefour Hyper)',
    shortName: 'קרפור',
    logoText: 'Carrefour',
    brandColor: '#2563eb', // blue
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    tagline: 'איכות אירופאית ומותג פרטי במחירים נוחים',
    badge: 'מותג פרטי מנצח',
    baseMultiplier: 0.96,
    categoryMultipliers: {
      protein: 0.97,
      dairy: 0.95,
      produce: 0.96,
      bakery: 0.95,
      pantry: 0.90, // פסטות, שימורים ושוקולדים של קרפור
      frozen: 0.94,
      household: 0.96,
      other: 0.95,
    },
    strengths: ['מוצרי מזווה אירופאיים', 'שוקולדים וממתקים', 'מותג פרטי Carrefour'],
  },
  {
    id: 'shufersal-deal',
    name: 'שופרסל דיל',
    shortName: 'שופרסל',
    logoText: 'שופרסל',
    brandColor: '#059669', // emerald / green
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    tagline: 'מגוון ענק, פריסה ארצית ומועדון לקוחות SUPREME',
    badge: 'מגוון וזמינות',
    baseMultiplier: 1.04,
    categoryMultipliers: {
      protein: 1.03,
      dairy: 1.02,
      produce: 1.06,
      bakery: 1.01, // מאפייה עשירה ומותג פרטי
      pantry: 1.04,
      frozen: 1.03,
      household: 1.07,
      other: 1.04,
    },
    strengths: ['מגוון עצום', 'מותג פרטי שופרסל', 'זמינות סניפים בכל מקום'],
  },
  {
    id: 'victory',
    name: 'ויקטורי רשת סופרמרקטים',
    shortName: 'ויקטורי',
    logoText: 'ויקטורי',
    brandColor: '#7c3aed', // purple
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    tagline: 'מבצעי סופ״ש חזקים ושירות שכונתי מהיר',
    badge: 'מבצעי סופ״ש',
    baseMultiplier: 0.98,
    categoryMultipliers: {
      protein: 0.96,
      dairy: 0.97,
      produce: 0.95,
      bakery: 0.98,
      pantry: 0.99,
      frozen: 0.97,
      household: 1.02,
      other: 0.98,
    },
    strengths: ['קרבה לבית', 'מבצעי 1+1', 'מחלקת דגים וגבינות'],
  },
]
