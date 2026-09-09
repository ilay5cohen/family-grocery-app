export function formatCurrency(value: number): string {
  return `₪${value.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 10) return 'עכשיו'
  if (diffSec < 60) return `לפני ${diffSec} שניות`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `לפני ${diffMin} דקות`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `לפני ${diffHour} שעות`
  const diffDay = Math.round(diffHour / 24)
  return `לפני ${diffDay} ימים`
}
