import { useState, useEffect } from 'react'
import {
  X,
  Share2,
  PlusSquare,
  Download,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

interface InstallPwaModalProps {
  isOpen: boolean
  onClose: () => void
  deferredPrompt: any
  onInstalled?: () => void
}

export function InstallPwaModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}: InstallPwaModalProps) {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Detect if already installed / standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(isStandaloneMode)
  }, [])

  if (!isOpen) return null

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    triggerHaptic(20)

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        triggerHaptic(40)
        onInstalled?.()
        onClose()
      }
    } catch (err) {
      console.error('Error during prompt:', err)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header with App Banner */}
        <div className="relative p-5 sm:p-6 border-b border-stone-200/60 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 shadow-apple-subtle flex items-center justify-center text-white">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">הסל שלנו</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-medium">
                  אפליקציה
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                התקנה למסך הבית לגישה מיידית
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Already installed state */}
          {isStandalone ? (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 shadow-apple-subtle flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="font-semibold text-stone-900 text-base">
                האפליקציה מותקנת במסך הבית
              </p>
              <p className="text-xs text-stone-500">
                ניתן לפתוח אותה ישירות ממסך האפליקציות במסך מלא מהיר.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-medium text-stone-700">
                להתקנה ב-iPhone או iPad:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 font-semibold text-xs mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-stone-600">
                    לחצו על כפתור <strong>השיתוף</strong> (Share) בתחתית הדפדפן Safari:
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 font-medium">
                      <Share2 className="w-3.5 h-3.5" />
                      שיתוף Safari
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 font-semibold text-xs mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-stone-600">
                    גללו מעט ולחצו על:
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 font-medium">
                      <PlusSquare className="w-3.5 h-3.5" />
                      הוסף למסך הבית
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 font-semibold text-xs mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-stone-600">
                    לחצו על <strong>"הוסף"</strong> בפינה העליונה של המסך.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome / Edge Installation */
            <div className="space-y-4">
              {deferredPrompt ? (
                <button
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-medium text-xs sm:text-sm shadow-apple-subtle flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isInstalling ? 'מתקין...' : 'התקנה למסך הבית'}
                </button>
              ) : (
                <div className="text-xs text-stone-600 space-y-2 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <p className="font-medium text-stone-800">
                    כיצד להתקין מהדפדפן:
                  </p>
                  <p>
                    פתחו את תפריט האפשרויות בדפדפן (⋮) ולחצו על{' '}
                    <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/40">
              <span className="text-xs font-medium text-stone-700 block">מהירות</span>
              <p className="text-[11px] text-stone-400 mt-0.5">טעינה מיידית</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/40">
              <span className="text-xs font-medium text-stone-700 block">מסך מלא</span>
              <p className="text-[11px] text-stone-400 mt-0.5">ללא סרגלים</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/40">
              <span className="text-xs font-medium text-stone-700 block">סנכרון</span>
              <p className="text-[11px] text-stone-400 mt-0.5">בזמן אמת</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-200/60 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/70 transition-colors"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  )
}
