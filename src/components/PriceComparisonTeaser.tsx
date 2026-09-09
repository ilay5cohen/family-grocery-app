import { useMemo } from 'react'
import { TrendingDown, ChevronLeft } from 'lucide-react'
import type { GroceryItem } from '../types'
import { calculateBasketComparison } from '../utils/priceComparison'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface PriceComparisonTeaserProps {
  items: GroceryItem[]
  onOpenModal: () => void
}

export function PriceComparisonTeaser({ items, onOpenModal }: PriceComparisonTeaserProps) {
  const comparison = useMemo(() => calculateBasketComparison(items), [items])

  if (items.length === 0) return null

  const cheapest = comparison.cheapestChain
  const maxSavings = comparison.maxSavings

  return (
    <div
      onClick={() => {
        triggerHaptic(20)
        onOpenModal()
      }}
      role="button"
      tabIndex={0}
      className="group flex items-center justify-between rounded-xl border border-emerald-200/90 bg-gradient-to-l from-emerald-50/90 via-white to-amber-50/60 px-3.5 py-2 text-xs shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
          <TrendingDown className="h-3.5 w-3.5" />
        </div>

        <div className="truncate text-xs">
          <span className="font-bold text-slate-800">איפה הכי זול? </span>
          {cheapest ? (
            <span className="text-slate-600">
              הכי משתלם ב<strong className="text-emerald-700 font-black">{cheapest.chain.shortName}</strong>
              {maxSavings > 5 && (
                <span className="font-bold text-emerald-800 me-1">
                  {' '}(חיסכון {formatCurrency(maxSavings)})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-500">לחצו להשוואת רמי לוי, שופרסל, יוחננוף</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 shrink-0 ps-2 group-hover:translate-x-[-2px] transition-transform">
        <span>השווה</span>
        <ChevronLeft className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
