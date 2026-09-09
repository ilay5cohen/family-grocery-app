import { ShoppingCart, HelpCircle, Share2, Smartphone } from 'lucide-react'
import type { Member } from '../types'
import { UserMenu } from './UserMenu'
import { triggerHaptic } from '../utils/haptics'

export function Header({
  me,
  familyCode,
  onOpenAdmin,
  onLogout,
  onHelp,
  onOpenSupermarketMode,
  onInstallPwa,
}: {
  me: Member
  familyCode: string
  onOpenAdmin: () => void
  onLogout: () => void
  onHelp: () => void
  onOpenSupermarketMode: () => void
  onInstallPwa?: () => void
}) {
  function handleShareWhatsApp() {
    triggerHaptic(20)
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteUrl = `${currentOrigin}?join=${familyCode}`
    const text = `היי! מוזמן/ת להצטרף לסל הקניות המשפחתי שלנו ב"הסל שלנו" 🛒:\n${inviteUrl}\n(קוד המשפחה: ${familyCode})`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        {/* Right side (RTL Start): User Menu */}
        <div className="flex items-center">
          <UserMenu
            me={me}
            familyCode={familyCode}
            onOpenAdmin={onOpenAdmin}
            onLogout={onLogout}
            onHelp={onHelp}
            onShareWhatsApp={handleShareWhatsApp}
            onOpenSupermarketMode={onOpenSupermarketMode}
          />
        </div>

        {/* Center: Centered App Brand & Pulse Indicator */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xs">
              <ShoppingCart className="h-4 w-4 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              הסל שלנו
            </h1>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            <span>מסונכרן בזמן אמת</span>
          </div>
        </div>

        {/* Left side (RTL End): Action Button */}
        <div className="flex items-center gap-1.5">
          {/* Desktop-only secondary buttons */}
          <button
            onClick={handleShareWhatsApp}
            title="הזמן משפחה בוואטסאפ"
            aria-label="הזמן משפחה בוואטסאפ"
            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onHelp}
            aria-label="הסבר על האפליקציה"
            title="הסבר על האפליקציה"
            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 active:scale-95"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>

          {/* Install PWA Button */}
          {onInstallPwa && (
            <button
              onClick={() => {
                triggerHaptic(20)
                onInstallPwa()
              }}
              title="התקן למסך הבית"
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl border border-emerald-300/80 bg-emerald-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition active:scale-95 shadow-2xs"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">התקן אפליקציה</span>
              <span className="sm:hidden">התקן</span>
            </button>
          )}

          {/* Quick Supermarket Mode button */}
          <button
            onClick={() => {
              triggerHaptic(25)
              onOpenSupermarketMode()
            }}
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-emerald-600 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">מצב סופר</span>
            <span className="sm:hidden">סופר</span>
          </button>
        </div>
      </div>
    </header>
  )
}
