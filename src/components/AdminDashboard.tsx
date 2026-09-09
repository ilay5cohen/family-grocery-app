import { useEffect, useState } from 'react'
import {
  Crown,
  Share2,
  RefreshCw,
  UserMinus,
  Copy,
  Check,
  X,
  ShieldCheck,
  Radio,
  RotateCcw,
} from 'lucide-react'
import type { Member } from '../types'
import { Avatar } from './Avatar'
import { triggerHaptic } from '../utils/haptics'

export function AdminDashboard({
  members,
  currentMemberId,
  familyCode,
  onClose,
  onKick,
  onResetCode,
  onWeeklyReset,
}: {
  members: Member[]
  currentMemberId: string
  familyCode: string
  onClose: () => void
  onKick: (memberId: string) => void
  onResetCode: () => void
  onWeeklyReset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingWeeklyReset, setConfirmingWeeklyReset] = useState(false)
  const [confirmingKickId, setConfirmingKickId] = useState<string | null>(null)

  useEffect(() => {
    if (!confirmingReset) return
    const timer = window.setTimeout(() => setConfirmingReset(false), 3000)
    return () => window.clearTimeout(timer)
  }, [confirmingReset])

  useEffect(() => {
    if (!confirmingKickId) return
    const timer = window.setTimeout(() => setConfirmingKickId(null), 3000)
    return () => window.clearTimeout(timer)
  }, [confirmingKickId])

  async function copyCode() {
    triggerHaptic(20)
    try {
      await navigator.clipboard.writeText(familyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

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

  function handleResetClick() {
    triggerHaptic(25)
    if (confirmingReset) {
      onResetCode()
      setConfirmingReset(false)
    } else {
      setConfirmingReset(true)
    }
  }

  function handleKickClick(memberId: string) {
    triggerHaptic(25)
    if (confirmingKickId === memberId) {
      onKick(memberId)
      setConfirmingKickId(null)
    } else {
      setConfirmingKickId(memberId)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="ניהול המשפחה"
    >
      <div className="relative w-full max-w-md animate-float-in overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="relative max-h-[85vh] overflow-y-auto p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <Crown className="h-5 w-5 text-amber-600" />
              ניהול המשפחה
            </h2>
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Family Code & Sharing */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-xs font-bold text-slate-600">קוד המשפחה לשיתוף</h3>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs">
              <span className="font-mono text-xl font-black tracking-[0.25em] text-emerald-800">
                {familyCode}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'הועתק!' : 'העתק'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-98"
            >
              <Share2 className="h-4 w-4" />
              <span>שלח הזמנה בוואטסאפ עם קישור ישיר</span>
            </button>

            <button
              onClick={handleResetClick}
              className="flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{confirmingReset ? 'בטוח? לחץ שוב לאיפוס הקוד' : 'איפוס קוד המשפחה'}</span>
            </button>
          </section>

          {/* Weekly Reset Section */}
          <section className="space-y-2.5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>איפוס שבועי (כל יום ראשון)</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                פעיל אוטומטית
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              ביום ראשון הרשימה מתאפסת: מוצרים קבועים (⭐) נשמרים, ומוצרים חד-פעמיים נמחקים.
            </p>
            <button
              onClick={() => {
                triggerHaptic(25)
                if (confirmingWeeklyReset) {
                  onWeeklyReset()
                  setConfirmingWeeklyReset(false)
                } else {
                  setConfirmingWeeklyReset(true)
                  setTimeout(() => setConfirmingWeeklyReset(false), 3500)
                }
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                confirmingWeeklyReset
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'border border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
              }`}
            >
              {confirmingWeeklyReset ? 'בטוח? לחץ לאיפוס שבועי מיידי' : 'איפוס שבועי עכשיו (השאר רק קבועים)'}
            </button>
          </section>

          {/* Members list */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600">חברי המשפחה ({members.length})</h3>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" /> מחוברים בסנכרון חי
              </span>
            </div>

            <div className="space-y-2">
              {members.map((member) => {
                const isMe = member.id === currentMemberId
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar member={member} size="sm" />
                      <span className="truncate font-bold text-slate-800">
                        {member.name} {isMe && '(אני)'}
                      </span>
                      {member.isAdmin && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                          מנהל/ת
                        </span>
                      )}
                    </div>

                    {!member.isAdmin && !isMe && (
                      <button
                        onClick={() => handleKickClick(member.id)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          confirmingKickId === member.id
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-500 hover:text-rose-600'
                        }`}
                      >
                        <UserMinus className="h-3 w-3" />
                        <span>{confirmingKickId === member.id ? 'אישור הסרה' : 'הסר'}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Cloud Sync & Architecture note */}
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>סנכרון ענן ב-0 ש״ח (Offline-First)</span>
            </div>
            <p className="text-slate-600">
              האפליקציה פועלת במצב אופליין מלא בכל סופרמרקט, ומסונכרנת מיידית בין כל המכשירים ללא עלויות שרת.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
