import { useState, useMemo } from 'react'
import {
  X,
  Trophy,
  Sparkles,
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
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#f7f9f6] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800">השוואת רשתות שיווק</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                  {items.length} מוצרים בסל
                </span>
              </div>
              <p className="text-xs text-slate-500">חישוב מחירי סל בזמן אמת ברשתות המובילות בישראל</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">הסל ריק כרגע</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                הוסיפו מוצרים לרשימת הקניות שלכם, ואנחנו נחשב עבורכם בדיוק איפה הכי משתלם לקנות השבוע.
              </p>
            </div>
          ) : (
            <>
              {/* Winner Best Deal Banner */}
              {cheapestChain && (
                <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 p-5 text-white shadow-lg shadow-amber-500/20">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-xs px-3 py-1 text-xs font-black tracking-wide text-amber-100">
                        <Trophy className="h-3.5 w-3.5 text-amber-200" />
                        הרשת המשתלמת ביותר לסל שלך
                      </span>

                      {maxSavings > 5 && (
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-amber-900 shadow-xs">
                          חיסכון של עד {formatCurrency(maxSavings)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <h3 className="text-2xl font-black">{cheapestChain.chain.name}</h3>
                        <p className="text-xs text-amber-100 mt-0.5">{cheapestChain.chain.tagline}</p>
                      </div>

                      <div className="text-left">
                        <span className="text-xs text-amber-100 block">סה״כ לסל:</span>
                        <span className="text-3xl font-black">{formatCurrency(cheapestChain.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/20">
                      {cheapestChain.chain.strengths.map((str, idx) => (
                        <span key={idx} className="rounded-lg bg-black/15 px-2 py-0.5 text-[11px] font-medium text-white">
                          ✓ {str}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-1">
                      <button
                        onClick={() => handleApply(cheapestChain.chain.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-amber-950 shadow-md hover:bg-amber-50 active:scale-[0.99] transition-all"
                      >
                        {appliedChainId === cheapestChain.chain.id ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>מחירי {cheapestChain.chain.shortName} הוחלו על הסל!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span>החל מחירי {cheapestChain.chain.shortName} על הסל שלי</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View Switcher: All Chains vs By Category */}
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  onClick={() => setActiveTab('chains')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    activeTab === 'chains'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  השוואת כל הרשתות ({results.length})
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    activeTab === 'categories'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  פירוט לפי מחלקות
                </button>
              </div>

              {/* TAB 1: ALL CHAINS LIST */}
              {activeTab === 'chains' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
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
                            ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-slate-800">{res.chain.name}</h4>
                                {res.chain.badge && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                    {res.chain.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{res.chain.tagline}</p>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-sm font-black text-slate-900 block">
                              {formatCurrency(res.totalPrice)}
                            </span>
                            {res.differenceFromCheapest > 0 ? (
                              <span className="text-[10px] font-bold text-rose-600">
                                +{formatCurrency(res.differenceFromCheapest)} (+{res.percentDifference}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600">
                                ✓ הכי זול
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bar comparison visual */}
                        <div className="mt-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWinner ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Action */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                          <span className="text-slate-500">
                            חזק ב: <span className="font-semibold text-slate-700">{res.chain.strengths.slice(0, 2).join(', ')}</span>
                          </span>

                          <button
                            onClick={() => handleApply(res.chain.id)}
                            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                          >
                            <span>החל מחירי רשת זו</span>
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
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">טיפ חיסכון למשפחה: </span>
                      לרשתות שונות יש יתרונות שונים. למשל, יוחננוף מובילה בפירות וירקות, בעוד שרמי לוי מוביל במוצרי בשר ומזווה.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(bestCategoryChains).map(([catKey, best]) => {
                      const category = CATEGORIES[catKey as keyof typeof CATEGORIES]
                      if (!category) return null

                      return (
                        <div
                          key={catKey}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </span>

                            <span className="text-xs font-black text-slate-900">
                              {formatCurrency(best.lowestPrice)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <span className="text-slate-500">הרשת המשתלמת:</span>
                            <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                              🏆 {best.chainName}
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
        <div className="border-t border-slate-100 bg-[#f7f9f6] px-5 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * המחירים מבוססים על ממוצעי סל שבועיים ומקדמי רשתות ארציים
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
