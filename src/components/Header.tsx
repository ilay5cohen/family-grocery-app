import { ShoppingCart, Download } from 'lucide-react'
import type { Member } from '../types'
import { UserMenu } from './UserMenu'
import { triggerHaptic } from '../utils/haptics'
import { isCloudSyncConfigured } from '../services/supabase'

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
    const text = `היי! מוזמן/ת להצטרף לרשימת הקניות המשפחתית שלנו ב"הסל שלנו":\n${inviteUrl}\n(קוד המשפחה: ${familyCode})`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank')
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.04] bg-white/85 shadow-[0_1px_4px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        {/* Right side (RTL Start): User Menu */}
        <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-indigo-depth">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.2]" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
              הסל שלנו
            </h1>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-stone-500 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
            <span>{isCloudSyncConfigured ? 'מסונכרן בענן' : 'מסונכרן בזמן אמת'}</span>
          </div>
        </div>

        {/* Left side (RTL End): Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Install PWA Button - Prominent & Visible */}
          {onInstallPwa && (
            <button
              onClick={() => {
                triggerHaptic(20)
                onInstallPwa()
              }}
              title="התקנת האפליקציה למסך הבית"
              aria-label="התקנת האפליקציה למסך הבית"
              className="flex items-center gap-1 rounded-xl border border-[#4f46e5]/20 bg-[#4f46e5]/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-[#4f46e5] hover:bg-[#4f46e5]/20 transition active:scale-95 shadow-button-depth"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>התקנה</span>
            </button>
          )}

          {/* Quick Supermarket Mode button */}
          <button
            onClick={() => {
              triggerHaptic(25)
              onOpenSupermarketMode()
            }}
            title="כניסה למצב סופרמרקט"
            aria-label="כניסה למצב סופרמרקט"
            className="flex items-center gap-1.5 rounded-xl bg-[#4f46e5] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-indigo-depth transition hover:bg-[#4338ca] active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>מצב קניות</span>
          </button>
        </div>
      </div>
    </header>
  )
}
