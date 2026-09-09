import type { Member } from '../types'

export function Avatar({ member, size = 'md' }: { member: Member; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size]

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${member.color} ${member.glow} ${sizeClasses} shrink-0 font-bold text-white ring-2 ring-black/40`}
      title={member.name}
    >
      {member.avatar}
    </div>
  )
}
