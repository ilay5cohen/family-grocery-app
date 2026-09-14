import { ShoppingBag } from 'lucide-react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import type { GroceryItem, Member } from '../types'
import { ItemCard } from './ItemCard'
import type { StatusFilter } from './FilterBar'

export function ItemList({
  items,
  members,
  canAssign,
  onToggle,
  onToggleStaple,
  onAssign,
  onDelete,
  status,
}: {
  items: GroceryItem[]
  members: Member[]
  canAssign: boolean
  onToggle: (id: string) => void
  onToggleStaple: (id: string) => void
  onAssign: (id: string, memberId: string | undefined) => void
  onDelete: (id: string) => void
  status?: StatusFilter
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-400 mb-4 shadow-apple-subtle">
          <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-stone-900 mb-1">הסל ריק</h3>
        <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
          {status === 'bought'
            ? 'טרם סומנו פריטים שנרכשו.'
            : status === 'mine'
            ? 'אין פריטים המשויכים אליך כעת.'
            : 'הוסיפו מוצרים לסל באמצעות שורת החיפוש למעלה.'}
        </p>
      </div>
    )
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: items.filter((i) => {
      const itemCat = i.category && i.category in CATEGORIES ? i.category : 'other'
      return itemCat === cat
    }),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      {grouped.map((group) => {
        const meta = CATEGORIES[group.category]
        const pendingCount = group.items.filter((i) => !i.boughtBy).length

        return (
          <section key={group.category} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <span>{meta.label}</span>
                <span className="text-[11px] font-normal text-stone-400">({group.items.length})</span>
              </h3>
              {pendingCount > 0 && (
                <span className="text-[11px] font-medium text-stone-600 bg-stone-100/90 border border-stone-200/60 px-2.5 py-0.5 rounded-full">
                  {pendingCount} נותרו
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
