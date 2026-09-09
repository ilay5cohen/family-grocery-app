import { useEffect, useState } from 'react'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface ToastProps {
  toast: ToastData | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) {
      setVisible(false)
      return
    }

    setVisible(true)
    const duration = toast.duration ?? 4500

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast || !visible) return null

  return (
    <aside
      aria-label="הודעות מערכת"
      className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rtl:translate-x-1/2 animate-float-in px-4 w-full max-w-sm"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/95 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="truncate text-xs font-semibold text-slate-100">{toast.message}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.()
                onDismiss()
              }}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {toast.actionLabel ?? 'בטל'}
            </button>
          )}

          <button
            onClick={onDismiss}
            aria-label="סגור הודעה"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
