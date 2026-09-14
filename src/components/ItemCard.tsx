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
      onClick={handleToggle}
      className={`group relative cursor-pointer animate-float-in flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all select-none ${
        bought
          ? 'border-black/[0.03] bg-stone-100/50 text-stone-400 opacity-60'
          : 'border-black/[0.05] bg-white hover:border-black/[0.1] text-stone-900 shadow-apple hover:shadow-apple-hover hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Toggle check button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
          aria-label={bought ? 'בטל סימון קנייה' : 'סמן כנקנה'}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-90 ${
            bought
              ? 'border-stone-900 bg-stone-900 text-white shadow-apple-subtle animate-check-pop'
              : 'border-stone-300 bg-stone-50/50 text-transparent hover:border-stone-500 hover:bg-stone-100'
          }`}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`truncate ${
                bought ? 'text-sm font-medium text-stone-400 line-through' : 'text-[15px] font-semibold text-stone-900'
              }`}
            >
              {item.name}
            </span>

            <span className="shrink-0 rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
              {item.quantity} {item.unit}
            </span>

            {/* Recurring staple badge / toggle */}
            <button
              onClick={handleStapleClick}
              type="button"
              aria-label={isStaple ? 'מוצר קבוע שבועי (לחץ לביטול)' : 'הפוך למוצר קבוע שבועי'}
              title={isStaple ? 'מוצר קבוע - יישמר באיפוס של יום ראשון' : 'לחץ להפיכה למוצר קבוע שבועי'}
              className={`flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition ${
                isStaple
                  ? 'border-stone-300 bg-stone-100 text-stone-900'
                  : 'border-stone-200 bg-stone-50 text-stone-400 hover:border-stone-300 hover:text-stone-700'
              }`}
            >
              <Star className={`h-2.5 w-2.5 ${isStaple ? 'fill-stone-900 text-stone-900' : 'text-stone-400'}`} />
              <span>{isStaple ? 'קבוע' : '+קבוע'}</span>
            </button>

            <span
              className="flex shrink-0 items-center rounded-md border border-stone-200/80 bg-stone-100/70 px-1.5 py-0.5 text-[10px] font-medium text-stone-600"
            >
              <span>{meta.label}</span>
            </span>

            {item.isHighProtein && (
              <span className="flex shrink-0 items-center rounded-md border border-stone-200/80 bg-stone-100/70 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                חלבון
              </span>
            )}
          </div>

          <div
            className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500"
            onClick={(e) => e.stopPropagation()}
          >
            {bought ? (
              <span className="flex items-center gap-1.5 text-stone-500 font-medium">
                {boughtByMember ? (
                  <Avatar member={boughtByMember} size="sm" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[10px] text-stone-700 font-bold">
                    {(item.boughtByName ?? '?').charAt(0)}
                  </span>
                )}
                נקנה ע״י {item.boughtByName ?? boughtByMember?.name ?? 'מישהו'} · {formatRelativeTime(item.boughtAt!)}
              </span>
            ) : canAssign ? (
              <AssignMenu members={members} assignedTo={item.assignedTo} onAssign={onAssign} />
            ) : assignedMember ? (
              <span className="flex items-center gap-1.5 rounded-full border border-stone-200 px-2 py-0.5 text-[11px] text-stone-600">
                <Avatar member={assignedMember} size="sm" />
                משויך ל{assignedMember.name}
              </span>
            ) : (
              <span className="text-[11px] text-stone-400">טרם שויך</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`text-sm font-bold tabular-nums ${
            bought ? 'text-stone-400' : 'text-stone-900'
          }`}
        >
          {formatCurrency(item.actualPrice ?? item.estimatedPrice)}
        </span>

        <button
          onClick={handleDelete}
          aria-label="הסר פריט מהרשימה"
          title="הסר מהסל"
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 active:scale-90"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Subtle hover accent line */}
      <div className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-stone-300 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
    </div>
  )
}
