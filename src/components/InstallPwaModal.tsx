import { useState, useEffect } from 'react'
import {
  X,
  Share2,
  PlusSquare,
  Download,
  CheckCircle2,
  Sparkles,
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
        <div className="relative p-6 pb-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold">הסל שלנו</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-semibold backdrop-blur-xs">
                  אפליקציה
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                התקן למסך הבית לגישה מהירה ונוחה
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Already installed state */}
          {isStandalone ? (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-base">
                האפליקציה כבר מותקנת במסך הבית שלך!
              </p>
              <p className="text-xs text-slate-700">
                תוכל לפתוח אותה ישירות ממסך האפליקציות בטלפון לקבלת חוויית מסך מלא מהירה.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                להתקנה ב-iPhone או iPad ב-3 צעדים פשוטים:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    לחץ על כפתור <strong>השיתוף</strong> (Share) בתחתית הדפדפן Safari:
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-sky-600 font-bold">
                      <Share2 className="w-3.5 h-3.5" />
                      שיתוף Safari
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700">
                    גלול מעט מטה ולחץ על:
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-emerald-700 font-bold">
                      <PlusSquare className="w-3.5 h-3.5" />
                      הוסף למסך הבית (Add to Home Screen)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700">
                    לחץ על <strong>"הוסף" (Add)</strong> בפינה העליונה של המסך — והאייקון של
                    הסל יופיע במסך הבית שלך!
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome / Edge Installation */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <strong>חוויית אפליקציה מלאה:</strong> טעינה מהירה, ללא סרגלי דפדפן, סנכרון
                  בזמן אמת וזמינות בלחיצה אחת ממסך הבית.
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isInstalling ? 'מתקין...' : 'התקן עכשיו למסך הבית'}
                </button>
              ) : (
                <div className="text-xs text-slate-600 space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-800">
                    כיצד להתקין מהדפדפן שלך:
                  </p>
                  <p>
                    פתח את תפריט 3 הנקודות בדפדפן (⋮) ולחץ על{' '}
                    <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-lg">⚡</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">טעינה מיידית</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-lg">📱</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">מסך מלא נקי</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-lg">🔄</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">סנכרון רציף</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
