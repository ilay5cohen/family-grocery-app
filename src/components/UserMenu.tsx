import { useState } from 'react'
import { Crown, LogOut, Copy, Check, Share2, HelpCircle, ShoppingCart } from 'lucide-react'
import type { Member } from '../types'
import { Avatar } from './Avatar'
import { triggerHaptic } from '../utils/haptics'

export function UserMenu({
  me,
  familyCode,
  onOpenAdmin,
  onLogout,
  onHelp,
  onShareWhatsApp,
  onOpenSupermarketMode,
}: {
  me: Member
  familyCode: string
  onOpenAdmin: () => void
  onLogout: () => void
  onHelp?: () => void
  onShareWhatsApp?: () => void
  onOpenSupermarketMode?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

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

  return (
    <div className="relative">
      <button
        onClick={() => {
          triggerHaptic(15)
          setOpen((o) => !o)
        }}
        className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white/90 py-1 ps-2.5 pe-1 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
      >
        {me.isAdmin && <Crown className="h-3.5 w-3.5 text-amber-600" />}
        <span className="text-xs font-bold text-slate-800 hidden xs:inline">{me.name}</span>
        <Avatar member={me} size="sm" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute start-0 sm:end-0 z-50 mt-2 w-64 animate-float-in overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-500">קוד המשפחה</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-base font-black tracking-[0.2em] text-emerald-800">
                  {familyCode}
                </span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'הועתק' : 'העתק'}</span>
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
              {onOpenSupermarketMode && (
                <button
                  onClick={() => {
                    triggerHaptic(20)
                    onOpenSupermarketMode()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  <span>מצב סופרמרקט מלא</span>
                </button>
              )}

              {onShareWhatsApp && (
                <button
                  onClick={() => {
                    triggerHaptic(20)
                    onShareWhatsApp()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  <span>הזמן משפחה בוואטסאפ</span>
                </button>
              )}

              {onHelp && (
                <button
                  onClick={() => {
                    triggerHaptic(15)
                    onHelp()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <HelpCircle className="h-4 w-4 text-slate-500" />
                  <span>עזרה וסיור מודרך</span>
                </button>
              )}

              {me.isAdmin && (
                <button
                  onClick={() => {
                    triggerHaptic(20)
                    onOpenAdmin()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-50"
                >
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span>ניהול המשפחה והקוד</span>
                </button>
              )}

              <button
                onClick={() => {
                  triggerHaptic(20)
                  onLogout()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                <span>התנתקות</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
