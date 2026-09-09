import { useState } from 'react'
import { Plus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type { ParsedItem } from '../utils/aiParse'
import { lookupItem } from '../data/itemKnowledge'
import { triggerHaptic } from '../utils/haptics'

const QUICK_STAPLES = [
  { name: 'חלב', icon: '🥛', qty: 1 },
  { name: 'ביצים', icon: '🥚', qty: 1 },
  { name: 'לחם פרוס', icon: '🍞', qty: 1 },
  { name: 'קוטג', icon: '🧀', qty: 1 },
  { name: 'עגבניות', icon: '🍅', qty: 1 },
  { name: 'מלפפונים', icon: '🥒', qty: 1 },
  { name: 'בצל', icon: '🧅', qty: 1 },
  { name: 'טונה', icon: '🐟', qty: 2 },
  { name: 'קפה', icon: '☕', qty: 1 },
  { name: 'שמן זית', icon: '🫒', qty: 1 },
  { name: 'חזה עוף', icon: '🍗', qty: 1 },
  { name: 'נייר טואלט', icon: '🧻', qty: 1 },
]

interface QuickPicksBarProps {
  onAdd: (items: ParsedItem[]) => void
}

export function QuickPicksBar({ onAdd }: QuickPicksBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleQuickAdd(name: string, quantity: number) {
    triggerHaptic(20)
    const profile = lookupItem(name)
    const item: ParsedItem = {
      name,
      quantity,
      unit: profile.unit,
      category: profile.category,
      isHighProtein: profile.protein,
      estimatedPrice: profile.price * quantity,
    }
    onAdd([item])
  }

  return (
    <div className="animate-float-in rounded-2xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-md">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
      >
        <span className="flex items-center gap-1.5 text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" />
          מוצרים קבועים — הוספה מהירה בלחיצה אחת
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-wrap gap-2 pt-1 animate-float-in">
          {QUICK_STAPLES.map((staple) => (
            <button
              key={staple.name}
              onClick={() => handleQuickAdd(staple.name, staple.qty)}
              className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200 active:scale-95"
            >
              <span>{staple.icon}</span>
              <span className="font-medium">{staple.name}</span>
              <Plus className="h-3 w-3 text-slate-400 group-hover:text-cyan-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
