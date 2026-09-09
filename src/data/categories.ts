import type { Category, CategoryMeta } from '../types'

export const CATEGORIES: Record<Category, CategoryMeta> = {
  produce: { id: 'produce', label: 'ירקות ופירות', icon: '🥦', glow: 'text-emerald-800 bg-emerald-50 border-emerald-200/80' },
  bakery: { id: 'bakery', label: 'מאפים ולחמים', icon: '🍞', glow: 'text-amber-800 bg-amber-50 border-amber-200/80' },
  dairy: { id: 'dairy', label: 'מוצרי חלב', icon: '🥛', glow: 'text-sky-800 bg-sky-50 border-sky-200/80' },
  protein: { id: 'protein', label: 'בשר, עוף ודגים', icon: '🥩', glow: 'text-rose-800 bg-rose-50 border-rose-200/80' },
  pantry: { id: 'pantry', label: 'מזווה ומכולת', icon: '🥫', glow: 'text-orange-800 bg-orange-50 border-orange-200/80' },
  frozen: { id: 'frozen', label: 'קפואים', icon: '🧊', glow: 'text-cyan-800 bg-cyan-50 border-cyan-200/80' },
  household: { id: 'household', label: 'ניקיון ובית', icon: '🧴', glow: 'text-purple-800 bg-purple-50 border-purple-200/80' },
  other: { id: 'other', label: 'שונות', icon: '🛒', glow: 'text-slate-800 bg-slate-100 border-slate-200/80' },
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
