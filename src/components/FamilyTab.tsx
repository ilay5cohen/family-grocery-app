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
    const founder = members.find((m) => m.isAdmin) || members[0]
    const inviteUrl = `${currentOrigin}?join=${familyCode}&fn=${encodeURIComponent(founder?.name || '')}`
    const text = `היי! מוזמן/ת להצטרף לסל הקניות המשפחתי שלנו ב"הסל שלנו":\n${inviteUrl}\n(קוד המשפחה: ${familyCode})`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank')
    }
  }

  return (
    <div className="space-y-5">
      {/* WhatsApp Invite Card */}
      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-apple space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 shadow-apple-subtle">
              <Share2 className="h-4 w-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">הזמנת בני משפחה</h3>
              <p className="text-xs text-stone-500">שתפו את הקישור לסנכרון מיידי בין כל המכשירים</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition shadow-apple-subtle"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-stone-900" /> : <Copy className="h-3.5 w-3.5 text-stone-400" />}
            <span>{copied ? 'קוד הועתק' : familyCode}</span>
          </button>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-xs font-medium text-white shadow-apple-subtle transition hover:bg-stone-800 active:scale-98"
        >
          <Share2 className="h-4 w-4" />
          <span>שליחת הזמנה בוואטסאפ (הצטרפות בלחיצה)</span>
        </button>
      </section>

      {/* Members & Admin */}
      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-apple space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Users className="h-4 w-4 text-stone-700 stroke-[1.75]" />
            <span>בני המשפחה בסל ({members.length})</span>
          </h3>

          {me?.isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900"
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
              className="flex items-center justify-between rounded-2xl border border-stone-200/60 bg-stone-50/60 p-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar member={member} size="md" />
                <div>
                  <p className="font-semibold text-stone-900 truncate">
                    {member.name} {member.id === currentMemberId && '(אני)'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    הצטרף/ה {formatRelativeTime(member.joinedAt)}
                  </p>
                </div>
              </div>

              {member.isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                  <Crown className="h-3 w-3" /> מנהל/ת
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Auto-Reset Card */}
      <section className="rounded-3xl border border-stone-200/80 bg-stone-50/70 p-5 shadow-apple-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 shadow-apple-subtle">
              <RotateCcw className="h-4 w-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <span>איפוס שבועי</span>
                <span className="rounded-full bg-stone-200/70 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                  כל יום ראשון
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                בימי ראשון, מוצרים שאינם קבועים מוסרים מהרשימה אוטומטית.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-normal text-stone-600 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-stone-700" />
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
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
              confirmingReset
                ? 'bg-stone-900 text-white shadow-apple-subtle'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {confirmingReset ? 'אישור איפוס לשבוע חדש' : 'איפוס ידני עכשיו'}
          </button>
        </div>
      </section>

      {/* Expenses Overview */}
      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-apple space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <TrendingUp className="h-4 w-4 text-stone-700 stroke-[1.75]" />
          <span>סיכום הוצאות ותקציב סל</span>
        </h3>

        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="rounded-2xl border border-stone-200/60 bg-stone-50/70 p-3 shadow-apple-subtle">
            <p className="text-[11px] font-normal text-stone-500">משוער לסל</p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-stone-900">{formatCurrency(stats.estimatedTotal)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/60 bg-stone-50/70 p-3 shadow-apple-subtle">
            <p className="text-[11px] font-normal text-stone-500">כבר נקנה</p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-stone-900">{formatCurrency(stats.spentTotal)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200/60 bg-stone-50/70 p-3 shadow-apple-subtle">
            <p className="text-[11px] font-normal text-stone-500">נותר לרכישה</p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-stone-900">{formatCurrency(stats.remainingEstimate)}</p>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-apple space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <History className="h-4 w-4 text-stone-700 stroke-[1.75]" />
          <span>פעילות אחרונה בסל</span>
        </h3>

        <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
          {activity.length === 0 ? (
            <p className="py-4 text-center text-xs text-stone-400">אין פעילויות עדיין.</p>
          ) : (
            activity.map((entry) => {
              const actor = members.find((m) => m.id === entry.memberId)
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/50 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {actor ? (
                      <Avatar member={actor} size="sm" />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[10px] text-stone-600 font-medium">
                        ?
                      </span>
                    )}
                    <span className="truncate text-stone-700 font-normal">{entry.text}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-stone-400">
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
