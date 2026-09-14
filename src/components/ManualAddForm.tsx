import { useState } from 'react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import { lookupItem } from '../data/itemKnowledge'
import type { Category } from '../types'

export interface ManualItemInput {
  name: string
  quantity: number
  unit: string
  category: Category
  isHighProtein: boolean
  estimatedPrice: number
}

export function ManualAddForm({ onAdd }: { onAdd: (item: ManualItemInput) => void }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('יחידה')
  const [category, setCategory] = useState<Category>('other')
  const [isHighProtein, setIsHighProtein] = useState(false)
  const [price, setPrice] = useState(10)

  function handleNameBlur() {
    if (!name.trim()) return
    const profile = lookupItem(name)
    setUnit(profile.unit)
    setCategory(profile.category)
    setIsHighProtein(profile.protein)
    setPrice(profile.price)
  }

  function submit() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), quantity, unit, category, isHighProtein, estimatedPrice: Math.round(price * quantity * 100) / 100 })
    setName('')
    setQuantity(1)
    setUnit('יחידה')
    setCategory('other')
    setIsHighProtein(false)
    setPrice(10)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-apple-subtle">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <label className="col-span-2 flex flex-col gap-1 sm:col-span-2">
          <span className="text-[11px] font-medium text-stone-500">שם הפריט</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="לדוגמה: שמן זית"
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-stone-500">כמות</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-stone-500">יחידה</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-stone-500">קטגוריה</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-stone-500">מחיר משוער (₪ ליחידה)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={isHighProtein}
            onChange={(e) => setIsHighProtein(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-stone-900"
          />
          <span className="text-xs text-stone-600">עשיר בחלבון</span>
        </label>
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-apple-subtle transition hover:bg-stone-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        הוספה לסל
      </button>
    </div>
  )
}
