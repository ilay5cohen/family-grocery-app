import { useState } from 'react'
import {
  Users,
  Share2,
  Copy,
  Check,
  Crown,
  TrendingUp,
  History,
  RotateCcw,
  Star,
} from 'lucide-react'
import type { Member, ActivityEntry } from '../types'
import { Avatar } from './Avatar'
import { formatCurrency, formatRelativeTime } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface FamilyTabProps {
  familyCode: string
  members: Member[]
  currentMemberId: string
  activity: ActivityEntry[]
  stats: {
    estimatedTotal: number
    spentTotal: number
    remainingEstimate: number
    boughtCount: number
    totalCount: number
    staplesCount: number
  }
  onOpenAdmin: () => void
  onPerformWeeklyReset: () => void
}

export function FamilyTab({
  familyCode,
  members,
  currentMemberId,
  activity,
  stats,
  onOpenAdmin,
  onPerformWeeklyReset,
}: FamilyTabProps) {
  const [copied, setCopied] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const me = members.find((m) => m.id === currentMemberId)

  async function handleCopy() {
    triggerHaptic(20)
    try {
      await navigator.clipboard.writeText(familyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
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

  return (
    <div className="animate-float-in space-y-5">
      {/* WhatsApp Invite Card */}
      <section className="rounded-3xl border border-emerald-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">הזמנת בני משפחה</h3>
              <p className="text-xs text-slate-500">שתפו את הקישור לסנכרון מיידי בין כל המכשירים</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'קוד הועתק' : familyCode}</span>
          </button>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 py-3 text-xs font-black text-white shadow-[0_2px_10px_rgba(5,150,105,0.25)] transition hover:brightness-105 active:scale-98"
        >
          <Share2 className="h-4 w-4" />
          <span>שלח הזמנה בוואטסאפ (הצטרפות בלחיצה אחת)</span>
        </button>
      </section>

      {/* Members & Admin */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>בני המשפחה בסל ({members.length})</span>
          </h3>

          {me?.isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>ניהול הרשאות</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar member={member} size="md" />
                <div>
                  <p className="font-bold text-slate-900 truncate">
                    {member.name} {member.id === currentMemberId && '(אני)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    הצטרף/ה {formatRelativeTime(member.joinedAt)}
                  </p>
                </div>
              </div>

              {member.isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                  <Crown className="h-3 w-3" /> מנהל/ת
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Auto-Reset Card */}
      <section className="rounded-3xl border border-amber-200/90 bg-gradient-to-l from-amber-500/10 to-orange-500/5 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>איפוס שבועי חכם</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  פעיל בכל יום ראשון
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                בכל יום ראשון, כל המוצרים שלא סומנו כ"קבועים" (⭐) נמחקים אוטומטית.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>נשמרים בסל: {stats.staplesCount} מוצרים קבועים</span>
          </span>

          <button
            onClick={() => {
              triggerHaptic(25)
              if (confirmingReset) {
                onPerformWeeklyReset()
                setConfirmingReset(false)
              } else {
                setConfirmingReset(true)
                setTimeout(() => setConfirmingReset(false), 3500)
              }
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              confirmingReset
                ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                : 'border border-amber-300 bg-white text-amber-900 hover:bg-amber-50'
            }`}
          >
            {confirmingReset ? 'בטוח? לחץ לאיפוס לשבוע חדש' : 'אפס לשבוע חדש עכשיו'}
          </button>
        </div>
      </section>

      {/* Expenses Overview */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span>סיכום הוצאות ותקציב סל</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">משוער לסל</p>
            <p className="mt-1 text-base font-black text-slate-900">{formatCurrency(stats.estimatedTotal)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
            <p className="text-[11px] font-medium text-emerald-800">כבר נקנה</p>
            <p className="mt-1 text-base font-black text-emerald-700">{formatCurrency(stats.spentTotal)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3">
            <p className="text-[11px] font-medium text-amber-800">נותר בקופה</p>
            <p className="mt-1 text-base font-black text-amber-700">{formatCurrency(stats.remainingEstimate)}</p>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
          <History className="h-4 w-4 text-emerald-600" />
          <span>יומן פעילות אחרונה</span>
        </h3>

        <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
          {activity.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">טרם בוצעו פעולות בסל.</p>
          ) : (
            activity.map((entry) => {
              const actor = members.find((m) => m.id === entry.memberId)
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {actor ? (
                      <Avatar member={actor} size="sm" />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600 font-bold">
                        ?
                      </span>
                    )}
                    <span className="truncate text-slate-700 font-semibold">{entry.text}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
