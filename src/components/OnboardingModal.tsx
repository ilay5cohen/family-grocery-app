import { useEffect, useState } from 'react'
import { ONBOARDING_SLIDES } from '../data/onboardingSlides'

export function OnboardingModal({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const isLast = step === ONBOARDING_SLIDES.length - 1
  const slide = ONBOARDING_SLIDES[step]

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onFinish()
      if (e.key === 'ArrowRight') setStep((s) => Math.max(0, s - 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.min(ONBOARDING_SLIDES.length - 1, s + 1))
      if (e.key === 'Enter') {
        setStep((s) => {
          if (s === ONBOARDING_SLIDES.length - 1) {
            onFinish()
            return s
          }
          return s + 1
        })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onFinish])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="הכרות עם האפליקציה"
    >
      <div className="relative w-full max-w-lg animate-float-in overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b14]/95 shadow-2xl shadow-black/70 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 transition-all duration-500"
          style={{
            background:
              'radial-gradient(circle at 50% -10%, rgba(217,70,239,0.35), transparent 55%)',
          }}
        />

        <button
          onClick={onFinish}
          className="absolute end-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-white/25 hover:text-white"
        >
          דלג
        </button>

        <div className="relative flex flex-col items-center gap-5 px-6 pb-6 pt-10 text-center sm:px-10 sm:pt-12">
          <div
            key={step}
            className={`animate-float-in flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl ${slide.glow}`}
          >
            {slide.icon}
          </div>

          <div key={`text-${step}`} className="animate-float-in space-y-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{slide.title}</h2>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-[15px]">{slide.description}</p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {ONBOARDING_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`שקופית ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-gradient-to-l from-fuchsia-400 to-cyan-400 shadow-[0_0_8px_-1px_rgba(217,70,239,0.9)]'
                    : 'w-1.5 bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>

          <div className="mt-2 flex w-full items-center gap-2.5">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                הקודם
              </button>
            )}

            {isLast ? (
              <button
                onClick={onFinish}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-fuchsia-500 via-purple-500 to-cyan-400 px-4 py-3 text-sm font-extrabold text-white shadow-[0_0_24px_-4px_rgba(217,70,239,0.9)] transition hover:brightness-110 active:scale-95"
              >
                בוא נתחיל 🚀
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-l from-fuchsia-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_-4px_rgba(217,70,239,0.9)] transition hover:brightness-110 active:scale-95"
              >
                הבא
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
