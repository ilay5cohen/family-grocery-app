import { formatCurrency } from '../utils/format'

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
  return (
    <div className="animate-float-in rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs">
      {/* Centered 3-Column Metrics Row */}
      <div className="flex items-center justify-around text-center divide-x divide-x-reverse divide-slate-100">
        <div className="flex-1 px-1 sm:px-2">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400">סה״כ בסל</p>
          <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
            {formatCurrency(stats.estimatedTotal)}
          </p>
        </div>

        <div className="flex-1 px-1 sm:px-2">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400">נותרו לקנות</p>
          <p className="text-sm sm:text-base font-black text-amber-700 mt-0.5">
            {stats.pendingCount} פריטים
          </p>
        </div>

        <div className="flex-1 px-1 sm:px-2">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400">הושלמו</p>
          <p className="text-sm sm:text-base font-black text-emerald-700 mt-0.5">
            {stats.boughtCount}/{stats.totalCount} ({stats.progress}%)
          </p>
        </div>
      </div>

      {/* Slim Centered Progress Line */}
      <div className="mt-2.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
