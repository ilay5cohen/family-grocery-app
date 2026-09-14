import { useState } from 'react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import { lookupItem } from '../data/itemKnowledge'
import type { Category } from '../types'
import { triggerHaptic } from '../utils/haptics'

export interface ManualItemInput {
  name: string
  quantity: number
  unit: string
  category: Category
  isHighProtein: boolean
  estimatedPrice: number
}

export function ManualAddForm({
  onAdd,
  onCancel,
}: {
  onAdd: (item: ManualItemInput) => void
  onCancel?: () => void
}) {
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
    triggerHaptic(25)
    onAdd({
      name: name.trim(),
      quantity,
      unit,
      category,
      isHighProtein,
      estimatedPrice: Math.round(price * quantity * 100) / 100,
    })
    setName('')
    setQuantity(1)
    setUnit('יחידה')
    setCategory('other')
    setIsHighProtein(false)
    setPrice(10)
  }

  return (
    <div className="space-y-4 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-apple">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 flex flex-col gap-1 sm:col-span-2">
          <span className="text-[11px] font-semibold text-stone-600">שם הפריט</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="לדוגמה: שמן זית"
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-stone-600">כמות</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-stone-600">יחידה</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-stone-600">קטגוריה</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-stone-600">מחיר משוער (₪)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHighProtein}
            onChange={(e) => setIsHighProtein(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-[#4f46e5]"
          />
          <span className="text-xs font-semibold text-stone-700">עשיר בחלבון 💪</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition active:scale-95"
          >
            ביטול
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="rounded-xl bg-[#4f46e5] px-5 py-2 text-xs font-bold text-white shadow-indigo-depth transition hover:bg-[#4338ca] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          הוספה לסל
        </button>
      </div>
    </div>
  )
}
