import { ShoppingBag, Sparkles, Users } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

export type ActiveTab = 'cart' | 'staples' | 'family'

interface NavigationTabsProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  itemCount: number
  pendingCount: number
}

export function NavigationTabs({
  activeTab,
  onTabChange,
  pendingCount,
}: NavigationTabsProps) {
  function handleSelect(tab: ActiveTab) {
    triggerHaptic(15)
    onTabChange(tab)
  }

  const tabs: {
    id: ActiveTab
    label: string
    shortLabel: string
    icon: typeof ShoppingBag
    badge?: number
  }[] = [
    { id: 'cart', label: 'רשימת הקניות', shortLabel: 'קניות', icon: ShoppingBag, badge: pendingCount },
    { id: 'staples', label: 'מוצרים קבועים', shortLabel: 'קבועים', icon: Sparkles },
    { id: 'family', label: 'המשפחה והוצאות', shortLabel: 'משפחה', icon: Users },
  ]

  return (
    <nav
      aria-label="ניווט ראשי"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/[0.04] bg-white/80 backdrop-blur-xl pb-safe shadow-[0_-1px_4px_rgba(0,0,0,0.02)] transition-all"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-2xl transition-all select-none min-w-[72px] ${
                isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-stone-900" />
              )}
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-stone-100 text-stone-900' : ''
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-semibold text-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${isActive ? 'font-semibold text-stone-900' : 'font-normal text-stone-400'}`}>
                {tab.shortLabel}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
