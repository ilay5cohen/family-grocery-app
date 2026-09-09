import React from 'react'
import { Check, Trash2, Star } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import type { GroceryItem, Member } from '../types'
import { formatCurrency, formatRelativeTime } from '../utils/format'
import { Avatar } from './Avatar'
import { AssignMenu } from './AssignMenu'
import { soundManager, triggerHaptic } from '../utils/haptics'

export function ItemCard({
  item,
  members,
  canAssign,
  onToggle,
  onToggleStaple,
  onAssign,
  onDelete,
}: {
  item: GroceryItem
  members: Member[]
  canAssign: boolean
  onToggle: () => void
  onToggleStaple?: () => void
  onAssign: (memberId: string | undefined) => void
  onDelete: () => void
}) {
  const meta = CATEGORIES[item.category]
  const bought = Boolean(item.boughtBy)
  const isStaple = Boolean(item.isStaple)
  const boughtByMember = members.find((m) => m.id === item.boughtBy)
  const assignedMember = members.find((m) => m.id === item.assignedTo)

  function handleToggle() {
    soundManager.playCheck()
    triggerHaptic(25)
    onToggle()
  }

  function handleStapleClick(e: React.MouseEvent) {
    e.stopPropagation()
    triggerHaptic(20)
    onToggleStaple?.()
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    triggerHaptic(20)
    onDelete()
  }

  return (
    <div
      className={`group animate-float-in flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all select-none ${
        bought
          ? 'border-slate-200/60 bg-slate-50/70 text-slate-400'
          : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Toggle check button */}
        <button
          onClick={handleToggle}
          aria-label={bought ? 'בטל סימון קנייה' : 'סמן כנקנה'}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90 ${
            bought
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_2px_6px_rgba(16,185,129,0.3)]'
              : 'border-slate-300 bg-slate-50 text-transparent hover:border-emerald-500 hover:bg-emerald-50/50'
          }`}
        >
          <Check className="h-4 w-4 stroke-[3]" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`truncate text-sm font-bold ${
                bought ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {item.name}
            </span>

            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
              {item.quantity} {item.unit}
            </span>

            {/* Recurring staple badge / toggle */}
            <button
              onClick={handleStapleClick}
              type="button"
              aria-label={isStaple ? 'מוצר קבוע שבועי (לחץ לביטול)' : 'הפוך למוצר קבוע שבועי'}
              title={isStaple ? 'מוצר קבוע - יישמר באיפוס של יום ראשון' : 'לחץ להפיכה למוצר קבוע שבועי'}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition ${
                isStaple
                  ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              <Star className={`h-3 w-3 ${isStaple ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{isStaple ? 'קבוע' : '+קבוע'}</span>
            </button>

            <span
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.glow}`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </span>

            {item.isHighProtein && (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                💪 חלבון
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {bought ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                {boughtByMember ? (
                  <Avatar member={boughtByMember} size="sm" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-700 font-bold">
                    {(item.boughtByName ?? '?').charAt(0)}
                  </span>
                )}
                נקנה ע״י {item.boughtByName ?? boughtByMember?.name ?? 'מישהו'} · {formatRelativeTime(item.boughtAt!)}
              </span>
            ) : canAssign ? (
              <AssignMenu members={members} assignedTo={item.assignedTo} onAssign={onAssign} />
            ) : assignedMember ? (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                <Avatar member={assignedMember} size="sm" />
                משויך ל{assignedMember.name}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">טרם שויך</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`text-sm font-black ${
            bought ? 'text-slate-400' : 'text-emerald-700'
          }`}
        >
          {formatCurrency(item.actualPrice ?? item.estimatedPrice)}
        </span>

        <button
          onClick={handleDelete}
          aria-label="הסר פריט מהרשימה"
          title="הסר מהסל"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-90"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
