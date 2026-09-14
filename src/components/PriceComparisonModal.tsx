import { useState, useMemo } from 'react'
import {
  X,
  Trophy,
  Check,
  Store,
  Info,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import type { GroceryItem } from '../types'
import { calculateBasketComparison } from '../utils/priceComparison'
import { CATEGORIES } from '../data/categories'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface PriceComparisonModalProps {
  items: GroceryItem[]
  isOpen: boolean
  onClose: () => void
  onApplyChainPrices: (chainId: string) => void
}

export function PriceComparisonModal({
  items,
  isOpen,
  onClose,
  onApplyChainPrices,
}: PriceComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<'chains' | 'categories'>('chains')
  const [appliedChainId, setAppliedChainId] = useState<string | null>(null)

  const comparison = useMemo(() => calculateBasketComparison(items), [items])

  if (!isOpen) return null

  const { results, cheapestChain, mostExpensiveChain, maxSavings, bestCategoryChains } = comparison

  const handleApply = (chainId: string) => {
    triggerHaptic(30)
    onApplyChainPrices(chainId)
    setAppliedChainId(chainId)
    setTimeout(() => {
      setAppliedChainId(null)
    }, 2500)
  }

  // Max total for calculating proportional progress bar widths
  const maxPrice = mostExpensiveChain?.totalPrice || 100

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200/60 bg-stone-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-apple-subtle">
              <Store className="h-5 w-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-stone-900">השוואת רשתות שיווק</h2>
                <span className="rounded-full bg-stone-100 border border-stone-200/60 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                  {items.length} מוצרים בסל
                </span>
              </div>
              <p className="text-xs text-stone-500">חישוב עלות הסל ברשתות המובילות</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
            aria-label="סגור"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 mb-3 shadow-apple-subtle">
                <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">הסל ריק כרגע</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                הוסיפו מוצרים לרשימת הקניות כדי להשוות מחירים בין הרשתות.
              </p>
            </div>
          ) : (
            <>
              {/* Winner Best Deal Banner */}
              {cheapestChain && (
                <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 p-5 text-white shadow-apple">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-stone-200">
                        <Trophy className="h-3.5 w-3.5 text-stone-300" />
                        הסל המשתלם ביותר
                      </span>

                      {maxSavings > 5 && (
                        <span className="rounded-full bg-stone-100 text-stone-900 px-2.5 py-0.5 text-xs font-semibold shadow-apple-subtle">
                          חיסכון של {formatCurrency(maxSavings)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-white">{cheapestChain.chain.name}</h3>
                        <p className="text-xs text-stone-400 mt-0.5">{cheapestChain.chain.tagline}</p>
                      </div>

                      <div className="text-left">
                        <span className="text-xs text-stone-400 block">סה״כ לסל:</span>
                        <span className="text-2xl sm:text-3xl font-semibold text-white">{formatCurrency(cheapestChain.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-stone-800">
                      {cheapestChain.chain.strengths.map((str, idx) => (
                        <span key={idx} className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-normal text-stone-300">
                          {str}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-1">
                      <button
                        onClick={() => handleApply(cheapestChain.chain.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-medium text-stone-900 shadow-apple-subtle hover:bg-stone-100 active:scale-[0.99] transition-all"
                      >
                        {appliedChainId === cheapestChain.chain.id ? (
                          <>
                            <Check className="h-4 w-4 text-stone-900" />
                            <span>מחירי {cheapestChain.chain.shortName} עודכנו בסל</span>
                          </>
                        ) : (
                          <>
                            <span>החלת מחירי {cheapestChain.chain.shortName} על הסל</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View Switcher: All Chains vs By Category */}
              <div className="flex rounded-2xl bg-stone-100/80 p-1 border border-stone-200/60">
                <button
                  onClick={() => setActiveTab('chains')}
                  className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                    activeTab === 'chains'
                      ? 'bg-white text-stone-900 shadow-apple-subtle'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  השוואת רשתות ({results.length})
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                    activeTab === 'categories'
                      ? 'bg-white text-stone-900 shadow-apple-subtle'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  פירוט לפי מחלקות
                </button>
              </div>

              {/* TAB 1: ALL CHAINS LIST */}
              {activeTab === 'chains' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-normal">
                    <span>רשת שיווק</span>
                    <span>עלות סל ופער מהזול</span>
                  </div>

                  {results.map((res, index) => {
                    const isWinner = res.isCheapest
                    const barWidth = Math.max(15, Math.round((res.totalPrice / maxPrice) * 100))

                    return (
                      <div
                        key={res.chain.id}
                        className={`rounded-2xl border p-3.5 transition-all ${
                          isWinner
                            ? 'border-stone-900 bg-stone-50/70 shadow-apple-subtle'
                            : 'border-stone-200/80 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-100 text-xs font-medium text-stone-700">
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-semibold text-stone-900">{res.chain.name}</h4>
                                {res.chain.badge && (
                                  <span className="rounded-full bg-stone-100 border border-stone-200/60 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                    {res.chain.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-400 line-clamp-1">{res.chain.tagline}</p>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-sm font-semibold text-stone-900 block">
                              {formatCurrency(res.totalPrice)}
                            </span>
                            {res.differenceFromCheapest > 0 ? (
                              <span className="text-[10px] font-medium text-stone-500">
                                +{formatCurrency(res.differenceFromCheapest)} (+{res.percentDifference}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-stone-800">
                                המחיר הזול ביותר
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bar comparison visual */}
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWinner ? 'bg-stone-900' : 'bg-stone-300'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Action */}
                        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px]">
                          <span className="text-stone-400">
                            יתרון: <span className="font-medium text-stone-700">{res.chain.strengths.slice(0, 2).join(', ')}</span>
                          </span>

                          <button
                            onClick={() => handleApply(res.chain.id)}
                            className="font-medium text-stone-900 hover:underline flex items-center gap-1"
                          >
                            <span>החלת מחירי רשת זו</span>
                            <ArrowRight className="h-3 w-3 rotate-180" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* TAB 2: CATEGORY BREAKDOWN */}
              {activeTab === 'categories' && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-3.5 text-xs text-stone-600 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">השוואה לפי קטגוריות: </span>
                      לרשתות שונות יתרונות שונים לפי מחלקות.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(bestCategoryChains).map(([catKey, best]) => {
                      const category = CATEGORIES[catKey as keyof typeof CATEGORIES]
                      if (!category) return null

                      return (
                        <div
                          key={catKey}
                          className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-apple-subtle space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-stone-800">
                              {category.label}
                            </span>

                            <span className="text-xs font-semibold text-stone-900">
                              {formatCurrency(best.lowestPrice)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-100">
                            <span className="text-stone-400">הרשת המשתלמת:</span>
                            <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                              {best.chainName}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-200/60 bg-stone-50/80 px-5 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            המחירים מבוססים על ממוצעי סל תקופתיים
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-apple-subtle"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  )
}
