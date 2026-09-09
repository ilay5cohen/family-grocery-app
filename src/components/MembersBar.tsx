import type { GroceryItem, Member } from '../types'
import { Avatar } from './Avatar'

export function MembersBar({ members, items }: { members: Member[]; items: GroceryItem[] }) {
  return (
    <div className="animate-float-in flex items-center gap-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md">
      <span className="shrink-0 text-[11px] font-medium text-slate-500">המשפחה מחוברת</span>
      <div className="flex gap-4">
        {members.map((m) => {
          const assignedCount = items.filter((i) => i.assignedTo === m.id && !i.boughtBy).length
          return (
            <div key={m.id} className="flex shrink-0 flex-col items-center gap-1">
              <div className="relative">
                <Avatar member={m} />
                <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#06060c] bg-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400">{m.name}</span>
              {assignedCount > 0 && <span className="text-[9px] text-slate-600">{assignedCount} משימות</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
