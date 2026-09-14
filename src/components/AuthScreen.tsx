import { useState } from 'react'
import { ShoppingCart, Copy, Check, ArrowRight, LogIn } from 'lucide-react'
import { joinDemoFamily } from '../data/demoFamily'
import { createFamily, joinFamily, MAX_MEMBER_NAME_LENGTH } from '../utils/familyActions'
import { getSavedProfile } from '../utils/savedProfile'
import { readFamilyState, FAMILY_CODE_LENGTH } from '../utils/familyStorage'
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
  // The join code arrives from a shared link, so it is untrusted input —
  // strip anything that can't be part of a code before it reaches the UI.
  const [initialJoinCode] = useState(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('join') || params.get('code') || ''
    return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, FAMILY_CODE_LENGTH)
  })

  const [initialFounderName] = useState(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams(window.location.search)
    return params.get('fn') || ''
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
  const [isJoining, setIsJoining] = useState(false)

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

  async function handleCreate() {
    if (!name.trim()) {
      setError('נא להזין שם.')
      return
    }
    triggerHaptic(25)
    try {
      const result = await createFamily(name)
      setCreatedCode(result.code)
      setPendingSession({ familyId: result.familyId, memberId: result.memberId })
      setMode('created')
    } catch {
      setError('לא הצלחנו ליצור את המשפחה. ייתכן שאחסון הדפדפן מלא או חסום.')
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError('נא להזין שם.')
      return
    }
    if (!code.trim()) {
      setError('נא להזין קוד משפחה.')
      return
    }
    triggerHaptic(25)
    setIsJoining(true)
    setError(null)
    try {
      const result = await joinFamily(code, name, { founderName: initialFounderName })
      if ('error' in result) {
        setError(result.error)
        setIsJoining(false)
        return
      }
      onAuthenticated(result)
    } catch {
      setError('אירעה שגיאה בהצטרפות. נסו לרענן את הדף ולנסות שוב.')
      setIsJoining(false)
    }
  }

  function handleTryDemo() {
    triggerHaptic(20)
    try {
      onAuthenticated(joinDemoFamily())
    } catch {
      setError('לא הצלחנו לטעון את ההדגמה. ייתכן שאחסון הדפדפן חסום.')
    }
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f6] px-4 py-10 text-stone-800"
    >
      {/* Gentle ambient background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(0,0,0,0.02) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(0,0,0,0.03) 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-md animate-float-in space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-apple">
            <ShoppingCart className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">הסל שלנו</h1>
          <p className="text-xs sm:text-sm text-stone-500">ניהול רשימת קניות משותפת בזמן אמת</p>
        </div>

        {/* Welcome Back card — shown when a saved profile is found */}
        {savedProfile && mode === 'choice' && (
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/90 p-4 shadow-apple-subtle">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white shadow-apple-subtle"
                style={{ background: savedProfile.memberColor || '#292524' }}
              >
                {savedProfile.memberAvatar || savedProfile.memberName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-500 font-medium">ברוך שובך</p>
                <p className="text-sm font-semibold text-stone-900 truncate">{savedProfile.memberName}</p>
                <p className="text-[11px] text-stone-400">קוד משפחה: <span className="font-mono font-medium text-stone-600">{savedProfile.familyCode}</span></p>
              </div>
            </div>
            <button
              onClick={handleQuickLogin}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-medium text-white shadow-apple-subtle transition hover:bg-stone-800 active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              כניסה כ-{savedProfile.memberName}
            </button>
            <button
              onClick={() => setMode('choice')}
              className="mt-2 w-full text-center text-[11px] text-stone-400 hover:text-stone-600"
            >
              החלפת משתמש / כניסה עם קוד אחר
            </button>
          </div>
        )}

        {initialJoinCode && mode === 'join' && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-center text-xs font-medium text-stone-700 shadow-apple-subtle">
            {initialFounderName
              ? `${initialFounderName} הזמין/ה אותך להצטרף לסל המשפחתי (קוד: `
              : 'הזמנה להצטרפות למשפחה (קוד: '}
            <span className="font-mono font-semibold tracking-wider">{initialJoinCode}</span>)
            <br />
            הזינו את שמכם כדי להתחבר לסל.
          </div>
        )}

        {notice && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-xs font-medium text-stone-700 shadow-apple-subtle">
            {notice}
          </div>
        )}

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-7 shadow-apple">
          {mode === 'choice' && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  resetForms()
                  setMode('create')
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 text-start transition hover:border-stone-400 hover:bg-stone-100/60 active:scale-98"
              >
                <div>
                  <h2 className="text-sm font-semibold text-stone-900">
                    פתיחת משפחה חדשה
                  </h2>
                  <p className="mt-0.5 text-xs text-stone-500">
                    קבלו קוד ייחודי להזמנת בני המשפחה
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 transition group-hover:-translate-x-1 group-hover:text-stone-700" />
              </button>

              <button
                onClick={() => {
                  resetForms()
                  setMode('join')
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-4 text-start transition hover:border-stone-400 hover:bg-stone-50/60 active:scale-98"
              >
                <div>
                  <h2 className="text-sm font-semibold text-stone-900">
                    הצטרפות עם קוד
                  </h2>
                  <p className="mt-0.5 text-xs text-stone-500">יש לכם קוד? הזינו אותו כאן</p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 transition group-hover:-translate-x-1 group-hover:text-stone-700" />
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <span className="w-full border-t border-stone-200/70" />
                <span className="bg-white px-3 text-[11px] font-normal text-stone-400">או הדגמה מהירה</span>
                <span className="w-full border-t border-stone-200/70" />
              </div>

              <button
                onClick={handleTryDemo}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                כניסה למשפחת הדמו (משפחת כהן)
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-stone-900">איך קוראים לך?</h2>
                <p className="text-xs text-stone-500">ניהול הסל המשפחתי</p>
              </div>

              {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="השם שלך (למשל: דניאל)"
                maxLength={MAX_MEMBER_NAME_LENGTH}
                autoFocus
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode('choice')}
                  className="rounded-2xl border border-stone-200/80 px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
                >
                  חזרה
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded-2xl bg-stone-900 py-2.5 text-xs font-medium text-white shadow-apple-subtle transition hover:bg-stone-800 active:scale-95"
                >
                  צור משפחה וקבל קוד
                </button>
              </div>
            </div>
          )}

          {mode === 'created' && pendingSession && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 shadow-apple-subtle">
                <Check className="h-6 w-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-semibold text-stone-900">המשפחה נוצרה בהצלחה</h2>
              <p className="text-xs text-stone-500">
                זהו קוד המשפחה. שתפו אותו עם בני הבית:
              </p>

              <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <span className="font-mono text-2xl font-semibold tracking-[0.2em] text-stone-900">
                  {createdCode}
                </span>
                <button
                  onClick={copyCreatedCode}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 shadow-apple-subtle"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-stone-800" /> : <Copy className="h-3.5 w-3.5 text-stone-400" />}
                  <span>{copied ? 'הועתק' : 'העתקה'}</span>
                </button>
              </div>

              <button
                onClick={() => onAuthenticated(pendingSession)}
                className="w-full rounded-2xl bg-stone-900 py-3 text-xs font-medium text-white shadow-apple transition hover:bg-stone-800 active:scale-95"
              >
                כניסה לסל הקניות המשפחתי
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-stone-900">הצטרפות למשפחה קיימת</h2>
                <p className="text-xs text-stone-500">הזינו את הקוד שקיבלתם ואת שמכם</p>
              </div>

              {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, FAMILY_CODE_LENGTH))}
                  placeholder="קוד משפחה (למשל: X7K9P)"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoFocus={!initialJoinCode}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 font-mono text-sm tracking-widest text-stone-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="השם שלך (למשל: אמא, דני, תמר)"
                  maxLength={MAX_MEMBER_NAME_LENGTH}
                  autoFocus={Boolean(initialJoinCode)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode('choice')}
                  disabled={isJoining}
                  className="rounded-2xl border border-stone-200/80 px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
                >
                  חזרה
                </button>
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1 rounded-2xl bg-stone-900 py-2.5 text-xs font-medium text-white shadow-apple-subtle transition hover:bg-stone-800 active:scale-95 disabled:opacity-50"
                >
                  {isJoining ? 'מתחבר למשפחה...' : 'הצטרפות למשפחה'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
