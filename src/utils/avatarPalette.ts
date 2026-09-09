export interface AvatarProfile {
  color: string
  glow: string
}

// Rotating gradient palette handed out to family members in join order.
const PALETTE: AvatarProfile[] = [
  { color: 'from-fuchsia-500 to-pink-500', glow: 'shadow-[0_0_16px_-2px_rgba(232,121,249,0.8)]' },
  { color: 'from-cyan-400 to-blue-500', glow: 'shadow-[0_0_16px_-2px_rgba(34,211,238,0.8)]' },
  { color: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_16px_-2px_rgba(52,211,153,0.8)]' },
  { color: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_16px_-2px_rgba(251,191,36,0.8)]' },
  { color: 'from-violet-500 to-purple-600', glow: 'shadow-[0_0_16px_-2px_rgba(167,139,250,0.8)]' },
  { color: 'from-rose-500 to-red-500', glow: 'shadow-[0_0_16px_-2px_rgba(244,63,94,0.8)]' },
  { color: 'from-sky-400 to-indigo-500', glow: 'shadow-[0_0_16px_-2px_rgba(56,189,248,0.8)]' },
  { color: 'from-lime-400 to-green-500', glow: 'shadow-[0_0_16px_-2px_rgba(163,230,53,0.8)]' },
]

export function avatarProfileFor(index: number): AvatarProfile {
  return PALETTE[index % PALETTE.length]
}

export function initialFor(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed[0] : '?'
}
