import type { ActivityEntry, Member } from '../types'
import { formatRelativeTime } from '../utils/format'
import { Avatar } from './Avatar'

export function ActivityFeed({ activity, members }: { activity: ActivityEntry[]; members: Member[] }) {
  return (
    <div className="animate-float-in rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse-glow" />
        פעילות המשפחה
      </h3>
      <ul className="space-y-3">
        {activity.slice(0, 10).map((entry) => {
          const member = members.find((m) => m.id === entry.memberId)
          return (
            <li key={entry.id} className="flex items-start gap-2.5 text-xs">
              {member ? <Avatar member={member} size="sm" /> : <span className="h-7 w-7 shrink-0" />}
              <div className="min-w-0">
                <p className="text-slate-300">{entry.text}</p>
                <p className="text-[10px] text-slate-600">{formatRelativeTime(entry.createdAt)}</p>
              </div>
            </li>
          )
        })}
        {activity.length === 0 && <li className="text-xs text-slate-500">אין פעילות עדיין</li>}
      </ul>
    </div>
  )
}
