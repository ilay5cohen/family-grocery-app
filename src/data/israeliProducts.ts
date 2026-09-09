import type { Category } from '../types'
import { DAIRY_CATALOG } from './catalog/dairyCatalog'
import { BAKERY_CATALOG } from './catalog/bakeryCatalog'
import { PRODUCE_CATALOG } from './catalog/produceCatalog'
import { MEAT_FISH_CATALOG } from './catalog/meatFishCatalog'
import { PANTRY_CATALOG } from './catalog/pantryCatalog'
import { SNACKS_CATALOG } from './catalog/snacksCatalog'
import { BEVERAGES_CATALOG } from './catalog/beveragesCatalog'
import { BREAKFAST_CATALOG } from './catalog/breakfastCatalog'
import { CLEANING_CATALOG } from './catalog/cleaningCatalog'
import { TOILETRIES_CATALOG } from './catalog/toiletriesCatalog'

export interface IsraeliBrand {
  id: string
  name: string
  logoText: string
  color: string
  bgLight: string
  borderLight: string
}

export interface CatalogProduct {
  id: string
  familyId: string
  name: string
  brand: string
  brandId: string
  size: string
  category: Category
  price: number
  unit: string
  emoji: string
  imageUrl?: string
  protein?: boolean
  badge?: string
  isPopular?: boolean
  keywords: string[]
}

export const ISRAELI_BRANDS: IsraeliBrand[] = [
  { id: 'all', name: 'כל המותגים', logoText: 'הכל', color: '#10b981', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200' },
  { id: 'tnuva', name: 'תנובה', logoText: 'תנובה', color: '#0284c7', bgLight: 'bg-sky-50', borderLight: 'border-sky-200' },
  { id: 'strauss', name: 'שטראוס', logoText: 'שטראוס', color: '#dc2626', bgLight: 'bg-red-50', borderLight: 'border-red-200' },
  { id: 'osem', name: 'אסם', logoText: 'אסם', color: '#ea580c', bgLight: 'bg-orange-50', borderLight: 'border-orange-200' },
  { id: 'elite', name: 'עלית', logoText: 'עלית', color: '#b91c1c', bgLight: 'bg-rose-50', borderLight: 'border-rose-200' },
  { id: 'tara', name: 'טרה', logoText: 'טרה', color: '#0d9488', bgLight: 'bg-teal-50', borderLight: 'border-teal-200' },
  { id: 'gad', name: 'מחלבות גד', logoText: 'גד', color: '#4338ca', bgLight: 'bg-indigo-50', borderLight: 'border-indigo-200' },
  { id: 'yotvata', name: 'יוטבתה', logoText: 'יוטבתה', color: '#059669', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200' },
  { id: 'telma', name: 'תלמה', logoText: 'תלמה', color: '#d97706', bgLight: 'bg-amber-50', borderLight: 'border-amber-200' },
  { id: 'sugat', name: 'סוגת', logoText: 'סוגת', color: '#7c3aed', bgLight: 'bg-purple-50', borderLight: 'border-purple-200' },
  { id: 'sano', name: 'סנו', logoText: 'סנו', color: '#2563eb', bgLight: 'bg-blue-50', borderLight: 'border-blue-200' },
  { id: 'fresh', name: 'טריים וקצביה', logoText: 'טרי', color: '#16a34a', bgLight: 'bg-green-50', borderLight: 'border-green-200' },
  { id: 'pantry-brand', name: 'מזווה ומכולת', logoText: 'מזווה', color: '#d97706', bgLight: 'bg-amber-50', borderLight: 'border-amber-200' },
  { id: 'beverage-brand', name: 'משקאות וקפה', logoText: 'משקאות', color: '#0284c7', bgLight: 'bg-cyan-50', borderLight: 'border-cyan-200' },
  { id: 'household-brand', name: 'בית וטיפוח', logoText: 'ניקיון', color: '#8b5cf6', bgLight: 'bg-violet-50', borderLight: 'border-violet-200' },
]

/**
 * The complete, comprehensive Israeli Supermarket Catalog
 * Aggregating all verified departments with authentic sizes, variants, and NIS prices.
 */
export const ISRAELI_CATALOG: CatalogProduct[] = [
  ...DAIRY_CATALOG,
  ...BAKERY_CATALOG,
  ...PRODUCE_CATALOG,
  ...MEAT_FISH_CATALOG,
  ...PANTRY_CATALOG,
  ...SNACKS_CATALOG,
  ...BEVERAGES_CATALOG,
  ...BREAKFAST_CATALOG,
  ...CLEANING_CATALOG,
  ...TOILETRIES_CATALOG,
]

/**
 * Returns all variants that belong to the same product family (e.g. all milk, cottage, chicken or tuna variants)
 */
export function getProductVariants(familyId: string): CatalogProduct[] {
  return ISRAELI_CATALOG.filter((p) => p.familyId === familyId)
}

/**
 * Finds a product or product family based on free text search
 */
export function findMatchingProducts(query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ISRAELI_CATALOG.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q))
    )
  })
}
