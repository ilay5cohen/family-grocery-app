import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

// Type declarations for Web Speech API
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: () => void
  onend: () => void
  onerror: (event: { error: string }) => void
  onresult: (event: SpeechRecognitionEventLike) => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // The recognition engine is created once and must survive re-renders: this
  // app re-renders whenever another family member changes the list, and
  // rebuilding the engine mid-sentence would abort listening silently.
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const SpeechConstructor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechConstructor) {
      setSupported(false)
      return
    }

    try {
      const recog = new SpeechConstructor()
      recog.continuous = false
      recog.interimResults = false
      recog.lang = 'he-IL'

      recog.onstart = () => {
        setIsListening(true)
        setErrorMsg(null)
        triggerHaptic(30)
      }

      recog.onend = () => {
        setIsListening(false)
      }

      recog.onerror = (e) => {
        setIsListening(false)
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setErrorMsg('שגיאה בזיהוי הקולי. נסו שוב.')
        }
      }

      recog.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript?.trim()
        if (text) {
          triggerHaptic([20, 50, 20])
          onTranscriptRef.current(text)
        }
      }

      recognitionRef.current = recog
    } catch {
      setSupported(false)
    }

    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  function toggleListening() {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setErrorMsg(null)
      try {
        recognitionRef.current.start()
      } catch {
        // May throw if already started
        setIsListening(false)
      }
    }
  }

  if (!supported) {
    return null // Gracefully hide button if unsupported
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? 'הפסק הקלטה' : 'הוספה באמצעות דיבור'}
        title={isListening ? 'מקשיב... לחץ לעצירה' : 'הוספה קולית בעברית'}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
          isListening
            ? 'border-red-400 bg-red-50 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
        }`}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping" />
            <MicOff className="h-5 w-5 relative z-10" />
          </>
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {isListening && (
        <span className="absolute -top-7 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-lg bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg animate-bounce">
          מקשיב... דבר/י עכשיו
        </span>
      )}

      {errorMsg && (
        <span className="absolute -bottom-8 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center gap-1 whitespace-nowrap rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] text-white">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </span>
      )}
    </div>
  )
}
