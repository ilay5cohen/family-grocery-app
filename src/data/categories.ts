import type { Category, CategoryMeta } from '../types'

export const CATEGORIES: Record<Category, CategoryMeta> = {
  produce: { id: 'produce', label: 'ירקות ופירות', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  bakery: { id: 'bakery', label: 'מאפים ולחמים', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  dairy: { id: 'dairy', label: 'מוצרי חלב', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  protein: { id: 'protein', label: 'בשר ודגים', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  pantry: { id: 'pantry', label: 'מזווה ומכולת', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  frozen: { id: 'frozen', label: 'קפואים', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  household: { id: 'household', label: 'ניקיון ובית', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
  other: { id: 'other', label: 'שונות', icon: '', glow: 'text-stone-700 bg-stone-100/80 border-stone-200/60' },
}

export const CATEGORY_ORDER: Category[] = [
  'produce',
  'bakery',
  'pantry',
  'dairy',
  'protein',
  'frozen',
  'household',
  'other',
]
