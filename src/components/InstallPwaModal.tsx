import { useState, useEffect } from 'react'
import {
  X,
  Share2,
  PlusSquare,
  Download,
  CheckCircle2,
  ShoppingBag,
  Smartphone,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-apple-float border border-black/[0.06] w-full max-w-md overflow-hidden text-right animate-bounce-in"
        dir="rtl"
      >
        {/* Header with App Banner */}
        <div className="relative p-5 sm:p-6 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] shadow-indigo-depth flex items-center justify-center text-white">
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">התקנת אפליקציית "הסל שלנו"</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-bold">
                  חינם
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                עובד כאפליקציה עצמאית מהירה במסך מלא
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
        <div className="p-5 sm:p-6 space-y-4">
          {/* Already installed state */}
          {isStandalone ? (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 shadow-apple-subtle flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="font-bold text-stone-900 text-base">
                האפליקציה כבר מותקנת במסך הבית שלך!
              </p>
              <p className="text-xs text-stone-500">
                ניתן לפתוח אותה ישירות מהאייקון במסך הבית לפעולה מהירה ללא דפדפן.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                התקנה ב-iPhone או iPad (ספארי):
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-stone-700 leading-relaxed">
                    לחצו על כפתור <strong>השיתוף</strong> (Share) בתחתית הדפדפן Safari:
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[#4f46e5] font-bold">
                      <Share2 className="w-3.5 h-3.5" />
                      שיתוף Safari
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-stone-700 leading-relaxed">
                    גללו בתפריט ובחרו <strong>"הוסף למסך הבית"</strong>:
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[#4f46e5] font-bold">
                      <PlusSquare className="w-3.5 h-3.5" />
                      הוסף למסך הבית
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                  <div className="w-6 h-6 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-stone-700 leading-relaxed">
                    לחצו על <strong>"הוסף"</strong> בפינה העליונה — וזהו! האפליקציה תופיע במסך הבית.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome / Edge Installation */
            <div className="space-y-3">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  className="w-full py-3.5 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-bold text-sm shadow-indigo-depth flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{isInstalling ? 'מתקין אפליקציה...' : 'התקן אפליקציה עכשיו בלחיצה'}</span>
                </button>
              ) : (
                <div className="space-y-2 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <Smartphone className="w-4 h-4 text-[#4f46e5]" />
                    <span>כיצד להתקין באנדרואיד / כרום:</span>
                  </div>
                  <p>
                    1. פתחו את תפריט האפשרויות בדפדפן (3 הנקודות <strong>⋮</strong> בפינה העליונה).
                  </p>
                  <p>
                    2. לחצו על <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.
                  </p>
                  <p className="text-stone-500 text-[11px] pt-1">
                    האפליקציה תותקן מיד ותיפתח במסך מלא עצמאי ונוח.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs font-bold text-stone-800 block">מהירות שיא</span>
              <p className="text-[10px] text-stone-400 mt-0.5">פתיחה מיידית</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs font-bold text-stone-800 block">מסך מלא</span>
              <p className="text-[10px] text-stone-400 mt-0.5">ללא סרגלי דפדפן</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs font-bold text-stone-800 block">סנכרון מלא</span>
              <p className="text-[10px] text-stone-400 mt-0.5">בזמן אמת</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200/70 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
