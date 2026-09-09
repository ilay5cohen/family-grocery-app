import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import type { GroceryItem, Member } from '../types'
import { ItemCard } from './ItemCard'
import { ShoppingBag } from 'lucide-react'

export function ItemList({
  items,
  members,
  canAssign,
  onToggle,
  onToggleStaple,
  onAssign,
  onDelete,
}: {
  items: GroceryItem[]
  members: Member[]
  canAssign: boolean
  onToggle: (id: string) => void
  onToggleStaple: (id: string) => void
  onAssign: (id: string, memberId: string | undefined) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="animate-float-in flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">אין פריטים להצגה בסל</h3>
          <p className="mt-0.5 text-xs text-slate-500">הוסיפו מוצרים באמצעות שורת החיפוש או הדיבור הקולי למעלה!</p>
        </div>
      </div>
    )
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-5">
      {grouped.map((group) => {
        const meta = CATEGORIES[group.category]
        const pendingCount = group.items.filter((i) => !i.boughtBy).length

        return (
          <section key={group.category} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="text-[11px] font-semibold text-slate-400">· {group.items.length}</span>
              </h3>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  {pendingCount} לביצוע
                </span>
              )}
            </div>

            <div className="space-y-2">
              {group.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  members={members}
                  canAssign={canAssign}
                  onToggle={() => onToggle(item.id)}
                  onToggleStaple={() => onToggleStaple(item.id)}
                  onAssign={(memberId) => onAssign(item.id, memberId)}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
