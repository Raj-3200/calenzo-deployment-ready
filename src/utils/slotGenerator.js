import { addDays, addMinutes, format, parse, startOfDay } from 'date-fns'
import { WORKING_DAYS } from '../data/constants'

export function timeToMinutes(time) {
  const [hours = 0, minutes = 0] = String(time).split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatSlotTime(time) {
  const [hours, minutes] = time.split(':')
  const hourNumber = Number(hours)
  const suffix = hourNumber >= 12 ? 'PM' : 'AM'
  const hour12 = hourNumber % 12 || 12
  return `${hour12}:${minutes} ${suffix}`
}

export function isClosedDay(date, workingDays = WORKING_DAYS) {
  const day = format(typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date, 'eeee').toLowerCase()
  return !workingDays.includes(day)
}

export function getNextAvailableDay(date, workingDays = WORKING_DAYS) {
  let cursor = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date
  for (let index = 1; index <= 14; index += 1) {
    cursor = addDays(cursor, 1)
    if (!isClosedDay(cursor, workingDays)) return format(cursor, 'yyyy-MM-dd')
  }
  return format(addDays(new Date(), 1), 'yyyy-MM-dd')
}

export function overlapsRange(start, end, rangeStart, rangeEnd) {
  return start < rangeEnd && end > rangeStart
}

export function generateSlots({
  date,
  openingTime = '09:00',
  closingTime = '18:00',
  lunchStart = '13:00',
  lunchEnd = '14:00',
  appointmentDuration = 10,
  existingAppointments = [],
  workingDays = WORKING_DAYS,
  doctorAvailability = [],
} = {}) {
  if (!date || isClosedDay(date, workingDays)) return []

  const bookedRanges = existingAppointments
    .filter((appointment) => appointment.appointment_date === date && !['cancelled', 'no_show', 'rescheduled'].includes(appointment.status))
    .map((appointment) => {
      const start = timeToMinutes(appointment.appointment_time)
      const duration = appointment.appointment_type === 'follow_up' ? 5 : (appointment.service?.duration || appointment.duration || 10)
      return { start, end: start + duration }
    })

  const unavailableRanges = doctorAvailability
    .filter((block) => block.date === date || block.day_of_week)
    .filter((block) => block.is_available === false)
    .map((block) => ({ start: timeToMinutes(block.start_time), end: timeToMinutes(block.end_time) }))

  const slots = []
  const dayStart = timeToMinutes(openingTime)
  const dayEnd = timeToMinutes(closingTime)
  const breakStart = lunchStart ? timeToMinutes(lunchStart) : null
  const breakEnd = lunchEnd ? timeToMinutes(lunchEnd) : null

  for (let cursor = dayStart; cursor + appointmentDuration <= dayEnd; cursor += appointmentDuration) {
    const slotEnd = cursor + appointmentDuration
    const time = minutesToTime(cursor)
    const inLunch = breakStart !== null && breakEnd !== null && overlapsRange(cursor, slotEnd, breakStart, breakEnd)
    const isBooked = bookedRanges.some((range) => overlapsRange(cursor, slotEnd, range.start, range.end))
    const isUnavailable = unavailableRanges.some((range) => overlapsRange(cursor, slotEnd, range.start, range.end))

    slots.push({
      time,
      display: formatSlotTime(time),
      available: !inLunch && !isBooked && !isUnavailable,
      isBreak: inLunch,
      isBooked,
      isUnavailable,
      duration: appointmentDuration,
    })
  }

  return slots
}

export function generateTimeSlots(openingTime, closingTime, slotDuration, bookedSlots = [], breakStart = null, breakEnd = null) {
  const appointments = bookedSlots.map((time) => ({
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: time,
    appointment_type: 'new',
    status: 'confirmed',
    duration: slotDuration,
  }))

  return generateSlots({
    date: format(new Date(), 'yyyy-MM-dd'),
    openingTime,
    closingTime,
    lunchStart: breakStart,
    lunchEnd: breakEnd,
    appointmentDuration: slotDuration,
    existingAppointments: appointments,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  })
}

export function getBookedSlotsForDate(appointments, date) {
  return appointments
    .filter((appointment) => appointment.appointment_date === date && !['cancelled', 'no_show', 'rescheduled'].includes(appointment.status))
    .map((appointment) => appointment.appointment_time?.slice(0, 5))
}

export function calculateArrivalWindow(appointmentTime, windowMinutes = 15) {
  const base = startOfDay(new Date())
  const appointmentDate = parse(appointmentTime, 'HH:mm', base)
  const start = addMinutes(appointmentDate, -windowMinutes)
  const end = addMinutes(appointmentDate, windowMinutes)
  return {
    start: format(start, 'HH:mm'),
    end: format(end, 'HH:mm'),
    display: `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
  }
}

export function isDuplicateSlot({ appointments, clinicId, date, time }) {
  return appointments.some((appointment) => (
    appointment.clinic_id === clinicId &&
    appointment.appointment_date === date &&
    appointment.appointment_time?.slice(0, 5) === time &&
    !['cancelled', 'no_show', 'rescheduled'].includes(appointment.status)
  ))
}

export function allocateNearestSlot({ slots, preferredTime }) {
  const available = slots.filter((slot) => slot.available)
  if (!available.length) return null
  if (!preferredTime) return available[0]

  const target = timeToMinutes(preferredTime)
  return available.reduce((best, slot) => {
    const distance = Math.abs(timeToMinutes(slot.time) - target)
    const bestDistance = Math.abs(timeToMinutes(best.time) - target)
    return distance < bestDistance ? slot : best
  }, available[0])
}
