export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
  const dt = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options,
  }).format(dt)
}

export const formatShortDate = (date: string | number | Date) =>
  formatDate(date, { month: 'short', day: '2-digit' })

export const formatMonth = (date: string | number | Date) => {
  const dt = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(dt)
}

export const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export const formatPercentage = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`

export const formatRelativeTime = (ms: number) => {
  if (!Number.isFinite(ms)) return '—'
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
