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

  const tabs: { id: ActiveTab; label: string; icon: typeof ShoppingBag; badge?: number }[] = [
    { id: 'cart', label: 'רשימת הקניות', icon: ShoppingBag, badge: pendingCount },
    { id: 'staples', label: 'מוצרים קבועים', icon: Sparkles },
    { id: 'family', label: 'המשפחה והוצאות', icon: Users },
  ]

  return (
    <nav aria-label="ניווט ראשי" className="flex items-center justify-center p-1">
      <div className="flex w-full max-w-md items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all select-none ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ms-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
