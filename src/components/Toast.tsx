import { useEffect, useRef } from 'react'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface ToastProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

const DEFAULT_DURATION = 4500

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  // Each toast owns its own timer so a newer toast can never cut short — or
  // silently swallow the undo of — an older one still on screen.
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismissRef.current(toast.id)
    }, toast.duration ?? DEFAULT_DURATION)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.duration])

  return (
    <div className="animate-float-in flex items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/95 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
        <p className="truncate text-xs font-semibold text-slate-100">{toast.message}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.()
              onDismiss(toast.id)
            }}
            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {toast.actionLabel ?? 'בטל'}
          </button>
        )}

        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="סגור הודעה"
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <aside
      aria-label="הודעות מערכת"
      aria-live="polite"
      className="fixed bottom-6 start-1/2 z-50 w-full max-w-sm -translate-x-1/2 space-y-2 px-4 rtl:translate-x-1/2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </aside>
  )
}
