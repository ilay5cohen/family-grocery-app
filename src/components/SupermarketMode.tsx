import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  Filter,
  ShoppingBag,
} from 'lucide-react'
import { SUPERMARKET_AISLE_ORDER } from '../data/itemKnowledge'
import type { Category, GroceryItem, Member } from '../types'
import { formatCurrency } from '../utils/format'
import { soundManager, triggerHaptic } from '../utils/haptics'

const AISLE_NAMES: Record<Category, string> = {
  produce: 'מעבר 1: פירות וירקות',
  bakery: 'מעבר 2: מאפייה ולחמים',
  pantry: 'מעבר 3: מכולת ושימורים',
  household: 'מעבר 4: ניקיון והיגיינה',
  dairy: 'מעבר 5: מקרר ומוצרי חלב',
  protein: 'מעבר 6: קצבייה, עוף ודגים',
  frozen: 'מעבר 7: מוצרים קפואים',
  other: 'מעבר 8: שונות ומזווה נוסף',
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
      className="fixed inset-0 z-50 flex flex-col bg-[#faf9f6] text-stone-800 overflow-hidden"
    >
      {/* Top Supermarket Focus Header */}
      <header className="relative shrink-0 border-b border-stone-200/60 bg-white/90 px-4 py-3 shadow-apple-subtle backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 active:scale-95 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              חזרה לסל
            </button>
            <div>
              <h1 className="flex items-center gap-1.5 text-sm sm:text-base font-semibold text-stone-900">
                מצב קנייה ממוקד
              </h1>
              <p className="text-[11px] font-normal text-stone-500">
                מסודר לפי סדר המעברים
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              aria-label={soundOn ? 'השתק צלילים' : 'הפעל צלילים'}
              title={soundOn ? 'צלילים פעילים' : 'צלילים מושתקים'}
              className="rounded-xl border border-stone-200/80 bg-stone-50 p-2 text-stone-600 hover:text-stone-900 transition"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-stone-800" /> : <VolumeX className="h-4 w-4 text-stone-400" />}
            </button>

            <button
              onClick={() => setHideCompleted((prev) => !prev)}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                hideCompleted
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200/80 bg-stone-50 text-stone-600 hover:text-stone-900'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {hideCompleted ? 'רק מה שנשאר' : 'הכל'}
            </button>
          </div>
        </div>

        {/* Progress bar in Supermarket Header */}
        <div className="mx-auto mt-3 max-w-2xl">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="text-stone-600">
              {boughtItems.length} מתוך {items.length} בעגלה
            </span>
            <span className="text-stone-500 font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-900 transition-all duration-300"
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
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-medium text-stone-600">הסל ריק. הוסיפו פריטים לפני הקנייה.</p>
              <button
                onClick={onExit}
                className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-apple-subtle hover:bg-stone-800"
              >
                חזרה להוספת פריטים
              </button>
            </div>
          ) : celebrated ? (
            <div className="animate-float-in flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-apple">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 shadow-apple-subtle mb-2">
                <Check className="h-7 w-7 stroke-[2]" />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-stone-900">כל המוצרים נאספו לסל</h2>
              <p className="mt-1 text-xs text-stone-500">
                סיימתם את כל רשימת הקניות. אפשר לגשת לקופה.
              </p>
              <button
                onClick={onExit}
                className="mt-5 rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-medium text-white shadow-apple transition hover:bg-stone-800 active:scale-95"
              >
                סגירת מצב קנייה
              </button>
            </div>
          ) : null}

          {aisleGroups.map((group) => {
            const pendingInGroup = group.items.filter((i) => !i.boughtBy).length

            return (
              <section key={group.category} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-stone-700">
                    <span>{group.name}</span>
                  </h2>
                  <span className="text-[11px] font-normal text-stone-400">
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
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all select-none active:scale-[0.99] ${
                          isBought
                            ? 'border-stone-200/50 bg-stone-100/50 text-stone-400'
                            : 'border-stone-200/80 bg-white text-stone-900 shadow-apple-subtle hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Large touch checkbox */}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                              isBought
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-300 bg-stone-50 text-transparent'
                            }`}
                          >
                            <Check className="h-4 w-4 stroke-[2.5]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  isBought ? 'line-through text-stone-400' : 'text-stone-900'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="rounded-md bg-stone-100 border border-stone-200/60 px-1.5 py-0.5 text-[11px] font-normal text-stone-600">
                                {item.quantity} {item.unit}
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-stone-400">
                              {item.isHighProtein && (
                                <span className="font-medium text-stone-600">חלבון</span>
                              )}
                              {assigned && (
                                <span>משויך ל{assigned.name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-start">
                          <span
                            className={`text-xs font-semibold ${
                              isBought ? 'text-stone-400' : 'text-stone-900'
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
