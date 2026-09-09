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
    <div className="animate-float-in space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <label className="col-span-2 flex flex-col gap-1 sm:col-span-2">
          <span className="text-[11px] text-slate-400">שם הפריט</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="לדוגמה: אבוקדו"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">כמות</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">יחידה</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">קטגוריה</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c} className="bg-[#0e0e18]">
                {CATEGORIES[c].icon} {CATEGORIES[c].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">מחיר משוער (₪ ליחידה)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-1.5">
          <input
            type="checkbox"
            checked={isHighProtein}
            onChange={(e) => setIsHighProtein(e.target.checked)}
            className="h-4 w-4 rounded accent-fuchsia-500"
          />
          <span className="text-xs text-slate-300">💪 חלבון גבוה</span>
        </label>
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="rounded-xl bg-gradient-to-l from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-black shadow-[0_0_16px_-4px_rgba(34,211,238,0.9)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        הוסף לרשימה
      </button>
    </div>
  )
}
