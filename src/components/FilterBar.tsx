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
}: {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  category: Category | 'all'
  onCategoryChange: (c: Category | 'all') => void
}) {
  return (
    <div className="animate-float-in space-y-2">
      {/* Status tabs - Centered on Mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 justify-center">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic(15)
              onStatusChange(tab.id)
            }}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition select-none ${
              status === tab.id
                ? 'bg-emerald-600 text-white shadow-[0_2px_6px_rgba(5,150,105,0.25)]'
                : 'border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            triggerHaptic(15)
            onCategoryChange('all')
          }}
          className={`shrink-0 rounded-xl border px-3 py-1 text-[11px] font-bold transition select-none ${
            category === 'all'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-slate-200/90 bg-white text-slate-500 hover:text-slate-800'
          }`}
        >
          כל הקטגוריות
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
              className={`shrink-0 flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold transition select-none ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                  : `${meta.glow} hover:brightness-95`
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
