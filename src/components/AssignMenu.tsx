import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Member } from '../types'
import { Avatar } from './Avatar'

const MENU_WIDTH = 160

export function AssignMenu({
  members,
  assignedTo,
  onAssign,
}: {
  members: Member[]
  assignedTo?: string
  onAssign: (memberId: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const assigned = members.find((m) => m.id === assignedTo)

  function reposition() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }

  function toggleOpen() {
    if (!open) reposition()
    setOpen((o) => !o)
  }

  // Every item card uses backdrop-blur, which creates its own CSS stacking
  // context — an absolutely-positioned dropdown inside one card would get
  // visually trapped behind the next card. Portaling to <body> with
  // fixed coordinates escapes that entirely.
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-white/15 px-2 py-1 text-[11px] text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
      >
        {assigned ? (
          <>
            <Avatar member={assigned} size="sm" />
            <span>{assigned.name}</span>
          </>
        ) : (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-xs">+</span>
            <span>שייך/י</span>
          </>
        )}
      </button>

      {open &&
        coords &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="fixed z-50 animate-float-in overflow-hidden rounded-xl border border-white/10 bg-[#0e0e18]/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-xl"
              style={{ top: coords.top, right: coords.right, width: MENU_WIDTH }}
            >
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onAssign(m.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                    m.id === assignedTo ? 'bg-fuchsia-500/15 text-fuchsia-200' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Avatar member={m} size="sm" />
                  {m.name}
                </button>
              ))}
              {assignedTo && (
                <button
                  onClick={() => {
                    onAssign(undefined)
                    setOpen(false)
                  }}
                  className="mt-0.5 flex w-full items-center gap-2 rounded-lg border-t border-white/5 px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-red-300"
                >
                  בטל/י שיוך
                </button>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
