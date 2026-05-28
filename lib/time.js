export const DEFAULT_CLINIC_ID = process.env.DEFAULT_CLINIC_ID || '00000000-0000-0000-0000-000000000001'

const pad = (value) => String(value).padStart(2, '0')

export function dateFromInput(value) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function timeFromInput(value) {
  const clean = String(value || '09:00').slice(0, 5)
  return new Date(`1970-01-01T${clean}:00.000Z`)
}

export function dateToInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export function timeToInput(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 5)
  const date = new Date(value)
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

export function timeToMinutes(value) {
  const [hours = 0, minutes = 0] = timeToInput(value).split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(total) {
  const minutes = ((total % 1440) + 1440) % 1440
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export function formatTime(value) {
  const [hours, minutes] = timeToInput(value).split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${pad(minutes)} ${suffix}`
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function addMinutesToTime(value, minutes) {
  return minutesToTime(timeToMinutes(value) + minutes)
}

export function calculateArrivalWindow(time, windowMinutes = 15) {
  return {
    start: addMinutesToTime(time, -windowMinutes),
    end: addMinutesToTime(time, windowMinutes),
  }
}

export function weekdayFromDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dateFromInput(value)).toLowerCase()
}

export function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysInput(value, days) {
  const date = dateFromInput(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function plain(value) {
  return JSON.parse(JSON.stringify(value))
}
