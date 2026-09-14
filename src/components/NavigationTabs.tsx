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
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40"
    >
      <div className="flex items-center justify-around rounded-full border border-black/[0.06] bg-white/90 p-1.5 shadow-apple-float backdrop-blur-2xl transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all select-none active:scale-95 ${
                isActive
                  ? 'bg-[#4f46e5] text-white shadow-indigo-depth font-bold'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`h-4 w-4 stroke-[2.2] ${isActive ? 'text-white' : 'text-stone-500'}`} />

                {/* Badge for items count */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                      isActive
                        ? 'bg-white text-[#4f46e5]'
                        : 'bg-[#4f46e5] text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-xs">{tab.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
