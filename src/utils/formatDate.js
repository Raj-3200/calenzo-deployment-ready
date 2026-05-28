import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'

export function toDate(date) {
  if (!date) return null
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date
  const parsed = parseISO(String(date))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(date, pattern = 'MMM dd, yyyy') {
  const parsed = toDate(date)
  return parsed ? format(parsed, pattern) : ''
}

export function formatTime(time) {
  if (!time) return ''
  const [hours = '0', minutes = '00'] = String(time).split(':')
  const hour = Number(hours)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatDateTime(date, time) {
  const dateText = formatDate(date)
  return `${dateText}${time ? ` at ${formatTime(time)}` : ''}`
}

export function formatRelative(date) {
  const parsed = toDate(date)
  if (!parsed) return ''
  if (isToday(parsed)) return 'Today'
  if (isTomorrow(parsed)) return 'Tomorrow'
  return formatDistanceToNow(parsed, { addSuffix: true })
}

export function formatShortDate(date) {
  return formatDate(date, 'MMM dd')
}

export function getDayName(date) {
  return formatDate(date, 'EEEE')
}

export function formatLastUpdated(date) {
  const parsed = toDate(date)
  if (!parsed) return 'Just now'
  return format(parsed, 'h:mm a')
}
