import { useState } from 'react'
import { ShoppingCart, Users, Sparkles, Copy, Check, ArrowRight, LogIn } from 'lucide-react'
import { joinDemoFamily } from '../data/demoFamily'
import { createFamily, joinFamily } from '../utils/familyActions'
import { getSavedProfile } from '../utils/savedProfile'
import { readFamilyState } from '../utils/familyStorage'
import type { Session } from '../types'
import { triggerHaptic } from '../utils/haptics'

type Mode = 'choice' | 'create' | 'created' | 'join'

export function AuthScreen({
  onAuthenticated,
  notice,
}: {
  onAuthenticated: (session: Session) => void
  notice?: string | null
}) {
  const [initialJoinCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return (params.get('join') || params.get('code') || '').trim().toUpperCase()
    }
    return ''
  })

  // Check for a saved profile to offer 1-tap login (Bug 2 fix)
  const [savedProfile] = useState(() => {
    const profile = getSavedProfile()
    if (!profile) return null
    // Verify the family still exists in localStorage
    const familyState = readFamilyState(profile.familyId)
    if (!familyState) return null
    // Verify the member still exists
    const memberExists = familyState.members.some((m) => m.id === profile.memberId)
    if (!memberExists) return null
    return profile
  })

  const [mode, setMode] = useState<Mode>(initialJoinCode ? 'join' : 'choice')
  const [name, setName] = useState('')
  const [code, setCode] = useState(initialJoinCode)
  const [error, setError] = useState<string | null>(null)
  const [createdCode, setCreatedCode] = useState('')
  const [pendingSession, setPendingSession] = useState<Session | null>(null)
  const [copied, setCopied] = useState(false)

  function handleQuickLogin() {
    if (!savedProfile) return
    triggerHaptic(25)
    onAuthenticated({ familyId: savedProfile.familyId, memberId: savedProfile.memberId })
  }

  function resetForms() {
    setName('')
    setCode('')
    setError(null)
  }

  function handleCreate() {
    if (!name.trim()) {
      setError('נא להזין שם.')
      return
    }
    triggerHaptic(25)
    const result = createFamily(name)
    setCreatedCode(result.code)
    setPendingSession({ familyId: result.familyId, memberId: result.memberId })
    setMode('created')
  }

  function handleJoin() {
    if (!name.trim()) {
      setError('נא להזין שם.')
      return
    }
    if (!code.trim()) {
      setError('נא להזין קוד משפחה.')
      return
    }
    triggerHaptic(25)
    const result = joinFamily(code, name)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onAuthenticated(result)
  }

  function handleTryDemo() {
    triggerHaptic(20)
    onAuthenticated(joinDemoFamily())
  }

  async function copyCreatedCode() {
    triggerHaptic(20)
    try {
      await navigator.clipboard.writeText(createdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f9f6] px-4 py-10 text-slate-800"
    >
      {/* Gentle organic background gradient */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(16,185,129,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(20,184,166,0.1), transparent 45%)',
        }}
      />

      <div className="relative w-full max-w-md animate-float-in space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
            <ShoppingCart className="h-8 w-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">הסל שלנו</h1>
          <p className="text-sm font-medium text-slate-500">רשימת הקניות המשפחתית שלכם, מסונכרנת בזמן אמת</p>
        </div>

        {/* Welcome Back card — shown when a saved profile is found */}
        {savedProfile && mode === 'choice' && (
          <div className="animate-float-in rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-[0_4px_20px_rgba(16,185,129,0.18)]">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md"
                style={{ background: savedProfile.memberColor || '#059669' }}
              >
                {savedProfile.memberAvatar || savedProfile.memberName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700">ברוך שובך! 👋</p>
                <p className="text-base font-black text-slate-900 truncate">{savedProfile.memberName}</p>
                <p className="text-xs text-slate-500">קוד משפחה: <span className="font-mono font-bold">{savedProfile.familyCode}</span></p>
              </div>
            </div>
            <button
              onClick={handleQuickLogin}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)] transition hover:bg-emerald-700 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              כניסה מחדש כ-{savedProfile.memberName} 👈
            </button>
            <button
              onClick={() => setMode('choice')}
              className="mt-2 w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              החלפת משתמש / כניסה עם קוד אחר
            </button>
          </div>
        )}

        {initialJoinCode && mode === 'join' && (
          <div className="animate-float-in rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-800 shadow-sm">
            🎉 קיבלת הזמנה להצטרף למשפחה (קוד: <span className="font-mono tracking-widest">{initialJoinCode}</span>)!
            <br />
            הזן/י את שמך בלבד כדי להיכנס לסל.
          </div>
        )}

        {notice && (
          <div className="animate-float-in rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
            {notice}
          </div>
        )}

        <div className="animate-float-in rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          {mode === 'choice' && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  resetForms()
                  setMode('create')
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-start transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-98"
              >
                <div>
                  <h2 className="text-base font-black text-emerald-950 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    פתיחת משפחה חדשה
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    קבלו קוד ייחודי והזמינו את בני הבית
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-600 transition group-hover:-translate-x-1" />
              </button>

              <button
                onClick={() => {
                  resetForms()
                  setMode('join')
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-start transition hover:border-slate-300 hover:bg-slate-50 active:scale-98"
              >
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    הצטרפות עם קוד
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">יש לכם קוד? הכניסו אותו כאן</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:-translate-x-1" />
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <span className="w-full border-t border-slate-200" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400">או לניסיון</span>
                <span className="w-full border-t border-slate-200" />
              </div>

              <button
                onClick={handleTryDemo}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                כניסה למשפחת הדמו (משפחת כהן)
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-900">איך קוראים לך?</h2>
                <p className="text-xs text-slate-500">תהיה המנהל/ת של הסל המשפחתי</p>
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="השם שלך (למשל: דניאל)"
                autoFocus
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode('choice')}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  חזרה
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)] transition hover:bg-emerald-700 active:scale-95"
                >
                  צור משפחה וקבל קוד
                </button>
              </div>
            </div>
          )}

          {mode === 'created' && pendingSession && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h2 className="text-lg font-black text-slate-900">המשפחה נוצרה בהצלחה!</h2>
              <p className="text-xs text-slate-500">
                זהו הקוד הסודי של המשפחה. שתפו אותו עם כולם:
              </p>

              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <span className="font-mono text-2xl font-black tracking-[0.25em] text-emerald-800">
                  {createdCode}
                </span>
                <button
                  onClick={copyCreatedCode}
                  className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'הועתק!' : 'העתק'}</span>
                </button>
              </div>

              <button
                onClick={() => onAuthenticated(pendingSession)}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white shadow-[0_2px_10px_rgba(5,150,105,0.3)] transition hover:bg-emerald-700 active:scale-95"
              >
                כניסה לסל הקניות המשפחתי 🚀
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-900">הצטרפות למשפחה קיימת</h2>
                <p className="text-xs text-slate-500">הזינו את הקוד שקיבלתם ואת שמכם</p>
              </div>

              {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="קוד משפחה (למשל: X7K9P)"
                  autoFocus={!initialJoinCode}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm tracking-widest text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="השם שלך (למשל: אמא, דני, תמר)"
                  autoFocus={Boolean(initialJoinCode)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode('choice')}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  חזרה
                </button>
                <button
                  onClick={handleJoin}
                  className="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)] transition hover:bg-emerald-700 active:scale-95"
                >
                  הצטרף למשפחה
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
