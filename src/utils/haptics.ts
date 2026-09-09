/**
 * Lightweight sound and haptic feedback utilities.
 * Uses Web Audio API for offline, zero-asset sound effects.
 */

class SoundController {
  private ctx: AudioContext | null = null
  private soundEnabled: boolean = true

  constructor() {
    // Read user preference
    try {
      const saved = localStorage.getItem('family_app_sound_enabled')
      if (saved !== null) {
        this.soundEnabled = JSON.parse(saved)
      }
    } catch {
      this.soundEnabled = true
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled
    try {
      localStorage.setItem('family_app_sound_enabled', JSON.stringify(this.soundEnabled))
    } catch {
      // ignore
    }
    return this.soundEnabled
  }

  private getAudioContext(): AudioContext | null {
    if (!this.soundEnabled) return null
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public playCheck(): void {
    const ctx = this.getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      // Ascending pleasant double tone: E6 -> G#6
      osc.frequency.setValueAtTime(1318.5, now)
      osc.frequency.exponentialRampToValueAtTime(1661.2, now + 0.08)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.2)
    } catch {
      // ignore audio errors
    }
  }

  public playComplete(): void {
    const ctx = this.getAudioContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.09
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.3)
      })
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundController()

export function triggerHaptic(pattern: number | number[] = 25) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // vibration unavailable or blocked
    }
  }
}
