import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { SUPERMARKET_AISLE_ORDER } from '../data/itemKnowledge'
import type { Category, GroceryItem, Member } from '../types'
import { formatCurrency } from '../utils/format'
import { soundManager, triggerHaptic } from '../utils/haptics'

const AISLE_NAMES: Record<Category, string> = {
  produce: 'מעבר 1: פירות וירקות 🥦',
  bakery: 'מעבר 2: מאפייה ולחמים 🍞',
  pantry: 'מעבר 3: מכולת ושימורים 🥫',
  household: 'מעבר 4: ניקיון והיגיינה 🧼',
  dairy: 'מעבר 5: מקרר ומוצרי חלב 🧀',
  protein: 'מעבר 6: קצבייה, עוף ודגים 🥩',
  frozen: 'מעבר 7: קפואים (בסוף כדי שלא יימסו!) 🍦',
  other: 'מעבר 8: שונות ומוצרים נוספים 📦',
}

interface SupermarketModeProps {
  items: GroceryItem[]
  members: Member[]
  currentMemberId?: string
  onToggleBought: (id: string) => void
  onExit: () => void
}

export function SupermarketMode({
  items,
  members,
  currentMemberId: _currentMemberId,
  onToggleBought,
  onExit,
}: SupermarketModeProps) {
  const [hideCompleted, setHideCompleted] = useState(false)
  const [soundOn, setSoundOn] = useState(() => soundManager.isEnabled())
  const [celebrated, setCelebrated] = useState(false)

  const pendingItems = useMemo(() => items.filter((i) => !i.boughtBy), [items])
  const boughtItems = useMemo(() => items.filter((i) => Boolean(i.boughtBy)), [items])
  const progressPercent = items.length ? Math.round((boughtItems.length / items.length) * 100) : 0

  useEffect(() => {
    if (items.length > 0 && pendingItems.length === 0 && !celebrated) {
      setCelebrated(true)
      soundManager.playComplete()
      triggerHaptic([50, 100, 50, 100])
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      })
    } else if (pendingItems.length > 0) {
      setCelebrated(false)
    }
  }, [items.length, pendingItems.length, celebrated])

  function handleItemClick(itemId: string) {
    soundManager.playCheck()
    triggerHaptic(30)
    onToggleBought(itemId)
  }

  function toggleSound() {
    const next = soundManager.toggleSound()
    setSoundOn(next)
    triggerHaptic(15)
  }

  const aisleGroups = useMemo(() => {
    const displayList = hideCompleted ? pendingItems : items
    return SUPERMARKET_AISLE_ORDER.map((cat) => {
      const catItems = displayList.filter((item) => item.category === cat)
      return {
        category: cat,
        name: AISLE_NAMES[cat] || cat,
        items: catItems,
      }
    }).filter((group) => group.items.length > 0)
  }, [items, pendingItems, hideCompleted])

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col bg-[#f7f9f6] text-slate-800 overflow-hidden"
    >
      {/* Top Supermarket Focus Header */}
      <header className="relative shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExit}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לסל
            </button>
            <div>
              <h1 className="flex items-center gap-1.5 text-base font-black text-slate-900">
                <span>🛒</span> מצב סופרמרקט
              </h1>
              <p className="text-[11px] font-bold text-emerald-700">
                מסודר לפי סדר המעברים בסופר
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              aria-label={soundOn ? 'השתק צלילים' : 'הפעל צלילים'}
              title={soundOn ? 'צלילים פעילים' : 'צלילים מושתקים'}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:text-slate-900 transition"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            <button
              onClick={() => setHideCompleted((prev) => !prev)}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                hideCompleted
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {hideCompleted ? 'רק מה שנשאר' : 'הכל'}
            </button>
          </div>
        </div>

        {/* Progress bar in Supermarket Header */}
        <div className="mx-auto mt-3 max-w-2xl">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-700">
              {boughtItems.length} מתוך {items.length} בעגלה
            </span>
            <span className="text-emerald-700">{progressPercent}% הושלם</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 shadow-[0_2px_6px_rgba(16,185,129,0.3)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Aisle List */}
      <main className="relative flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl">🧺</span>
              <p className="mt-3 text-sm font-bold text-slate-600">הסל ריק! הוסיפו פריטים לפני הקנייה.</p>
              <button
                onClick={onExit}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                חזרה להוספת פריטים
              </button>
            </div>
          ) : celebrated ? (
            <div className="animate-float-in flex flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                🎉
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-900">איזה אלופים! כל המוצרים בעגלה!</h2>
              <p className="mt-1 text-xs text-slate-600">
                סיימתם את כל רשימת הקניות של המשפחה. אפשר לגשת לקופה בנחת!
              </p>
              <button
                onClick={onExit}
                className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-[0_2px_10px_rgba(5,150,105,0.3)] transition hover:bg-emerald-700 active:scale-95"
              >
                סגור מצב סופרמרקט
              </button>
            </div>
          ) : null}

          {aisleGroups.map((group) => {
            const meta = CATEGORIES[group.category]
            const pendingInGroup = group.items.filter((i) => !i.boughtBy).length

            return (
              <section key={group.category} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-xs font-black tracking-wide text-slate-800">
                    <span className="text-base">{meta.icon}</span>
                    <span>{group.name}</span>
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">
                    נותרו {pendingInGroup}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isBought = Boolean(item.boughtBy)
                    const assigned = members.find((m) => m.id === item.assignedTo)

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item.id)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all select-none active:scale-[0.98] ${
                          isBought
                            ? 'border-slate-200/60 bg-slate-50/70 text-slate-400'
                            : 'border-slate-200 bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Large touch checkbox */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                              isBought
                                ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_2px_6px_rgba(16,185,129,0.3)]'
                                : 'border-slate-300 bg-slate-50 text-transparent'
                            }`}
                          >
                            <Check className="h-5 w-5 stroke-[3]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-bold ${
                                  isBought ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                {item.quantity} {item.unit}
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                              {item.isHighProtein && (
                                <span className="font-bold text-rose-700">💪 חלבון</span>
                              )}
                              {assigned && (
                                <span>משויך ל{assigned.name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-start">
                          <span
                            className={`text-sm font-black ${
                              isBought ? 'text-slate-400' : 'text-emerald-700'
                            }`}
                          >
                            {formatCurrency(item.actualPrice ?? item.estimatedPrice)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
