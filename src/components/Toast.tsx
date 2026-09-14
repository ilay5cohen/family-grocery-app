import { useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, RotateCcw, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface ToastProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

const DEFAULT_DURATION = 3500

export function Toast({ toasts, onDismiss }: ToastProps) {
  // Show ONLY the most recent toast so it never stacks or dominates the screen!
  const currentToast = toasts.length > 0 ? toasts[toasts.length - 1] : null

  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!currentToast) return
    const timer = window.setTimeout(() => {
      onDismissRef.current(currentToast.id)
    }, currentToast.duration ?? DEFAULT_DURATION)
    return () => window.clearTimeout(timer)
  }, [currentToast])

  if (!currentToast) return null

  const type = currentToast.type ?? 'info'
  const bgColor = {
    success: 'bg-emerald-600/95 border-emerald-500/80 text-white',
    error: 'bg-rose-600/95 border-rose-500/80 text-white',
    info: 'bg-[#4f46e5]/95 border-[#4f46e5] text-white',
  }[type]

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type]

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 inset-x-4 z-50 flex justify-center pointer-events-none animate-slide-up"
    >
      <div
        className={`pointer-events-auto flex items-center justify-between gap-2.5 rounded-full border px-3.5 py-2 shadow-apple-float backdrop-blur-xl max-w-sm w-auto ${bgColor}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-white" />
          <p className="truncate text-xs font-semibold text-white">{currentToast.message}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {currentToast.onAction && (
            <button
              type="button"
              onClick={() => {
                currentToast.onAction?.()
                onDismiss(currentToast.id)
              }}
              className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white transition hover:bg-white/30 active:scale-95 shadow-2xs"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{currentToast.actionLabel ?? 'בטל'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDismiss(currentToast.id)}
            aria-label="סגור הודעה"
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
