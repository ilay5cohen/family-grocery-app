import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import type { Category } from '../types'
import { triggerHaptic } from '../utils/haptics'

export type StatusFilter = 'all' | 'pending' | 'bought' | 'mine'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'pending', label: 'לביצוע' },
  { id: 'bought', label: 'נקנה' },
  { id: 'mine', label: 'שלי' },
]

export function FilterBar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  onOpenPriceComparison,
  onOpenProductLibrary,
}: {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  category: Category | 'all'
  onCategoryChange: (c: Category | 'all') => void
  onOpenPriceComparison?: () => void
  onOpenProductLibrary?: () => void
}) {
  return (
    <div className="sticky top-[57px] z-20 bg-[#faf9f6]/90 backdrop-blur-xl py-2 -mx-3 px-3 sm:-mx-6 sm:px-6 space-y-2 transition-all">
      {/* Top Row: Status Tabs + Quick Action Tools */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(15)
                onStatusChange(tab.id)
              }}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all select-none active:scale-95 ${
                status === tab.id
                  ? 'bg-stone-900 text-white shadow-apple-subtle'
                  : 'border border-black/[0.04] bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Tool Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenPriceComparison && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15)
                onOpenPriceComparison()
              }}
              title="השוואת מחירי רשתות סופרמרקטים בישראל"
              className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition active:scale-95 shadow-2xs"
            >
              <span className="hidden sm:inline">השוואת מחירים</span>
              <span className="sm:hidden">השוואה</span>
            </button>
          )}

          {onOpenProductLibrary && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15)
                onOpenProductLibrary()
              }}
              title="ספריית קטלוג מוצרים ישראליים"
              className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition active:scale-95 shadow-2xs"
            >
              <span className="hidden sm:inline">קטלוג מוצרים</span>
              <span className="sm:hidden">קטלוג</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle Separator */}
      <div className="h-px bg-stone-200/50 my-0.5" />

      {/* Categories Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            triggerHaptic(15)
            onCategoryChange('all')
          }}
          className={`shrink-0 rounded-xl border px-3 py-1 text-[11px] font-medium transition-all select-none active:scale-95 ${
            category === 'all'
              ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
              : 'border-stone-200/80 bg-white text-stone-600 hover:text-stone-900'
          }`}
        >
          הכל
        </button>

        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORIES[c]
          const isSelected = category === c

          return (
            <button
              key={c}
              onClick={() => {
                triggerHaptic(15)
                onCategoryChange(isSelected ? 'all' : c)
              }}
              className={`shrink-0 flex items-center rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-all select-none active:scale-95 ${
                isSelected
                  ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                  : 'border-stone-200/80 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              <span>{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
