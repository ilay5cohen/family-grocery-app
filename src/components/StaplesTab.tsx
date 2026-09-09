import { useState } from 'react'
import { Plus, Check, Sparkles } from 'lucide-react'
import type { ParsedItem } from '../utils/aiParse'
import { lookupItem } from '../data/itemKnowledge'
import { soundManager, triggerHaptic } from '../utils/haptics'
import { formatCurrency } from '../utils/format'
import type { GroceryItem } from '../types'

interface StapleItemDefinition {
  name: string
  icon: string
  category: string
  quantity: number
}

const STAPLE_CATALOG: { categoryName: string; icon: string; items: StapleItemDefinition[] }[] = [
  {
    categoryName: 'מוצרי יסוד וחובה בבית',
    icon: '✨',
    items: [
      { name: 'חלב', icon: '🥛', category: 'dairy', quantity: 1 },
      { name: 'ביצים', icon: '🥚', category: 'protein', quantity: 1 },
      { name: 'לחם פרוס', icon: '🍞', category: 'bakery', quantity: 1 },
      { name: 'שמן זית', icon: '🫒', category: 'pantry', quantity: 1 },
      { name: 'קפה שחור', icon: '☕', category: 'pantry', quantity: 1 },
      { name: 'סוכר', icon: '🧂', category: 'pantry', quantity: 1 },
    ],
  },
  {
    categoryName: 'ירקות ופירות קבועים',
    icon: '🥦',
    items: [
      { name: 'עגבניות', icon: '🍅', category: 'produce', quantity: 1 },
      { name: 'מלפפונים', icon: '🥒', category: 'produce', quantity: 1 },
      { name: 'בצל', icon: '🧅', category: 'produce', quantity: 1 },
      { name: 'תפוחי אדמה', icon: '🥔', category: 'produce', quantity: 1 },
      { name: 'לימון', icon: '🍋', category: 'produce', quantity: 1 },
      { name: 'בננות', icon: '🍌', category: 'produce', quantity: 1 },
    ],
  },
  {
    categoryName: 'מקרר, חלב וגבינות',
    icon: '🧀',
    items: [
      { name: 'קוטג', icon: '🧀', category: 'dairy', quantity: 1 },
      { name: 'גבינה צהובה', icon: '🧀', category: 'dairy', quantity: 1 },
      { name: 'גבינה לבנה', icon: '🥣', category: 'dairy', quantity: 1 },
      { name: 'יוגורט יווני', icon: '🥛', category: 'dairy', quantity: 2 },
      { name: 'חמאה', icon: '🧈', category: 'dairy', quantity: 1 },
      { name: 'שמנת מתוקה', icon: '🍶', category: 'dairy', quantity: 1 },
    ],
  },
  {
    categoryName: 'חלבון, בשר ודגים',
    icon: '🥩',
    items: [
      { name: 'חזה עוף', icon: '🍗', category: 'protein', quantity: 1 },
      { name: 'בשר טחון', icon: '🥩', category: 'protein', quantity: 1 },
      { name: 'טונה', icon: '🐟', category: 'protein', quantity: 2 },
      { name: 'סלמון', icon: '🍣', category: 'protein', quantity: 1 },
      { name: 'טופו', icon: '🧊', category: 'protein', quantity: 1 },
    ],
  },
  {
    categoryName: 'בית, היגיינה וניקיון',
    icon: '🧴',
    items: [
      { name: 'נייר טואלט', icon: '🧻', category: 'household', quantity: 1 },
      { name: 'מגבות נייר', icon: '🧻', category: 'household', quantity: 1 },
      { name: 'סבון כלים', icon: '🧼', category: 'household', quantity: 1 },
      { name: 'שקיות אשפה', icon: '🗑️', category: 'household', quantity: 1 },
      { name: 'משחת שיניים', icon: '🪥', category: 'household', quantity: 1 },
    ],
  },
]

interface StaplesTabProps {
  currentItems: GroceryItem[]
  onAdd: (items: ParsedItem[]) => void
}

export function StaplesTab({ currentItems, onAdd }: StaplesTabProps) {
  const [justAddedName, setJustAddedName] = useState<string | null>(null)

  function handleAddStaple(staple: StapleItemDefinition) {
    soundManager.playCheck()
    triggerHaptic(25)
    setJustAddedName(staple.name)
    setTimeout(() => setJustAddedName(null), 1200)

    const profile = lookupItem(staple.name)
    const item: ParsedItem = {
      name: staple.name,
      quantity: staple.quantity,
      unit: profile.unit,
      category: profile.category,
      isHighProtein: profile.protein,
      estimatedPrice: profile.price * staple.quantity,
      isStaple: true,
    }
    onAdd([item])
  }

  return (
    <div className="animate-float-in space-y-6">
      {/* Header explanation */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-l from-emerald-500/10 to-teal-500/5 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">מוצרים קבועים לסל</h2>
            <p className="text-xs text-slate-600">
              לחיצה אחת על כל מוצר מוסיפה אותו מיד לרשימת הקניות של המשפחה.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Categories */}
      {STAPLE_CATALOG.map((cat) => (
        <section key={cat.categoryName} className="space-y-3">
          <h3 className="flex items-center gap-1.5 px-1 text-xs font-black text-slate-700">
            <span>{cat.icon}</span>
            <span>{cat.categoryName}</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {cat.items.map((staple) => {
              const profile = lookupItem(staple.name)
              const inCart = currentItems.filter((i) => i.name.includes(staple.name) && !i.boughtBy).length
              const isRecentlyAdded = justAddedName === staple.name

              return (
                <button
                  key={staple.name}
                  onClick={() => handleAddStaple(staple)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-start transition-all select-none active:scale-95 ${
                    isRecentlyAdded
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{staple.icon}</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isRecentlyAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}
                    >
                      {isRecentlyAdded ? <Check className="h-4 w-4 stroke-[3]" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{staple.name}</span>
                      {inCart > 0 && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          {inCart} בסל
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{staple.quantity} {profile.unit}</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(profile.price * staple.quantity)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
