import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface Stats {
  pendingCount: number
  boughtCount: number
  totalCount: number
  estimatedTotal: number
  spentTotal: number
  remainingEstimate: number
  progress: number
}

export function StatsBar({ stats }: { stats: Stats }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isComplete = stats.totalCount > 0 && stats.pendingCount === 0

  function toggleExpand() {
    triggerHaptic(15)
    setIsExpanded((prev) => !prev)
  }

  return (
    <div className="animate-float-in overflow-hidden rounded-2xl border border-black/[0.04] bg-white/90 shadow-apple backdrop-blur-md transition-all">
      {/* Collapsed Micro-Strip (Default View - Ultra Clean) */}
      <div
        onClick={toggleExpand}
        className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs select-none hover:bg-stone-50/70 transition-colors"
        title="הצגת פירוט סטטיסטיקה"
      >
        <div className="flex items-center gap-2.5">
          {/* Progress Pill */}
          <span
            className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-800"
          >
            {stats.progress}%
          </span>

          {/* Key Summary Stats */}
          <div className="flex items-center gap-2 text-stone-600 text-xs">
            {isComplete ? (
              <span className="text-stone-900 font-semibold">כל הפריטים בסל הושלמו</span>
            ) : (
              <>
                <span>
                  נותרו <strong className="text-stone-900 font-bold">{stats.pendingCount}</strong>
                </span>
                <span className="text-stone-300">·</span>
                <span>
                  נקנו <strong className="text-stone-800 font-semibold">{stats.boughtCount}</strong>
                </span>
              </>
            )}
            <span className="text-stone-300">·</span>
            <span>
              סה״כ <strong className="text-stone-900 font-bold">{formatCurrency(stats.estimatedTotal)}</strong>
            </span>
          </div>
        </div>

        {/* Expand / Collapse Icon */}
        <div className="flex items-center gap-1 text-stone-400">
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isExpanded ? 'rotate-180 text-stone-800' : ''
            }`}
          />
        </div>
      </div>

      {/* Expanded Detailed Breakdown */}
      {isExpanded && (
        <div className="border-t border-stone-100 bg-stone-50/40 p-3 sm:p-4 animate-slide-up">
          <div className="flex items-center justify-around text-center divide-x divide-x-reverse divide-stone-200/60">
            <div className="flex-1 px-2">
              <p className="text-[11px] font-medium text-stone-500">סה״כ משוער</p>
              <p className="mt-1 text-base font-bold text-stone-900">
                {formatCurrency(stats.estimatedTotal)}
              </p>
            </div>

            <div className="flex-1 px-2">
              <p className="text-[11px] font-medium text-stone-500">נותרו לרכישה</p>
              <p className="mt-1 text-base font-bold text-stone-900">
                {stats.pendingCount === 0 ? 'הכל הושלם' : `${stats.pendingCount} פריטים`}
              </p>
            </div>

            <div className="flex-1 px-2">
              <p className="text-[11px] font-medium text-stone-500">נאספו לעגלה</p>
              <p className="mt-1 text-base font-bold text-stone-900">
                {stats.boughtCount}
                <span className="text-xs font-medium text-stone-400">/{stats.totalCount}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {stats.totalCount > 0 && (
            <div className="mt-3.5 pt-3 border-t border-stone-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">התקדמות</span>
                <span className="text-[11px] font-bold text-stone-800">{stats.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200/60">
                <div
                  className="h-full rounded-full bg-stone-900 transition-all duration-700 ease-out"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
